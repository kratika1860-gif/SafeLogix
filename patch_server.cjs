const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace imports
code = code.replace("import { db } from './src/db/index.js';", "import { connectDB, User, Profile, DriverProfile, Vehicle, Trip, FieldReport, EmergencyReport, Alert, LocationRecord, AuditLog } from './src/db/mongo.js';\nimport 'dotenv/config';");
code = code.replace(/import \{ users, driverProfiles, profiles, fieldReports, emergencyReports, locationRecords, auditLogs, vehicles, trips, alerts \} from '\.\/src\/db\/schema\.js';\n/, "");
code = code.replace(/import \{ eq, isNull, desc, sql \} from 'drizzle-orm';\n/, "");

// Inject connection
code = code.replace("async function startServer() {", "async function startServer() {\n  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/test');");

// 1. /api/auth/me
code = code.replace(
  "const [user] = await db.select().from(users).where(eq(users.uid, req.user.uid));",
  "const user = await User.findOne({ uid: req.user.uid }).lean();"
);
code = code.replace(
  /const \[newUser\] = await db\.insert\(users\)\.values\(\{ uid: req\.user\.uid, email: req\.user\.email \}\)\.returning\(\);/,
  "const newUser = await User.create({ uid: req.user.uid, email: req.user.email });\n          await Profile.create({ userId: newUser._id, firstName: 'User', lastName: 'Name' });"
);
code = code.replace("user = newUser;", "user = newUser.toObject();");

// 2. /api/admin/users/:uid/role
code = code.replace(
  "let [user] = await db.select().from(users).where(eq(users.uid, uid));",
  "let user = await User.findOne({ uid });"
);
code = code.replace(
  /const \[updated\] = await db\.update\(users\)\.set\(\{ role: newRole \}\)\.where\(eq\(users\.id, user\.id\)\)\.returning\(\);/,
  "user.role = newRole; await user.save(); const updated = user;"
);

// 3. /api/driver/profile
code = code.replace(
  "const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));\n      const [driverProfile] = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id));",
  "const profile = await Profile.findOne({ userId: user._id }).lean();\n      const driverProfile = await DriverProfile.findOne({ userId: user._id }).lean();"
);

// 4. /api/admin/vehicles
code = code.replace(
  "const allVehicles = await db.select().from(vehicles).where(isNull(vehicles.deletedAt));",
  "const allVehicles = await Vehicle.find({ deletedAt: null }).lean();"
);
code = code.replace(
  /const \[v\] = await db\.insert\(vehicles\)\.values\(\{ make, model, year, licensePlate, status \}\)\.returning\(\);/,
  "const v = await Vehicle.create({ make, model, year, licensePlate, status });"
);

// 5. /api/admin/drivers
code = code.replace(
  /const allDrivers = await db\.select\(\{[\s\S]*?\}\)\.from\(users\)[\s\S]*?eq\(users\.id, driverProfiles\.userId\)\);/,
  "const allDrivers = await User.aggregate([\n        { $match: { role: 'driver' } },\n        { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },\n        { $lookup: { from: 'driverprofiles', localField: '_id', foreignField: 'userId', as: 'driverProfile' } },\n        { $unwind: '$profile' },\n        { $unwind: { path: '$driverProfile', preserveNullAndEmptyArrays: true } },\n        { $project: { id: '$_id', uid: 1, email: 1, firstName: '$profile.firstName', lastName: '$profile.lastName', licenseNumber: '$driverProfile.licenseNumber', status: '$driverProfile.status' } }\n      ]);"
);

// 6. /api/admin/trips
code = code.replace(
  "const allTrips = await db.select().from(trips).orderBy(desc(trips.createdAt));",
  "const allTrips = await Trip.find().sort({ createdAt: -1 }).lean();"
);
code = code.replace(
  /const \[t\] = await db\.insert\(trips\)\.values\(\{[\s\S]*?\}\)\.returning\(\);/,
  "const t = await Trip.create({\n        driverId,\n        vehicleId,\n        cargoCategory,\n        priority,\n        startLocation,\n        endLocation,\n        status: 'assigned',\n        delayIntelligence: {\n          expectedDelay: priority === 'critical' ? '0 hrs' : '2 hrs',\n          actualDelay: '0 hrs',\n          cause: 'None',\n          weatherFactor: 'Low',\n          routeFactor: 'Clear',\n          incidentFactor: 'None',\n          recommendedAction: 'Proceed as planned'\n        }\n      });"
);

