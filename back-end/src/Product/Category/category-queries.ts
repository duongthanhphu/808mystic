import prismaService from "../../prisma.service";


const findAll = async () => {
    try {
        return await prismaService.category.findMany({
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
    } finally {
        await prismaService.$disconnect(); 
    }
}


const findByid = async (id: string) => {
    try {
        return await prismaService.category.findUnique({
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
    } finally {
        await prismaService.$disconnect(); 
    } 
}

const findByLevel = async (level: string) => {
    try {
        return await prismaService.category.findMany({
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
    } finally {
        await prismaService.$disconnect(); 
    } 
}


const deleteAll = async () => {
    try {
        return await prismaService.category.deleteMany()
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    } finally {
        await prismaService.$disconnect(); 
    }  
}

const findCategoriesWithAttributes = async () => {
    try {
        const categories = await prismaService.category.findMany({
            include: {
                attributes: true, 
                childCategories: true, 
            },
        });
        
        return categories; 
    } catch (error) {
        console.error('Error fetching categories with attributes:', error);
        throw error;
    } finally {
        await prismaService.$disconnect(); 
    }
};

const findAttributesByCategoryId = async (categoryId: string) => {
    try {
        console.log(categoryId)
        const attributes = await prismaService.categoryAttribute.findMany({
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
    } finally {
        await prismaService.$disconnect(); 
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