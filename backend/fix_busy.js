const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf-8');

code = code.replace(/const busyCandidate = await Candidate\.findOne\(\{[\s\n]*assignedRoom: interviewer\.roomNumber,[\s\n]*assignedTable: interviewer\.tableNumber,[\s\n]*status: \{ \$in: \['moving', 'interviewing'\] \}[\s\n]*\}\);/g, `const busyCandidate = await Candidate.findOne({
        department: interviewer.department,
        assignedRoom: interviewer.roomNumber,
        assignedTable: interviewer.tableNumber,
        status: { $in: ['moving', 'interviewing'] }
      });`);

fs.writeFileSync('backend/server.js', code, 'utf-8');
console.log('Fixed busyCandidate queries!');
