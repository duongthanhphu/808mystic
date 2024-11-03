import { Request, Response } from 'express';
import prismaService from '../prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';
import GHNService, { GHNOrderInfo } from '../Shipment/ghn-service';
const ghnService = new GHNService({
        token: 'a98258af-8cc0-11ef-9b94-5ef2ee6a743d',
        environment: 'prod',
        shopId: 5396542
    });

const createOrder = async (req: Request, res: Response) => {
    const { userId, items } = req.body;
    
    try {
        const userIdNumber = Number(userId);
        if (isNaN(userIdNumber)) {
            return res.status(400).json({ error: 'UserId không hợp lệ' });
        }

        // Kiểm tra user có tồn tại không
        const user = await prismaService.user.findUnique({
            where: { id: userIdNumber },
            include: { addresses: true }
        });

        if (!user) {
            return res.status(400).json({ error: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra địa chỉ giao hàng
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

        // Tính toán tổng tiền và xử lý items
        let totalAmount = 0;
        interface OrderItem {
            productId: number;
            classificationId?: number;
            quantity: number;
            price: number;
        }

        let processedItems = items.map((item: OrderItem) => {
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

        // Lấy thông tin sản phẩm và người bán
        const productIds = processedItems.map((item: OrderItem) => item.productId);
        const products = await prismaService.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            select: {
                id: true,
                sellerId: true
            }
        });

        if (products.length === 0) {
            return res.status(400).json({ error: 'Không tìm thấy sản phẩm' });
        }

        const productMap = new Map(products.map(p => [p.id, p]));
        processedItems = processedItems.map((item: OrderItem) => ({
            ...item,
            product: productMap.get(item.productId)
        }));

        // Tạo đơn hàng với trạng thái PENDING
        const order = await prismaService.order.create({
            data: {
                userId: userIdNumber,
                sellerId: processedItems[0].product.sellerId,
                status: OrderStatus.PENDING, // Trạng thái ban đầu là PENDING
                totalAmount,
                shippingAddressId: user.addresses[0]?.id,
                items: {
                    create: processedItems.map((item: OrderItem) => ({
                        productId: item.productId,
                        classificationId: item.classificationId || null,
                        quantity: item.quantity,
                        price: item.price,
                    }))
                },
                statusHistory: {
                    create: {
                        status: OrderStatus.PENDING,
                        createdBy: userIdNumber,
                        note: 'Đơn hàng mới được tạo'
                    }
                }
            },
            include: {
                items: true,
                statusHistory: true
            }
        });

        res.status(201).json({ 
            success: true,
            message: 'Đơn hàng đã được tạo và đang chờ người bán xác nhận',
            order 
        });

    } catch (error: unknown) {
        console.error('Lỗi chi tiết khi tạo đơn hàng:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: 'Lỗi khi tạo đơn hàng', details: error.message });
        } else {
            res.status(500).json({ error: 'Lỗi không xác định khi tạo đơn hàng' });
        }
    }
};

const confirmOrderBySeller = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { sellerId, action, note } = req.body; 
    console.log(orderId)
    console.log(sellerId, action, note)
    try {
        // Kiểm tra đơn hàng tồn tại
        const order = await prismaService.order.findUnique({
            where: { id: Number(orderId) },
            include: { 
                items: true,
                statusHistory: true
            }
        });
        console.log(order)
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
        }

        // Kiểm tra quyền của người bán
        if (order.sellerId !== Number(sellerId)) {
            return res.status(403).json({ error: 'Bạn không có quyền xác nhận đơn hàng này' });
        }

        // Kiểm tra trạng thái hiện tại của đơn hàng
        if (order.status !== OrderStatus.PENDING) {
            return res.status(400).json({ 
                error: 'Không thể xác nhận đơn hàng này',
                message: 'Đơn hàng không ở trạng thái chờ xác nhận'
            });
        }

        let newStatus;
        let statusNote;

        if (action === 'confirm') {
            newStatus = OrderStatus.SELLER_CONFIRMED;
            statusNote = note || 'Đơn hàng đã được người bán xác nhận';

            // Cập nhật số lượng trong kho
            for (const item of order.items) {
                await prismaService.inventory.update({
                    where: {
                        warehouseId_productId_classificationId: {
                            warehouseId: 8, // Lấy từ config hoặc request
                            productId: item.productId,
                            classificationId: item.classificationId as number
                        }
                    },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }
        } else if (action === 'reject') {
            newStatus = OrderStatus.SELLER_REJECTED;
            statusNote = note || 'Đơn hàng đã bị từ chối bởi người bán';
        } else {
            return res.status(400).json({ error: 'Hành động không hợp lệ' });
        }

        // Cập nhật trạng thái đơn hàng
        const updatedOrder = await prismaService.order.update({
            where: { id: Number(orderId) },
            data: {
                status: newStatus,
                confirmedAt: action === 'confirm' ? new Date() : null,
                statusHistory: {
                    create: {
                        status: newStatus,
                        createdBy: Number(sellerId),
                        note: statusNote
                    }
                }
            },
            include: {
                items: true,
                statusHistory: true
            }
        });

        res.json({
            success: true,
            message: `Đơn hàng đã được ${action === 'confirm' ? 'xác nhận' : 'từ chối'}`,
            order: updatedOrder
        });

    } catch (error) {
        console.error('Lỗi khi xác nhận đơn hàng:', error);
        res.status(500).json({ error: 'Không thể xác nhận đơn hàng' });
    }
};

const printOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    try {
        const orderIdNumber = Number(orderId);
        if (isNaN(orderIdNumber)) {
            return res.status(400).json({ error: 'OrderId không hợp lệ' });
        }
        const orderFromServer = await prismaService.order.findUnique({    
            where: { id: orderIdNumber },
        });
        if (!orderFromServer) {
            return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
        }
        if (!orderFromServer.shippingCode) {
            return res.status(400).json({ error: 'Đơn hàng chưa có mã vận đơn' });
        }
        
        const printData = await ghnService.printOrder(orderFromServer.shippingCode);
        res.json({
            success: true,
            message: 'Lấy link in đơn hàng thành công',
            data: printData
        });
    } catch (error) {
        console.error('Lỗi khi in đơn hàng:', error);
        res.status(500).json({ error: 'Không thể in đơn hàng' });
    }
}

const orderDetail = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    try {
        const order = await prismaService.order.findUnique({
        where: {
            id: Number(orderId),
        },
        include: {
            items: {
            include: {
                product: {
                include: {
                    images: {
                    where: {
                        isThumbnail: true
                    },
                    take: 1
                    }
                }
                },
                classification: {
                    include: {
                        option1: true,
                        option2: true
                    }
                }
            }
            },
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    addresses: true
                }
            },
            seller: {
                select: {
                        id: true,
                            seller: {
                                select: {
                                    storeName: true,
                                    email: true,
                                    pickupAddress: true
                                }
                    }
                }
            },
            shippingAddress: {
                include: {
                    user: {
                        select: {
                            addresses: true
                        }
                    },
                    
                }
            },
            statusHistory: {
                include: {
                    user: {
                        select: {
                                id: true,
                                fullName: true
                            }
                        }
            },
                orderBy: {
                    createdAt: 'desc'
                }
            },
                cancellation: true
            }
        });
        res.json({
            success: true,
            message: 'Lấy chi tiết đơn hàng thành công',
            data: order
        });
    }catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        res.status(500).json({ error: 'Không thể lấy chi tiết đơn hàng' });
    }
}

export default {
    createOrder,
    confirmOrderBySeller,
    printOrder,
    orderDetail
}
