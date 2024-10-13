import express from 'express'
import handler from './user-handlers'
const router = express.Router()

router
.get('/', handler.findAllUserHandler)
.get('/:id', handler.findUserByIdHandler)
.post('/signin', handler.signin)
.post('/signup', handler.signup)



export default router;