import { PrismaClient, Prisma, InventoryStatus, MovementType, MovementStatus } from '@prisma/client';

const prisma = new PrismaClient();

const createInventoryForProduct = async (productId: number, warehouseId: number, createdBy: number) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                classifications: true 
            }
        });

        if (!product) throw new Error('Product not found');

        return await prisma.$transaction(async (tx) => {
            // Tạo inventory cho mỗi classification
            const inventories = await Promise.all(
                product.classifications.map(async (classification) => {
                    const inventory = await tx.inventory.create({
                        data: {
                            warehouseId,
                            productId,
                            classificationId: classification.id,
                            quantity: classification.stock, 
                            minQuantity: 1, 
                            maxQuantity: 1000,
                            status: InventoryStatus.ACTIVE
                        }
                    });
                    // Tạo phiếu nhập kho ban đầu
                    await tx.stockMovement.create({
                        data: {
                            warehouseId,
                            type: MovementType.IMPORT,
                            inventoryId: inventory.id,
                            createdBy,
                            note: 'Initial stock import',
                            items: {
                                create: {
                                    inventoryId: inventory.id,
                                    quantity: classification.stock
                                }
                            }
                        }
                    });

                    return inventory;
                })
            );

            return inventories;
        });
    } catch (error) {
        console.error('Error creating inventory:', error);
        throw error;
    }
};

// Xuất kho
const exportStock = async (
    inventoryId: number,
    quantity: number,
    createdBy: number,
    note?: string
) => {
    return await prisma.$transaction(async (tx) => {
        // Kiểm tra tồn kho
        const inventory = await tx.inventory.findUnique({
            where: { id: inventoryId }
        });

        if (!inventory) throw new Error('Inventory not found');
        if (inventory.quantity < quantity) throw new Error('Insufficient stock');

        // Tạo phiếu xuất kho
        const movement = await tx.stockMovement.create({
            data: {
                warehouseId: inventory.warehouseId,
                type: MovementType.EXPORT,
                status: MovementStatus.PENDING,
                inventoryId,
                createdBy,
                note,
                items: {
                    create: {
                        inventoryId,
                        quantity,
                        note
                    }
                }
            }
        });

        // Cập nhật số lượng tồn
        const updatedInventory = await tx.inventory.update({
            where: { id: inventoryId },
            data: {
                quantity: {
                    decrement: quantity
                },
                status: inventory.quantity - quantity <= 0 
                    ? InventoryStatus.OUT_OF_STOCK 
                    : InventoryStatus.ACTIVE
            }
        });

        // Tạo cảnh báo nếu tồn kho thấp
        if (updatedInventory.quantity <= inventory.minQuantity) {
            await tx.inventoryAlert.create({
                data: {
                    inventoryId,
                    type: 'LOW_STOCK',
                    message: `Số lượng tồn kho (${updatedInventory.quantity}) dưới ngưỡng tối thiểu (${inventory.minQuantity})`
                }
            });
        }

        return { inventory: updatedInventory, movement };
    });
};

// Nhập thêm hàng
const importStock = async (
    inventoryId: number,
    quantity: number,
    createdBy: number,
    note?: string
) => {
    return await prisma.$transaction(async (tx) => {
        const inventory = await tx.inventory.findUnique({
            where: { id: inventoryId }
        });

        if (!inventory) throw new Error('Inventory not found');

        // Tạo phiếu nhập kho
        const movement = await tx.stockMovement.create({
            data: {
                warehouseId: inventory.warehouseId,
                type: MovementType.IMPORT,
                status: MovementStatus.PENDING,
                inventoryId,
                createdBy,
                note,
                items: {
                    create: {
                        inventoryId,
                        quantity,
                        note
                    }
                }
            }
        });

        // Cập nhật số lượng tồn
        const updatedInventory = await tx.inventory.update({
            where: { id: inventoryId },
            data: {
                quantity: {
                    increment: quantity
                },
                status: InventoryStatus.ACTIVE
            }
        });

        // Kiểm tra tồn kho cao
        if (updatedInventory.quantity >= inventory.maxQuantity) {
            await tx.inventoryAlert.create({
                data: {
                    inventoryId,
                    type: 'OVERSTOCK',
                    message: `Số lượng tồn kho (${updatedInventory.quantity}) vượt ngưỡng tối đa (${inventory.maxQuantity})`
                }
            });
        }

        return { inventory: updatedInventory, movement };
    });
};

// Cập nhật thông tin tồn kho
const updateInventory = async (
    inventoryId: number,
    data: {
        quantity?: number;
        minQuantity?: number;
        maxQuantity?: number;
        status?: InventoryStatus;
    }
) => {
    const inventory = await prisma.inventory.update({
        where: { id: inventoryId },
        data: {
            ...data,
            updatedAt: new Date()
        },
        include: {
            product: true,
            classification: true
        }
    });

    // Tạo cảnh báo nếu tồn kho thấp/cao
    if (inventory.quantity <= inventory.minQuantity) {
        await prisma.inventoryAlert.create({
            data: {
                inventoryId,
                type: 'LOW_STOCK',
                message: `Sản phẩm ${inventory.product.name} sắp hết hàng`
            }
        });
    }

    return inventory;
};

// Duyệt phiếu xuất/nhập kho
const approveMovement = async (
    movementId: number,
    approvedBy: number
) => {
    return await prisma.stockMovement.update({
        where: { id: movementId },
        data: {
            status: MovementStatus.COMPLETED,
            approvedBy,
            completedAt: new Date()
        }
    });
};

const findInventoryByClassification = async (
    warehouseId: number,
    filters?: {
        productId?: number;
        classificationId?: number;
        status?: InventoryStatus;
        minQuantity?: number;
        maxQuantity?: number;
    }
) => {
    return await prisma.inventory.findMany({
        where: {
            warehouseId,
            productId: filters?.productId,
            classificationId: filters?.classificationId,
            status: filters?.status,
            quantity: {
                gte: filters?.minQuantity,
                lte: filters?.maxQuantity
            }
        },
        include: {
            product: true,
            classification: {
                include: {
                    option1: true,
                    option2: true
                }
            }
        }
    });
};

const getInventoryList = async (
    sellerId: number,
    params: {
        warehouseId?: number;
        search?: string;
        status?: InventoryStatus;
        page?: number;
        limit?: number;
    }
) => {
    const {
        warehouseId,
        search,
        status,
        page = 1,
        limit = 10
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {
        warehouse: {
            sellerId: sellerId
        },
        warehouseId: warehouseId,
        status: status,
        OR: search ? [
            { product: { name: { contains: search, mode: 'insensitive' } } },
            { classification: { 
                OR: [
                    { option1: { name: { contains: search, mode: 'insensitive' } } },
                    { option2: { name: { contains: search, mode: 'insensitive' } } }
                ]
            }}
        ] : undefined
    };

    const [total, inventories] = await prisma.$transaction([
        prisma.inventory.count({ where }),
        prisma.inventory.findMany({
            where,
            include: {
                product: {
                    select: {
                        name: true,
                        images: true,
                        
                    }
                },
                warehouse: {
                    select: {
                        name: true,
                        code: true
                    }
                },
                classification: {
                    include: {
                        option1: true,
                        option2: true,
                    }
                },
            },
            skip,
            take: limit,
            orderBy: { updatedAt: 'desc' }
        })
    ]);

    return {
        data: inventories,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export default {
    createInventoryForProduct,
    exportStock,
    importStock, 
    updateInventory,
    approveMovement,
    findInventoryByClassification,
    getInventoryList
};
