import express from 'express'
import handler from './shipping-handler'
const router = express.Router()

router
.get('/', handler.getShippingProviders)
.post('/init', handler.initShippingProvider)

export default router;
