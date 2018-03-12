const { Evaluation } = require('../models')
const router = require('express').Router()
const passport = require('../config/auth')
const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
    .get('/evaluations', (req, res, next) => {
      Evaluation.find()
        .sort({ createdAt: -1 })
        .then((evaluations) => res.json(evaluations))
        .catch((error) => next(error))
    })
    .get('/evaluations/:id', (req, res, next) => {
      const id = req.params.id

      Evaluation.findById(id)
        .then((evaluation) => {
          if (!evaluation) { next() }
          res.json(evaluation)
        })
        .catch((error) => next(error))
    })
    .get('/evaluations/student/:id', (req, res, next) => {
      const id = req.params.id

      Evaluation.find({studentId: id})
        .sort({ date: 1 })
        .then((evaluations) => {
          io.emit('action', {
            type: 'STUDENT_EVALUATIONS_FETCHED',
            payload: evaluations
          })
          res.json(evaluations)
        })
        .catch((error) => next(error))
    })
    .post('/evaluations', authenticate, (req, res, next) => {
      const { date, color, remarks, userId, studentId } = req.body
      const newEvaluation = {
        date: date,
        color: color,
        remarks: remarks,
        userId: userId,
        studentId: studentId
      }

      if(['red', 'yellow'].includes(color) && remarks.trim() === '') {
        const error = new Error('You must provide your remarks to RED or YELLOW evals')
        error.status = 422
        next(error)
      }

      Evaluation.create(newEvaluation)
        .then((evaluation) => {
          io.emit('action', {
            type: 'EVALUATION_CREATED',
            payload: evaluation
          })
          res.json(evaluation)
        })
        .catch((error) => next(error))
    })
    .patch('/evaluations/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const userId = req.account._id.toString()

      Evaluation.findById(id)
        .then((evaluation) => {
          if (!evaluation) { next() }

          if(evaluation.userId !== userId) {
            const error = new Error('You can only edit evaluations you did')
            error.status = 422
            next(error)
          }

          if(['red', 'yellow'].includes(color) && remarks.trim() === '') {
            const error = new Error('You must provide your remarks to RED or YELLOW evals')
            error.status = 422
            next(error)
          }

          const evaluationUpdates = req.body
          const patchedEvaluation = { ...evaluation, ...evaluationUpdates }

          Evaluation.findByIdAndUpdate(id, { $set: patchedEvaluation }, { new: true })
            .then((evaluation) => {
              io.emit('action', {
                type: 'EVALUATION_UPDATED',
                payload: evaluation
              })
              res.json(evaluation)
            })
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })
    .delete('/evaluations/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      Evaluation.findByIdAndRemove(id)
        .then(() => {
          io.emit('action', {
            type: 'EVALUATION_REMOVED',
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
