const fs = require('fs');
const path = require('path');

const receptionistPath = path.join(__dirname, '../frontend/src/pages/ReceptionistView.jsx');
let lines = fs.readFileSync(receptionistPath, 'utf-8').split('\n');

const startIdx = lines.findIndex(l => l.includes('const handleManualCheckIn = async () => {'));
let endIdx = -1;
for (let i = startIdx; i < lines.length; i++) {
  if (lines[i].includes('toast.success(') && lines[i].includes('check-in')) {
    endIdx = i + 1; // including the closing brace
    break;
  }
}

const newManualCheckIn = `  const handleManualCheckIn = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Check-in ứng viên',
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

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1, newManualCheckIn);
  fs.writeFileSync(receptionistPath, lines.join('\n'), 'utf-8');
  console.log("Replaced handleManualCheckIn by lines.");
} else {
  console.log("Could not find start or end index.");
}
