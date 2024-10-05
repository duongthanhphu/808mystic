import express from 'express'
import handler from './categoryAttribute-handlers'
const router = express.Router()

router
.get('/', handler.findAllCategoryAttribute)
.post('/', handler.createCategoryAttribute)


export default router;