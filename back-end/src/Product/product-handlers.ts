import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import productService from './product-services';
import { Product } from './product-model'


const createProductHandler = async (req: Request, res: Response) => {
    try {
        const productData: Omit<Product, 'hasClassification'> & { hasClassification: string } = JSON.parse(JSON.stringify(req.body));
        const files: Express.Multer.File[] = req.files as Express.Multer.File[];

        if (!productData.name || !productData.categoryId || !productData.sellerId) {
            return res.status(400).json({ error: "Name, category, and seller are required" });
        }
        const hasClassification = productData.hasClassification === 'true';

        let attributeValues = [];
        let classificationGroups = [];
        let productClassifications = [];

        try {
            const parseAndEnsureArray = (data: any, fieldName: string) => {
                if (typeof data === 'string') {
                    const parsedData = JSON.parse(data);
                    return Array.isArray(parsedData) ? parsedData : [parsedData];
                }
                return Array.isArray(data) ? data : [data];
            };

            attributeValues = parseAndEnsureArray(productData.attributeValues, 'attributeValues');
            classificationGroups = parseAndEnsureArray(productData.classificationGroups, 'classificationGroups');
            productClassifications = parseAndEnsureArray(productData.productClassifications, 'productClassifications');

        } catch (error) {
            console.error("Lỗi khi parse dữ liệu:", error);
            return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
        }

        const createdProduct = await productService.createProductService(
            { ...productData, hasClassification },
            attributeValues,
            classificationGroups,
            productClassifications,
            files
        );
        if (files && files.length > 0) {
                try {
                    await productService.uploadProductImages(files, String(createdProduct.id));
                } catch (uploadError) {
                    console.error('Error uploading images:', uploadError);
                }
            }
        return res.status(201).json({
            message: "Product created successfully",
            product: createdProduct
        });
    } catch (error: unknown) {
        console.error("Error creating product:", error);
        return res.status(500).json({ error: "An error occurred while creating the product" });
    }
};


const findByIdHandler = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const product = await productService.findByIdService(Number(id))
        return res.json({
            product : product
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const findAllHandler = async (req: Request, res: Response) => {
    const { page = 1, pageSize = 10 } = req.query;
    try {
        const productsFromsServer = await productService.findAllService(Number(page), Number(pageSize))
        res.json({
            message: 'success',
            products: productsFromsServer
        });
    }catch (error: unknown) {
        res.status(500).json({
            error: 'Error fetching products'
        });
    }
}

const imageTester = async (req: Request, res: Response) => {
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    const {id} = req.body
    try {
        const productsFromsServer = await productService.uploadProductImages(files, id)
        res.json({
            message: 'success',
            products: productsFromsServer
        });
    }catch (error: unknown) {
        res.status(500).json({
            error: 'Error fetching products'
        });
    }
}


export default { 
    createProductHandler,
    findAllHandler,
    findByIdHandler,
    imageTester

};
