const fs = require('fs');
const path = require('path');

const interviewerPath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let i = fs.readFileSync(interviewerPath, 'utf-8');

const oldFind = `        const candidate = all.find(c => 
          c.assignedTable === String(tableNum) && 
          c.assignedRoom === String(roomNum) &&
          (c.status === 'moving' || c.status === 'interviewing')
        );`;

const newFind = `        const candidate = all.find(c => 
          String(c.assignedTable).trim() === String(tableNum).trim() && 
          String(c.assignedRoom).trim() === String(roomNum).trim() &&
          (c.status === 'moving' || c.status === 'interviewing')
        );`;

if (i.includes(oldFind)) {
  i = i.replace(oldFind, newFind);
} else {
  i = i.replace(oldFind.replace(/\n/g, '\r\n'), newFind);
}

fs.writeFileSync(interviewerPath, i, 'utf-8');
console.log('InterviewerView robust find patched.');
