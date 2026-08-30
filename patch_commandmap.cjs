const fs = require('fs');
const content = fs.readFileSync('src/pages/admin/CommandMap.tsx', 'utf8');

const target1 = `export default function CommandMap() {`;
const replacement1 = `export default function CommandMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);`;

const target2 = `const selectedDistrict = MOCK_DISTRICTS.find(d => d.id === selectedDistrictId);`;
const replacement2 = `const selectedDistrict = MOCK_DISTRICTS.find(d => d.id === selectedDistrictId);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: \`https://api.maptiler.com/maps/streets-v2/style.json?key=\${import.meta.env.VITE_MAPTILER_KEY}\`,
        center: [114.1694, 22.3193],
        zoom: 9,
        attributionControl: false
      });
      
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);`;

let newContent = content.replace(target1, replacement1);
newContent = newContent.replace(target2, replacement2);
fs.writeFileSync('src/pages/admin/CommandMap.tsx', newContent);
