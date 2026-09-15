const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/TvView.jsx", "utf8");

// Change moving container
code = code.replace(
  `className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 min-h-[30vh]"`,
  `className="h-[45%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2"`
);
code = code.replace(
  `className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 min-h-[30vh]"`,
  `className="h-[45%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2"`
);

// Change waiting container
code = code.replace(
  `className="bg-slate-900/40 rounded-3xl p-6"`,
  `className="h-[55%] bg-slate-900/40 rounded-3xl p-6 flex flex-col overflow-hidden"`
);
code = code.replace(
  `className="bg-slate-900/40 rounded-3xl p-6"`,
  `className="h-[55%] bg-slate-900/40 rounded-3xl p-6 flex flex-col overflow-hidden"`
);

// Change waiting list wrapper to overflow-y-auto
code = code.replace(
  `<div className="flex flex-col gap-3">`,
  `<div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-2">`
);
code = code.replace(
  `<div className="flex flex-col gap-3">`,
  `<div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-2">`
);

fs.writeFileSync("frontend/src/pages/TvView.jsx", code, "utf8");
console.log("Fixed TvView.jsx layout");
