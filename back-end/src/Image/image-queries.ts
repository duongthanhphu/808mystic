import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const createImage = async (data: Prisma.ImageUncheckedCreateInput) => {

    try {
        return await prisma.image.create({
            data
        })
        
    } catch (error: any) {
        console.error('Error creating category:', error.message);
        throw error; 
    }
};

export const updateImage = async (id: number, data: Prisma.ImageUncheckedCreateInput) => {
    try {
        
        return await prisma.image.update({
            where:{
                id: id
            },
            data
        });
    } catch (error: any) {
        console.error('Error creating category:', error.message);
        throw error; 
    }
};

export const deleteImage = async (id: number) => {
    try {
        return await prisma.image.delete({
            where: {
                id: id,
            },
        });
    } catch (error: any) {
        console.log("[IMAGE] - Cannot deleteCategory", error.message);
        throw error
    }
};

export default {
    createImage
}