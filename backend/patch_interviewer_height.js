const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

// 1. Remove strict height constraints from the right column container
const oldRightCol = `<div className="xl:w-1/2 space-y-5 flex flex-col h-[70vh] overflow-y-auto custom-scrollbar pr-2">`;
const newRightCol = `<div className="xl:w-1/2 space-y-5 flex flex-col">`;

c = c.replace(oldRightCol, newRightCol);

// 2. Remove max-height and scrolling from the questions section
const oldQuestionsWrapper = `<div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">`;
const newQuestionsWrapper = `<div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4">`;

c = c.replace(oldQuestionsWrapper, newQuestionsWrapper);

// 3. Remove the sticky header inside questions to just be normal since it's no longer scrolling inside
const oldStickyHeader = `<h3 className="font-bold text-slate-700 text-lg border-b pb-2 sticky top-0 bg-white/90 backdrop-blur-md z-10">Danh sách Câu hỏi Phỏng vấn</h3>`;
const newHeader = `<h3 className="font-bold text-slate-700 text-lg border-b pb-2">Danh sách Câu hỏi Phỏng vấn</h3>`;

c = c.replace(oldStickyHeader, newHeader);

// 4. Also, the left column (Thông tin Ứng viên) has a fixed height? Let's check. 
// "h-full" or something. We want the layout to just naturally expand.

fs.writeFileSync(filePath, c, 'utf-8');
console.log('InterviewerView heights patched.');
