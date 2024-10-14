import { PrismaClient, Prisma } from '@prisma/client';
import { handlePrismaError } from '../Utils/DatabaseError'
import {Product, AttributeValue, ClassificationGroup, ProductClassification} from './product-model'
import query from './product-queries'
import imageService from '../Image/image-services'
const prisma = new PrismaClient();


const createProductService = async (
    productData: Product,
    attributeValues: Array<{ categoryAttributeValueId: number, value: { name: string } }>,
    classificationGroups: ClassificationGroup[],
    productClassifications: ProductClassification[]
) => {
    try {
        await prisma.$transaction(async (prismaTransaction) => {
            // console.log('Starting transaction');
            const newProductDetails: Prisma.ProductCreateInput = {
                name: productData.name,
                category: {
                    connect: {
                        id: productData.categoryId
                    }
                },
                seller: {
                    connect: {
                        id: productData.sellerId
                    }
                },
                hasClassification: productData.hasClassification,
                slug: 'something', 
            }
            const createdProductInDB = await prismaTransaction.product.create({data: newProductDetails})
            
            if (typeof attributeValues === 'object') {
                await Promise.all(Object.values(attributeValues).map(async (element, index) => {
                    // console.log(`Processing attribute value ${index + 1}`);
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
                                value: element.value,
                            }
                        });
                        // console.log('New attribute value created:', attributeValue);
                    }else {
                        // console.log('Existing attribute value found:', attributeValue);
                    }
                    const pav = await prismaTransaction.productAttributeValue.create({
                        data: {
                            productId: createdProductInDB.id,
                            attributeValueId: attributeValue.id,
                        }
                    });
                    
                }));
            }
            console.log("PRoduct" + createdProductInDB.id)
            if (Array.isArray(productClassifications)) {
                const createdGroups = await Promise.all(classificationGroups.map(async (group) => {
                return await prismaTransaction.classificationGroup.create({
                    data: {
                        name: group.name,
                        product: { connect: { id: createdProductInDB.id } },
                        options: {
                            create: group.options.map((option) => ({
                                name: option.name,
                            })),
                        },
                    },
                    include: { options: true },
                });
            }));
                
            await Promise.all(classificationGroups.flatMap((group, groupIndex) =>
                group.options.flatMap((option) =>
                productClassifications.map(async (classification) => {
                    const createdOption = createdGroups[groupIndex].options.find(o => o.name === option.name);
                    const option2 = group.options.length > 1 ? createdGroups[groupIndex].options[1] : null;
                    if (!createdOption) {
                    throw new Error(`Option ${option.name} not found in created group`);
                    }

                    return prismaTransaction.productClassification.create({
                        data: {
                            price: classification.price,
                            stock: classification.stock,
                            product: { connect: { id: createdProductInDB.id } },
                            option1: { connect: { id: createdOption.id } },
                            ...(option2 && { option2: { connect: { id: option2.id } } }),
                        },
                    });
                })
                )
            ));
            }
        
            return createdProductInDB;
        });
        
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
export default {
    createProductService,
    uploadProductImages,
    findByIdService
}

