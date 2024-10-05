import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();


const findAll = async () => {
    try {
        return await prisma.product.findMany({
            
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const createProduct = async (data: Prisma.ProductUncheckedCreateInput) => {
    try {
        return await prisma.product.create({
            data
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}
export default {
    findAll,
    createProduct
}