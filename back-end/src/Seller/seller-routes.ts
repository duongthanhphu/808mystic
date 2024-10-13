import express from 'express'
import handler from './seller-handler'
const router = express.Router()

router
.post('/register', handler.registerOrUpgradeToSeller)
.post('/login', handler.login)



export default router;