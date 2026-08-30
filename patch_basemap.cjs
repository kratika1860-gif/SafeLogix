const fs = require('fs');
let content = fs.readFileSync('src/components/map/BaseMap.tsx', 'utf8');

content = content.replace(
  /export default function BaseMap\(\{/,
  `import { forwardRef, useImperativeHandle } from 'react';

const BaseMap = forwardRef<MapRef, BaseMapProps>(({`
);

content = content.replace(
  /: BaseMapProps\) \{/,
  `}, ref) => {`
);

content = content.replace(
  /const mapRef = useRef<MapRef>\(null\);/,
  `const mapRef = useRef<MapRef>(null);
  useImperativeHandle(ref, () => mapRef.current as MapRef);`
);

content = content.replace(
  /}\n$/,
  `});
export default BaseMap;
`
);

fs.writeFileSync('src/components/map/BaseMap.tsx', content);
