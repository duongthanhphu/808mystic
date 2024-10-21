import { Request, Response } from 'express';
import imageServices from './image-services';
import { Prisma } from '@prisma/client';


const uploadManyImagesHandler = async (req: Request, res: Response) => {
    try {
        // const files: Express.Multer.File[] = req.files as Express.Multer.File[]; // Lấy tệp từ req.files
        // const uploadedImages = await imageServices.uploadManyImageService(files); // Gọi hàm với files

        // res.status(200).json(uploadedImages); // Trả về kết quả
    } catch (error) {
        console.error('Error in uploadImagesHandler:', error);
        res.status(500).send('Failed to upload images.');
    }
};

export default {
    uploadManyImagesHandler
};
