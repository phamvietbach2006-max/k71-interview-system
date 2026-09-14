const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/interview');
const User = require('./models/User');
User.deleteMany({ username: { $in: ['Nam.phanduy', 'van.nguyendinh', 'NAM.PHANDUY', 'VAN.NGUYENDINH'] } })
  .then(() => {
    console.log('Deleted');
    process.exit();
  });
