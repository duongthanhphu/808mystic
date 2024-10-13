import { Request, Response } from 'express';
import prismaService from '../../../prisma.service';


const findAllProvinceHandler = async (req: Request, res: Response) => {
    try {
        const provinceFromServer = await prismaService.province.findMany({
            orderBy: {
                id: 'asc'
            }
        })

        return res.json(provinceFromServer)
    }catch (error){
        res.status(500).json({ error: 'Error fetching provinces' });
    }
}

const findProvinceByIdHandler = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const provinceFromServer = await prismaService.province.findFirst({
            where: {
                id : Number(id)
            },
            orderBy: {
                id: 'asc'
            }
        })

        return res.json(provinceFromServer)
    }catch (error){
        res.status(500).json({ error: 'Error fetching province' });
    }   
}
export default {
    findAllProvinceHandler,
    findProvinceByIdHandler

}