const router = require('express').Router()
const { Batch } = require('../models')
const { Student } = require('../models')
const passport = require('../config/auth')
const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
    .get('/batches', (req, res, next) => {
      Batch.find()
        .sort({ createdAt: -1 })
        .then((batches) => res.json(batches))
        .catch((error) => next(error))
    })
    .get('/batches/:id', (req, res, next) => {
      const id = req.params.id

      Batch.findById(id)
        .then((batch) => {
          if (!batch) { return next() }
          res.json(batch)
        })
        .catch((error) => next(error))
    })
    .get('/batches/:id/students', (req, res, next) => {
      const id = req.params.id

      Batch.findById(id)
        .then((batch) => {
          if (!batch) { return next() }

          Student.find({
            '_id': { $in: batch.students }
          },
          (err, students) => {
            io.emit('action', {
              type: 'BATCH_STUDENTS_FETCHED',
              payload: students
            })
            res.json(students)
          })
        })
        .catch((error) => next(error))
    })
    .post('/batches', authenticate, (req, res, next) => {
      const newBatch = req.body

      Batch.create(newBatch)
        .then((batch) => {
          io.emit('action', {
            type: 'BATCH_CREATED',
            payload: batch
          })
          res.json(batch)
        })
        .catch((error) => next(error))
    })
    .patch('/batches/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const userId = req.account._id.toString()

      Batch.findById(id)
        .then((batch) => {
          if (!batch) { return next() }

          const batchUpdates = req.body
          const patchedBatch = {...batch, ...batchUpdates}
          // console.log(patchedBatch)

          Batch.findByIdAndUpdate(id, { $set: patchedBatch }, { new: true })
            .then((batch) => {
              io.emit('action', {
                type: 'BATCH_UPDATED',
                payload: batch
              })
              res.json(batch)
            })
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })
    .delete('/batches/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      Batch.findByIdAndRemove(id)
        .then(() => {
          io.emit('action', {
            type: 'BATCH_REMOVED',
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
