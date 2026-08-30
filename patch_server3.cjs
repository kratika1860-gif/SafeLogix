const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newAdminEndpoints = `
  // INCIDENT UPDATES
  app.put('/api/admin/incidents/field/:id', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const { status, assignedResponderId, resolutionNotes, severity } = req.body;
      const [r] = await db.update(fieldReports).set({ status, assignedResponderId, resolutionNotes, severity }).where(eq(fieldReports.id, parseInt(req.params.id))).returning();
      
      // Audit log for critical actions
      if (status === 'Rejected' || status === 'Resolved') {
        await db.insert(auditLogs).values({
          userId: 1, // Mock user ID for admin
          action: status === 'Rejected' ? 'REJECT_REPORT' : 'RESOLVE_REPORT',
          entityType: 'field_report',
          entityId: r.id,
          details: { status, resolutionNotes }
        });
      }
      
      res.json(r);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/incidents/emergency/:id', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const { status, assignedResponderId, resolutionNotes } = req.body;
      const [r] = await db.update(emergencyReports).set({ status, assignedResponderId, resolutionNotes }).where(eq(emergencyReports.id, parseInt(req.params.id))).returning();
      
      if (status === 'Rejected' || status === 'Resolved') {
        await db.insert(auditLogs).values({
          userId: 1, 
          action: status === 'Rejected' ? 'REJECT_EMERGENCY' : 'RESOLVE_EMERGENCY',
          entityType: 'emergency_report',
          entityId: r.id,
          details: { status, resolutionNotes }
        });
      }

      res.json(r);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ALERTS
  app.get('/api/admin/alerts', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const allAlerts = await db.select().from(alerts).orderBy(desc(alerts.createdAt));
      res.json(allAlerts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/admin/alerts', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const { title, message, severity, targetDistricts, targetDrivers, targetVehicles, expiresAt } = req.body;
      const [a] = await db.insert(alerts).values({
        title, message, severity, targetDistricts, targetDrivers, targetVehicles, expiresAt: expiresAt ? new Date(expiresAt) : null, createdBy: 1
      }).returning();
      res.json(a);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ANALYTICS MOCK
  app.get('/api/admin/analytics', authenticate, requireRole(adminRoles), async (req, res) => {
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
  
  app.post('/api/admin/emergency-mode', authenticate, requireRole(adminRoles), async (req, res) => {
    emergencyModeActive = req.body.active;
    
    // Audit log
    await db.insert(auditLogs).values({
      userId: 1,
      action: emergencyModeActive ? 'ACTIVATE_EMERGENCY_MODE' : 'DEACTIVATE_EMERGENCY_MODE',
      entityType: 'system',
      details: { timestamp: new Date() }
    });
    
    res.json({ active: emergencyModeActive });
  });

`;

code = code.replace("  // DRIVER ACTIVATION/APPROVAL", newAdminEndpoints + "\n  // DRIVER ACTIVATION/APPROVAL");
code = code.replace("import { users, driverProfiles, profiles, fieldReports, emergencyReports, locationRecords, auditLogs, vehicles, trips } from './src/db/schema.js';", "import { users, driverProfiles, profiles, fieldReports, emergencyReports, locationRecords, auditLogs, vehicles, trips, alerts } from './src/db/schema.js';");

fs.writeFileSync('server.ts', code);
