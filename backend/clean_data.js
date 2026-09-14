const mongoose = require('mongoose');

// Thay đổi link này thành link MongoDB Atlas của bạn (giống trong file copy_db.js)
const ATLAS_URI = 'mongodb://admin:BanTCKT123@ac-brz0ioh-shard-00-00.tmpz7fx.mongodb.net:27017,ac-brz0ioh-shard-00-01.tmpz7fx.mongodb.net:27017,ac-brz0ioh-shard-00-02.tmpz7fx.mongodb.net:27017/interview?ssl=true&authSource=admin';

async function cleanData() {
  try {
    console.log('Đang kết nối tới Atlas DB để làm sạch dữ liệu...');
    await mongoose.connect(ATLAS_URI);
    console.log('Kết nối thành công!');

    const db = mongoose.connection.db;

    // 1. Xóa toàn bộ lịch sử đánh giá
    console.log('Đang xóa lịch sử đánh giá (evaluations)...');
    await db.collection('evaluations').deleteMany({});
    
    // 2. Reset trạng thái toàn bộ ứng viên về 'active' (chưa check-in)
    console.log('Đang reset trạng thái ứng viên (candidates)...');
    await db.collection('candidates').updateMany({}, {
      $set: { 
        status: 'active', 
        assignedTable: null,
        checkInTime: null,
        interviewEndTime: null
      }
    });

    // 3. Reset trạng thái toàn bộ người phỏng vấn về 'active' (đang rảnh)
    console.log('Đang reset trạng thái nhân sự (users)...');
    await db.collection('users').updateMany({ role: 'interviewer' }, {
      $set: { status: 'active' }
    });

    console.log('\n✅ Hoàn tất làm sạch dữ liệu! Hệ thống đã sẵn sàng cho buổi phỏng vấn mới.');
    process.exit(0);
  } catch (error) {
    console.error('Có lỗi xảy ra:', error);
    process.exit(1);
  }
}

cleanData();
