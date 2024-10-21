import express from 'express'
import handler from './user-handlers'
const router = express.Router()

router
.get('/', handler.findAllUserHandler)
.get('/:id', handler.findUserByIdHandler)
.post('/signin', handler.signin)
.post('/signup', handler.registerWithVerification)
.post('/verify-email', handler.verifyEmail)
.post('/resend-otp', handler.resendOTP)
.get('/provinces', handler.getProvinces)
.get('/provinces/:provinceId/districts', handler.getDistricts)
.get('/districts/:districtId/wards', handler.getWards)

export default router;
