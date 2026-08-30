require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  
  // Define schemas directly for seeding if we can't import ES modules easily in CJS
  const User = mongoose.model('User', new mongoose.Schema({ uid: String, email: String, role: String, createdAt: { type: Date, default: Date.now }, deletedAt: Date }));
  const Profile = mongoose.model('Profile', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, firstName: String, lastName: String, phone: String, avatarUrl: String, updatedAt: { type: Date, default: Date.now } }));
  const DriverProfile = mongoose.model('DriverProfile', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, licenseNumber: String, licenseExpiry: Date, status: String, locationLat: String, locationLng: String, updatedAt: { type: Date, default: Date.now } }));
  const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({ make: String, model: String, year: Number, licensePlate: String, status: String, createdAt: { type: Date, default: Date.now }, deletedAt: Date }));
  const Trip = mongoose.model('Trip', new mongoose.Schema({ driverId: mongoose.Schema.Types.ObjectId, vehicleId: mongoose.Schema.Types.ObjectId, status: String, cargoCategory: String, priority: String, startLocation: String, endLocation: String, startLat: String, startLng: String, endLat: String, endLng: String, delayIntelligence: mongoose.Schema.Types.Mixed, createdAt: { type: Date, default: Date.now } }));
  const FieldReport = mongoose.model('FieldReport', new mongoose.Schema({ reporterId: mongoose.Schema.Types.ObjectId, category: String, severity: String, description: String, locationLat: String, locationLng: String, status: String, createdAt: { type: Date, default: Date.now } }));
  const EmergencyReport = mongoose.model('EmergencyReport', new mongoose.Schema({ reporterId: mongoose.Schema.Types.ObjectId, type: String, description: String, locationLat: String, locationLng: String, status: String, createdAt: { type: Date, default: Date.now } }));

  // Clear existing
  await Promise.all([
    User.deleteMany({}), Profile.deleteMany({}), DriverProfile.deleteMany({}),
    Vehicle.deleteMany({}), Trip.deleteMany({}), FieldReport.deleteMany({}), EmergencyReport.deleteMany({})
  ]);

  // Admin
  const admin = await User.create({ uid: 'mock-admin-uid', email: 'admin@example.com', role: 'admin' });
  await Profile.create({ userId: admin._id, firstName: 'System', lastName: 'Admin' });

  // Driver
  const driver = await User.create({ uid: 'mock-driver-uid', email: 'driver@example.com', role: 'driver' });
  await Profile.create({ userId: driver._id, firstName: 'John', lastName: 'Doe' });
  await DriverProfile.create({ userId: driver._id, licenseNumber: 'LIC123456', status: 'off_duty' });

  // Vehicles
  const v1 = await Vehicle.create({ make: 'Toyota', model: 'Hiace', year: 2021, licensePlate: 'HK-1234', status: 'available' });
  const v2 = await Vehicle.create({ make: 'Isuzu', model: 'N-Series', year: 2020, licensePlate: 'HK-5678', status: 'maintenance' });

  // Trips
  await Trip.create({
    driverId: driver._id,
    vehicleId: v1._id,
    cargoCategory: 'Medical Supplies',
    priority: 'critical',
    status: 'assigned',
    startLocation: 'Central Hospital',
    endLocation: 'North District Clinic',
    startLat: '22.28',
    startLng: '114.15',
    endLat: '22.31',
    endLng: '114.16',
    delayIntelligence: { expectedDelay: '0 hrs', actualDelay: '0 hrs', cause: 'None', weatherFactor: 'Low', routeFactor: 'Clear', incidentFactor: 'None', recommendedAction: 'Proceed as planned' }
  });

  // Reports
  await FieldReport.create({
    reporterId: driver._id,
    category: 'Obstacle',
    severity: 'Medium',
    description: 'Fallen tree blocking the road',
    locationLat: '22.32',
    locationLng: '114.15',
    status: 'New'
  });

  await EmergencyReport.create({
    reporterId: driver._id,
    type: 'Medical',
    description: 'Driver feels unwell',
    locationLat: '22.31',
    locationLng: '114.17',
    status: 'New'
  });

  console.log('Seeding complete');
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
