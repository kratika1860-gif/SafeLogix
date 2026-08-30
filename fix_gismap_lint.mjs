import fs from 'fs';
let content = fs.readFileSync('src/components/map/GISMap.tsx', 'utf-8');

// Fix deliveries layer
content = content.replace(/layers.deliveries/g, 'layers.deliveryLocations');

// Fix 'logistics' entity type -> 'warehouse' or 'delivery'
// We can just use the property's type if available, e.g., cluster.properties.type
content = content.replace(
  /setSelectedEntity\(cluster\.properties\.id, 'logistics'\)/g,
  "setSelectedEntity(cluster.properties.id, cluster.properties.type || 'warehouse')"
);

// Add AlertTriangle import
if (!content.includes('AlertTriangle')) {
  content = content.replace(
    "import { X } from 'lucide-react';",
    "import { X, AlertTriangle } from 'lucide-react';"
  );
  if (!content.includes('AlertTriangle')) {
    content = "import { AlertTriangle } from 'lucide-react';\n" + content;
  }
}

fs.writeFileSync('src/components/map/GISMap.tsx', content);
