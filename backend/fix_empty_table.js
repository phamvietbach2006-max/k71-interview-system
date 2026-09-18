const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/InterviewerView.jsx', 'utf-8');

c = c.replace(/if \(\!user\) return null;/g, `if (!user) return null;
  if (!user.tableNumber || !user.roomNumber) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi: Chưa có số Phòng/Bàn.</h2>
      <p className="text-slate-600 mb-6">Bạn chưa được phân số bàn hoặc số phòng. Vui lòng đăng nhập lại để thiết lập.</p>
      <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700">Đăng xuất và thử lại</button>
    </div>
  );`);

fs.writeFileSync('frontend/src/pages/InterviewerView.jsx', c, 'utf-8');
