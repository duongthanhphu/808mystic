import express from 'express';
import handler from './cart-handlers';

const router = express.Router();

router
    .get('/', handler.findCarts)
    .get('/:userId', handler.findCartById)
    .post('/', handler.createCart)
    .put('/:itemId', handler.updateCart)
    // .put('/:itemId', handler.deleteCart)

export default router;