const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// Container grid
content = content.replace(
  /className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"/g,
  'className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"'
);

// Box padding
content = content.replace(
  /className="glass-panel border border-white\/10 rounded-\[2rem\] p-8 flex flex-col items-start group hover:border-\[\#c5a059\]\/50 transition-all shadow-2xl text-left relative overflow-hidden"/g,
  'className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"'
);

// Blur
content = content.replace(
  /w-32 h-32 (.+?) -mr-16 -mt-16/g,
  'w-24 h-24 $1 -mr-12 -mt-12'
);

// Icon container
content = content.replace(
  /className="w-14 h-14 ([^"]+) rounded-2xl flex items-center justify-center border ([^"]+) group-hover:bg-\[\#c5a059\] group-hover:text-black transition-all shadow-2xl mb-8"/g,
  'className="w-10 h-10 $1 rounded-xl flex items-center justify-center border $2 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4"'
);
content = content.replace(
  /className="w-7 h-7"/g,
  'className="w-5 h-5"'
);

// Title
content = content.replace(
  /className="font-black text-white tracking-tight text-2xl group-hover:text-\[\#c5a059\] transition-colors mb-2 uppercase"/g,
  'className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase"'
);

// Subtitle
content = content.replace(
  /className="text-\[10px\] font-black text-zinc-500 uppercase tracking-\[0\.2em\] mb-8"/g,
  'className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1"'
);

// Tags container
content = content.replace(
  /className="flex flex-wrap gap-3 mb-10"/g,
  'className="flex flex-wrap gap-2 mb-5"'
);

// Tags
content = content.replace(
  /className="px-3 py-1\.5 rounded-lg bg-white\/5 border border-white\/10 text-\[8px\] font-black uppercase tracking-widest text-zinc-400"/g,
  'className="px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-zinc-400"'
);

// Footer
content = content.replace(
  /className="mt-auto w-full flex items-center justify-between pt-6 border-t border-white\/5"/g,
  'className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5"'
);

// Footer text
content = content.replace(
  /className="text-\[10px\] font-black text-\[\#c5a059\] uppercase tracking-widest group-hover:text-white transition-colors">Initialize Test/g,
  'className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start'
);
content = content.replace(
  /className="text-\[10px\] font-black text-\[\#c5a059\] uppercase tracking-widest group-hover:text-white transition-colors">Take Test/g,
  'className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start'
);

// Footer Icon button
content = content.replace(
  /className="w-10 h-10 rounded-xl bg-\[\#c5a059\]\/10 flex items-center justify-center border border-\[\#c5a059\]\/20 group-hover:bg-\[\#c5a059\] group-hover:text-black transition-all"/g,
  'className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden xs:flex"'
);

// Footer Icon
content = content.replace(
  /className="w-5 h-5"/g,
  'className="w-4 h-4"'
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
