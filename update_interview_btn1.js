const fs = require('fs'); 
let txt = fs.readFileSync('frontend/src/pages/InterviewerView.jsx', 'utf8'); 
txt = txt.replace(/XÁC NHẬN ĐÃ CÓ MẶT\\s*<\\/button>/i, match => match + '\\n                      <button onClick={cancelInterview} className=\"mt-4 text-red-500 hover:text-red-700 font-bold px-6 py-2 rounded-xl border-2 border-transparent hover:border-red-200 hover:bg-red-50 transition-all flex items-center gap-2 mx-auto\"><XCircle size={20} /> Hủy lượt & Đưa về hàng chờ</button>');
fs.writeFileSync('frontend/src/pages/InterviewerView.jsx', txt);
