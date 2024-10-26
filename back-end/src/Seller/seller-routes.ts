import express from 'express'
import handler from './seller-handler'
const router = express.Router()

router
.post('/register', handler.registerOrUpgradeToSeller)
.get('/:sellerId/details', handler.getSellerDetails)
.post('/login', handler.login)
.post('/verify-email', handler.verifyEmailAndActivateSeller)
.get('/:sellerId/products', handler.getSellerProducts);
// .post('/resend-otp', handler.resendOTP);

export default router;
