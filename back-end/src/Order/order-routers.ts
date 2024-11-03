import express from 'express';
import handler from './order-handlers';

const router = express.Router();

router.get('/', handler.printOrder)
        .get('/:orderId', handler.orderDetail)
        .post('/:orderId/confirm', handler.confirmOrderBySeller)
        .post('/', handler.createOrder)


export default router;
