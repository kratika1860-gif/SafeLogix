import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, boolean, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const tripStatusEnum = pgEnum('trip_status', [
  'assigned', 'accepted', 'preparing', 'started', 
  'in_transit', 'delayed', 'route_changed', 'paused', 
  'emergency', 'delivered', 'completed', 'cancelled'
]);
export const vehicleStatusEnum = pgEnum('vehicle_status', ['available', 'assigned', 'maintenance']);
export const roleEnum = pgEnum('role', ['admin', 'super_admin', 'district_officer', 'logistics_coordinator', 'emergency_coordinator', 'driver', 'field_user']);

// Users (Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID
  email: text('email').notNull(),
  role: roleEnum('role').default('driver').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Profiles (General User Profile)
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Driver Profiles (Driver specific info)
export const driverProfiles = pgTable('driver_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  licenseNumber: text('license_number'),
  licenseExpiry: timestamp('license_expiry'),
  status: text('status').default('off_duty').notNull(), // 'off_duty', 'on_duty'
  locationLat: text('location_lat'),
  locationLng: text('location_lng'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vehicles
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  licensePlate: text('license_plate').notNull().unique(),
  status: vehicleStatusEnum('status').default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Driver Vehicle Assignments
export const driverVehicleAssignments = pgTable('driver_vehicle_assignments', {
  id: serial('id').primaryKey(),
  driverId: integer('driver_id').references(() => users.id).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  unassignedAt: timestamp('unassigned_at'),
});

// Trips
export const trips = pgTable('trips', {
  id: serial('id').primaryKey(),
  driverId: integer('driver_id').references(() => users.id).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  status: tripStatusEnum('status').default('assigned').notNull(),
  cargoCategory: text('cargo_category').default('Other'), // Medicines, Food, Agricultural produce, Construction materials, Emergency supplies, Other
  priority: text('priority').default('normal'), // low, normal, high, critical
  startLocation: text('start_location').notNull(),
  endLocation: text('end_location').notNull(),
  startLat: text('start_lat'),
  startLng: text('start_lng'),
  endLat: text('end_lat'),
  endLng: text('end_lng'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  estimatedArrivalTime: timestamp('estimated_arrival_time'),
  delayIntelligence: jsonb('delay_intelligence'), // { expectedDelay, actualDelay, cause, weatherFactor, routeFactor, incidentFactor, recommendedAction }
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // e.g. 'alert', 'info', 'emergency'
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  driverProfile: one(driverProfiles, { fields: [users.id], references: [driverProfiles.userId] }),
  assignments: many(driverVehicleAssignments),
  trips: many(trips),
  notifications: many(notifications),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const driverProfilesRelations = relations(driverProfiles, ({ one }) => ({
  user: one(users, { fields: [driverProfiles.userId], references: [users.id] }),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  assignments: many(driverVehicleAssignments),
  trips: many(trips),
}));

export const driverVehicleAssignmentsRelations = relations(driverVehicleAssignments, ({ one }) => ({
  driver: one(users, { fields: [driverVehicleAssignments.driverId], references: [users.id] }),
  vehicle: one(vehicles, { fields: [driverVehicleAssignments.vehicleId], references: [vehicles.id] }),
}));

export const tripsRelations = relations(trips, ({ one }) => ({
  driver: one(users, { fields: [trips.driverId], references: [users.id] }),
  vehicle: one(vehicles, { fields: [trips.vehicleId], references: [vehicles.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Field Reports
export const fieldReports = pgTable('field_reports', {
  id: serial('id').primaryKey(),
  reporterId: integer('reporter_id').references(() => users.id).notNull(),
  category: text('category').notNull(),
  severity: text('severity').notNull(),
  description: text('description').notNull(),
  locationLat: text('location_lat').notNull(),
  locationLng: text('location_lng').notNull(),
  photoUrls: jsonb('photo_urls'),
  status: text('status').default('New').notNull(),
  assignedResponderId: integer('assigned_responder_id').references(() => users.id),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Emergency Reports
export const emergencyReports = pgTable('emergency_reports', {
  id: serial('id').primaryKey(),
  reporterId: integer('reporter_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  description: text('description'),
  locationLat: text('location_lat').notNull(),
  locationLng: text('location_lng').notNull(),
  status: text('status').default('New').notNull(),
  assignedResponderId: integer('assigned_responder_id').references(() => users.id),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Alerts
export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: text('severity').notNull(),
  targetDistricts: jsonb('target_districts'),
  targetDrivers: jsonb('target_drivers'),
  targetVehicles: jsonb('target_vehicles'),
  expiresAt: timestamp('expires_at'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Location Queue (GPS tracking)
export const locationRecords = pgTable('location_records', {
  id: serial('id').primaryKey(),
  driverId: integer('driver_id').references(() => users.id).notNull(),
  lat: text('lat').notNull(),
  lng: text('lng').notNull(),
  timestamp: timestamp('timestamp').notNull(),
});

export const fieldReportsRelations = relations(fieldReports, ({ one }) => ({
  reporter: one(users, { fields: [fieldReports.reporterId], references: [users.id] }),
}));

export const emergencyReportsRelations = relations(emergencyReports, ({ one }) => ({
  reporter: one(users, { fields: [emergencyReports.reporterId], references: [users.id] }),
}));

export const locationRecordsRelations = relations(locationRecords, ({ one }) => ({
  driver: one(users, { fields: [locationRecords.driverId], references: [users.id] }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  createdBy: one(users, { fields: [alerts.createdBy], references: [users.id] }),
}));