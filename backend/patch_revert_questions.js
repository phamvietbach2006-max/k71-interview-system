const fs = require('fs');
const path = require('path');

const interviewerPath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let c = fs.readFileSync(interviewerPath, 'utf-8');

// 1. Restore simple score calculation
const newScoreCalc = `  const averageScore = ((Number(attitude) + Number(skill) + Number(problemSolving)) / 3).toFixed(1);`;

const calcRegex = /const isTCKT =[\s\S]*?finalScore = isTCKT[\s\S]*?: avgGeneral\.toFixed\(2\);/;
if (calcRegex.test(c)) {
  c = c.replace(calcRegex, newScoreCalc);
} else {
  console.log("Could not find score calculation regex");
}

// 2. Remove questions UI
const questionsUIRegex = /\{\/\* Interview Questions Section - ONLY FOR TCKT \*\/\}[\s\S]*?\{\/\* Right 1\/2: Evaluation Form \*\/\}/;
if (questionsUIRegex.test(c)) {
  c = c.replace(questionsUIRegex, `{/* Right 1/2: Evaluation Form */}`);
} else {
  console.log("Could not find questions UI regex");
}

// 3. Update total score label
const totalScoreLabelRegex = /<label className="font-bold text-slate-700 text-base">\{isTCKT \? 'Điểm tổng \(70% Câu hỏi \+ 30% Chung\):' : 'Tổng điểm trung bình:'\}<\/label>/;
if (totalScoreLabelRegex.test(c)) {
  c = c.replace(totalScoreLabelRegex, `<label className="font-bold text-slate-700 text-base">Tổng điểm trung bình:</label>`);
}

const finalScoreValueRegex = /\{finalScore\}/g;
c = c.replace(finalScoreValueRegex, `{averageScore}`);

// 4. Update submitEvaluation payload
const payloadQuestionsRegex = /const isTCKTSubmit =[\s\S]*?\];/;
if (payloadQuestionsRegex.test(c)) {
  c = c.replace(payloadQuestionsRegex, ``);
}
c = c.replace(/questions: questionsArray,/g, ``);
c = c.replace(/totalScore: totalScore,/g, ``);

// 5. Restore left column fixed height so it matches the right side if needed, or leave it unbounded?
// User said "thông tin ứng viên không cần phải cuộn nữa, hiện thị đầy đủ, kéo dài theo trang" for the previous fix. Since the right side is now short again, unbounded is fine. It will naturally size to its content.

fs.writeFileSync(interviewerPath, c, 'utf-8');
console.log('InterviewerView restored.');

// Now fix AdminView.jsx
const adminPath = path.join(__dirname, '../frontend/src/pages/AdminView.jsx');
let a = fs.readFileSync(adminPath, 'utf-8');

const adminHeaderRegex = /\{\/\* Total Score Highlight \*\/\}[\s\S]*?\{\/\* Detailed Questions \*\/\}/;
if (adminHeaderRegex.test(a)) {
  a = a.replace(adminHeaderRegex, `
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="block text-xs text-slate-500 font-bold mb-1">Thái độ & Tác phong</span>
                      <span className="text-xl font-black text-slate-700">{selectedEvaluation.attitudeScore}/10</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="block text-xs text-slate-500 font-bold mb-1">Kỹ năng chuyên môn</span>
                      <span className="text-xl font-black text-slate-700">{selectedEvaluation.skillScore}/10</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="block text-xs text-slate-500 font-bold mb-1">Xử lý tình huống</span>
                      <span className="text-xl font-black text-slate-700">{selectedEvaluation.problemSolvingScore}/10</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="block text-xs text-slate-500 font-bold mb-1">Kết quả</span>
                      <span className={\`text-lg font-black \${selectedEvaluation.result === 'Đạt' ? 'text-emerald-600' : selectedEvaluation.result === 'Không đạt' ? 'text-red-600' : 'text-orange-500'}\`}>
                        {selectedEvaluation.result}
                      </span>
                    </div>
                  </div>
                  {/* Detailed Questions */}`);
}

const adminQuestionsRegex = /\{selectedEvaluation\.questions && selectedEvaluation\.questions\.length > 0 && \([\s\S]*?\)\}/;
if (adminQuestionsRegex.test(a)) {
  a = a.replace(adminQuestionsRegex, ``);
}

const adminGeneralCriteriaRegex = /\{\/\* General Criteria \*\/\}[\s\S]*?\{\/\* Overall Notes \*\/\}/;
if (adminGeneralCriteriaRegex.test(a)) {
  a = a.replace(adminGeneralCriteriaRegex, `{/* Overall Notes */}`);
}

fs.writeFileSync(adminPath, a, 'utf-8');
console.log('AdminView restored.');
