import express from 'express'
import {
    findAllUserHandler,
    findUserByIdHandler,
    signup,
    signin,
    verifyEmail
} from './user-handlers'
const router = express.Router()

router
.get('/', findAllUserHandler)
.get('/:id', findUserByIdHandler)
.post('/verify-email', verifyEmail)
.post('/signin', signin)
.post('/signup', signup)



export default router;