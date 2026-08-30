import fs from 'fs';
let content = fs.readFileSync('src/components/map/GISMap.tsx', 'utf-8');

if (!content.includes('AlertTriangle')) {
  content = "import { AlertTriangle } from 'lucide-react';\n" + content;
} else if (content.indexOf('AlertTriangle') > 1000) {
  // if it's only in the JSX
  content = "import { AlertTriangle } from 'lucide-react';\n" + content;
}

fs.writeFileSync('src/components/map/GISMap.tsx', content);
