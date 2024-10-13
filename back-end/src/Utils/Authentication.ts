import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Lấy token từ cookie
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'Không có token, quyền truy cập bị từ chối' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN as string) as { userId: string };
        
        // Nếu verify thành công, gán userId vào request object
        req.user = { id: decoded.userId };
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

export default authMiddleware;