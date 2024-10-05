import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const findAll = async () => {
    try {
        return await prisma.category.findMany({
            include: {
                childCategories: true
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


const findByid = async (id: string) => {
    try {
        return await prisma.category.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                childCategories: true
            },
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }    
}

const findByLevel = async (level: string) => {
    try {
        return await prisma.category.findMany({
            where : {
                level: Number(level)
            },
            include: {
                childCategories: {
                    include: {
                        childCategories: true
                    }
                }
            },
            
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }  
}


const deleteAll = async () => {
    try {
        return await prisma.category.deleteMany()
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }  
}

const findCategoriesWithAttributes = async () => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                attributes: true, // Join với bảng CategoryAttribute
                childCategories: true, // Nếu bạn cũng muốn lấy các category con
            },
        });
        
        return categories; // Trả về danh sách categories cùng với attributes
    } catch (error) {
        console.error('Error fetching categories with attributes:', error);
        throw error;
    } finally {
        await prisma.$disconnect(); // Đóng kết nối
    }
};

const findAttributesByCategoryId = async (categoryId: string) => {
    try {
        console.log(categoryId)
        const attributes = await prisma.categoryAttribute.findMany({
            where: {
                categoryId: Number(categoryId) // Lọc thuộc tính theo categoryId
            },
            include: {
                category: true, // Join với bảng CategoryAttribute
            },
            orderBy: {
                createdAt: 'asc' // Sắp xếp theo ngày tạo, bạn có thể thay đổi theo nhu cầu
            }
        });
        return attributes;
    } catch (error) {
        console.error('Error fetching attributes by categoryId:', error);
        throw new Error('Unable to fetch attributes for the specified category.');
    }
};

export default {
    findAll,
    findByid,
    findByLevel,
    deleteAll,
    findCategoriesWithAttributes,
    findAttributesByCategoryId
}