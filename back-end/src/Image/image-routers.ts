import express from 'express';
import multer from 'multer';
import  handler from './image-handlers';
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router
// .post('/images', upload.single('image'), handler.createImageHandler )
.post('/images/many', upload.array('images', 10), handler.uploadManyImagesHandler );

export default router;
