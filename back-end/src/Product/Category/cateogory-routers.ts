import express from 'express'
import handler from './category-handlers'
const router = express.Router()

router
.get('/init', )
.get('/', handler.findAllCategoryHandler)
.get('/:id', handler.findByIdCategoryHandler)
.get('/level/:level', handler.findByLevelCategoryHandler)
.get('/:categoryId/attributes', handler.findCategoryAttributesByIdHandler)
.delete('/', handler.deleteCategoryHandler)



export default router;