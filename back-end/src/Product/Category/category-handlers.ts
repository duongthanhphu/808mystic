import { Request, Response } from 'express';
import query from './category-queries';
import productQuery from "../product-queries";
const findAllCategoryHandler = async (req: Request, res: Response) => {
    const { page = 1, pageSize = 10 } = req.query;
    try {
        const result = await query.findAll(Number(page), Number(pageSize));
        res.json({
            message: 'success',
            categories: result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching categories'
        });
    }
};

const findByIdCategoryHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const categoryFromServer = await query.findByid(id);
        res.json({
            message: 'success',
            categories: categoryFromServer
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching category'
        });
    }
};

const findByLevelCategoryHandler = async (req: Request, res: Response) => {
    const { level } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    try {
        const result = await query.findByLevel(level, Number(page), Number(pageSize));
        res.json({
            message: 'success',
            categories: result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching categories'
        });
    }
};

const deleteCategoryHandler = async (req: Request, res: Response) => {
    try {
        const result = await query.deleteAll();
        res.json({
            message: 'success',
            deletedCount: result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error deleting categories'
        });
    }
};

const findCategoryAttributesByIdHandler = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    try {
        const result = await query.findAttributesByCategoryId(categoryId, Number(page), Number(pageSize));
        res.json({
            message: 'success',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching category attributes'
        });
    }
};

const filterProductByCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.id  // lấy categoryId từ query params
  const filterAttributes = req.query; // lấy toàn bộ thuộc tính từ query params (color, size, v.v.)

  try {
    // 1. Lấy tất cả sản phẩm trong category
    const products = await productQuery.findProductsByCategory(categoryId);

    // 2. Lọc sản phẩm dựa trên attributes (ví dụ: color, size)
    let filteredProducts = products;

    // Duyệt qua tất cả các attribute trong query để filter
    for (const [key, value] of Object.entries(filterAttributes)) {
      if (key !== "categoryId") {
        filteredProducts = filteredProducts.filter((product) =>
          product.ProductAttributeValue.some((attrValue) => {
            // Kiểm tra attributeValue.value không phải là null
            if (attrValue.attributeValue && attrValue.attributeValue.value) {
              const attributeValue = attrValue.attributeValue.value;

              // Kiểm tra xem attributeValue có phải là một object (JsonObject)
              if (
                typeof attributeValue === "object" &&
                !Array.isArray(attributeValue)
              ) {
                // Kiểm tra giá trị tương ứng với key
                return attributeValue[key] === value;
              }
            }
            return false;
          })
        );
      }
    }

    // 3. Trả về kết quả lọc
    res.json({
      message: "success",
      filteredProducts,
    });
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(500).json({
      error: "Error filtering products",
    });
  }
};


export default {
  findAllCategoryHandler,
  findByIdCategoryHandler,
  findByLevelCategoryHandler,
  deleteCategoryHandler,
  findCategoryAttributesByIdHandler,
  filterProductByCategory,
};