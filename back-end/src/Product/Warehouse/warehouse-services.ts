import prismaService from "../../prisma.service";
import { WarehouseStatus } from "@prisma/client";
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

const createDefaultWarehouse = async (
    sellerId: number, 
    pickUpAddress: string,
    provinceId: number,
    districtId: number,
    wardId: number
) => {
    try {
        // Tạo mã kho tự động
        const warehouseCode = `WH-${sellerId}-${Date.now()}`;
        
        return await prismaService.warehouse.create({
            data: {
                sellerId: sellerId, // Sử dụng sellerId trực tiếp
                name: "Kho mặc định",
                code: warehouseCode,
                address: pickUpAddress,
                provinceId,
                districtId,
                wardId,
                status: WarehouseStatus.ACTIVE,
                description: "Kho hàng mặc định được tạo tự động"
            }
        });
    } catch (error) {
        console.error('Error creating default warehouse:', error);
        throw error;
    }
};

interface GetWarehousesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: WarehouseStatus;
    provinceId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

const getAllWarehouses = async (
    sellerId: number,
    params: GetWarehousesParams
) => {
    const {
        page = 1,
        limit = 10,
        search,
        status,
        provinceId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.WarehouseWhereInput = {
        sellerId,
        status: status,
        provinceId: provinceId,
        OR: search ? [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } }
        ] : undefined
    };

    // Xây dựng orderBy
    const orderBy: Prisma.WarehouseOrderByWithRelationInput = {
        [sortBy]: sortOrder
    };

    try {
        const [total, warehouses] = await prismaService.$transaction([
            // Đếm tổng số warehouse
            prismaService.warehouse.count({ where }),
            
            // Query warehouses với phân trang
            prismaService.warehouse.findMany({
                where,
                include: {
                    province: {
                        select: {
                            Name: true,
                        }
                    },
                    district: {
                        select: {
                            Name: true,
                        }
                    },
                    ward: {
                        select: {
                            Name: true,
                        }
                    },
                    inventory: {
                        select: {
                            _count: true
                        }
                    },
                    seller: {
                        select: {
                            storeName: true
                        }
                    }
                },
                orderBy,
                skip,
                take: limit
            })
        ]);

        return {
            data: warehouses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Error getting warehouses:', error);
        throw error;
    }
};

export default {
    createDefaultWarehouse,
    getAllWarehouses
};
