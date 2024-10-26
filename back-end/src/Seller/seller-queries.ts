import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const countProductsBySeller = async (sellerId: number) => {
    const count = await prisma.product.count({
        where: { sellerId }
    });
    return count;
};
export const getProductsBySeller = async (sellerId: number) => {
    const products = await prisma.product.findMany({    
        where: { sellerId },
        include: { images: true } 
    });
    return products;
};
        