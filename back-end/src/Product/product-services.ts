import query from './product-queries'
import { Prisma } from '@prisma/client';
import imageService from '../Image/image-services'
const addProduct = (data: Prisma.ProductUncheckedCreateInput) => {
    try {
        
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const uploadProductImages = async (files: Express.Multer.File[], productId: string) => {
    try {
        return await imageService.uploadManyImageService(files, productId)
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}
export default {
    addProduct,
    uploadProductImages
}