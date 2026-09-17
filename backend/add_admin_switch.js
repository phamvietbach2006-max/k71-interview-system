const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/AdminView.jsx', 'utf-8');

const switchCode = `\n  const performSwitchToRole = async (roleName, path) => {
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
  };\n`;

const target = "const navigate = useNavigate();";
if (!code.includes("const performSwitchToRole")) {
    code = code.replace(target, target + switchCode);
    fs.writeFileSync('frontend/src/pages/AdminView.jsx', code, 'utf-8');
    console.log("Added performSwitchToRole to AdminView");
}
