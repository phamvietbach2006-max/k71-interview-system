const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

// 1. Inject finalScore calculation right before return (
const returnStmt = `  return (\n    <div`;
const finalScoreCalc = `  const answeredQuestions = Object.values(questionData).filter(q => q.score > 0);
  const avgQuestions = answeredQuestions.length > 0 
    ? answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length 
    : 0;
  const avgGeneral = (Number(attitude) + Number(skill) + Number(problemSolving)) / 3;
  const finalScore = ((avgQuestions * 0.7) + (avgGeneral * 0.3)).toFixed(2);

  return (
    <div`;

if (!c.includes('const finalScore =')) {
  c = c.replace(returnStmt, finalScoreCalc);
  // fallback for CRLF
  c = c.replace(`  return (\r\n    <div`, finalScoreCalc.replace(/\n/g, '\r\n'));
}

// 2. Inject Questions UI
const generalCriteriaUI = `                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">`;
const questionsUI = `
                        {/* Interview Questions Section */}
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                          <h3 className="font-bold text-slate-700 text-lg border-b pb-2 sticky top-0 bg-white/90 backdrop-blur-md z-10">Danh sách Câu hỏi Phỏng vấn</h3>
                          {INTERVIEW_QUESTIONS.map((q) => (
                            <div key={q.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <div className="flex justify-between items-start mb-3">
                                <label className="text-sm font-bold text-slate-700 flex-1 pr-4 leading-relaxed">{q.text}</label>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Điểm:</span>
                                  <input 
                                    type="number" min="0" max="10" 
                                    className="w-14 h-8 border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center font-bold text-base"
                                    value={questionData[q.id].score}
                                    onChange={(e) => setQuestionData({...questionData, [q.id]: { ...questionData[q.id], score: Number(e.target.value) }})}
                                  />
                                </div>
                              </div>
                              <div className="text-xs text-slate-400 mb-2 italic">Nhập 0 nếu bỏ qua câu hỏi này.</div>
                              <textarea
                                rows={2}
                                className="w-full rounded-lg border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm placeholder:text-slate-400"
                                placeholder="Ghi chú thêm về câu trả lời..."
                                value={questionData[q.id].note}
                                onChange={(e) => setQuestionData({...questionData, [q.id]: { ...questionData[q.id], note: e.target.value }})}
                              ></textarea>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">`;

if (!c.includes('Danh sách Câu hỏi Phỏng vấn')) {
  c = c.replace(generalCriteriaUI, questionsUI);
}

// 3. Update Total Score Display
const origTotalUI = `                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                          <label className="font-bold text-slate-700 text-base">Tổng điểm trung bình:</label>
                          <span className="text-2xl font-black text-indigo-600 bg-indigo-50 px-5 py-1.5 rounded-xl border border-indigo-100 shadow-inner">
                            {((Number(attitude) + Number(skill) + Number(problemSolving)) / 3).toFixed(1)}
                          </span>
                        </div>`;

const newTotalUI = `                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                          <label className="font-bold text-slate-700 text-base">Điểm tổng (70% Câu hỏi + 30% Chung):</label>
                          <span className="text-2xl font-black text-indigo-600 bg-indigo-50 px-5 py-1.5 rounded-xl border border-indigo-100 shadow-inner">
                            {finalScore}
                          </span>
                        </div>`;

if (c.includes('Tổng điểm trung bình:')) {
  c = c.replace(origTotalUI, newTotalUI);
  c = c.replace(origTotalUI.replace(/\n/g, '\r\n'), newTotalUI);
}

// Fix styling of the parent container to allow scrolling properly since it's getting long
const origContainer = `                      <div className="xl:w-1/2 space-y-5 flex flex-col justify-between h-[70vh]">`;
const newContainer = `                      <div className="xl:w-1/2 space-y-5 flex flex-col h-[70vh] overflow-y-auto custom-scrollbar pr-2">`;
if (c.includes(origContainer)) {
  c = c.replace(origContainer, newContainer);
}

fs.writeFileSync(filePath, c, 'utf-8');
console.log('InterviewerView UI patched successfully!');
