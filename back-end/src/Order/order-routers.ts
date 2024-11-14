import express from 'express';
import handler from './order-handlers';

const router = express.Router();

router.post('/:userId/checkout', handler.checkoutOrder)
      .get('/:orderId', handler.orderDetail)
      .post('/', handler.createOrder)
      .post('/:orderId/confirm', handler.confirmOrderBySeller)
      .get('/user/:userId', handler.getAllOrderByUser)
      .get('/seller/:sellerId', handler.getOrdersBySeller)

export default router;
