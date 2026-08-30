const fs = require('fs');

const filesToPatch = [
  'src/pages/admin/CommandMap.tsx',
  'src/components/map/GISMap.tsx',
  'src/pages/admin/AdminDashboard.tsx',
  'src/components/dashboard/DriverAnalyticsHome.tsx'
];

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // For CommandMap.tsx & GISMap.tsx & AdminDashboard.tsx which have the ternary mapStyle logic
  const maptilerRegex = /mapStyle=\{\s*import\.meta\.env\.VITE_MAPTILER_KEY\s*\?\s*`https:\/\/api\.maptiler\.com\/maps\/streets-v2\$\{theme === 'dark' \? '-dark' : ''\}\/style\.json\?key=\$\{import\.meta\.env\.VITE_MAPTILER_KEY\}`\s*:\s*theme === 'dark'\s*\?\s*'https:\/\/basemaps\.cartocdn\.com\/gl\/dark-matter-gl-style\/style\.json'\s*:\s*'https:\/\/basemaps\.cartocdn\.com\/gl\/voyager-gl-style\/style\.json'\s*\}/;
  
  // For DriverAnalyticsHome.tsx which has a string mapStyle
  const cartoRegex = /mapStyle="https:\/\/basemaps\.cartocdn\.com\/gl\/voyager-gl-style\/style\.json"/;
  
  const freerouteLogic = `mapStyle={\`https://api.maps.freeroute.com/styles/v1/\${theme === 'dark' ? 'dark' : 'light'}/style.json?key=\${import.meta.env.VITE_FREEROUTE_API_KEY || 'fro_8815a0f16a6919bc1cbf01c88bbcf46a1ad7444701bdb18423ba35acdb9b7866'}\`}`;
  
  const freerouteLogicWithoutTheme = `mapStyle={\`https://api.maps.freeroute.com/styles/v1/light/style.json?key=\${import.meta.env.VITE_FREEROUTE_API_KEY || 'fro_8815a0f16a6919bc1cbf01c88bbcf46a1ad7444701bdb18423ba35acdb9b7866'}\`}`;

  if (maptilerRegex.test(content)) {
    content = content.replace(maptilerRegex, freerouteLogic);
  } else if (cartoRegex.test(content)) {
    content = content.replace(cartoRegex, freerouteLogicWithoutTheme);
  }
  
  fs.writeFileSync(file, content);
});
console.log('Patched map styles');
