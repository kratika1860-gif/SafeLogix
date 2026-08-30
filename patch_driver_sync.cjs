const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /await db\.insert\(locationRecords\)\.values\([\s\S]*?\n        \);/,
  "await LocationRecord.insertMany(\n          gps.map(g => ({\n            driverId,\n            lat: g.lat.toString(),\n            lng: g.lng.toString(),\n            timestamp: new Date(g.timestamp)\n          }))\n        );"
);

code = code.replace(
  /await db\.insert\(fieldReports\)\.values\([\s\S]*?\n        \);/,
  "await FieldReport.insertMany(\n          incidents.map(i => ({\n            reporterId: driverId,\n            category: i.category,\n            severity: i.severity,\n            description: i.description,\n            locationLng: i.location[0].toString(),\n            locationLat: i.location[1].toString(),\n            photoUrls: i.photoUrls || []\n          }))\n        );"
);

code = code.replace(
  /await db\.insert\(emergencyReports\)\.values\([\s\S]*?\n        \);/,
  "await EmergencyReport.insertMany(\n          emergencies.map(e => ({\n            reporterId: driverId,\n            type: e.type,\n            description: e.description,\n            locationLng: e.location[0].toString(),\n            locationLat: e.location[1].toString()\n          }))\n        );"
);

code = code.replace(
  "const driverId = req.dbUser.id;",
  "const driverId = req.dbUser._id;"
);

// fix /api/admin/drivers/:id status 
code = code.replace(
  /await db\.update\(driverProfiles\)\.set\(\{ status: parsed\.data\.isOnDuty \? 'on_duty' : 'off_duty' \}\)\.where\(eq\(driverProfiles\.userId, req\.dbUser\.id\)\);/,
  "await DriverProfile.findOneAndUpdate({ userId: req.dbUser._id }, { status: parsed.data.isOnDuty ? 'on_duty' : 'off_duty' });"
);

fs.writeFileSync('server.ts', code);
