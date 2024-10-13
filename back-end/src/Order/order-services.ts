// order service
import { Order, ProductClassification, Product } from '@prisma/client';
import * as OrderQueries from './order-queries';
import { CreateOrderDTO, OrderItemDTO } from './order-models';

export async function createOrder(orderData: CreateOrderDTO): Promise<Order> {
    const { userId, items } = orderData;
    let totalAmount = 0;
    const processedItems: OrderItemDTO[] = [];

    for (const item of items) {
        const product = await OrderQueries.getProductWithClassifications(item.productId);
        if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
        }

        let price: number;
        if (product.hasClassification && item.classificationId) {
            const classification = product.classifications.find(
                (c: ProductClassification) => c.id === item.classificationId
            );
            if (!classification) {
                throw new Error(`Classification with id ${item.classificationId} not found for product ${item.productId}`);
            }
            price = Number(classification.price);
        } else if (!product.hasClassification) {
            // Kiểm tra xem product có trường price không
            if ('price' in product && typeof product.price === 'number') {
                price = product.price;
            } else {
                throw new Error(`Price not found for product ${item.productId}`);
            }
        } else {
            throw new Error(`Classification id is required for product ${item.productId}`);
        }

        totalAmount += price * item.quantity;
        processedItems.push({
            ...item,
            price, // Bây giờ chúng ta có thể thêm price vào processedItems
        });
    }

    return OrderQueries.createOrderWithItems(userId, totalAmount, processedItems);
}

export async function getOrderById(orderId: number): Promise<Order | null> {
    return OrderQueries.getOrderById(orderId);
}

export async function updateOrderStatus(orderId: number, status: string): Promise<Order> {
    return OrderQueries.updateOrderStatus(orderId, status);
}

export async function cancelOrder(orderId: number, reason: string): Promise<Order> {
    return OrderQueries.cancelOrder(orderId, reason);
}