const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/InterviewerView.jsx', 'utf-8');

const targetStr = `Object.entries(currentCandidate.applicationData).map(([key, value], idx) => {
                                if (['Id', 'Th?i gian b_t \` u', 'Th?i gian hoAn thAnh', 'TAn+ Nhn xAct', 'Kt qu', 'TAn', 'NgA'n ng_'].includes(key)) return null;
                                return (
                                  <div key={idx} className="bg-white/80 p-3.5 rounded-xl shadow-sm border border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">{key}</div>
                                    <div className="text-sm font-medium text-slate-800 break-words">{value}</div>
                                  </div>
                                );
                              })`;

const replacementStr = `Object.entries(currentCandidate.applicationData).map(([key, value], idx) => {
                                const hiddenKeys = ['Id', 'ID', 'Thời gian bắt đầu', 'Start time', 'Thời gian hoàn thành', 'Completion time', 'Tên+ Nhận xét', 'Kết quả', 'Tên', 'Name', 'Ngôn ngữ', 'Language'];
                                if (hiddenKeys.includes(key)) return null;
                                
                                let displayValue = value;
                                if (typeof value === 'string' && (key.toLowerCase().includes('facebook') || value.startsWith('http'))) {
                                  let url = value;
                                  if (!url.startsWith('http')) url = 'https://' + url;
                                  displayValue = <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">{value}</a>;
                                }

                                return (
                                  <div key={idx} className="bg-white/80 p-3.5 rounded-xl shadow-sm border border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">{key}</div>
                                    <div className="text-sm font-medium text-slate-800 break-words">{displayValue}</div>
                                  </div>
                                );
                              })`;

// It might be encoded differently in Windows, so we'll just use regex or index to find it!
const startIdx = code.indexOf('Object.entries(currentCandidate.applicationData).map(([key, value], idx) => {');
if (startIdx !== -1) {
  const endMarker = '})';
  let endIdx = code.indexOf(endMarker, startIdx);
  // wait, there are nested {}, let's just find `);` then `})`
  endIdx = code.indexOf('})', code.indexOf('</div>', startIdx) + 5) + 2;
  
  if (endIdx > 10) {
    code = code.substring(0, startIdx) + replacementStr + code.substring(endIdx);
    fs.writeFileSync('frontend/src/pages/InterviewerView.jsx', code, 'utf-8');
    console.log("Success");
  } else {
    console.log("Failed to find end index");
  }
} else {
  console.log("Failed to find start index");
}
