export const dynamic = 'force-static';

import fs from 'fs';
import path from 'path';

export default function HomePage() {
  const htmlPath = path.join(process.cwd(), 'public', 'homepage.html');
  
  // For development, return a note
  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <iframe 
        src="/homepage.html" 
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none', 
          margin: 0, 
          padding: 0 
        }} 
      />
    </div>
  );
}
