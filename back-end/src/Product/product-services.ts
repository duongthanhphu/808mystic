import { PrismaClient, Prisma } from '@prisma/client';
import { handlePrismaError } from '../Utils/DatabaseError'
import {Product, AttributeValue, ClassificationGroup, ProductClassification, ProductFilterQuery} from './product-model'
import query from './product-queries'
import imageService from '../Image/image-services'
const prisma = new PrismaClient();


const createProductService = async (
    productData: Product,
    attributeValues: AttributeValue[],
    classificationGroups: ClassificationGroup[],
    productClassifications: ProductClassification[],
    files: Express.Multer.File[]
) => {
    try {
        const productTransaction = await prisma.$transaction(async (prismaTransaction) => {
            const newProductDetails: Prisma.ProductCreateInput = {
                name: productData.name,
                shortDescription: productData.shortDescription,
                longDescription: productData.longDescription,
                category: {
                    connect: {
                        id: Number(productData.categoryId)
                    }
                },
                seller: {
                    connect: {
                        id: Number(productData.sellerId)
                    }
                },
                hasClassification: productData.hasClassification,
                slug: 'something', 
            }
            const createdProductInDB = await prismaTransaction.product.create({data: newProductDetails})
            
            if (Array.isArray(attributeValues)) {
                console.log(attributeValues)
                await Promise.all(attributeValues.map(async (element) => {
                    let attributeValue = await prismaTransaction.attributeValue.findFirst({
                        where: {
                            categoryAttributeValueId: element.categoryAttributeValueId,
                        }
                    });
                    if (!attributeValue) {
                        console.log('Attribute value not found, creating new one');
                        attributeValue = await prismaTransaction.attributeValue.create({
                            data: {
                                categoryAttributeValueId: element.categoryAttributeValueId,
                                value: element.value
                            
                            }
                        });
                    } else {
                        console.log('Existing attribute value found:', attributeValue);
                    }
                    
                    await prismaTransaction.productAttributeValue.upsert({
                        where: {
                            productId_attributeValueId: {
                                productId: createdProductInDB.id,
                                attributeValueId: attributeValue.id,
                            }
                        },
                        update: {}, // Không cần cập nhật gì nếu đã tồn tại
                        create: {
                            productId: createdProductInDB.id,
                            attributeValueId: attributeValue.id,
                        }
                    });
                }));
            }
            if (Array.isArray(classificationGroups) && Array.isArray(productClassifications)) {
                const createdGroups = await Promise.all(classificationGroups.map(async (group) => {
                    if (!group.name) {
                        throw new Error('Classification group name is required');
                    }
                    if (!Array.isArray(group.options) || group.options.length === 0) {
                        throw new Error(`Classification group "${group.name}" must have at least one valid option`);
                    }
                    return await prismaTransaction.classificationGroup.create({
                        data: {
                            name: group.name,
                            product: { connect: { id: createdProductInDB.id } },
                            options: {
                                create: group.options.map((optionName) => ({ name: optionName })),
                            },
                        },
                        include: { options: true },
                    });
                }));

                const optionNameToId = new Map();
                createdGroups.forEach(group => {
                    group.options.forEach(option => {
                        optionNameToId.set(option.name, option.id);
                    });
                });

                await Promise.all(productClassifications.map(async (classification) => {
                    const optionConnections: any = {};
                    Object.entries(classification).forEach(([key, value]) => {
                        if (key.startsWith('option')) {
                            const optionId = optionNameToId.get(value);
                            if (!optionId) {
                                throw new Error(`Option ${value} not found`);
                            }
                            optionConnections[key] = { connect: { id: optionId } };
                        }
                    });

                    return prismaTransaction.productClassification.create({
                        data: {
                            price: classification.price,
                            stock: classification.stock,
                            product: { connect: { id: createdProductInDB.id } },
                            ...optionConnections,
                        },
                    });
                }));
            }
            return createdProductInDB
        });
        

        
        return productTransaction;
    } catch (error) {
        console.error(`Error processing attribute value:`, error);
        throw error; 
    }
};


const uploadProductImages = async (files: Express.Multer.File[], productId: string) => {
    try {
        return await imageService.uploadManyImageService(files, productId)
    }catch (error: unknown) {
        handlePrismaError(error)
    }
}


const findByIdService = async (id: number) => {
    try {
        return await query.findProductDetail(id)
    }catch(error){
        console.error(`Error find by product:`, error);
        throw error; 
    }
}

const findAllService = async (page: number = 1, pageSize: number = 10) => {
    try {
        return await query.findAll(page, pageSize )
    }catch(error){
        console.error(`Error find all products:`, error);
        throw error; 
    }
}


export default {
    createProductService,
    uploadProductImages,
    findByIdService,
    findAllService
}
