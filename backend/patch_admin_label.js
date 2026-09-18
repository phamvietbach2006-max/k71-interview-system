const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/AdminView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

const oldLabel = `<span className="block text-sm text-blue-600 font-bold mb-1">Điểm tổng (70% Câu hỏi + 30% Tiêu chí chung)</span>`;
const newLabel = `<span className="block text-sm text-blue-600 font-bold mb-1">
                        {selectedEvaluation.questions && selectedEvaluation.questions.length > 0 
                          ? 'Điểm tổng (70% Câu hỏi + 30% Tiêu chí chung)' 
                          : 'Tổng điểm trung bình'}
                      </span>`;

c = c.replace(oldLabel, newLabel);
c = c.replace(oldLabel.replace(/\n/g, '\r\n'), newLabel);

fs.writeFileSync(filePath, c, 'utf-8');
console.log('AdminView patched for dynamic score label.');
