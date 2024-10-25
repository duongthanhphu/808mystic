import express from 'express';
import multer from 'multer';
import handler from './product-handlers';

const router = express.Router();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 10
  }
});

// Error handling middleware for multer
const handleMulterError = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size is too large. Max size is 10MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Max count is 10.' });
    }
    return res.status(400).json({ message: 'File upload error.' });
  }
  next(err);
};

router.use(handleMulterError);

router
  .get('/', handler.findAllHandler)
  .get('/:id', handler.findByIdHandler)
  .post('/', upload.array('images', 10), handler.createProductHandler)
  .post('/image/', upload.array('images', 10), handler.imageTester)

export default router;