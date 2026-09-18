const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

// 1. Fix the calculation logic to depend on department
const oldFinalScoreCalc = `  const answeredQuestions = Object.values(questionData).filter(q => q.score > 0);
  const avgQuestions = answeredQuestions.length > 0 
    ? answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length 
    : 0;
  const avgGeneral = (Number(attitude) + Number(skill) + Number(problemSolving)) / 3;
  const finalScore = ((avgQuestions * 0.7) + (avgGeneral * 0.3)).toFixed(2);`;

const newFinalScoreCalc = `  const isTCKT = (currentCandidate?.department || user?.department) === 'TCKT';
  const answeredQuestions = Object.values(questionData).filter(q => q.score > 0);
  const avgQuestions = answeredQuestions.length > 0 
    ? answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length 
    : 0;
  const avgGeneral = (Number(attitude) + Number(skill) + Number(problemSolving)) / 3;
  const finalScore = isTCKT 
    ? ((avgQuestions * 0.7) + (avgGeneral * 0.3)).toFixed(2)
    : avgGeneral.toFixed(2);`;

c = c.replace(oldFinalScoreCalc, newFinalScoreCalc);
c = c.replace(oldFinalScoreCalc.replace(/\n/g, '\r\n'), newFinalScoreCalc);

// 2. Hide Questions UI for non-TCKT
const oldQuestionsUI = `                        {/* Interview Questions Section */}
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">`;

const newQuestionsUI = `                        {/* Interview Questions Section - ONLY FOR TCKT */}
                        {isTCKT && (
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">`;

c = c.replace(oldQuestionsUI, newQuestionsUI);
c = c.replace(oldQuestionsUI.replace(/\n/g, '\r\n'), newQuestionsUI);

const oldQuestionsUIEnd = `                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">`;

const newQuestionsUIEnd = `                          ))}
                        </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">`;

c = c.replace(oldQuestionsUIEnd, newQuestionsUIEnd);
c = c.replace(oldQuestionsUIEnd.replace(/\n/g, '\r\n'), newQuestionsUIEnd);

// 3. Update the label for Total Score depending on isTCKT
const oldTotalScoreLabel = `<label className="font-bold text-slate-700 text-base">Điểm tổng (70% Câu hỏi + 30% Chung):</label>`;
const newTotalScoreLabel = `<label className="font-bold text-slate-700 text-base">{isTCKT ? 'Điểm tổng (70% Câu hỏi + 30% Chung):' : 'Tổng điểm trung bình:'}</label>`;

c = c.replace(oldTotalScoreLabel, newTotalScoreLabel);

// 4. In submitEvaluation, clear questionsArray if not TCKT
const oldQuestionsPayload = `    const questionsArray = INTERVIEW_QUESTIONS.map(q => ({
      questionText: q.text,
      score: questionData[q.id].score,
      note: questionData[q.id].note
    }));`;

const newQuestionsPayload = `    const isTCKTSubmit = (currentCandidate?.department || user?.department) === 'TCKT';
    const questionsArray = isTCKTSubmit ? INTERVIEW_QUESTIONS.map(q => ({
      questionText: q.text,
      score: questionData[q.id].score,
      note: questionData[q.id].note
    })) : [];`;

c = c.replace(oldQuestionsPayload, newQuestionsPayload);
c = c.replace(oldQuestionsPayload.replace(/\n/g, '\r\n'), newQuestionsPayload);

fs.writeFileSync(filePath, c, 'utf-8');
console.log('InterviewerView patched to show questions only for TCKT.');
