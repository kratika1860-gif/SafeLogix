const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

const correctEnding = `
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
`;

code = code.replace(/\/\/ Alerts[\s\S]*/, correctEnding.trim());

fs.writeFileSync('src/db/schema.ts', code);
