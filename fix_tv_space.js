const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/TvView.jsx", "utf8");

// Fix container padding and gap
code = code.replace(
  /className="lg:w-1\/2 flex flex-col gap-6 bg-gradient-to-br from-blue-900\/80 to-indigo-900\/80 backdrop-blur-2xl rounded-\[3rem\] border border-blue-400\/30 shadow-\[0_0_50px_rgba\(37,99,235,0\.2\)\] p-8"/g,
  `className="lg:w-1/2 flex flex-col gap-3 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-2xl rounded-[3rem] border border-blue-400/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] p-6 pt-4"`
);

code = code.replace(
  /className="lg:w-1\/2 flex flex-col gap-6 bg-gradient-to-br from-emerald-900\/80 to-teal-900\/80 backdrop-blur-2xl rounded-\[3rem\] border border-emerald-400\/30 shadow-\[0_0_50px_rgba\(16,185,129,0\.2\)\] p-8"/g,
  `className="lg:w-1/2 flex flex-col gap-3 bg-gradient-to-br from-emerald-900/80 to-teal-900/80 backdrop-blur-2xl rounded-[3rem] border border-emerald-400/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] p-6 pt-4"`
);

// Fix logo container (remove border, padding bottom, margin bottom)
code = code.replace(
  `className="flex justify-center border-b border-blue-500/30 pb-4 mb-2"`,
  `className="flex justify-center -mt-2 -mb-4"`
);
code = code.replace(
  `className="flex justify-center border-b border-emerald-500/30 pb-4 mb-2"`,
  `className="flex justify-center -mt-2 -mb-4"`
);

// Fix image styling
code = code.replace(
  `className="w-[95%] h-auto max-h-[400px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-110"`,
  `className="w-full max-w-[90%] h-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"`
);
code = code.replace(
  `className="w-[95%] h-auto max-h-[400px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-110"`,
  `className="w-full max-w-[90%] h-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"`
);

// Expand moving section and add top border to it instead of the logo
code = code.replace(
  `className="h-[45%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2"`,
  `className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 border-t border-blue-500/30 pt-4"`
);
code = code.replace(
  `className="h-[45%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2"`,
  `className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 border-t border-emerald-500/30 pt-4"`
);

// Expand waiting section
code = code.replace(
  `className="h-[55%] bg-slate-900/40 rounded-3xl p-6 flex flex-col overflow-hidden"`,
  `className="flex-[1.2] bg-slate-900/40 rounded-3xl p-6 flex flex-col overflow-hidden"`
);
code = code.replace(
  `className="h-[55%] bg-slate-900/40 rounded-3xl p-6 flex flex-col overflow-hidden"`,
  `className="flex-[1.2] bg-slate-900/40 rounded-3xl p-6 flex flex-col overflow-hidden"`
);

fs.writeFileSync("frontend/src/pages/TvView.jsx", code, "utf8");
console.log("Fixed TvView.jsx spacing");
