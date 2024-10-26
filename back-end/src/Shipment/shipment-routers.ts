import express from 'express';
import testGHNService from './test.ghn.api';

const router = express.Router();

router
    .get('/test-ghn', async (req, res) => {
        try {
            await testGHNService;
            res.status(200).json({ message: 'Kiểm tra GHN Service thành công' });
        } catch (error) {
            console.error('Lỗi khi kiểm tra GHN Service:', error);
            res.status(500).json({ error: 'Đã xảy ra lỗi khi kiểm tra GHN Service' });
        }
    });

export default router;