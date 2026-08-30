const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const target = `  app.get('/api/admin/stats', authenticate, requireRole(adminRoles), async (req, res) => {
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
  });`;

const replacement = `  app.get('/api/admin/stats', authenticate, requireRole(adminRoles), async (req, res) => {
    try {
      const activeVehiclesCount = await db.select({ count: sql\`count(*)\` }).from(vehicles).where(eq(vehicles.status, 'available'));
      const tripsCount = await db.select({ count: sql\`count(*)\` }).from(trips).where(eq(trips.status, 'in_progress'));
      const openIncidentsCount = await db.select({ count: sql\`count(*)\` }).from(fieldReports).where(eq(fieldReports.status, 'New'));
      const emergencyEventsCount = await db.select({ count: sql\`count(*)\` }).from(emergencyReports).where(eq(emergencyReports.status, 'New'));

      res.json({
        activeVehicles: activeVehiclesCount[0]?.count || 0,
        activeDeliveries: tripsCount[0]?.count || 0,
        delayedDeliveries: 0,
        blockedRoutes: 0,
        openIncidents: openIncidentsCount[0]?.count || 0,
        emergencyEvents: emergencyEventsCount[0]?.count || 0,
        criticalWeather: 0,
        districtAccess: "100%"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });`;

const newContent = content.replace(target, replacement);
fs.writeFileSync('server.ts', newContent);
