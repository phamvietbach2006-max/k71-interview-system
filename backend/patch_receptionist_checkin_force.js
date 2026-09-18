const fs = require('fs');
const path = require('path');

const receptionistPath = path.join(__dirname, '../frontend/src/pages/ReceptionistView.jsx');
let r = fs.readFileSync(receptionistPath, 'utf-8');

const regex = /const handleManualCheckIn = async \(\) => \{[\s\S]*?toast\.success\([^)]+\);\s*\};/;

const newManualCheckIn = `const handleManualCheckIn = async () => {
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

if (regex.test(r)) {
  r = r.replace(regex, newManualCheckIn);
  fs.writeFileSync(receptionistPath, r, 'utf-8');
  console.log("ReceptionistView manual checkin successfully patched.");
} else {
  console.log("Failed to match ReceptionistView checkin regex.");
}
