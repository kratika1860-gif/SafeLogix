const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

code = code.replace("const { t } = useTranslation();", `const { t } = useTranslation();
  const [stats, setStats] = React.useState<any>({
    activeVehicles: 142,
    activeDeliveries: 86,
    delayedDeliveries: 14,
    blockedRoutes: 3,
    openIncidents: 24,
    emergencyEvents: 2,
    criticalWeather: 1,
    districtAccess: "92%"
  });

  useEffect(() => {
    import('../../store/useAppStore').then(({ fetchWithAuth }) => {
      fetchWithAuth('/api/admin/stats').then(setStats).catch(console.error);
    });
  }, []);
`);

code = code.replace(/<StatCard title="Active Vehicles" value=\{142\}/, `<StatCard title="Active Vehicles" value={stats.activeVehicles}`);
code = code.replace(/<StatCard title="Active Deliveries" value=\{86\}/, `<StatCard title="Active Deliveries" value={stats.activeDeliveries}`);
code = code.replace(/<StatCard title="Delayed Deliveries" value=\{14\}/, `<StatCard title="Delayed Deliveries" value={stats.delayedDeliveries}`);
code = code.replace(/<StatCard title="Blocked Routes" value=\{3\}/, `<StatCard title="Blocked Routes" value={stats.blockedRoutes}`);
code = code.replace(/<StatCard title="Open Incidents" value=\{24\}/, `<StatCard title="Open Incidents" value={stats.openIncidents}`);
code = code.replace(/<StatCard title="Emergency Events" value=\{2\}/, `<StatCard title="Emergency Events" value={stats.emergencyEvents}`);
code = code.replace(/<StatCard title="Critical Weather" value=\{1\}/, `<StatCard title="Critical Weather" value={stats.criticalWeather}`);
code = code.replace(/<StatCard title="District Access" value="92%"/, `<StatCard title="District Access" value={stats.districtAccess}`);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
