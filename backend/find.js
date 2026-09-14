const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/interview');
const User = require('./backend/models/User');
User.find({ fullName: { $in: ['Trần Đức Hoàng Anh', 'Kiều Minh Anh', 'Phạm Việt Bách'] } })
  .then(u => {
    console.log(u.map(x => ({ name: x.fullName, username: x.username })));
    process.exit();
  });
