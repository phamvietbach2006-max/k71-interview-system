const fs = require('fs');

const switchCode = `  const performSwitchToRole = async (roleName, path) => {
    let tableNum = null;
    let roomNum = null;
    
    if (roleName === 'interviewer') {
      const stored = JSON.parse(localStorage.getItem('user')) || {};
      const lastRoom = localStorage.getItem('lastRoomNumber') || stored.roomNumber || "";
      const lastTable = localStorage.getItem('lastTableNumber') || stored.tableNumber || "";
      
      roomNum = window.prompt("Vui lòng nhập số Phòng (ví dụ: 101, hoặc để trống):", lastRoom);
      if (roomNum === null) return; // User cancelled
      
      tableNum = window.prompt("Vui lòng nhập số Bàn phỏng vấn (bắt buộc):", lastTable);
      if (!tableNum) return; // User cancelled or left empty
    }

    const userObj = JSON.parse(localStorage.getItem('user')) || {};

    const res = await fetch('/api/staff/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: userObj.username, 
        targetRole: roleName,
        tableNumber: tableNum,
        roomNumber: roomNum
      })
    });
    const data = await res.json();
    if (data.success) {
      const stored = JSON.parse(localStorage.getItem('user'));
      stored.role = roleName;
      if (tableNum) stored.tableNumber = tableNum;
      if (roomNum !== null) stored.roomNumber = roomNum;
      localStorage.setItem('user', JSON.stringify(stored));
      if (tableNum) localStorage.setItem('lastTableNumber', tableNum);
      if (roomNum) localStorage.setItem('lastRoomNumber', roomNum);
      window.location.href = path;
    } else {
      alert("Lỗi chuyển đổi quyền: " + data.message);
    }
  };`;

const files = ['frontend/src/pages/AdminView.jsx', 'frontend/src/pages/InterviewerView.jsx', 'frontend/src/pages/ReceptionistView.jsx'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Find start and end of performSwitchToRole
  const start = code.indexOf('const performSwitchToRole = async');
  if (start !== -1) {
    const end = code.indexOf('};', start) + 2;
    code = code.substring(0, start) + switchCode + code.substring(end);
    fs.writeFileSync(file, code, 'utf-8');
    console.log("Updated", file);
  }
});
