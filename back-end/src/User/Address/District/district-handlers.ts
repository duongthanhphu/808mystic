import { Request, Response } from 'express';
import prismaService from '../../../prisma.service';




const findDistrictByProvinceIdHandler = async (req: Request, res: Response) => {
    const { provinceCode } = req.params
    if (!provinceCode) {
        return res.status(400).json({ error: 'Province code is required' });
    }
    try {
        const districtsFromServer  = await prismaService.district.findMany({
            where: {
                ProvinceCode: provinceCode
            },
            include: {
                province: false
            },
            orderBy: {
                id: 'asc'
            },
            
        })

        return districtsFromServer.length === 0
        ? res.status(404).json({ message: 'No districts found for the given province code' })
        : res.json(districtsFromServer);

    }catch (error){
        res.status(500).json({ error: 'Error fetching district' });
    }   
}
export default {
    findDistrictByProvinceIdHandler

}