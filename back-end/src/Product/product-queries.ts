import prismaService from "../prisma.service";
import { Prisma } from '@prisma/client';



const findAll = async () => {
    try {
        return await prismaService.product.findMany({
            
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
        return await prismaService.product.create({
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