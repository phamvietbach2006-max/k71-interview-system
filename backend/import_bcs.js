const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Candidate = require('./models/Candidate');
require('dotenv').config();

async function run() {
  try {
    const mongoURI = 'mongodb://admin:BanTCKT123@ac-brz0ioh-shard-00-00.tmpz7fx.mongodb.net:27017,ac-brz0ioh-shard-00-01.tmpz7fx.mongodb.net:27017,ac-brz0ioh-shard-00-02.tmpz7fx.mongodb.net:27017/interview?ssl=true&authSource=admin';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected.');

    const file1Path = 'C:\\\\Users\\\\phamv\\\\Downloads\\\\Vòng đơn BCSNN.xlsx';
    const wb1 = xlsx.readFile(file1Path);
    const data1 = xlsx.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]]);
    
    const passedMSSVs = new Set();
    let passedCount = 0;
    for (let row of data1) {
      const keys = Object.keys(row);
      const resultKey = keys.find(k => k.toLowerCase().includes('trạng thái'));
      const result = resultKey ? String(row[resultKey] || '').trim().toLowerCase() : '';
      
      if (result.includes('đỗ') || result.includes('cần xem xét')) {
        const mssvKey = keys.find(k => k.toLowerCase().includes('mssv'));
        if (mssvKey) {
          const mssv = String(row[mssvKey]).trim();
          if (mssv && mssv !== 'undefined') {
            passedMSSVs.add(mssv);
            passedCount++;
          }
        }
      }
    }
    console.log('Found ' + passedCount + ' passed candidates in File 1.');

    const file2Path = 'C:\\\\Users\\\\phamv\\\\Downloads\\\\TUYỂN THÀNH VIÊN BAN CÁN SỰ ĐOÀN - HỘI KHỐI SINH VIÊN NĂM NHẤT K71(1-164).xlsx';
    const wb2 = xlsx.readFile(file2Path);
    const data2 = xlsx.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]);
    
    const candidatesMap = new Map();
    for (let row of data2) {
      const keys = Object.keys(row);
      const mssvKey = keys.find(k => k.toLowerCase().includes('mssv'));
      const mssv = mssvKey ? String(row[mssvKey]).trim() : '';

      if (mssv && passedMSSVs.has(mssv)) {
        for (let k of keys) {
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

    await Candidate.deleteMany({ department: 'BCS' }); 
    console.log('Deleted old BCS candidate data.');

    let inserted = 0;
    for (let [mssv, row] of candidatesMap.entries()) {
      const candidate = new Candidate({
        interviewCode: mssv,
        department: 'BCS',
        status: 'active',
        applicationData: row
      });
      await candidate.save();
      inserted++;
    }
    
    console.log('Successfully inserted ' + inserted + ' BCS candidates to database.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
