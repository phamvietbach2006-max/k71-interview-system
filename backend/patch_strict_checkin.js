const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../backend/server.js');
let s = fs.readFileSync(serverPath, 'utf-8');

// 1. Add /api/candidates/checkin endpoint
const checkinApi = `
app.post('/api/candidates/checkin', async (req, res) => {
  let { interviewCode, department } = req.body;
  if (interviewCode) interviewCode = interviewCode.trim().toUpperCase();

  try {
    let candidate = await Candidate.findOne({ interviewCode, department });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Không có thông tin bạn đó trúng tuyển vào ban này!' });
    }
    if (candidate.status === 'active' || !candidate.status) {
      candidate.status = 'waiting';
      candidate.checkInTime = new Date();
      await candidate.save();
      io.emit('board_update');
      return res.json({ success: true, message: 'Check-in thành công!', candidate });
    } else {
      return res.status(400).json({ success: false, message: 'Ứng viên này đã check-in rồi!' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
`;

// Insert it somewhere appropriate, e.g. before /api/candidates/add
if (!s.includes('/api/candidates/checkin')) {
  s = s.replace(`app.post('/api/candidates/add'`, checkinApi + `\napp.post('/api/candidates/add'`);
}

// 2. Modify socket.on('candidate_checkin') to NOT create phantom candidates
const oldSocketCheckin = `        let candidate = await Candidate.findOne(query);
        if (!candidate) {
          candidate = new Candidate({ interviewCode: data.interviewCode, department: data.department || 'TCKT' });
        }
        if (candidate.status === 'active' || !candidate.status) {
          candidate.status = 'waiting';
          candidate.checkInTime = new Date();
          await candidate.save();
          io.emit('board_update');
        }`;

const newSocketCheckin = `        let candidate = await Candidate.findOne(query);
        if (candidate && (candidate.status === 'active' || !candidate.status)) {
          candidate.status = 'waiting';
          candidate.checkInTime = new Date();
          await candidate.save();
          io.emit('board_update');
        }`;

s = s.replace(oldSocketCheckin, newSocketCheckin);

fs.writeFileSync(serverPath, s, 'utf-8');
console.log('Server updated for strict check-in.');

const receptionistPath = path.join(__dirname, '../frontend/src/pages/ReceptionistView.jsx');
let r = fs.readFileSync(receptionistPath, 'utf-8');

// 3. Update handleManualCheckIn
const oldManualCheckIn = `    const handleManualCheckIn = async () => {
      const { value: code } = await Swal.fire({
        title: 'Check-in Ứng viên',
        input: 'text',
        inputLabel: 'Nhập MSSV (hoặc Mã PV) của ứng viên:',
        showCancelButton: true,
        confirmButtonText: 'Check-in',
        cancelButtonText: 'Hủy'
      });
      if (!code) return;
      
      socketRef.current.emit('candidate_checkin', { interviewCode: code.trim().toUpperCase(), department: viewDepartment });
      toast.success(\`Đã gửi yêu cầu check-in cho \${code.trim().toUpperCase()}\`);
    };`;

const newManualCheckIn = `    const handleManualCheckIn = async () => {
      const { value: formValues } = await Swal.fire({
        title: 'Check-in Ứng viên',
        html: \`
          <input id="swal-input-mssv" class="swal2-input" placeholder="Nhập MSSV (hoặc Mã PV)..." style="text-transform: uppercase;">
          <select id="swal-input-dept" class="swal2-select" style="display:flex; width: 80%; margin: 1em auto; font-size: 1.1em;">
            <option value="TCKT" \${viewDepartment === 'TCKT' ? 'selected' : ''}>Ban Tổ chức - Kiểm tra (TCKT)</option>
            <option value="BCS" \${viewDepartment === 'BCS' ? 'selected' : ''}>Ban Cán sự (BCS)</option>
          </select>
        \`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Check-in',
        cancelButtonText: 'Hủy',
        preConfirm: () => {
          const mssv = document.getElementById('swal-input-mssv').value;
          const dept = document.getElementById('swal-input-dept').value;
          if (!mssv) {
            Swal.showValidationMessage('Vui lòng nhập MSSV');
            return false;
          }
          return { mssv: mssv.trim().toUpperCase(), dept };
        }
      });
      if (!formValues) return;
      
      try {
        const res = await fetch('/api/candidates/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewCode: formValues.mssv, department: formValues.dept })
        });
        const data = await res.json();
        
        if (data.success) {
          Swal.fire({ title: 'Thành công!', text: 'Ứng viên đã được đưa vào phòng chờ.', icon: 'success', timer: 2000, showConfirmButton: false });
        } else {
          Swal.fire('Lỗi', data.message, 'error');
        }
      } catch (err) {
        Swal.fire('Lỗi', 'Không thể kết nối đến server', 'error');
      }
    };`;

r = r.replace(oldManualCheckIn, newManualCheckIn);

// Also try replacing with potential \r\n differences just in case
r = r.replace(oldManualCheckIn.replace(/\n/g, '\r\n'), newManualCheckIn);

fs.writeFileSync(receptionistPath, r, 'utf-8');
console.log('ReceptionistView updated for strict check-in.');
