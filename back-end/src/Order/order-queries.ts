//order queries

import { PrismaClient, Order, Product, ProductClassification } from '@prisma/client';
const prisma = new PrismaClient();


export async function getProductWithClassifications(productId: number): Promise<Product & { classifications: ProductClassification[] } | null> {
    return prisma.product.findUnique({
        where: { id: productId },
        include: { classifications: true },
    });
}

export async function createOrderWithItems(userId: number, totalAmount: number, items: any[]): Promise<Order> {
    return prisma.$transaction(async (prisma) => {
        const newOrder = await prisma.order.create({
            data: {
                userId,
                totalAmount,
                status: 'Pending',
            },
        });

        const orderItems = items.map((item) => ({
            orderId: newOrder.id,
            productId: item.productId,
            classificationId: item.classificationId,
            quantity: item.quantity,
            price: item.price,
        }));

        await prisma.orderItem.createMany({
            data: orderItems,
        });

        return newOrder;
    });
}

export async function getOrderById(orderId: number): Promise<Order | null> {
    return prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });
}

export async function updateOrderStatus(orderId: number, status: string): Promise<Order> {
    return prisma.order.update({
        where: { id: orderId },
        data: { status },
    });
}

export async function cancelOrder(orderId: number, reason: string): Promise<Order> {
    return prisma.$transaction(async (prisma) => {
        const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'Cancelled' },
        });

        await prisma.orderCancellation.create({
        data: {
            orderId,
            reason,
        },
        });

        return order;
    });
}