// 7. /api/admin/incidents/field/:id
code = code.replace(
  /const \[r\] = await db\.update\(fieldReports\)\.set\(\{ status, assignedResponderId, resolutionNotes, severity \}\)\.where\(eq\(fieldReports\.id, parseInt\(req\.params\.id\)\)\)\.returning\(\);/,
  "const r = await FieldReport.findByIdAndUpdate(req.params.id, { status, assignedResponderId, resolutionNotes, severity }, { new: true });"
);
code = code.replace(
  /await db\.insert\(auditLogs\)\.values\(\{[\s\S]*?\}\);/g,
  "await AuditLog.create({\n          userId: null,\n          action: status === 'Rejected' ? 'REJECT' : 'RESOLVE',\n          entityType: 'report',\n          entityId: r._id,\n          details: { status, resolutionNotes }\n        });"
);

// 8. /api/admin/incidents/emergency/:id
code = code.replace(
  /const \[r\] = await db\.update\(emergencyReports\)\.set\(\{ status, assignedResponderId, resolutionNotes \}\)\.where\(eq\(emergencyReports\.id, parseInt\(req\.params\.id\)\)\)\.returning\(\);/,
  "const r = await EmergencyReport.findByIdAndUpdate(req.params.id, { status, assignedResponderId, resolutionNotes }, { new: true });"
);

// 9. /api/admin/alerts
code = code.replace(
  "const allAlerts = await db.select().from(alerts).orderBy(desc(alerts.createdAt));",
  "const allAlerts = await Alert.find().sort({ createdAt: -1 }).lean();"
);
code = code.replace(
  /const \[a\] = await db\.insert\(alerts\)\.values\(\{[\s\S]*?\}\)\.returning\(\);/,
  "const a = await Alert.create({\n        title, message, severity, targetDistricts, targetDrivers, targetVehicles, expiresAt: expiresAt ? new Date(expiresAt) : null, createdBy: null\n      });"
);

// 10. /api/admin/emergency-mode
code = code.replace(
  /await db\.insert\(auditLogs\)\.values\(\{[\s\S]*?\}\);/,
  "await AuditLog.create({\n      userId: null,\n      action: emergencyModeActive ? 'ACTIVATE_EMERGENCY_MODE' : 'DEACTIVATE_EMERGENCY_MODE',\n      entityType: 'system',\n      details: { timestamp: new Date() }\n    });"
);

// 11. /api/admin/drivers/:id
code = code.replace(
  /const \[d\] = await db\.update\(driverProfiles\)\.set\(\{ status \}\)\.where\(eq\(driverProfiles\.userId, parseInt\(req\.params\.id\)\)\)\.returning\(\);/,
  "const d = await DriverProfile.findOneAndUpdate({ userId: req.params.id }, { status }, { new: true });"
);

// 12. /api/admin/stats
code = code.replace(
  /const activeVehiclesCount = await db\.select\(\{ count: sql`count\(\*\)` \}\)\.from\(vehicles\)\.where\(eq\(vehicles\.status, 'available'\)\);[\s\S]*?const emergencyEventsCount = await db\.select\(\{ count: sql`count\(\*\)` \}\)\.from\(emergencyReports\)\.where\(eq\(emergencyReports\.status, 'New'\)\);/,
  "const activeVehiclesCount = await Vehicle.countDocuments({ status: 'available' });\n      const tripsCount = await Trip.countDocuments({ status: 'assigned' });\n      const openIncidentsCount = await FieldReport.countDocuments({ status: 'New' });\n      const emergencyEventsCount = await EmergencyReport.countDocuments({ status: 'New' });"
);
code = code.replace(
  /activeVehicles: activeVehiclesCount\[0\]\?\.count \|\| 0,[\s\S]*?emergencyEvents: emergencyEventsCount\[0\]\?\.count \|\| 0,/,
  "activeVehicles: activeVehiclesCount,\n        activeDeliveries: tripsCount,\n        delayedDeliveries: 0,\n        blockedRoutes: 0,\n        openIncidents: openIncidentsCount,\n        emergencyEvents: emergencyEventsCount,"
);

// 13. /api/admin/users
code = code.replace(
  /const allUsers = await db\.select\(\{[\s\S]*?\}\)\.from\(users\)\.leftJoin\(profiles, eq\(users\.id, profiles\.userId\)\);/,
  "const allUsers = await User.aggregate([\n        { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },\n        { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },\n        { $project: { id: '$_id', uid: 1, email: 1, role: 1, firstName: '$profile.firstName', lastName: '$profile.lastName' } }\n      ]);"
);

// 14. /api/admin/incidents
code = code.replace(
  /const allFieldReports = await db\.select\(\)\.from\(fieldReports\);\n      const allEmergencyReports = await db\.select\(\)\.from\(emergencyReports\);/,
  "const allFieldReports = await FieldReport.find().lean();\n      const allEmergencyReports = await EmergencyReport.find().lean();"
);


fs.writeFileSync('server.ts', code);
