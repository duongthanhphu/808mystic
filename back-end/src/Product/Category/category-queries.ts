import prismaService from "../../prisma.service";
import { paginateQuery, PaginationResult } from "../../Utils/PaginationUtils";

const findAll = async (page: number = 1, pageSize: number = 10): Promise<PaginationResult<any>> => {
    try {
        return await paginateQuery(
            (skip, take) => prismaService.category.findMany({
                include: { childCategories: true },
                skip,
                take,
            }),
            () => prismaService.category.count(),
            page,
            pageSize
        );
    } catch (error: unknown) {
        console.error('Error in findAll:', error);
        throw error;
    } finally {
        await prismaService.$disconnect();
    }
};

const findByid = async (id: string) => {
    try {
        return await prismaService.category.findUnique({
            where: { id: Number(id) },
            include: { childCategories: true },
        });
    } catch (error: unknown) {
            console.error('Error in findById:', error);
            throw error;
    } finally {
            await prismaService.$disconnect();
    }
};

const findByLevel = async (level: string, page: number = 1, pageSize: number = 10): Promise<PaginationResult<any>> => {
    try {
        return await paginateQuery(
            (skip, take) => prismaService.category.findMany({
                where: { level: Number(level) },
                include: {
                childCategories: {
                    select: {
                        id: true,
                        name: true,
                        childCategories: { 
                            select: { id: true, name: true } 
                        }
                    }
                }
                },
                skip,
                take,
            }),
            () => prismaService.category.count({ where: { level: Number(level) } }),
            page,
            pageSize
        );
    } catch (error: unknown) {
        console.error('Error in findByLevel:', error);
        throw error;
    } finally {
        await prismaService.$disconnect();
    }
};

const deleteAll = async () => {
    try {
            return await prismaService.category.deleteMany();
    } catch (error: unknown) {
            console.error('Error in deleteAll:', error);
            throw error;
    } finally {
            await prismaService.$disconnect();
    }
};

const findAttributesByCategoryId = async (categoryId: string, page: number = 1, pageSize: number = 10): Promise<PaginationResult<any>> => {
    try {
        return await paginateQuery(
            (skip, take) => prismaService.categoryAttribute.findMany({
                where: { categoryId: Number(categoryId) },
                include: { category: true },
                orderBy: { createdAt: 'asc' },
                skip,
                take,
            }),
            () => prismaService.categoryAttribute.count({ where: { categoryId: Number(categoryId) } }),
            page,
            pageSize
        );
    } catch (error) {
        console.error('Error in findAttributesByCategoryId:', error);
        throw new Error('Unable to fetch attributes for the specified category.');
    } finally {
        await prismaService.$disconnect();
    }
};

export default {
    findAll,
    findByid,
    findByLevel,
    deleteAll,
    findAttributesByCategoryId
};