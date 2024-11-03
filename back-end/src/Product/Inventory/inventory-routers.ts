import express from 'express';
import handler from './inventory-handlers';

const router = express.Router();


router
    .get('/:sellerId', handler.getInventoryList)

export default router;