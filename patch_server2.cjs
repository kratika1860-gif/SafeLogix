const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. /api/auth/me missing db.insert
code = code.replace(
  /\[user\] = await db\.insert\(users\)\.values\(\{\n          uid: req\.user\.uid,\n          email: req\.user\.email\n        \}\)\.returning\(\);\n\n        await db\.insert\(profiles\)\.values\(\{\n          userId: user\.id,\n          firstName: parsed\.data\.firstName,\n          lastName: parsed\.data\.lastName\n        \}\);\n\n        await db\.insert\(driverProfiles\)\.values\(\{\n          userId: user\.id\n        \}\);/,
  "user = await User.create({\n          uid: req.user.uid,\n          email: req.user.email\n        });\n        user = user.toObject();\n\n        await Profile.create({\n          userId: user._id,\n          firstName: parsed.data.firstName,\n          lastName: parsed.data.lastName\n        });\n\n        await DriverProfile.create({\n          userId: user._id\n        });"
);

// 2. /api/driver/status
code = code.replace(
  /await db\.update\(driverProfiles\)\.set\(\{ status: parsed\.data\.isOnDuty \? 'on_duty' : 'off_duty' \}\)\.where\(eq\(driverProfiles\.userId, req\.dbUser\.id\)\);/,
  "await DriverProfile.findOneAndUpdate({ userId: req.dbUser._id }, { status: parsed.data.isOnDuty ? 'on_duty' : 'off_duty' });"
);

// 3. /api/driver/location
code = code.replace(
  /await db\.insert\(locationRecords\)\.values\(\n          parsed\.data\.locations\.map\(loc => \(\{\n            driverId: req\.dbUser\.id,\n            lat: loc\.lat\.toString\(\),\n            lng: loc\.lng\.toString\(\),\n            timestamp: new Date\(loc\.timestamp\)\n          \}\)\)\n        \);/,
  "await LocationRecord.insertMany(\n          parsed.data.locations.map(loc => ({\n            driverId: req.dbUser._id,\n            lat: loc.lat.toString(),\n            lng: loc.lng.toString(),\n            timestamp: new Date(loc.timestamp)\n          }))\n        );"
);

// 4. /api/driver/reports/field
code = code.replace(
  /await db\.insert\(fieldReports\)\.values\(\{\n          reporterId: req\.dbUser\.id,\n          category: parsed\.data\.category,\n          severity: parsed\.data\.severity,\n          description: parsed\.data\.description,\n          locationLat: parsed\.data\.locationLat\.toString\(\),\n          locationLng: parsed\.data\.locationLng\.toString\(\),\n          photoUrls: parsed\.data\.photoUrls\n        \}\);/,
  "await FieldReport.create({\n          reporterId: req.dbUser._id,\n          category: parsed.data.category,\n          severity: parsed.data.severity,\n          description: parsed.data.description,\n          locationLat: parsed.data.locationLat.toString(),\n          locationLng: parsed.data.locationLng.toString(),\n          photoUrls: parsed.data.photoUrls\n        });"
);

// 5. /api/driver/reports/emergency
code = code.replace(
  /await db\.insert\(emergencyReports\)\.values\(\{\n          reporterId: req\.dbUser\.id,\n          type: parsed\.data\.type,\n          description: parsed\.data\.description,\n          locationLat: parsed\.data\.locationLat\.toString\(\),\n          locationLng: parsed\.data\.locationLng\.toString\(\)\n        \}\);/,
  "await EmergencyReport.create({\n          reporterId: req.dbUser._id,\n          type: parsed.data.type,\n          description: parsed.data.description,\n          locationLat: parsed.data.locationLat.toString(),\n          locationLng: parsed.data.locationLng.toString()\n        });"
);

// 6. /api/admin/vehicles post
code = code.replace(
  /const \[v\] = await db\.insert\(vehicles\)\.values\(\{ make, model, year, licensePlate \}\)\.returning\(\);/,
  "const v = await Vehicle.create({ make, model, year, licensePlate });"
);

// 7. /api/admin/vehicles/:id put
code = code.replace(
  /const \[v\] = await db\.update\(vehicles\)\.set\(\{ status \}\)\.where\(eq\(vehicles\.id, parseInt\(req\.params\.id\)\)\)\.returning\(\);/,
  "const v = await Vehicle.findByIdAndUpdate(req.params.id, { status }, { new: true });"
);

// 8. /api/admin/vehicles/:id delete
code = code.replace(
  /const \[v\] = await db\.update\(vehicles\)\.set\(\{ deletedAt: new Date\(\) \}\)\.where\(eq\(vehicles\.id, parseInt\(req\.params\.id\)\)\)\.returning\(\);/,
  "const v = await Vehicle.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });"
);

// 9. req.dbUser.id to req.dbUser._id wherever it is defined
code = code.replace(
  "req.dbUser = user;",
  "req.dbUser = user;"
); // Already ok

// 10. Audit log emergency mode error fix
code = code.replace(
  /await AuditLog\.create\(\{\n          userId: null,\n          action: status === 'Rejected' \? 'REJECT' : 'RESOLVE',\n          entityType: 'report',\n          entityId: r\._id,\n          details: \{ status, resolutionNotes \}\n        \}\);/g,
  "await AuditLog.create({\n      userId: null,\n      action: emergencyModeActive ? 'ACTIVATE_EMERGENCY_MODE' : 'DEACTIVATE_EMERGENCY_MODE',\n      entityType: 'system',\n      details: { timestamp: new Date() }\n    });"
);

// Wait, the audit log replacement from previous script was globally applied in emergency-mode?
// Let's manually replace the emergency mode one correctly.
fs.writeFileSync('server.ts', code);
