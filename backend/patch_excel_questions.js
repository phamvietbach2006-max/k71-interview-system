const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

// 1. Remove left column scroll
const oldLeftCol = `<div className="xl:w-1/2 bg-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-sm h-[70vh] overflow-y-auto custom-scrollbar">`;
const newLeftCol = `<div className="xl:w-1/2 bg-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-sm">`;

c = c.replace(oldLeftCol, newLeftCol);

// 2. Update INTERVIEW_QUESTIONS to match exact Excel content
const oldQuestionsArrayMatch = /const INTERVIEW_QUESTIONS = \[[\s\S]*?\];/m;
const newQuestionsArray = `const INTERVIEW_QUESTIONS = [
  { id: 'q1', text: "Giới thiệu bản thân? (Yêu cầu ứng viên giới thiệu thông tin cơ bản)" },
  { id: 'q2', text: "Theo em, điểm mạnh và điểm yếu của bản thân em là gì? Bằng cách nào điểm mạnh/ điểm yếu ấy lại phù hợp với Ban TCKT?" },
  { id: 'q3', text: "Em có đang đăng ký tham gia vào CLB/ Tổ chức nào khác không?\\n- Nếu ứng viên trả lời \\"Có\\" => Em sẽ sắp xếp thời gian tham gia hoạt động của Ban như thế nào để cân bằng việc học và khối lượng HĐNK khá nhiều như vậy?\\n- Nếu ứng viên trả lời \\"Không\\" => Em sẽ sắp sẽ sắp xếp thời gian tham gia hoạt động của Ban như thế nào để cân bằng việc học và hiệu quả công việc của Ban?" },
  { id: 'q4', text: "Đặt câu hỏi sâu về các vị trí/ HĐNK mà ứng viên đã tham gia?\\n- Với các ứng viên đã có HĐNK C3 => VD: Em đã đóng góp gì, học hỏi được gì từ vị trí đó? Những kinh nghiệm ấy phù hợp như thế nào với Ban TCKT" },
  { id: 'q5', text: "Câu hỏi góc nhìn: Các bạn phỏng vấn check theo câu trả lời cho câu hỏi sau trên đơn của ứng viên: Bạn hiểu gì về tính chất công việc của những hoạt động đó?\\nVD: Theo em, tỉ mỉ và cẩn thận có phải là khái niệm chuẩn xác nhất để định nghĩa ban TCKT?" },
  { id: 'q6', text: "Câu hỏi tình huống: Phổ biến sơ qua về DHCD của TCKT với ứng viên trước khi hỏi.\\n=> Gỉa sử em tham gia đại hội CĐ của Chi đoàn A trong vai trò của Đại diện TCKT Đoàn ĐH, một số Đoàn viên Chi đoàn có dấu hiệu không chấp hành, cợt nhả, thậm chí là xúc phạm đại biểu của TCKT, em sẽ làm gì?" },
  { id: 'q7', text: "Câu hỏi tình huống 2: Gỉa sử có giảng viên tham gia buổi họp, đại diện Đoàn trường từ chối dừng/ hủy buổi họp, em sẽ xử lý ra sao?" },
  { id: 'q8', text: "Em có xác định hoạt động lâu dài hay không?" },
  { id: 'q9', text: "Dành cho Sinh viên năm 2:\\n- Năm nhất em đã có những trải nghiệm gì?\\n- Em nghĩ bản thân có ưu điểm gì hơn so với các bạn sinh viên năm nhất?\\n- Em có thể đóng góp gì cho Ban từ những trải nghiệm ấy?" },
  { id: 'q10', text: "CÂU HỎI CUỐI: Em có câu hỏi gì cho Ban không?" }
];`;

c = c.replace(oldQuestionsArrayMatch, newQuestionsArray);

// 3. Update the initial state of questionData
const oldInitialStateStr = `const [questionData, setQuestionData] = useState({
    q1: { score: 5, note: '' },
    q2: { score: 5, note: '' },
    q3: { score: 5, note: '' },
    q4: { score: 5, note: '' },
    q5: { score: 5, note: '' },
    q6: { score: 5, note: '' },
    q7: { score: 0, note: '' }
  });`;
  
const newInitialStateStr = `const [questionData, setQuestionData] = useState({
    q1: { score: 5, note: '' }, q2: { score: 5, note: '' },
    q3: { score: 5, note: '' }, q4: { score: 5, note: '' },
    q5: { score: 5, note: '' }, q6: { score: 5, note: '' },
    q7: { score: 5, note: '' }, q8: { score: 5, note: '' },
    q9: { score: 0, note: '' }, q10: { score: 0, note: '' }
  });`;

// Replace both Unix and Windows line endings
const oldInitialStateRegex = /const \[questionData, setQuestionData\] = useState\(\{[\s\S]*?\}\);/;
c = c.replace(oldInitialStateRegex, newInitialStateStr);

// 4. Update the reset state in submitEvaluation
const oldResetRegex = /setQuestionData\(\{[\s\S]*?\}\);/;
const newResetStr = `setQuestionData({ q1: { score: 5, note: '' }, q2: { score: 5, note: '' }, q3: { score: 5, note: '' }, q4: { score: 5, note: '' }, q5: { score: 5, note: '' }, q6: { score: 5, note: '' }, q7: { score: 5, note: '' }, q8: { score: 5, note: '' }, q9: { score: 0, note: '' }, q10: { score: 0, note: '' } });`;

c = c.replace(oldResetRegex, newResetStr);

// 5. Ensure the question text has whitespace-pre-wrap so \n renders as a line break
const oldLabelClass = `className="text-sm font-bold text-slate-700 flex-1 pr-4 leading-relaxed"`;
const newLabelClass = `className="text-sm font-bold text-slate-700 flex-1 pr-4 leading-relaxed whitespace-pre-wrap"`;
c = c.replace(oldLabelClass, newLabelClass);

fs.writeFileSync(filePath, c, 'utf-8');
console.log('InterviewerView full detailed questions patched.');
