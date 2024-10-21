import { Request, Response } from 'express';
import prismaService from '../prisma.service';

export const createOrder = async (req: Request, res: Response) => {
    const { userId, items } = req.body;
    console.log('Received data:', { userId, items });

    try {
        const userIdNumber = Number(userId);
        if (isNaN(userIdNumber)) {
            return res.status(400).json({ error: 'UserId không hợp lệ' });
        }

        const user = await prismaService.user.findUnique({
            where: { id: userIdNumber },
            include: { addresses: true }
        });

        if (!user) {
            return res.status(400).json({ error: 'Không tìm thấy người dùng' });
        }

        let shippingAddress;
        if (user.addresses.length > 0) {
            shippingAddress = user.addresses[0];
        } else if (user.provinceCode && user.districtCode && user.wardCode) {
            shippingAddress = {
                provinceCode: user.provinceCode,
                districtCode: user.districtCode,
                wardCode: user.wardCode,
                address: user.address || ''
            };
        } else {
            return res.status(400).json({ error: 'Không tìm thấy địa chỉ giao hàng cho người dùng này' });
        }

        let totalAmount = 0;

        interface OrderItem {
            productId: number;
            classificationId?: number;
            quantity: number;
            price: number;
        }

        const processedItems = items.map((item: OrderItem) => {
            const price = Number(item.price);
            if (isNaN(price)) {
                throw new Error(`Giá không hợp lệ cho sản phẩm: ${item.productId}`);
            }
            totalAmount += price * item.quantity;
            return {
                ...item,
                price: price
            };
        });

        const order = await prismaService.order.create({
            data: {
                userId: userIdNumber,
                status: 'PENDING',
                totalAmount,
                items: {
                    create: processedItems.map((item: OrderItem) => ({
                        productId: item.productId,
                        classificationId: item.classificationId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                items: true
            }
        });

        res.status(201).json({ order });
    } catch (error: unknown) {
        console.error('Lỗi chi tiết khi tạo đơn hàng:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: 'Lỗi khi tạo đơn hàng', details: error.message });
        } else {
            res.status(500).json({ error: 'Lỗi không xác định khi tạo đơn hàng' });
        }
    }
};

export const confirmOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    
    try {
        const orderIdNumber = Number(orderId);
        if (isNaN(orderIdNumber)) {
            return res.status(400).json({ error: 'OrderId không hợp lệ' });
        }

        const order = await prismaService.order.findUnique({
            where: { id: orderIdNumber },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        const updatedOrder = await prismaService.order.update({
            where: { id: orderIdNumber },
            data: { status: 'CONFIRMED' },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: true
            }
        });

        res.status(200).json({ order: updatedOrder });
    } catch (error: unknown) {
        console.error('Lỗi chi tiết khi xác nhận đơn hàng:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: 'Lỗi khi xác nhận đơn hàng', details: error.message });
        } else {
            res.status(500).json({ error: 'Lỗi không xác định khi xác nhận đơn hàng' });
        }
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    const { orderId } = req.params;

    try {
        const orderIdNumber = Number(orderId);
        if (isNaN(orderIdNumber)) {
            return res.status(400).json({ error: 'OrderId không hợp lệ' });
        }

        const order = await prismaService.order.findUnique({
            where: { id: orderIdNumber },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    include: {
                        addresses: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        const userAddress = {
            provinceCode: order.user.provinceCode,
            districtCode: order.user.districtCode,
            wardCode: order.user.wardCode,
            address: order.user.address,
            addresses: order.user.addresses
        };

        res.status(200).json({ 
            order: {
                ...order,
                userAddress
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin đơn hàng:', error);
        res.status(500).json({ error: 'Không thể lấy thông tin đơn hàng' });
    }
};
