import express from 'express';
import { createOrder, 
        confirmOrder, 
        getOrderById, 
        sellerConfirmOrder, 
        createShippingOrder,
        trackOrder,
        getOrderHistory,
} from './order-handlers';

const router = express.Router();

router
    .get('/:orderId', getOrderById)
    .get('/:orderId/track', trackOrder)
    .get('/:orderId/history', getOrderHistory)
    .post('/:orderId/createShippingOrder', createShippingOrder)
    .post('/', createOrder)
    .post('/:orderId/sellerConfirm', sellerConfirmOrder)
    .put('/:orderId/confirm', confirmOrder)

export default router;
