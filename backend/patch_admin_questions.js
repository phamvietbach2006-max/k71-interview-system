const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/AdminView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

// Replace the EvaluationDetailsModal body to display the new fields
const origEvalModalContent = `                <div className="space-y-4">
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
                  <div>
                    <span className="block text-sm text-slate-500 font-bold mb-1">Nhận xét chi tiết</span>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap min-h-[100px]">
                      {selectedEvaluation.notes || <span className="text-slate-400 italic">Không có nhận xét</span>}
                    </div>
                  </div>
                </div>`;

const newEvalModalContent = `                <div className="space-y-6">
                  {/* Total Score Highlight */}
                  <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div>
                      <span className="block text-sm text-blue-600 font-bold mb-1">Điểm tổng (70% Câu hỏi + 30% Tiêu chí chung)</span>
                      <span className="text-3xl font-black text-blue-800">{selectedEvaluation.totalScore !== undefined ? selectedEvaluation.totalScore : ((selectedEvaluation.attitudeScore + selectedEvaluation.skillScore + selectedEvaluation.problemSolvingScore) / 3).toFixed(2)} / 10</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-slate-500 font-bold mb-1">Quyết định cuối cùng</span>
                      <span className={\`inline-block px-4 py-1.5 rounded-full text-sm font-black \${selectedEvaluation.result === 'Đạt' ? 'bg-emerald-100 text-emerald-700' : selectedEvaluation.result === 'Không đạt' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}\`}>
                        {selectedEvaluation.result}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Questions */}
                  {selectedEvaluation.questions && selectedEvaluation.questions.length > 0 && (
                    <div>
                      <h4 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">Chi tiết Câu hỏi</h4>
                      <div className="space-y-3">
                        {selectedEvaluation.questions.map((q, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-bold text-slate-700 mr-4">{q.questionText}</span>
                              <span className="text-sm font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{q.score > 0 ? \`\${q.score}/10\` : 'Bỏ qua'}</span>
                            </div>
                            {q.note && <div className="text-sm text-slate-600 italic bg-white p-2 rounded border border-slate-100 whitespace-pre-wrap">{q.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* General Criteria */}
                  <div>
                    <h4 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">Đánh giá Tiêu chí chung</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                        <span className="block text-xs text-slate-500 font-bold mb-1">Thái độ & Tác phong</span>
                        <span className="text-xl font-black text-slate-700">{selectedEvaluation.attitudeScore}/10</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                        <span className="block text-xs text-slate-500 font-bold mb-1">Kỹ năng chuyên môn</span>
                        <span className="text-xl font-black text-slate-700">{selectedEvaluation.skillScore}/10</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                        <span className="block text-xs text-slate-500 font-bold mb-1">Xử lý tình huống</span>
                        <span className="text-xl font-black text-slate-700">{selectedEvaluation.problemSolvingScore}/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Notes */}
                  <div>
                    <span className="block text-sm text-slate-500 font-bold mb-1">Nhận xét chung</span>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap min-h-[80px]">
                      {selectedEvaluation.notes || <span className="text-slate-400 italic">Không có nhận xét</span>}
                    </div>
                  </div>
                </div>`;

// Replace handling standard \r\n and \n formatting variations
c = c.replace(origEvalModalContent, newEvalModalContent);
if(c.indexOf('selectedEvaluation.questions') === -1) {
    // try removing crlf in both
    c = c.replace(origEvalModalContent.replace(/\r/g, ''), newEvalModalContent);
}

fs.writeFileSync(filePath, c, 'utf-8');
console.log('AdminView patched for detailed questions!');
