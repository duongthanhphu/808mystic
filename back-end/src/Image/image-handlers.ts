import { Request, Response } from 'express';
import imageServices from './image-services';
import { Prisma } from '@prisma/client';
// Handler để upload một ảnh
const createImageHandler = async (req: Request, res: Response) => {
    try {
        // if (!req.file) {
        //     return res.status(400).json({ message: 'Không có tệp nào được tải lên.' });
        // }
        // console.log(req.file.mimetype)
        // // Chuyển đổi Buffer thành base64
        // const b64 = Buffer.from(req.file.buffer).toString('base64');
        // const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // const imageData: Prisma.ImageUncheckedCreateInput = {
        //     name:  req.file.originalname,
        //     path: dataURI,
        //     isThumbnail: false,
        //     isEliminated: false,
        //     publicId: '',  // Được cập nhật sau khi upload lên Cloudinary
        //     contentType: req.file.mimetype, // Sẽ được cập nhật từ Cloudinary
        //     size: req.file.size  // Kích thước sẽ được xác định sau khi upload
        // };


        // const createdImage = await imageServices.createImageService(imageData);
        
        // return res.status(201).json(createdImage); // Trả về thông tin hình ảnh đã được tạo
    } catch (error) {
        console.error('Error in createImageHandler:', error);
        return res.status(500).json({ message: 'Error uploading image' });
    }
};

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
    createImageHandler,
    uploadManyImagesHandler
};
