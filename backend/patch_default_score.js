const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

// Replace the initial state
const oldState = `const [questionData, setQuestionData] = useState({
    q1: { score: 5, note: '' }, q2: { score: 5, note: '' },
    q3: { score: 5, note: '' }, q4: { score: 5, note: '' },
    q5: { score: 5, note: '' }, q6: { score: 5, note: '' },
    q7: { score: 5, note: '' }, q8: { score: 5, note: '' },
    q9: { score: 0, note: '' }, q10: { score: 0, note: '' }
  });`;
  
const newState = `const [questionData, setQuestionData] = useState({
    q1: { score: 0, note: '' }, q2: { score: 0, note: '' },
    q3: { score: 0, note: '' }, q4: { score: 0, note: '' },
    q5: { score: 0, note: '' }, q6: { score: 0, note: '' },
    q7: { score: 0, note: '' }, q8: { score: 0, note: '' },
    q9: { score: 0, note: '' }, q10: { score: 0, note: '' }
  });`;

// Account for potential Windows CRLF
const oldStateRegex = /const \[questionData, setQuestionData\] = useState\(\{[\s\S]*?\}\);/;
c = c.replace(oldStateRegex, newState);

// Replace the reset state
const oldReset = `setQuestionData({ q1: { score: 5, note: '' }, q2: { score: 5, note: '' }, q3: { score: 5, note: '' }, q4: { score: 5, note: '' }, q5: { score: 5, note: '' }, q6: { score: 5, note: '' }, q7: { score: 5, note: '' }, q8: { score: 5, note: '' }, q9: { score: 0, note: '' }, q10: { score: 0, note: '' } });`;
const newReset = `setQuestionData({ q1: { score: 0, note: '' }, q2: { score: 0, note: '' }, q3: { score: 0, note: '' }, q4: { score: 0, note: '' }, q5: { score: 0, note: '' }, q6: { score: 0, note: '' }, q7: { score: 0, note: '' }, q8: { score: 0, note: '' }, q9: { score: 0, note: '' }, q10: { score: 0, note: '' } });`;

c = c.replace(oldReset, newReset);

fs.writeFileSync(filePath, c, 'utf-8');
console.log('InterviewerView default score patched to 0.');
