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

const findProductDetail = async (productId: string) => {
    try {
    const product = await prismaService.product.findUnique({
        where: { id: Number(productId) },
        include: {
            category: true,
            attributeValues: {
            include: {
                attributeValue: {
                include: {
                    attribute: true
                }
                }
            }
            },
            classificationGroups: {
            include: {
                options: true
            }
            },
            classifications: {
            include: {
                option1: true,
                option2: true
            }
            },
            images: true
        }
        });

        if (!product) {
        throw new Error('Product not found');
        }

        return product;
    } catch (error: unknown) {
        if (error instanceof Error) {
        console.error('Error fetching product details:', error.message);
        } else {
        console.error('Unexpected error:', error);
        }
        throw error;
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
    createProduct,
    findProductDetail
}