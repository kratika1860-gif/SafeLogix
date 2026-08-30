const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const allDrivers = await db\.select\(\{[\s\S]*?eq\(users\.role, 'driver'\)\);/,
  "const allDrivers = await User.aggregate([\n        { $match: { role: 'driver' } },\n        { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },\n        { $lookup: { from: 'driverprofiles', localField: '_id', foreignField: 'userId', as: 'driverProfile' } },\n        { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },\n        { $unwind: { path: '$driverProfile', preserveNullAndEmptyArrays: true } },\n        { $project: { id: '$_id', email: 1, role: 1, firstName: '$profile.firstName', lastName: '$profile.lastName', licenseNumber: '$driverProfile.licenseNumber', status: '$driverProfile.status' } }\n      ]);"
);

fs.writeFileSync('server.ts', code);
