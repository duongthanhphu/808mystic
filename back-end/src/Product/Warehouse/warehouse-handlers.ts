import { Request, Response } from 'express';
import warehouseService from './warehouse-services';
import { WarehouseStatus } from '@prisma/client';
import prismaService from '../../prisma.service';

const getAllWarehouses = async (req: Request, res: Response) => {
    try {
        const { sellerId } = req.params; 
        
        const userFromServer = await prismaService.user.findUnique({
            where: { id: Number(sellerId) },
            include: {
                seller: true
            }
        })
        const {
            page,
            limit,
            search,
            status,
            provinceId,
            sortBy,
            sortOrder
        } = req.query;

        const result = await warehouseService.getAllWarehouses(userFromServer?.seller?.id as number, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search: search as string,
            status: status as WarehouseStatus,
            provinceId: provinceId ? Number(provinceId) : undefined,
            sortBy: sortBy as string,
            sortOrder: (sortOrder as 'asc' | 'desc')
        });

        res.status(200).json({
            success: true,
            ...result
        });

    } catch (error: any) {
        console.error('Error in getAllWarehouses:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách kho',
            error: error.message
        });
    }
};

export default {
    getAllWarehouses
};

