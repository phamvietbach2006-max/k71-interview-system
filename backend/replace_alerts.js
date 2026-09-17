const fs = require('fs');

const filesToFix = [
  'frontend/src/pages/AdminView.jsx',
  'frontend/src/pages/CandidateView.jsx',
  'frontend/src/pages/InterviewerView.jsx',
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/ReceptionistView.jsx'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  if (!content.includes("import toast")) {
    content = content.replace(/(import React.*?;\n)/, "$1import toast from 'react-hot-toast';\n");
  }

  // Replace error alerts
  content = content.replace(/alert\((.*?lỗi.*?|.*?Lỗi.*?|.*?không.*?|.*?vui lòng.*?|.*?thất bại.*?|.*?Vui lòng.*?|.*?Network error.*?|.*?Not allowed.*?)\)/gi, 'toast.error($1)');
  
  // Replace success alerts
  content = content.replace(/alert\((.*?thành công.*?|.*?Đã gửi.*?|.*?Chuyển sang check-in.*?)\)/gi, 'toast.success($1)');
  
  // Any leftover alert that we couldn't classify, just make it a normal toast
  content = content.replace(/alert\(/g, 'toast(');
  
  fs.writeFileSync(file, content, 'utf-8');
  console.log("Replaced alerts in", file);
});
