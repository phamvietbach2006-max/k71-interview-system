const mongoose = require('mongoose');
const User = require('./models/User');
const Candidate = require('./models/Candidate');
const Evaluation = require('./models/Evaluation');

async function resetDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/interview');
    console.log('Connected.');

    console.log('Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped.');

    console.log('Seeding initial data...');
    
    // Create initial admin
    const admin = new User({
      username: 'admin_tckt',
      role: 'admin',
      status: 'active'
    });
    await admin.save();

    // Create a receptionist
    const receptionist = new User({
      username: 'letan_1',
      role: 'receptionist',
      status: 'active'
    });
    await receptionist.save();

    // Create some interviewers
    const i1 = new User({
      username: 'phongvan_ban1',
      role: 'interviewer',
      tableNumber: '1',
      status: 'active'
    });
    await i1.save();

    const i2 = new User({
      username: 'phongvan_ban2',
      role: 'interviewer',
      tableNumber: '2',
      status: 'active'
    });
    await i2.save();

    console.log('Database reset and seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDB();
