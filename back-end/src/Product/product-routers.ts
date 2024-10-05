import express from 'express';
import multer from 'multer';
import  handler from './product-handlers';
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router
.get('/', handler.findAll )
.post('/', upload.array('images', 10), handler.createProductHandler );

export default router;
