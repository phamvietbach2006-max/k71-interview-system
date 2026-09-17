const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Candidate = require('./models/Candidate');
require('dotenv').config();

async function run() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interview';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected.');

    const file1Path = 'C:\\\\Users\\\\phamv\\\\Downloads\\\\Ket_qua_vong_don_K71_TCKT_da_them_email.xlsx';
    const wb1 = xlsx.readFile(file1Path);
    const data1 = xlsx.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]]);
    
    const passedMSSVs = new Set();
    let passedCount = 0;
    for (let row of data1) {
      const result = String(row['Kết luận (Gợi ý)'] || '').trim();
      if (result === 'Đỗ vòng đơn' || result === 'Cần xem xét thêm') {
        const mssv = String(row['MSSV']).trim();
        if (mssv && mssv !== 'undefined') {
          passedMSSVs.add(mssv);
          passedCount++;
        }
      }
    }
    console.log('Found ' + passedCount + ' passed candidates in File 1.');

    const file2Path = 'C:\\\\Users\\\\phamv\\\\Downloads\\\\TUYỂN THÀNH VIÊN BAN TỔ CHỨC - KIỂM TRA ĐOÀN THANH NIÊN ĐẠI HỌC BÁCH KHOA HÀ NỘI 2026-2027(1-328).xlsx';
    const wb2 = xlsx.readFile(file2Path);
    const data2 = xlsx.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]);
    
    const candidatesMap = new Map();
    for (let row of data2) {
      const mssv = String(row['MSSV']).trim();
      if (passedMSSVs.has(mssv)) {
        for (let k of Object.keys(row)) {
          if (k.toLowerCase().includes('điện thoại')) {
            let v = String(row[k]).trim();
            if (v && v.length >= 8 && !v.startsWith('0')) {
              row[k] = '0' + v;
            }
          }
        }
        
        if (!candidatesMap.has(mssv) || row['ID'] > (candidatesMap.get(mssv)['ID'] || 0)) {
          candidatesMap.set(mssv, row);
        }
      }
    }
    
    console.log('Matched ' + candidatesMap.size + ' unique candidates in File 2.');

    await Candidate.deleteMany({ $or: [{ department: 'TCKT' }, { department: { $exists: false } }] }); 
    console.log('Deleted old TCKT candidate data.');

    let inserted = 0;
    for (let [mssv, row] of candidatesMap.entries()) {
      const candidate = new Candidate({
        interviewCode: mssv,
        department: 'TCKT',
        status: 'active',
        applicationData: row
      });
      await candidate.save();
      inserted++;
    }
    
    console.log('Successfully inserted ' + inserted + ' TCKT candidates to database.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
