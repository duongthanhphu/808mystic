import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import productService from './product-services';
import { Product } from './product-model'
import prismaService from '../prisma.service';
import inventoryService from './Inventory/inventory-services';

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
        
        console.log("createdProduct.sellerId", createdProduct.sellerId)
        const userFromServer = await prismaService.user.findUnique({ 
                where: { id: createdProduct.sellerId },
                include: {
                    seller: true
                }
            }); 
        const warehouseFromServer = await prismaService.warehouse.findFirst({ 
                where: { sellerId: userFromServer?.seller?.id },
            }); 
        // Tạo inventory sau khi tạo sản phẩm thành công
        try {
            const inventories = await inventoryService.createInventoryForProduct(
                createdProduct.id,
                warehouseFromServer?.id as number, 
                createdProduct.sellerId
            );

            if (files && files.length > 0) {
                try {
                    await productService.uploadProductImages(files, String(createdProduct.id));
                } catch (uploadError) {
                    console.error('Error uploading images:', uploadError);
                }
            }
            

            return res.status(201).json({
                message: "Product created successfully with inventory",
                product: createdProduct,
                inventories: inventories
            });

        } catch (inventoryError) {
            console.error("Error creating inventory:", inventoryError);
            return res.status(201).json({
                message: "Product created successfully but inventory creation failed",
                product: createdProduct,
                inventoryError: inventoryError
            });
        }
        
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

const searchProductsHandler = async (req: Request, res: Response) => {
  try {
    const {
      searchTerm,
      categoryId,
      minPrice,
      maxPrice,
      attributes,
      page = 1,
      limit = 10
    } = req.query;

    const result = await productService.searchProducts({
      searchTerm: searchTerm as string,
      categoryId: categoryId ? Number(categoryId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      attributes: attributes ? JSON.parse(attributes as string) : undefined,
      page: Number(page),
      limit: Number(limit)
    });

    return res.json(result);
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({ error: "An error occurred while searching products" });
  }
};

const filterByCategoryHandler = async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      minPrice,
      maxPrice,
      attributes,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    const result = await productService.filterByCategory({
      categoryId: Number(categoryId),
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      attributes: attributes ? JSON.parse(attributes as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: Number(page),
      limit: Number(limit)
    });

    return res.json(result);
  } catch (error) {
    console.error("Error filtering products:", error);
    return res.status(500).json({ error: "An error occurred while filtering products" });
  }
};

export default { 
    createProductHandler,
    findAllHandler,
    findByIdHandler,
    imageTester,
    searchProductsHandler,
    filterByCategoryHandler

};
