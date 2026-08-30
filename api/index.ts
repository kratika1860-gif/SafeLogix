import express from 'express';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const isDriverToken = authHeader.includes('DEV_MOCK_TOKEN') && !authHeader.includes('DEV_MOCK_ADMIN_TOKEN');

  if (isDriverToken) {
    return res.json({
      user: { id: '1', uid: 'dev-mock-uid', email: 'driver@safelogix.gov.in', role: 'driver', name: 'Rajesh Kumar' },
      driverState: { isOnDuty: true }
    });
  }

  res.json({
    user: { id: '2', uid: 'dev-mock-admin-uid', email: 'admin@safelogix.gov.in', role: 'admin', name: 'HQ Commander' },
    driverState: { isOnDuty: false }
  });
});

app.post('/api/driver/duty', (req, res) => {
  res.json({ success: true, isOnDuty: req.body.isOnDuty });
});

app.post('/api/sync', (req, res) => {
  res.json({ success: true, syncedCounts: { gps: 1, incidents: 0, emergencies: 0 } });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({ activeVehicles: 12, activeDeliveries: 8, delayedDeliveries: 1, blockedRoutes: 2, openIncidents: 3, emergencyEvents: 1, criticalWeather: 1, districtAccess: '94.5%' });
});

app.get('/api/admin/vehicles', (req, res) => {
  res.json([
    { id: 1, make: 'Toyota', model: 'Hilux 4x4', year: 2024, licensePlate: 'AS-01-HC-1024', status: 'available' },
    { id: 2, make: 'Mahindra', model: 'Bolero Pickup', year: 2023, licensePlate: 'AS-01-EC-4820', status: 'assigned' },
    { id: 3, make: 'Tata', model: 'Yodha 4x4', year: 2024, licensePlate: 'AS-01-TR-9912', status: 'available' },
    { id: 4, make: 'Isuzu', model: 'D-Max', year: 2023, licensePlate: 'AS-01-MB-3310', status: 'maintenance' }
  ]);
});

app.get('/api/admin/drivers', (req, res) => {
  res.json([
    { id: 1, email: 'driver1@safelogix.gov.in', role: 'driver', firstName: 'Rajesh', lastName: 'Kumar', licenseNumber: 'DL-AS012023901', status: 'on_duty' },
    { id: 2, email: 'driver2@safelogix.gov.in', role: 'driver', firstName: 'Biren', lastName: 'Gogoi', licenseNumber: 'DL-AS012022841', status: 'on_duty' },
    { id: 3, email: 'driver3@safelogix.gov.in', role: 'driver', firstName: 'Amit', lastName: 'Saikia', licenseNumber: 'DL-AS012021503', status: 'off_duty' }
  ]);
});

app.get('/api/admin/trips', (req, res) => {
  res.json([
    { id: 101, driverId: 1, vehicleId: 2, cargoCategory: 'Medical Supplies', priority: 'critical', startLocation: 'Guwahati Central Depot (Garchuk)', endLocation: 'Dispur Medical Complex', status: 'assigned', createdAt: new Date().toISOString(), delayIntelligence: { expectedDelay: '0 hrs', actualDelay: '0 hrs', cause: 'None', weatherFactor: 'Clear', routeFactor: 'Clear', incidentFactor: 'None', recommendedAction: 'Proceed as planned' } }
  ]);
});

app.get('/api/admin/incidents', (req, res) => {
  res.json({
    fieldReports: [
      { id: 1, reporterId: 1, category: 'Landslide', severity: 'High', description: 'Partial road blockage near Sonapur Pass', locationLng: '91.9800', locationLat: '26.1100', status: 'New', createdAt: new Date().toISOString() },
      { id: 2, reporterId: 2, category: 'Waterlogging', severity: 'Medium', description: 'Standing water 1.5ft deep on NH-27 connector', locationLng: '91.8100', locationLat: '26.1500', status: 'In_Progress', createdAt: new Date().toISOString() }
    ],
    emergencyReports: []
  });
});

app.get('/api/admin/alerts', (req, res) => {
  res.json([
    { id: 1, title: 'Flash Flood Advisory - Kamrup Metro', message: 'Heavy rainfall forecasted along River Brahmaputra corridor.', severity: 'high', targetDistricts: ['Kamrup Metro'], targetDrivers: [], targetVehicles: [], createdAt: new Date().toISOString() }
  ]);
});

app.get('/api/admin/health', (req, res) => {
  res.json({ api: 'healthy', database: 'healthy', queue: 'healthy', weatherProvider: 'healthy', routingProvider: 'healthy', aiService: 'healthy', notificationService: 'healthy', uptime: 100 });
});

app.get('/api/admin/analytics', (req, res) => {
  res.json({
    riskTrends: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], data: [12, 19, 15, 25, 22] },
    districtComparison: { labels: ['Northern', 'Central', 'Eastern'], data: [45, 80, 20] },
    frequentDisruptions: ['Route 4A', 'Valley Bridge'],
    predictedDisruptions: ['Route 7 (Landslide Risk)'],
    delayTrends: { labels: ['Week 1', 'Week 2', 'Week 3'], data: [2.5, 3.1, 1.8] },
    weatherImpact: 'High'
  });
});

app.get('/api/admin/users', (req, res) => {
  res.json([
    { id: 1, uid: 'user-driver-1', email: 'driver1@safelogix.gov.in', role: 'driver', firstName: 'Rajesh', lastName: 'Kumar' },
    { id: 2, uid: 'dev-mock-admin-uid', email: 'admin@safelogix.gov.in', role: 'admin', firstName: 'HQ', lastName: 'Commander' }
  ]);
});

export default app;
