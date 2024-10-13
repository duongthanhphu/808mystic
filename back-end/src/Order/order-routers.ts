import express from 'express';
import * as OrderHandlers from './order-handlers';

const router = express.Router();

router.post('/', OrderHandlers.createOrder)
.get('/:id', OrderHandlers.getOrder)
.put('/:id/status', OrderHandlers.updateOrderStatus)
.post('/:id/cancel', OrderHandlers.cancelOrder);

export default router;