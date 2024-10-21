import express from 'express';
import { createOrder, confirmOrder, getOrderById } from './order-handlers';

const router = express.Router();

router
    .post('/', createOrder)
    .put('/:orderId/confirm', confirmOrder)
    .get('/:orderId', getOrderById);

export default router;
