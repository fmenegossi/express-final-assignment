const { Student } = require('../models')
const router = require('express').Router()
const passport = require('../config/auth')
const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
    .get('/students', (req, res, next) => {
      Student.find()
        .sort({ createdAt: -1 })
        .then((students) => res.json(students))
        .catch((error) => next(error))
    })
    .get('/students/:id', (req, res, next) => {
      const id = req.params.id

      Student.findById(id)
        .then((student) => {
          if (!student) { return next() }
          res.json(student)
        })
        .catch((error) => next(error))
    })
    .post('/students', authenticate, (req, res, next) => {
      const { name, photo } = req.body
      const newStudent = {
        name: name,
        photo: photo
      }

      Student.create(newStudent)
        .then((student) => {
          io.emit('action', {
            type: 'STUDENT_CREATED',
            payload: student
          })
          res.json(student)
        })
        .catch((error) => next(error))
    })
    .patch('/students/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const userId = req.account._id.toString()

      Student.findById(id)
        .then((student) => {
          if (!student) { return next() }

          const studentUpdates = req.body
          const patchedStudent = {...student, ...studentUpdates}

          Student.findByIdAndUpdate(id, { $set: patchedStudent }, { new: true })
            .then((student) => {
              io.emit('action', {
                type: 'STUDENT_UPDATED',
                payload: student
              })
              res.json(student)
            })
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })
    .delete('/students/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      Student.findByIdAndRemove(id)
        .then(() => {
          io.emit('action', {
            type: 'STUDENT_REMOVED',
            payload: id
          })
          res.status = 200
          res.json({
            message: 'Removed',
            _id: id
          })
        })
        .catch((error) => next(error))
    })

  return router
}
