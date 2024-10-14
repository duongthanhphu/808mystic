import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import productService from './product-services';
import { Product } from './product-model'


const createProductHandler = async (req: Request, res: Response) => {
    try {
        const productData: Product = req.body;

        if (!productData.name || !productData.categoryId || !productData.sellerId) {
            return res.status(400).json({ error: "Name, category, and seller are required" });
        }
        
        const attributeValues = (productData.attributeValues || []) ;

        if (!Array.isArray(attributeValues)) {
            return res.status(400).json({ error: "attributeValues must be an array of attributeValue objects" });
        }
        const classificationGroups = productData.classificationGroups || [];

        if (!Array.isArray(classificationGroups)) {
            return res.status(400).json({ error: "classificationGroup must be an array of classificationGroup objects" });
        }

        const productClassifications = productData.productClassifications || [];

        if (!Array.isArray(productClassifications)) {
            return res.status(400).json({ error: "productClassifications must be an array of productClassifications objects" });
        }


        const productFromServer = await productService.createProductService(productData,  attributeValues, classificationGroups, productClassifications)
        return res.status(201).json({
            product : productFromServer
        })
    } catch (error: unknown) {
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


export default { 
    createProductHandler,
    findByIdHandler

};