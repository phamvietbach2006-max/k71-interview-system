const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/TvView.jsx", "utf8");

code = code.replace(
  `className="w-3/4 max-w-2xl max-h-40 object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"`,
  `className="w-[95%] h-auto max-h-[400px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-110"`
);
code = code.replace(
  `className="w-3/4 max-w-2xl max-h-40 object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"`,
  `className="w-[95%] h-auto max-h-[400px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-110"`
);

fs.writeFileSync("frontend/src/pages/TvView.jsx", code, "utf8");
console.log("Fixed TvView.jsx image size");
