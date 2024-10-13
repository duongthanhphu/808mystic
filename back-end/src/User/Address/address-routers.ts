import express from 'express'
import provinceHandler from './Province/province-handlers'
import districtHandler from './District/district-handlers'
import wardHandler from './Ward/ward-handlers'
const router = express.Router()

router.get('/province', provinceHandler.findAllProvinceHandler)
router.get('/province/:id', provinceHandler.findProvinceByIdHandler)
router.get('/province/:provinceCode/district/', districtHandler.findDistrictByProvinceIdHandler)
router.get('/province/district/:districtCode/ward/', wardHandler.findWardByDistrictIdHandler)





export default router;