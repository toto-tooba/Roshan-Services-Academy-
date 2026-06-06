const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

content = content.replace(
  /hidden xs:flex/g,
  'hidden sm:flex'
);
content = content.replace(
  /className="px-2 py-1 rounded-md text-center bg-white\/5 border border-white\/10 text-\[8px\] font-black uppercase tracking-widest text-zinc-400"/g,
  'className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate"'
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
