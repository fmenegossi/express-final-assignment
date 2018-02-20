// models/user.js
const mongoose = require('../config/database')
const { Schema } = mongoose

const studentSchema = new Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  currentColor: { type: String, default: 'red' },
});

module.exports = mongoose.model('students', studentSchema)
