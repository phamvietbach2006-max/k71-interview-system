const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/CandidateView.jsx', 'utf-8');

code = code.replace(/if \(data\.candidate\.interviewCode === stored\.interviewCode\) \{/g, `if (data.candidate.interviewCode === stored.interviewCode && data.candidate.department === stored.department) {`);

fs.writeFileSync('frontend/src/pages/CandidateView.jsx', code, 'utf-8');
console.log('Fixed candidate_assigned socket event in CandidateView.jsx');
