import express from 'express'
import handler from './seller-handler'
const router = express.Router()

router
.post('/register', handler.registerOrUpgradeToSeller)
.post('/login', handler.login)
.get('/:sellerId', handler.getShopDetails) // Route xem chi tiết shop
.get('/:sellerId/products', handler.getProductsForShop); // Route hiển thị tất cả sản phẩm của shop

export default router;
