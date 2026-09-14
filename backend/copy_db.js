const mongoose = require('mongoose');

// Thay đổi link này thành link MongoDB Atlas của bạn
const ATLAS_URI = 'mongodb://admin:BanTCKT123@ac-brz0ioh-shard-00-00.tmpz7fx.mongodb.net:27017,ac-brz0ioh-shard-00-01.tmpz7fx.mongodb.net:27017,ac-brz0ioh-shard-00-02.tmpz7fx.mongodb.net:27017/interview?ssl=true&authSource=admin';
// Link local của bạn (giữ nguyên)
const LOCAL_URI = 'mongodb://127.0.0.1:27017/interview';

async function copyDatabase() {
  if (ATLAS_URI.includes('<password>')) {
    console.error('LỖI: Bạn chưa điền link MongoDB Atlas của bạn vào biến ATLAS_URI trong file này!');
    process.exit(1);
  }

  console.log('Đang kết nối tới Local DB...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('Đang kết nối tới Atlas DB...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();

  console.log('Kết nối thành công. Đang lấy danh sách collections...');
  const collections = await localConn.db.listCollections().toArray();

  for (let collection of collections) {
    const name = collection.name;
    console.log(`\nĐang copy collection: ${name}...`);
    
    // Đọc dữ liệu từ local
    const localData = await localConn.db.collection(name).find({}).toArray();
    console.log(`Tìm thấy ${localData.length} bản ghi trong local.`);

    if (localData.length > 0) {
      // Xóa dữ liệu cũ trên Atlas nếu có để tránh trùng lặp
      await atlasConn.db.collection(name).deleteMany({});
      
      // Ghi dữ liệu lên Atlas
      await atlasConn.db.collection(name).insertMany(localData);
      console.log(`Đã copy thành công ${localData.length} bản ghi lên Atlas (${name}).`);
    } else {
      console.log(`Collection ${name} trống, bỏ qua.`);
    }
  }

  console.log('\n✅ Hoàn tất copy dữ liệu! Bạn có thể đóng cửa sổ này.');
  process.exit(0);
}

copyDatabase().catch(err => {
  console.error('Có lỗi xảy ra:', err);
  process.exit(1);
});
