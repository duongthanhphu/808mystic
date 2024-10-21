import query from './image-queries';
import { Prisma } from '@prisma/client';
import { v2 as cloudinary, UploadApiResponse  } from 'cloudinary';
import { Image } from './image-models';
import PQueue from 'p-queue';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET!
});


const uploadManyImageService = async (files: Express.Multer.File[], productId: string): Promise<Image[]> => {
    const queue = new PQueue({ concurrency: 2 }); // Giới hạn số lượng upload đồng thời
    try {
        const uploadTasks = files.map(file => 
            queue.add(() => {
                return new Promise<UploadApiResponse>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'auto' }, 
                        (error, result) => {
                                    if (error) {
                                return reject(error);
                                }
                                if (!result) {
                                    return reject(new Error('Upload failed, no result returned.'));
                                }
                            resolve(result); // Chuyển kết quả upload lên Cloudinary
                        }
                    );
                    stream.end(file.buffer); // Đưa buffer vào stream
                });
            })
        );

        // Chờ tất cả các tác vụ upload hoàn thành
        const imageFromCloud: UploadApiResponse[] = await Promise.all(uploadTasks);
        
        // Tạo và lưu thông tin hình ảnh vào cơ sở dữ liệu
        const imagesFromServer = await Promise.all(imageFromCloud.map(image => 
            query.createImage({
                productId: Number(productId),
                name: image.original_filename || 'unnamed',
                path: image.secure_url,
                contentType: image.format || '', // Đảm bảo lấy đúng kiểu
                publicId: image.public_id || '',
                size: image.bytes || 0,
                isThumbnail: false,
                isEliminated: false,
                createdAt: new Date(), // Thêm createdAt
                updatedAt: new Date(), // Thêm updatedAt
                deletedAt: null // Thêm deletedAt
            })
        ));
        
        return imagesFromServer; // Trả về danh sách hình ảnh đã lưu
    } catch (error: any) {
        console.error('Error in uploadManyImageService:', error);
        throw new Error(`Upload many images failed: ${error.message}`); // Cải thiện thông báo lỗi
    }
}






// const updateImageService = async (id: number, data: Partial<Image>): Promise<Image> => {
//     try {
//         const existingImage = await query.findImageById(id);
//         if (!existingImage) {
//             throw new Error('Image not found');
//         }

//         if (data.path && data.path !== existingImage.path) {
//             await cloudinary.uploader.destroy(existingImage.publicId);
//             const uploadResult = await cloudinary.uploader.upload(data.path, {
//                 public_id: data.name || existingImage.name,
//                 resource_type: 'auto'
//             });
//             data.path = uploadResult.secure_url;
//             data.contentType = uploadResult.format;
//             data.publicId = uploadResult.public_id;
//             data.size = uploadResult.bytes;
//         }

//         return await query.updateImage(id, data);
//     } catch (error) {
//         console.error('Error in updateImageService:', error);
//         throw error;
//     }
// }

// const deleteImageService = async (id: number): Promise<void> => {
//     try {
//         const image = await query.findImageById(id);
//         if (!image) {
//             throw new Error('Image not found');
//         }

//         await cloudinary.uploader.destroy(image.publicId);
//         await query.deleteImage(id);
//     } catch (error) {
//         console.error('Error in deleteImageService:', error);
//         throw error;
//     }
// }

export default {
    uploadManyImageService,
    // updateImageService,
    // deleteImageService
}