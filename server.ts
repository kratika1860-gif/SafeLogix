import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { eq, desc, isNull, and, count } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  users,
  profiles,
  driverProfiles,
  vehicles,
  trips,
  notifications,
  auditLogs,
  fieldReports,
  emergencyReports,
  alerts,
  locationRecords,
} from './src/db/schema.ts';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: firebaseConfig.projectId
  });
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = 3000;

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite Dev Server compatibility
  }));

  app.use(express.json({ limit: '10mb' }));

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });

  const syncLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // Allow bursts for offline sync
  });

  app.use('/api/', apiLimiter);

  // Middleware to verify Firebase token
  const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];
    if (token === 'DEV_MOCK_TOKEN') {
      req.user = { uid: 'dev-mock-uid', email: 'driver@example.com', name: 'Test Driver', devRole: 'driver' };
      return next();
    }
    if (token === 'DEV_MOCK_ADMIN_TOKEN') {
      req.user = { uid: 'dev-mock-admin-uid', email: 'admin@example.com', name: 'Test Admin', devRole: 'admin' };
      return next();
    }
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // RBAC Middleware
  const requireRole = (roles: string[]) => {
    return async (req: any, res: any, next: any) => {
      try {
        if (req.user.uid === 'dev-mock-uid' || req.user.uid === 'dev-mock-admin-uid') {
          if (!roles.includes(req.user.devRole)) {
            return res.status(403).json({ error: 'Forbidden' });
          }
          req.dbUser = { id: req.user.uid === 'dev-mock-admin-uid' ? 2 : 1, uid: req.user.uid, role: req.user.devRole };
          return next();
        }

        const [user] = await db.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
        if (!user || !roles.includes(user.role)) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        req.dbUser = user;
        next();
      } catch (error) {
        console.error('Role check error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    };
  };

  // Auth / Me endpoint
  app.get('/api/auth/me', authenticate, async (req: any, res: any) => {
    try {
      const { uid, email, name, devRole } = req.user;
      
      if (uid === 'dev-mock-uid' || uid === 'dev-mock-admin-uid') {
        const isDevAdmin = uid === 'dev-mock-admin-uid';
        return res.json({
          user: {
            id: isDevAdmin ? '2' : '1',
            uid: uid,
            email: email,
            role: devRole,
            name: name
          },
          driverState: {
            isOnDuty: false
          }
        });
      }

      let [user] = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      
      if (!user) {
        const [newUser] = await db.insert(users).values({
          uid,
          email: email || '',
          role: (devRole as any) || 'driver',
        }).returning();
        user = newUser;

        const firstName = name ? name.split(' ')[0] : 'New';
        const lastName = name ? name.split(' ').slice(1).join(' ') || 'User' : 'User';

        await db.insert(profiles).values({
          userId: user.id,
          firstName,
          lastName,
        });

        await db.insert(driverProfiles).values({
          userId: user.id,
          status: 'off_duty',
        });
      }

      const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
      const [driverProfile] = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1);

      res.json({
        user: {
          id: user.id.toString(),
          uid: user.uid,
          email: user.email,
          role: user.role,
          name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : (name || 'User'),
        },
        driverState: {
          isOnDuty: driverProfile?.status === 'on_duty',
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Driver duty toggle
  const dutySchema = z.object({ isOnDuty: z.boolean() });
  app.post('/api/driver/duty', authenticate, requireRole(['driver']), async (req: any, res: any) => {
    try {
      const parsed = dutySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
      
      if (req.user.uid === 'dev-mock-uid' || req.user.uid === 'dev-mock-admin-uid') {
        return res.json({ success: true, isOnDuty: parsed.data.isOnDuty });
      }

      await db.update(driverProfiles)
        .set({ 
          status: parsed.data.isOnDuty ? 'on_duty' : 'off_duty',
          updatedAt: new Date()
        })
        .where(eq(driverProfiles.userId, req.dbUser.id));
      
      await db.insert(auditLogs).values({
        userId: req.dbUser.id,
        action: parsed.data.isOnDuty ? 'DRIVER_ON_DUTY' : 'DRIVER_OFF_DUTY',
        entityType: 'driver_profile',
        entityId: req.dbUser.id,
        details: { timestamp: new Date() }
      });

      res.json({ success: true, isOnDuty: parsed.data.isOnDuty });
    } catch (error) {
      console.error('Error updating duty status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Sync endpoint (Handles offline queues for GPS, Incidents, Emergencies)
  const syncSchema = z.object({
    gps: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      timestamp: z.number()
    })).optional(),
    incidents: z.array(z.object({
      category: z.string(),
      severity: z.string(),
      description: z.string(),
      location: z.tuple([z.number(), z.number()]),
      photoUrls: z.array(z.string()).optional()
    })).optional(),
    emergencies: z.array(z.object({
      type: z.string(),
      description: z.string().optional(),
      location: z.tuple([z.number(), z.number()])
    })).optional()
  });

  app.post('/api/sync', authenticate, requireRole(['driver']), syncLimiter, async (req: any, res: any) => {
    try {
      const parsed = syncSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload schema' });
      }

      if (req.user.uid === 'dev-mock-uid' || req.user.uid === 'dev-mock-admin-uid') {
        return res.json({ success: true, synced: true });
      }

      const { gps = [], incidents = [], emergencies = [] } = parsed.data;
      const driverId = req.dbUser.id;

      if (gps.length > 0) {
        await db.insert(locationRecords).values(
          gps.map(g => ({
            driverId,
            lat: g.lat.toString(),
            lng: g.lng.toString(),
            timestamp: new Date(g.timestamp)
          }))
        );
      }

      if (incidents.length > 0) {
        await db.insert(fieldReports).values(
          incidents.map(i => ({
            reporterId: driverId,
            category: i.category,
            severity: i.severity,
            description: i.description,
            locationLng: i.location[0].toString(),
            locationLat: i.location[1].toString(),
            photoUrls: i.photoUrls || []
          }))
        );
      }

      if (emergencies.length > 0) {
        await db.insert(emergencyReports).values(
          emergencies.map(e => ({
            reporterId: driverId,
            type: e.type,
            description: e.description || '',
            locationLng: e.location[0].toString(),
            locationLat: e.location[1].toString()
          }))
        );
      }

      res.json({ success: true, syncedCounts: { gps: gps.length, incidents: incidents.length, emergencies: emergencies.length } });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Admin Endpoints
  const adminRoles = ['admin', 'super_admin', 'district_officer', 'logistics_coordinator', 'emergency_coordinator'];

  // VEHICLE MANAGEMENT
  app.get('/api/admin/vehicles', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const allVehicles = await db.select().from(vehicles).where(isNull(vehicles.deletedAt)).orderBy(desc(vehicles.createdAt));
      res.json(allVehicles);
    } catch (error) {
      console.error('Vehicles error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/admin/vehicles', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const { make, model, year, licensePlate } = req.body;
      const [v] = await db.insert(vehicles).values({
        make: make || 'Toyota',
        model: model || 'Hilux',
        year: parseInt(year) || 2024,
        licensePlate: licensePlate || `HK-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'available',
      }).returning();
      res.json(v);
    } catch (error) {
      console.error('Create vehicle error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/vehicles/:id', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const [v] = await db.update(vehicles).set({ status }).where(eq(vehicles.id, id)).returning();
      res.json(v);
    } catch (error) {
      console.error('Update vehicle error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Deactivate vehicle
  app.delete('/api/admin/vehicles/:id', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [v] = await db.update(vehicles).set({ deletedAt: new Date() }).where(eq(vehicles.id, id)).returning();
      res.json(v);
    } catch (error) {
      console.error('Delete vehicle error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // DRIVER MANAGEMENT
  app.get('/api/admin/drivers', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const allDrivers = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          licenseNumber: driverProfiles.licenseNumber,
          status: driverProfiles.status,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .leftJoin(driverProfiles, eq(users.id, driverProfiles.userId))
        .where(eq(users.role, 'driver'));

      res.json(allDrivers.map(d => ({
        id: d.id,
        email: d.email,
        role: d.role,
        firstName: d.firstName || 'Driver',
        lastName: d.lastName || '',
        licenseNumber: d.licenseNumber || 'Pending',
        status: d.status || 'off_duty'
      })));
    } catch (error) {
      console.error('Drivers error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // DRIVER ACTIVATION/APPROVAL
  app.put('/api/admin/drivers/:id', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { status } = req.body;
      const existing = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, userId)).limit(1);
      let result;
      if (existing.length > 0) {
        [result] = await db.update(driverProfiles).set({ status, updatedAt: new Date() }).where(eq(driverProfiles.userId, userId)).returning();
      } else {
        [result] = await db.insert(driverProfiles).values({ userId, status, updatedAt: new Date() }).returning();
      }
      res.json(result);
    } catch (error) {
      console.error('Update driver error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // TRIP MANAGEMENT
  app.get('/api/admin/trips', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const allTrips = await db.select().from(trips).orderBy(desc(trips.createdAt));
      res.json(allTrips);
    } catch (error) {
      console.error('Trips error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/admin/trips', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const { driverId, vehicleId, cargoCategory, priority, startLocation, endLocation } = req.body;
      const [t] = await db.insert(trips).values({
        driverId: parseInt(driverId) || 1,
        vehicleId: vehicleId ? parseInt(vehicleId) : null,
        cargoCategory: cargoCategory || 'Other',
        priority: priority || 'normal',
        startLocation: startLocation || 'Central Warehouse',
        endLocation: endLocation || 'Northern Hub',
        status: 'assigned',
        delayIntelligence: {
          expectedDelay: priority === 'critical' ? '0 hrs' : '2 hrs',
          actualDelay: '0 hrs',
          cause: 'None',
          weatherFactor: 'Low',
          routeFactor: 'Clear',
          incidentFactor: 'None',
          recommendedAction: 'Proceed as planned'
        }
      }).returning();
      res.json(t);
    } catch (error) {
      console.error('Create trip error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // INCIDENT UPDATES
  app.get('/api/admin/incidents', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const allFieldReports = await db.select().from(fieldReports).orderBy(desc(fieldReports.createdAt));
      const allEmergencyReports = await db.select().from(emergencyReports).orderBy(desc(emergencyReports.createdAt));
      res.json({ fieldReports: allFieldReports, emergencyReports: allEmergencyReports });
    } catch (error) {
      console.error('Incidents error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/incidents/field/:id', authenticate, requireRole(adminRoles), async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { status, assignedResponderId, resolutionNotes, severity } = req.body;
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (assignedResponderId !== undefined) updateData.assignedResponderId = assignedResponderId ? parseInt(assignedResponderId) : null;
      if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;
      if (severity !== undefined) updateData.severity = severity;

      const [r] = await db.update(fieldReports).set(updateData).where(eq(fieldReports.id, id)).returning();
      
      if (status === 'Rejected' || status === 'Resolved') {
        await db.insert(auditLogs).values({
          userId: req.dbUser?.id || null,
          action: `FIELD_REPORT_${status.toUpperCase()}`,
          entityType: 'field_report',
          entityId: id,
          details: { resolutionNotes, timestamp: new Date() }
        });
      }
      
      res.json(r);
    } catch (error) {
      console.error('Update field report error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/incidents/emergency/:id', authenticate, requireRole(adminRoles), async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { status, assignedResponderId, resolutionNotes } = req.body;
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (assignedResponderId !== undefined) updateData.assignedResponderId = assignedResponderId ? parseInt(assignedResponderId) : null;
      if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;

      const [r] = await db.update(emergencyReports).set(updateData).where(eq(emergencyReports.id, id)).returning();
      
      if (status === 'Rejected' || status === 'Resolved') {
        await db.insert(auditLogs).values({
          userId: req.dbUser?.id || null,
          action: `EMERGENCY_REPORT_${status.toUpperCase()}`,
          entityType: 'emergency_report',
          entityId: id,
          details: { resolutionNotes, timestamp: new Date() }
        });
      }

      res.json(r);
    } catch (error) {
      console.error('Update emergency report error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ALERTS
  app.get('/api/admin/alerts', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const allAlerts = await db.select().from(alerts).orderBy(desc(alerts.createdAt));
      res.json(allAlerts);
    } catch (error) {
      console.error('Alerts error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/admin/alerts', authenticate, requireRole(adminRoles), async (req: any, res: any) => {
    try {
      const { title, message, severity, targetDistricts, targetDrivers, targetVehicles, expiresAt } = req.body;
      const [a] = await db.insert(alerts).values({
        title: title || 'Operational Alert',
        message: message || '',
        severity: severity || 'high',
        targetDistricts: targetDistricts || [],
        targetDrivers: targetDrivers || [],
        targetVehicles: targetVehicles || [],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.dbUser?.id || null,
      }).returning();
      res.json(a);
    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // SYSTEM HEALTH
  app.get('/api/admin/health', authenticate, requireRole(adminRoles), (req, res) => {
    res.json({
      api: 'healthy',
      database: 'healthy',
      queue: 'healthy',
      weatherProvider: 'degraded',
      routingProvider: 'healthy',
      aiService: 'healthy',
      notificationService: 'healthy',
      uptime: process.uptime()
    });
  });

  // ANALYTICS MOCK
  app.get('/api/admin/analytics', authenticate, requireRole(adminRoles), (req, res) => {
    res.json({
      riskTrends: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], data: [12, 19, 15, 25, 22] },
      districtComparison: { labels: ['Northern', 'Central', 'Eastern'], data: [45, 80, 20] },
      frequentDisruptions: ['Route 4A', 'Valley Bridge', 'Eastern Delta Route 12'],
      predictedDisruptions: ['Route 7 (High Landslide Risk)', 'Coastal Highway (Flood Risk)'],
      delayTrends: { labels: ['Week 1', 'Week 2', 'Week 3'], data: [2.5, 3.1, 1.8] },
      weatherImpact: 'High'
    });
  });

  let emergencyModeActive = false;
  app.get('/api/admin/emergency-mode', authenticate, requireRole(adminRoles), (req, res) => {
    res.json({ active: emergencyModeActive });
  });
  
  app.post('/api/admin/emergency-mode', authenticate, requireRole(adminRoles), async (req: any, res: any) => {
    emergencyModeActive = !!req.body.active;
    
    try {
      await db.insert(auditLogs).values({
        userId: req.dbUser?.id || null,
        action: emergencyModeActive ? 'ACTIVATE_EMERGENCY_MODE' : 'DEACTIVATE_EMERGENCY_MODE',
        entityType: 'system',
        details: { timestamp: new Date() }
      });
    } catch (err) {
      console.error('Audit log error:', err);
    }
    
    res.json({ active: emergencyModeActive });
  });

  // STATS
  app.get('/api/admin/stats', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const [vehiclesRes] = await db.select({ count: count() }).from(vehicles).where(and(eq(vehicles.status, 'available'), isNull(vehicles.deletedAt)));
      const [tripsRes] = await db.select({ count: count() }).from(trips).where(eq(trips.status, 'assigned'));
      const [fieldRes] = await db.select({ count: count() }).from(fieldReports).where(eq(fieldReports.status, 'New'));
      const [emergRes] = await db.select({ count: count() }).from(emergencyReports).where(eq(emergencyReports.status, 'New'));

      res.json({
        activeVehicles: Number(vehiclesRes?.count || 0),
        activeDeliveries: Number(tripsRes?.count || 0),
        delayedDeliveries: 0,
        blockedRoutes: 0,
        openIncidents: Number(fieldRes?.count || 0),
        emergencyEvents: Number(emergRes?.count || 0),
        criticalWeather: 0,
        districtAccess: "100%"
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // USERS
  app.get('/api/admin/users', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const allUsers = await db
        .select({
          id: users.id,
          uid: users.uid,
          email: users.email,
          role: users.role,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId));

      res.json(allUsers.map(u => ({
        id: u.id,
        uid: u.uid,
        email: u.email,
        role: u.role,
        firstName: u.firstName || '',
        lastName: u.lastName || ''
      })));
    } catch (error) {
      console.error('Users error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
