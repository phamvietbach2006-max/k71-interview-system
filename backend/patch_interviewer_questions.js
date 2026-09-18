const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

const INTERVIEW_QUESTIONS = `
const INTERVIEW_QUESTIONS = [
  { id: 'q1', text: "1. Giới thiệu bản thân? (Thông tin cơ bản)" },
  { id: 'q2', text: "2. Theo em, điểm mạnh và điểm yếu của bản thân em là gì? Bằng cách nào điểm mạnh/ điểm yếu ấy lại phù hợp với Ban TCKT?" },
  { id: 'q3', text: "3. Sắp xếp thời gian cân bằng việc học và hoạt động Ban/HĐNK?" },
  { id: 'q4', text: "4. Kinh nghiệm từ HĐNK đã tham gia và sự phù hợp với Ban TCKT?" },
  { id: 'q5', text: "5. Góc nhìn: Bạn hiểu gì về tính chất công việc của Ban TCKT?" },
  { id: 'q6', text: "6. Câu hỏi tình huống: Đại hội Chi đoàn / Thầy cô / Hoạt động lâu dài" },
  { id: 'q7', text: "7. Dành cho SV năm 2: Trải nghiệm năm nhất, ưu điểm và đóng góp?" }
];
`;

// Insert the questions array right after imports
c = c.replace(
  "import ChatWidget from '../components/ChatWidget';",
  "import ChatWidget from '../components/ChatWidget';\n" + INTERVIEW_QUESTIONS
);

// Add questionData state
c = c.replace(
  "  const [result, setResult] = useState('Đạt');",
  `  const [result, setResult] = useState('Đạt');\n  const [questionData, setQuestionData] = useState({\n    q1: { score: 5, note: '' },\n    q2: { score: 5, note: '' },\n    q3: { score: 5, note: '' },\n    q4: { score: 5, note: '' },\n    q5: { score: 5, note: '' },\n    q6: { score: 5, note: '' },\n    q7: { score: 0, note: '' }\n  });`
);

// Update submitEvaluation to send new fields
const origSubmitPayload = `    const payload = {
      interviewCode: currentCandidate.interviewCode,
      department: currentCandidate.department || user.department,
      interviewerUsername: user.username,
      attitudeScore: attitude,
      skillScore: skill,
      problemSolvingScore: problemSolving,
      notes,
      result
    };`;

const newSubmitPayload = `
    const questionsArray = INTERVIEW_QUESTIONS.map(q => ({
      questionText: q.text,
      score: questionData[q.id].score,
      note: questionData[q.id].note
    }));
    
    // Tính điểm
    const answeredQuestions = Object.values(questionData).filter(q => q.score > 0);
    const avgQuestions = answeredQuestions.length > 0 
      ? answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length 
      : 0;
    const avgGeneral = (attitude + skill + problemSolving) / 3;
    const totalScore = parseFloat(((avgQuestions * 0.7) + (avgGeneral * 0.3)).toFixed(2));

    const payload = {
      interviewCode: currentCandidate.interviewCode,
      department: currentCandidate.department || user.department,
      interviewerUsername: user.username,
      attitudeScore: attitude,
      skillScore: skill,
      problemSolvingScore: problemSolving,
      questions: questionsArray,
      totalScore: totalScore,
      notes,
      result
    };`;

c = c.replace(origSubmitPayload, newSubmitPayload);

// Reset questionData on success
c = c.replace(
  "        setAttitude(5); setSkill(5); setProblemSolving(5); setNotes(''); setResult('Đạt');",
  "        setAttitude(5); setSkill(5); setProblemSolving(5); setNotes(''); setResult('Đạt');\n        setQuestionData({ q1: { score: 5, note: '' }, q2: { score: 5, note: '' }, q3: { score: 5, note: '' }, q4: { score: 5, note: '' }, q5: { score: 5, note: '' }, q6: { score: 5, note: '' }, q7: { score: 0, note: '' } });"
);

// Add calculated average to the render method
const origAvgCalc = `  const averageScore = ((attitude + skill + problemSolving) / 3).toFixed(1);`;
const newAvgCalc = `
  const answeredQuestions = Object.values(questionData).filter(q => q.score > 0);
  const avgQuestions = answeredQuestions.length > 0 
    ? answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length 
    : 0;
  const avgGeneral = (attitude + skill + problemSolving) / 3;
  const finalScore = ((avgQuestions * 0.7) + (avgGeneral * 0.3)).toFixed(2);
`;
c = c.replace(origAvgCalc, newAvgCalc);


// Now inject the UI for questions. We'll put it right before the 3 general criteria sliders.
const generalCriteriaUI = `<div className="grid grid-cols-3 gap-4 mb-6">`;
const questionsUI = `
            <div className="mb-8 space-y-6">
              <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Danh sách Câu hỏi Phỏng vấn</h3>
              {INTERVIEW_QUESTIONS.map((q) => (
                <div key={q.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex justify-between items-start mb-3">
                    <label className="text-sm font-bold text-slate-700 flex-1 pr-4 leading-relaxed">{q.text}</label>
                    <div className="flex items-center gap-3 w-32 shrink-0">
                      <span className="text-xs text-slate-500 whitespace-nowrap">Điểm:</span>
                      <input 
                        type="number" min="0" max="10" 
                        className="w-16 border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center font-bold text-lg"
                        value={questionData[q.id].score}
                        onChange={(e) => setQuestionData({...questionData, [q.id]: { ...questionData[q.id], score: Number(e.target.value) }})}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mb-2 italic">Nhập 0 nếu bỏ qua câu hỏi này.</div>
                  <textarea
                    rows={2}
                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 text-sm placeholder:text-slate-400"
                    placeholder="Ghi chú thêm về câu trả lời..."
                    value={questionData[q.id].note}
                    onChange={(e) => setQuestionData({...questionData, [q.id]: { ...questionData[q.id], note: e.target.value }})}
                  ></textarea>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4 mt-6">Đánh giá chung (Thái độ, Kỹ năng, Xử lý)</h3>
            `;

c = c.replace(generalCriteriaUI, questionsUI + generalCriteriaUI);

// Update Total Score UI display
c = c.replace(
  `                  <span className="text-slate-600 font-bold">Tổng điểm trung bình:</span>\r\n                  <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-black text-xl">\r\n                    {averageScore}\r\n                  </span>`,
  `                  <span className="text-slate-600 font-bold">Điểm tổng (70% Câu hỏi + 30% Chung):</span>
                  <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-black text-xl">
                    {finalScore}
                  </span>`
);
c = c.replace( // Same for CRLF differences
  `                  <span className="text-slate-600 font-bold">Tổng điểm trung bình:</span>\n                  <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-black text-xl">\n                    {averageScore}\n                  </span>`,
  `                  <span className="text-slate-600 font-bold">Điểm tổng (70% Câu hỏi + 30% Chung):</span>
                  <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-black text-xl">
                    {finalScore}
                  </span>`
);


fs.writeFileSync(filePath, c, 'utf-8');
console.log('InterviewerView patched for detailed questions!');
