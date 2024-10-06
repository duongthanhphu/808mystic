import prismaService from "../../prisma.service";
import { Prisma } from '@prisma/client';



const findAll = async () => {
    try {
        return await prismaService.categoryAttribute.findMany()
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const findById = async ( id: String) => {
    try {
        return await prismaService.categoryAttribute.findUnique({
            where : {
                id: Number(id)
            }
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}


const createCategory = async (categoryAttribute: Prisma.CategoryAttributeUncheckedCreateInput) => {
    try {
        const existingCategory = await prismaService.category.findUnique({
            where: { id: categoryAttribute.categoryId }
            });

            if (!existingCategory) {
                
            return console.error('Invalid categoryId, category does not exist');
            }

        return await prismaService.categoryAttribute.create({
            data: categoryAttribute
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}
const updateCategory = async ( ) => {
    try {

    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const deleteCategory = async ( ) => {
    try {

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
    findById,
    createCategory,
    updateCategory,
    deleteCategory
}