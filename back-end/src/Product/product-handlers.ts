import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as productService from './product-services';

const prisma = new PrismaClient();

const createProductHandler = async (req: Request, res: Response) => {
    try {
        const {
            name,
            categoryId,
            attributeValues,
            hasClassification,
            classificationGroups,
            sellerId,
        } = req.body;
        console.log(classificationGroups)
        const files: Express.Multer.File[] = req.files as Express.Multer.File[];
        if (!name || !categoryId || !sellerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await prisma.$transaction(async (prisma) => {
            const productData: Prisma.ProductCreateInput = {
                name,
                category: { connect: { id: Number(categoryId) } },
                seller: { connect: { id: Number(sellerId) } },
                hasClassification:  JSON.parse(hasClassification.toLowerCase()),
                slug: 'something',
            };

            const product = await prisma.product.create({
                data: productData,
            });

            if (attributeValues && attributeValues.length > 0) {
                for (const av of attributeValues) {
                    await prisma.productAttributeValue.create({
                        data: {
                            product: { connect: { id: product.id } },
                            attribute: { connect: { id: av.attributeId } },
                        }
                    });
                }
            }

            if (hasClassification && classificationGroups) {
                for (const group of classificationGroups) {
                    const createdGroup = await prisma.classificationGroup.create({
                        data: {
                            name: group.name,
                            product: { connect: { id: product.id } },
                            options: {
                                create: group.options.map((option: string) => ({ name: option })),
                            },
                        },
                        include: { options: true },
                    });

                    if (classificationGroups.length === 2 && classificationGroups[1]) {
                        const secondGroup = await prisma.classificationGroup.create({
                            data: {
                                name: classificationGroups[1].name,
                                product: { connect: { id: product.id } },
                                options: {
                                    create: classificationGroups[1].options.map((option: string) => ({ name: option })),
                                },
                            },
                            include: { options: true },
                        });

                        for (const option1 of createdGroup.options) {
                            for (const option2 of secondGroup.options) {
                                await prisma.productClassification.create({
                                    data: {
                                        product: { connect: { id: product.id } },
                                        option1: { connect: { id: option1.id } },
                                        option2: { connect: { id: option2.id } },
                                        price: 0,
                                        stock: 0,
                                    },
                                });
                            }
                        }
                    }
                }
            }

            return product;
        });

        // Handle file uploads outside of the transaction
        if (files && files.length > 0) {
            try {
                await productService.default.uploadProductImages(files, String(result.id));
            } catch (uploadError) {
                console.error('Error uploading images:', uploadError);
                // Optionally handle rollback logic or inform the user about partial failure
            }
        }

        res.status(201).json({ message: 'Product created successfully', product: result });
    } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error:', error.message, error.code);
        // Handle specific Prisma error codes
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
        console.log('something')
        const product = await prisma.product.findMany({
            include : {
                attributeValues: true,
                classificationGroups: true,
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
export default { 
    createProductHandler,
    findAll

};