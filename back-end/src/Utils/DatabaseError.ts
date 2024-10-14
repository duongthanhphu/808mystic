import { Prisma } from '@prisma/client';
import { AppError } from './AppError';

export function handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
        case 'P2002':
            throw new AppError('Dữ liệu đã tồn tại (vi phạm ràng buộc unique)', 400);
        case 'P2003':
            throw new AppError('Vi phạm ràng buộc khóa ngoại', 400);
        case 'P2005':
        case 'P2006':
            throw new AppError('Giá trị không hợp lệ cho trường dữ liệu', 400);
        case 'P2011':
            throw new AppError('Vi phạm ràng buộc không được null', 400);
        case 'P2014':
            throw new AppError('ID không hợp lệ trong điều kiện truy vấn', 400);
        case 'P2025':
            throw new AppError('Bản ghi không tồn tại', 404);
        default:
            throw new AppError(`Lỗi database không xác định: ${error.code}`, 500);
        }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new AppError('Lỗi xác thực dữ liệu Prisma', 400);
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new AppError('Lỗi nghiêm trọng trong Prisma Client', 500);
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new AppError('Lỗi khởi tạo Prisma Client', 500);
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new AppError('Lỗi không xác định từ Prisma Client', 500);
    } else {
        throw new AppError('Lỗi không xác định', 500);
    }
}