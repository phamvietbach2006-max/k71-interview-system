const mongoose = require('mongoose');
const xlsx = require('xlsx');
const User = require('./models/User');
require('dotenv').config();

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, '');
}

async function importStaff() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interview';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected.');

    // Clear existing users
    await User.deleteMany({});
    
    const filePath = 'C:/Users/phamv/Downloads/Danh sách Ban tiếp tục nhiệm kỳ 2025 - 2027, năm 2026 (1).xlsx';
    const wb = xlsx.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws);

    const admins = ['Trần Đức Hoàng Anh', 'Kiều Minh Anh'];
    const interviewers = ['Cao Hương Quỳnh', 'Lê Trần Cẩm Dung', 'Trịnh Lương Việt', 'Đặng Thị Thùy Dương', 'Phạm Việt Bách', 'Nguyễn Thanh An'];

    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fullName = row['__EMPTY'];
      if (!fullName || fullName.toUpperCase().includes('HỌ TÊN')) continue;

      let role = 'admin'; // default to receptionist/admin
      if (admins.includes(fullName)) {
        role = 'admin';
      } else if (interviewers.includes(fullName)) {
        role = 'interviewer';
      } else {
        // receptionists use admin role in the system
        role = 'admin';
      }

      let username = '';
      if (row['__EMPTY_4']) {
        username = String(row['__EMPTY_4']).trim().toUpperCase();
      } else if (row['__EMPTY_8']) {
        username = String(row['__EMPTY_8']).split('@')[0];
      } else {
        username = removeAccents(fullName);
      }
      
      const user = new User({
        username,
        fullName, // We can store fullName in DB too if we add it to schema, but for now just use username
        password: '123', // default password not really checked in this simple system
        role
      });
      await user.save();
      console.log(`Created ${role}: ${fullName} -> ${username}`);
      count++;
    }

    console.log(`Successfully imported ${count} staff.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

importStaff();
