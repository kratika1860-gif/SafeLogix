import 'dotenv/config';
import { db } from './src/db/index.ts';
import { users, driverProfiles, profiles, vehicles, trips, fieldReports, emergencyReports, alerts } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log("Starting seed...");
  try {
    // 1. Ensure an admin user exists
    let admin = await db.select().from(users).where(eq(users.email, "admin@example.com"));
    let adminId;
    if (admin.length === 0) {
      const [newAdmin] = await db.insert(users).values({ uid: "mock-admin-uid", email: "admin@example.com", role: "admin" }).returning();
      await db.insert(profiles).values({ userId: newAdmin.id, firstName: "System", lastName: "Admin" });
      adminId = newAdmin.id;
    } else {
      adminId = admin[0].id;
    }

    // 2. Ensure a driver user exists
    let driver = await db.select().from(users).where(eq(users.email, "driver@example.com"));
    let driverId;
    if (driver.length === 0) {
      const [newDriver] = await db.insert(users).values({ uid: "mock-driver-uid", email: "driver@example.com", role: "driver" }).returning();
      await db.insert(profiles).values({ userId: newDriver.id, firstName: "John", lastName: "Doe" });
      await db.insert(driverProfiles).values({ userId: newDriver.id, licenseNumber: "LIC123456", status: "off_duty" });
      driverId = newDriver.id;
    } else {
      driverId = driver[0].id;
    }

    // 3. Vehicles
    const existingVehicles = await db.select().from(vehicles);
    let v1Id, v2Id;
    if (existingVehicles.length === 0) {
      const [v1] = await db.insert(vehicles).values({ make: "Toyota", model: "Hiace", year: 2021, licensePlate: "HK-1234", status: "available" }).returning();
      const [v2] = await db.insert(vehicles).values({ make: "Isuzu", model: "N-Series", year: 2020, licensePlate: "HK-5678", status: "maintenance" }).returning();
      v1Id = v1.id; v2Id = v2.id;
    } else {
      v1Id = existingVehicles[0].id;
    }

    // 4. Trips
    const existingTrips = await db.select().from(trips);
    if (existingTrips.length === 0) {
      await db.insert(trips).values({
        driverId: driverId,
        vehicleId: v1Id,
        cargoCategory: "Medical Supplies",
        priority: "critical",
        status: "assigned",
        startLocation: "Central Hospital",
        endLocation: "North District Clinic",
        startLat: "22.28",
        startLng: "114.15",
        endLat: "22.31",
        endLng: "114.16",
      });
    }

    // 5. Reports
    const existingFR = await db.select().from(fieldReports);
    if (existingFR.length === 0) {
      await db.insert(fieldReports).values({
        reporterId: driverId,
        category: "Obstacle",
        severity: "Medium",
        description: "Fallen tree blocking the road",
        locationLat: "22.32",
        locationLng: "114.15",
        status: "New"
      });
    }
    
    // 6. Emergencies
    const existingER = await db.select().from(emergencyReports);
    if (existingER.length === 0) {
      await db.insert(emergencyReports).values({
        reporterId: driverId,
        type: "Medical",
        description: "Driver feels unwell",
        locationLat: "22.31",
        locationLng: "114.17",
        status: "New"
      });
    }

    console.log("Seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
