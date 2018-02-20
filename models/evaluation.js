// models/game.js
const mongoose = require('../config/database')
const { Schema } = mongoose

const evaluationSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'students' },
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  color: { type: String, default: 'red' },
  remarks: {type: String},
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('evaluations', evaluationSchema)
