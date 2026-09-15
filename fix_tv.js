const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/TvView.jsx", "utf8");

// QR
code = code.replace("w-32 h-32 rounded-xl object-contain border-4 border-slate-100", "w-56 h-56 rounded-3xl object-contain border-4 border-slate-100 shadow-inner");
code = code.replace("text-2xl font-black text-slate-800 uppercase tracking-widest", "text-5xl font-black text-slate-800 uppercase tracking-widest mb-2");
code = code.replace("p-4 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.2)]", "p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.2)]");
code = code.replace("gap-6 bg-white p-4", "gap-10 bg-white p-6");
code = code.replace("text-center pr-6 border-r border-slate-200", "text-center pr-10 border-r-2 border-slate-200");
code = code.replace("text-slate-500 font-bold", "text-slate-500 font-bold text-xl");

// TCKT Waiting
const tcktOld = `<div className="flex flex-wrap gap-3">
                {tcktWaiting.map(c => (
                  <div key={c.interviewCode} className="bg-blue-500/20 text-blue-100 px-4 py-2 rounded-xl border border-blue-400/30 font-bold">
                    {c.interviewCode}
                  </div>
                ))}
              </div>`;
const tcktNew = `<div className="flex flex-col gap-3">
                {tcktWaiting.map((c, index) => (
                  <div key={c.interviewCode} className="bg-blue-500/20 text-blue-100 px-5 py-3 rounded-2xl border border-blue-400/30 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-5">
                      <span className="text-3xl font-black text-blue-200 w-12 text-center drop-shadow-md">#{index + 1}</span>
                      <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tight drop-shadow-sm">{c.applicationData?.["Họ và tên"] || "Ứng viên"}</span>
                        <span className="text-blue-300 font-bold text-sm uppercase tracking-widest mt-1">MSSV: {c.interviewCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>`;
code = code.replace(tcktOld, tcktNew);

// BCS Waiting
const bcsOld = `<div className="flex flex-wrap gap-3">
                {bcsWaiting.map(c => (
                  <div key={c.interviewCode} className="bg-emerald-500/20 text-emerald-100 px-4 py-2 rounded-xl border border-emerald-400/30 font-bold">
                    {c.interviewCode}
                  </div>
                ))}
              </div>`;
const bcsNew = `<div className="flex flex-col gap-3">
                {bcsWaiting.map((c, index) => (
                  <div key={c.interviewCode} className="bg-emerald-500/20 text-emerald-100 px-5 py-3 rounded-2xl border border-emerald-400/30 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-5">
                      <span className="text-3xl font-black text-emerald-200 w-12 text-center drop-shadow-md">#{index + 1}</span>
                      <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tight drop-shadow-sm">{c.applicationData?.["Họ và tên"] || "Ứng viên"}</span>
                        <span className="text-emerald-300 font-bold text-sm uppercase tracking-widest mt-1">MSSV: {c.interviewCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>`;
code = code.replace(bcsOld, bcsNew);

fs.writeFileSync("frontend/src/pages/TvView.jsx", code, "utf8");
console.log("Fixed TvView.jsx");
