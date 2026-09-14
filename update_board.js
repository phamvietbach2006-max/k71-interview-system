const fs = require('fs'); 
let txt = fs.readFileSync('frontend/src/pages/Board.jsx', 'utf8'); 
txt = txt.replace(/<span className=\{`font-black text-xl tracking-tight [^>]+>\{c\.interviewCode\}<\/span>/g, match => match.replace('c.interviewCode', "c.applicationData?.['Họ và tên'] || c.interviewCode")); 
txt = txt.replace(/<div className="font-black text-xl text-slate-800 tracking-tight">\{c\.interviewCode\}<\/div>/g, match => match.replace('c.interviewCode', "c.applicationData?.['Họ và tên'] || c.interviewCode")); 
fs.writeFileSync('frontend/src/pages/Board.jsx', txt);
