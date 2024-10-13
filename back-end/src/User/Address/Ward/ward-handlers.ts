import { Request, Response } from 'express';
import prismaService from '../../../prisma.service';


const findAllWardHandler = async (req: Request, res: Response) => {
    try {
        const wartFromServer = await prismaService.ward.findMany({
            orderBy: {
                id: 'asc'
            }
        })

        return res.json(wartFromServer)
    }catch (error){
        res.status(500).json({ error: 'Error fetching wards' });
    }
}

const findWardByDistrictIdHandler = async (req: Request, res: Response) => {
    const { districtCode } = req.params
    if (!districtCode) {
        return res.status(400).json({ error: 'District code is required' });
    }
    try {
        const wartFromServer = await prismaService.ward.findMany({
            where: {
                DistrictCode : districtCode
            },
            orderBy: {
                id: 'asc'
            }
        })

        return wartFromServer.length === 0
        ? res.status(404).json({ message: 'No wards found for the given district code' })
        : res.json(wartFromServer);
    }catch (error){
        res.status(500).json({ error: 'Error fetching ward' });
    }   
}
export default {
    findAllWardHandler,
    findWardByDistrictIdHandler

}