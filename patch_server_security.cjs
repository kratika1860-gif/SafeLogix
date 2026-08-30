const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add helmet and rate-limit imports
if (!code.includes("import helmet from 'helmet';")) {
  code = code.replace("import express from 'express';", "import express from 'express';\nimport helmet from 'helmet';\nimport rateLimit from 'express-rate-limit';");
}

// Add middlewares after app = express()
const middlewares = `
// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for the preview environment compatibility
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
`;

if (!code.includes("app.use(helmet(")) {
  code = code.replace("const PORT = process.env.PORT || 3000;\n", "const PORT = process.env.PORT || 3000;\n" + middlewares);
}

const healthEndpoint = `
  // SYSTEM HEALTH
  app.get('/api/admin/health', authenticate, requireRole(adminRoles), (req, res) => {
    res.json({
      api: 'healthy',
      database: 'healthy',
      queue: 'healthy',
      weatherProvider: 'degraded',
      routingProvider: 'healthy',
      aiService: 'healthy',
      notificationService: 'healthy',
      uptime: process.uptime()
    });
  });
`;

if (!code.includes("/api/admin/health")) {
  code = code.replace("  // ANALYTICS MOCK", healthEndpoint + "\n  // ANALYTICS MOCK");
}

fs.writeFileSync('server.ts', code);
