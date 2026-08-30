const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

const newReports = `// Field Reports
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
});`;

code = code.replace(/\/\/ Field Reports[\s\S]*?export const emergencyReportsRelations/m, newReports + '\n\nexport const alertsRelations = relations(alerts, ({ one }) => ({\n  createdBy: one(users, { fields: [alerts.createdBy], references: [users.id] }),\n}));\n\nexport const emergencyReportsRelations');

fs.writeFileSync('src/db/schema.ts', code);
