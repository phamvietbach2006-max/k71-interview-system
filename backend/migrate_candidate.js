const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/interview');
const Candidate = require('./models/Candidate');

async function migrate() {
  const candidates = await Candidate.find();
  for (let c of candidates) {
    if (c.applicationData && c.applicationData['MSSV']) {
      c.interviewCode = String(c.applicationData['MSSV']).trim();
      await c.save();
    }
  }
  console.log('Migrated', candidates.length, 'candidates.');
  process.exit();
}
migrate();
