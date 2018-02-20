// models/user.js
const mongoose = require('../config/database')
const { Schema } = mongoose

const batchSchema = new Schema({
  number: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'students' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('batches', batchSchema)
