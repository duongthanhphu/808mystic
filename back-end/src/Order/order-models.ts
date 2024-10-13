import { PrismaClient, Prisma } from '@prisma/client'

export interface CreateOrderDTO {
    userId: number;
    items: OrderItemDTO[];
}

export interface OrderItemDTO {
    productId: number;
    classificationId?: number;
    quantity: number;
    price?: number;
}

export interface Order {
    id: number;
    userId: number;
    orderDate: Date;
    totalAmount: Prisma.Decimal;
    status: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    classificationId?: number;
    quantity: number;
    price: Prisma.Decimal;
}