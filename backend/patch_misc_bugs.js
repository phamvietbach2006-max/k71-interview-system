const fs = require('fs');
const path = require('path');

// --- 1. InterviewerView: evaluation check and Swal ---
const interviewerPath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let i = fs.readFileSync(interviewerPath, 'utf-8');

const oldSubmitEval = /const submitEvaluation = async \(\) => \{[\s\S]*?try \{[\s\S]*?const res = await fetch\('\/api\/evaluation'[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\};/;

const newSubmitEval = `const submitEvaluation = async () => {
    if (!currentCandidate) return;

    const confirm = await Swal.fire({
      title: 'Hoàn tất đánh giá?',
      text: "Kết quả sẽ được lưu và bạn không thể sửa lại sau đó.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý & Lưu',
      cancelButtonText: 'Hủy'
    });
    if (!confirm.isConfirmed) return;

    const data = {
      interviewCode: currentCandidate.interviewCode,
      department: currentCandidate.department || user.department,
      interviewerUsername: user.username,
      attitudeScore: attitude,
      skillScore: skill,
      problemSolvingScore: problemSolving,
      notes,
      result
    };
    
    try {
      const res = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const responseData = await res.json();
      
      if (responseData.success) {
        setAttitude(5); setSkill(5); setProblemSolving(5); setNotes(''); setResult('Đạt');
        setCurrentCandidate(null);
        Swal.fire({ title: 'Đã lưu!', text: 'Kết quả phỏng vấn đã được ghi lại.', icon: 'success', timer: 2000, showConfirmButton: false });
      } else {
        Swal.fire({ title: 'Lỗi!', text: responseData.error || responseData.message || 'Không thể lưu đánh giá. Vui lòng thử lại.', icon: 'error' });
      }
    } catch (err) {
      Swal.fire({ title: 'Lỗi mạng!', text: 'Mất kết nối. Vui lòng kiểm tra internet và thử lại.', icon: 'error' });
    }
  };`;

if (i.includes('const submitEvaluation = async () => {')) {
  i = i.replace(oldSubmitEval, newSubmitEval);
}
fs.writeFileSync(interviewerPath, i, 'utf-8');

// --- 2. server.js ---
const serverPath = path.join(__dirname, '../backend/server.js');
let s = fs.readFileSync(serverPath, 'utf-8');

// B5: trim room/table in /api/staff/switch-role
s = s.replace(/user\.tableNumber = tableNumber;/g, `user.tableNumber = String(tableNumber).trim();`);
s = s.replace(/user\.roomNumber = roomNumber;/g, `user.roomNumber = String(roomNumber).trim();`);

// L6: reset candidate in /api/staff/leave
const oldLeaveRegex = /const user = await User\.findOne\(\{ username \}\);\s*if \(user\) \{\s*user\.tableNumber = null;\s*user\.roomNumber = null;\s*user\.status = 'active';\s*await user\.save\(\);\s*io\.emit\('staff_update'\);\s*\}/;
const newLeave = `const user = await User.findOne({ username });
    if (user) {
      // Bỏ gán ứng viên hiện tại nếu đang pv dở
      if (user.tableNumber && user.roomNumber) {
        await Candidate.updateMany(
          { assignedTable: user.tableNumber, assignedRoom: user.roomNumber, department: user.department, status: { $in: ['moving', 'interviewing'] } },
          { $set: { status: 'waiting', assignedTable: null, assignedRoom: null, checkInTime: new Date(0) } }
        );
      }
      
      user.tableNumber = null;
      user.roomNumber = null;
      user.status = 'active';
      await user.save();
      io.emit('board_update');
      io.emit('staff_update');
    }`;
if (s.includes("user.tableNumber = null;")) {
  s = s.replace(oldLeaveRegex, newLeave);
}
fs.writeFileSync(serverPath, s, 'utf-8');

// --- 3. ChatWidget.jsx ---
const chatPath = path.join(__dirname, '../frontend/src/components/ChatWidget.jsx');
let c = fs.readFileSync(chatPath, 'utf-8');
const oldChatSend = `const res = await fetch('/api/chat', {`;
const newChatSend = `const res = await fetch('/api/chat', {`; // Just standard fetch
const oldChatCheck = `const data = await res.json();
      if (data.success) {
        setNewMsg('');
      }`;
const newChatCheck = `if (!res.ok) {
        const errorData = await res.json();
        alert('Không thể gửi tin nhắn: ' + (errorData.message || 'Lỗi hệ thống'));
        return;
      }
      const data = await res.json();
      if (data.success) {
        setNewMsg('');
      }`;
if (!c.includes('if (!res.ok)')) {
  c = c.replace(oldChatCheck, newChatCheck);
  fs.writeFileSync(chatPath, c, 'utf-8');
}

console.log('Restored remaining bugs.');
