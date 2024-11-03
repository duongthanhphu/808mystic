import express from 'express';
import handler from './warehouse-handlers';

const router = express.Router();


router
    .get('/:sellerId', handler.getAllWarehouses)

export default router;