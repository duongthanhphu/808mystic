import { query, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as productService from './product-services';
import productQuery from './product-queries';

const prisma = new PrismaClient();

interface Product {
    name: string,
    categoryId: number,
    sellerId: number,
    attributes: {attributeId: number, value: any}[],
    slug?: string
}
interface ClassificationGroup {
    name: string;
    options: string[];
}

interface Classification {
    option1: string;
    option2?: string;
    price: number;
    stock: number;
}

const createProductHandler = async (req: Request, res: Response) => {
    try {
        const {
            name,
            categoryId,
            hasClassification,
            attributeValues,
            classificationGroups,
            classifications,
            sellerId,
        }: {
            name: string;
            categoryId: number;
            hasClassification: string;
            attributeValues?: string;
            classificationGroups?: ClassificationGroup[];
            classifications?: Classification[];
            sellerId: number;
        } = req.body;

        console.log(req.body)
        const files: Express.Multer.File[] = req.files as Express.Multer.File[];
        if (!name || !categoryId || !sellerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        let parsedClassificationGroups: ClassificationGroup[] | undefined;
        if (classificationGroups) {
            if (typeof classificationGroups === 'string') {
                try {
                    parsedClassificationGroups = JSON.parse(classificationGroups);
                } catch (error) {
                    return res.status(400).json({ error: 'classificationGroups không hợp lệ' });
                }
            } else if (Array.isArray(classificationGroups)) {
                parsedClassificationGroups = classificationGroups;
            } else {
                return res.status(400).json({ error: 'classificationGroups phải là một mảng hoặc một chuỗi JSON' });
            }
        }
        const result = await prisma.$transaction( async (prisma) => {
            const productData: Prisma.ProductCreateInput = {
                name,
                category: { 
                    connect: { 
                        id: Number(categoryId) 
                    } 
                },
                seller: { 
                    connect: { 
                        id: 1
                    } 
                },
                hasClassification:  JSON.parse(hasClassification),
                slug: 'something',
            };

            const product = await prisma.product.create({
                data: productData,
            });
            if (attributeValues && attributeValues.length > 0) {
                try {
                    const parsedAttributeValues: Array<{attributeId: number, value: {name: string}}> = JSON.parse(attributeValues);
                    
                    await Promise.all(parsedAttributeValues.map(async (element) => {
                    
                    const attribute = await prisma.categoryAttribute.findUnique({
                        where: { id: element.attributeId }
                    });
                    if (!attribute) {
                        throw new Error(`Attribute with id ${element.attributeId} does not exist`);
                    }
                    let attributeValue = await prisma.attributeValue.findFirst({
                        where: {
                            attributeId: element.attributeId,
                            value:{
                                path: ['name'],
                                equals: element.value.name
                            }
                        }
                    });

                    if (!attributeValue) {
                        attributeValue = await prisma.attributeValue.create({
                        data: {
                            attributeId: element.attributeId,
                            value: element.value 
                        }   
                        });
                    }

                    await prisma.productAttributeValue.create({
                        data: {
                        productId: product.id,
                        attributeValueId: attributeValue.id
                        }
                    });
                    }));
                } catch (error) {
                    console.error('Error parsing or processing attributeValues:', error);
                    throw error; 
                }
            }

            
        if (hasClassification && parsedClassificationGroups) {
            console.log('Classification groups:', parsedClassificationGroups);
            console.log('Classifications (raw):', classifications);

            // Đảm bảo classifications là một mảng
            let parsedClassifications: Classification[];
            if (Array.isArray(classifications)) {
                parsedClassifications = classifications;
            } else if (typeof classifications === 'string') {
                try {
                    parsedClassifications = JSON.parse(classifications);
                    if (!Array.isArray(parsedClassifications)) {
                        throw new Error('Parsed classifications is not an array');
                    }
                } catch (error) {
                    console.error('Error parsing classifications:', error);
                    throw new Error('Invalid classifications format');
                }
            } else if (typeof classifications === 'object' && classifications !== null) {
                parsedClassifications = [classifications as Classification];
            } else {
                console.error('Invalid classifications type:', typeof classifications);
                throw new Error('Invalid classifications format');
            }


            const createdGroups = await Promise.all(parsedClassificationGroups.map(async (group) => {
                return await prisma.classificationGroup.create({
                    data: {
                        name: group.name,
                        product: { connect: { id: product.id } },
                        options: {
                            create: group.options.map((option: string) => ({ name: option })),
                        },
                    },
                    include: { options: true },
                });
            }));


            for (const classification of parsedClassifications) {
                console.log('Processing classification:', classification);

                if (!classification.option1) {
                    console.error('Invalid classification: option1 is undefined', classification);
                    throw new Error(`Invalid classification: option1 is undefined`);
                }

                let option1, option2;

                for (const group of createdGroups) {
                    const foundOption = group.options.find(o => o.name === classification.option1 || o.name === classification.option2);
                    if (foundOption) {
                        if (!option1) {
                            option1 = foundOption;
                        } else {
                            option2 = foundOption;
                            break;
                        }
                    }
                }

                if (!option1) {
                    console.error('Option1 not found:', classification.option1);
                    throw new Error(`Invalid classification options: option1 "${classification.option1}" not found in any group`);
                }

                if (classification.option2 && !option2) {
                    console.error('Option2 not found:', classification.option2);
                    throw new Error(`Invalid classification options: option2 "${classification.option2}" not found in any group`);
                }

                await prisma.productClassification.create({
                    data: {
                        product: { connect: { id: product.id } },
                        option1: { connect: { id: option1.id } },
                        option2: option2 ? { connect: { id: option2.id } } : undefined,
                        price: classification.price,
                        stock: classification.stock,
                    },
                });

                console.log('Classification created successfully');
            }
        }


            return product;
        });
                
        

        if (files && files.length > 0) {
            try {
                await productService.default.uploadProductImages(files, String(result.id));
            } catch (uploadError) {
                console.error('Error uploading images:', uploadError);
            }
        }

        res.status(201).json({ message: 'Product created successfully', product: result });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('Prisma error:', error.message, error.code);
            if (error.code === 'P2002') {
                res.status(409).json({ error: 'Duplicate entry' });
            } else {
                res.status(400).json({ error: 'Database operation failed', code: error.code });
            }
        } else if (error instanceof Error) {
            console.error('Error creating product:', error.message);
            res.status(500).json({ error: 'Failed to create product', details: error.message });
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
};


const findAll = async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.findMany({
            include : {
                attributeValues: true,
                classificationGroups: {
                    include: {
                        options: true
                    }
                },
                classifications: true,
                images: true,
                
            }
        })
        return res.json({
            products : product
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}


const findByIdHandler = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const product = await productQuery.findProductDetail(id)
        return res.json({
            products : product
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
    createProductHandler,
    findAll,
    findByIdHandler

};