const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const adminEndpoints = `
  // Admin Endpoints
  const adminRoles = ['admin', 'super_admin', 'district_officer', 'logistics_coordinator', 'emergency_coordinator'];

  app.get('/api/admin/stats', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      // Simulate real data fetch for the dashboard
      res.json({
        activeVehicles: 142,
        activeDeliveries: 86,
        delayedDeliveries: 14,
        blockedRoutes: 3,
        openIncidents: 24,
        emergencyEvents: 2,
        criticalWeather: 1,
        districtAccess: "92%"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/admin/users', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        uid: users.uid,
        email: users.email,
        role: users.role,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      }).from(users).leftJoin(profiles, eq(users.id, profiles.userId));
      res.json(allUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/admin/incidents', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const allFieldReports = await db.select().from(fieldReports);
      const allEmergencyReports = await db.select().from(emergencyReports);
      res.json({ fieldReports: allFieldReports, emergencyReports: allEmergencyReports });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

`;

code = code.replace('// Vite middleware for development', adminEndpoints + '\n  // Vite middleware for development');
fs.writeFileSync('server.ts', code);
