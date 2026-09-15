const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Candidate = require('./models/Candidate');
require('dotenv').config();

async function importExcel() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interview';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected.');

    // Clear existing candidates
    await Candidate.deleteMany({});
    console.log('Cleared existing candidates.');

    const filePath = process.argv[2] || './candidate_data.xlsx';
    if (!require('fs').existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      process.exit(1);
    }
    console.log(`Reading Excel file: ${filePath}`);
    const wb = xlsx.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws);

    let count = 0;
    for (let row of data) {
      if (row['MSSV']) {
        const pvCode = String(row['MSSV']).trim();
        let candidate = await Candidate.findOne({ interviewCode: pvCode });
        if (!candidate) {
          candidate = new Candidate({ interviewCode: pvCode, status: 'active' });
        }
        
        for (let k of Object.keys(row)) {
          if (k.toLowerCase().includes('điện thoại')) {
            let v = String(row[k]).trim();
            if (v && v.length >= 8 && !v.startsWith('0')) {
              row[k] = '0' + v;
            }
          }
        }

        candidate.applicationData = row;
        await candidate.save();
        count++;
      }
    }
    
    console.log(`Successfully imported/updated ${count} candidates from new Excel.`);
    process.exit(0);
  } catch (err) {
    console.error('Error importing Excel:', err);
    process.exit(1);
  }
}

importExcel();
