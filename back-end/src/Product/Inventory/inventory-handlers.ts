import { Request, Response } from 'express';
import inventoryService from './inventory-services';
import prismaService from '../../prisma.service';
import { InventoryStatus } from '@prisma/client';

const getInventoryList = async (req: Request, res: Response) => {
    try {
        const { sellerId } = req.params;
        const userFromServer = await prismaService.user.findUnique({
            where: { id: Number(sellerId) },
            include: {
                seller: true
            }
        })
        const { 
            warehouseId, 
            status,
            search,
            page = 1, 
            limit = 10 
        } = req.query;

        const result = await inventoryService.getInventoryList(
            userFromServer?.seller?.id as number,
            {
                warehouseId: warehouseId ? Number(warehouseId) : undefined,
                status: status as InventoryStatus,
                search: search as string,
                page: Number(page),
                limit: Number(limit)
            }
        );

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Không thể lấy danh sách tồn kho'
        });
    }
};

export default {
    getInventoryList
};

