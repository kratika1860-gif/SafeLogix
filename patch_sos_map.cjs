const fs = require('fs');
const file = 'src/pages/admin/SOSAlerts.tsx';
let content = fs.readFileSync(file, 'utf8');

const maptilerRegex = /mapStyle=\{\s*import\.meta\.env\.VITE_MAPTILER_KEY\s*\?\s*`https:\/\/api\.maptiler\.com\/maps\/streets-v2\$\{theme === 'dark' \? '-dark' : ''\}\/style\.json\?key=\$\{import\.meta\.env\.VITE_MAPTILER_KEY\}`\s*:\s*theme === 'dark'\s*\?\s*'https:\/\/basemaps\.cartocdn\.com\/gl\/dark-matter-gl-style\/style\.json'\s*:\s*'https:\/\/basemaps\.cartocdn\.com\/gl\/voyager-gl-style\/style\.json'\s*\}/;
const freerouteLogic = `mapStyle={\`https://api.maps.freeroute.com/styles/v1/\${theme === 'dark' ? 'dark' : 'light'}/style.json?key=\${import.meta.env.VITE_FREEROUTE_API_KEY || 'fro_8815a0f16a6919bc1cbf01c88bbcf46a1ad7444701bdb18423ba35acdb9b7866'}\`}`;

if (maptilerRegex.test(content)) {
  content = content.replace(maptilerRegex, freerouteLogic);
  fs.writeFileSync(file, content);
  console.log('Patched SOSAlerts map style');
} else {
  console.log('Regex did not match for SOSAlerts.tsx');
}
