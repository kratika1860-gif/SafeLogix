const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/<ProtectedRoute allowedRoles=\{\['admin', 'super_admin', 'district_officer', 'logistics_coordinator', 'emergency_coordinator'\]\}>\n          <ProtectedRoute allowedRoles=\{\['admin', 'super_admin', 'district_officer', 'logistics_coordinator', 'emergency_coordinator'\]\}>/g, '<ProtectedRoute allowedRoles={[\'admin\', \'super_admin\', \'district_officer\', \'logistics_coordinator\', \'emergency_coordinator\']}>');
fs.writeFileSync('src/App.tsx', content);
