import express from 'express';
import handler from './category-handlers';

const router = express.Router();

router
  .get("/level/:level", handler.findByLevelCategoryHandler)
  .get("/:categoryId/attributes", handler.findCategoryAttributesByIdHandler)
  .get("/:id", handler.findByIdCategoryHandler)
  .get("/", handler.findAllCategoryHandler)
  .delete("/", handler.deleteCategoryHandler)
  .get("/products/category/:id", handler.filterProductByCategory);
export default router;