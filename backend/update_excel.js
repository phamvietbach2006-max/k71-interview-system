const xlsx = require('xlsx');

const filePath = 'C:/Users/phamv/Downloads/TUYỂN THÀNH VIÊN BAN TỔ CHỨC - KIỂM TRA ĐOÀN THANH NIÊN ĐẠI HỌC BÁCH KHOA HÀ NỘI 2026-2027.xlsx';
const wb = xlsx.readFile(filePath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(ws, { defval: '' });

// We need to add "Mã phỏng vấn" before "Họ và tên"
const newData = data.map((row, index) => {
  const newRow = {};
  for (let key in row) {
    if (key === 'Tên' || key === 'Họ và tên') {
      if (!newRow['Mã phỏng vấn']) {
        newRow['Mã phỏng vấn'] = `PV${String(index + 1).padStart(3, '0')}`;
      }
    }
    newRow[key] = row[key];
  }
  // Just in case "Tên" or "Họ và tên" wasn't there
  if (!newRow['Mã phỏng vấn']) {
    newRow['Mã phỏng vấn'] = `PV${String(index + 1).padStart(3, '0')}`;
  }
  return newRow;
});

const newWs = xlsx.utils.json_to_sheet(newData);
const newFilePath = 'C:/Users/phamv/Downloads/TUYỂN THÀNH VIÊN BTC (Có Mã PV).xlsx';
xlsx.writeFile(wb, newFilePath);
console.log('Excel file updated with Mã phỏng vấn and saved to new file.');
