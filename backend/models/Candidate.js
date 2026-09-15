const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  interviewCode: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['active', 'waiting', 'moving', 'interviewing', 'completed'], 
    default: 'active' 
  },
  checkInTime: { type: Date }, // To calculate waiting time
  assignedRoom: { type: String, default: null },
  assignedTable: { type: String, default: null }, // Table number assigned to
  interviewEndTime: { type: Date },
  applicationData: { type: Object, default: {} }, // Excel data
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
