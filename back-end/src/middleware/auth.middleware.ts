import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prismaService from '../prisma.service';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        const user = await prismaService.user.findUnique({
            where: { id: decoded.userId },
            include: { seller: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

