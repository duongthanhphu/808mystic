import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const createStockMovement = async (
    warehouseId: number,
    inventoryId: number,
    type: 'IMPORT' | 'EXPORT',
    quantity: number,
    createdBy: number,
    note?: string
) => {
    try {
        return await prisma.$transaction(async (prisma) => {
            // 1. Tạo phiếu nhập/xuất
            const movement = await prisma.stockMovement.create({
                data: {
                    warehouseId,
                    inventoryId,
                    type,
                    status: 'PENDING',
                    note,
                    createdBy,
                    items: {
                        create: {
                            inventoryId,
                            quantity,
                            note
                        }
                    }
                },
                include: {
                    items: true
                }
            });

            // 2. Cập nhật số lượng tồn kho khi phiếu được duyệt
            if (movement.status === 'APPROVED') {
                const inventory = await prisma.inventory.findUnique({
                    where: { id: inventoryId }
                });

                if (!inventory) throw new Error('Inventory not found');

                const newQuantity = type === 'IMPORT' 
                    ? inventory.quantity + quantity
                    : inventory.quantity - quantity;

                if (newQuantity < 0) throw new Error('Insufficient stock');

                await prisma.inventory.update({
                    where: { id: inventoryId },
                    data: { quantity: newQuantity }
                });

                // 3. Kiểm tra và tạo cảnh báo nếu cần
                if (newQuantity <= inventory.minQuantity) {
                    await prisma.inventoryAlert.create({
                        data: {
                            inventoryId,
                            type: 'LOW_STOCK',
                            message: `Tồn kho thấp: ${newQuantity} sản phẩm`
                        }
                    });
                }
            }

            return movement;
        });
    } catch (error) {
        console.error('Error creating stock movement:', error);
        throw error;
    }
};

export default createStockMovement;