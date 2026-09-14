const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, 
  senderRole: { type: String, required: true }, 
  receiver: { type: String, required: true }, // username, or 'group'
  content: { type: String, required: true },
  readBy: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
