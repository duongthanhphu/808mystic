import { Request, Response } from 'express';
import prismaService from '../prisma.service';
import { OrderStatus } from '@prisma/client';
import GHNService, { GHNOrderInfo } from '../Shipment/ghn-service';
const ghnService = new GHNService({
        token: 'a98258af-8cc0-11ef-9b94-5ef2ee6a743d',
        environment: 'prod',
        shopId: 5396542
    });

export const createOrder = async (req: Request, res: Response) => {
    const { userId, items } = req.body;
    

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

        const productMap = new Map(products.map(p => [p.id, p]));

        processedItems = processedItems.map((item: OrderItem) => ({
            ...item,
            product: productMap.get(item.productId)
        }));
        const order = await prismaService.order.create({
            data: {
                userId: userIdNumber,
                sellerId: processedItems[0].product.sellerId, 
                status: OrderStatus.PENDING,
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
            data: { status: OrderStatus.PENDING },
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

export const sellerConfirmOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    try {
        const orderIdNumber = Number(orderId);
        if (isNaN(orderIdNumber)) {
            return res.status(400).json({ error: 'OrderId không hợp lệ' });
        }   
        const order = await prismaService.order.findUnique({
            where: { id: orderIdNumber },
            include: { seller: true }
        });

        const updatedOrder = await prismaService.order.update({
            where: { id: orderIdNumber },
            data: {
                status: OrderStatus.SELLER_CONFIRMED,
                confirmedAt: new Date(),
                statusHistory: {
                    create: {
                        status: OrderStatus.SELLER_CONFIRMED,
                        createdBy: order?.sellerId || 0,
                        note: 'Đơn hàng đã được xác nhận bởi người bán'
                    }
                }
            },
            include: {
                items: true,
                user: true,
                seller: true,
                statusHistory: true
            }
        });
        return res.json(updatedOrder)
    } catch (error) {
        console.error('Lỗi khi xác nhận đơn hàng:', error);
        res.status(500).json({ error: 'Không thể xác nhận đơn hàng' });
    }
}

// create shipping order ( Vận đơn )
export const createShippingOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { addressData } = req.body;
    console.log(orderId);
    try {
        const order = await prismaService.order.findUnique({
            where: { id: Number(orderId) },
            include: { 
                items: { include: { product: true } },
                user: {
                    include: {
                        addresses: true
                    }
                },
                seller: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
        }

        let shippingAddress;
        if (addressData) {
            // Sử dụng địa chỉ mới nếu được cung cấp
            shippingAddress = addressData;
        } else if (order.user.addresses.length > 0) {
            // Sử dụng địa chỉ đầu tiên của người dùng nếu có
            shippingAddress = order.user.addresses[0];
        } else if (order.user.provinceCode && order.user.districtCode && order.user.wardCode) {
            // Sử dụng thông tin địa chỉ từ user nếu có
            shippingAddress = {
                provinceCode: order.user.provinceCode,
                districtCode: order.user.districtCode,
                wardCode: order.user.wardCode,
                address: order.user.address || ''
            };
        } else {
            return res.status(400).json({ error: 'Không có thông tin địa chỉ giao hàng' });
        }

        // Lấy thông tin chi tiết từ GHN API
        // const wardInfo = await ghnService.getWardInfo(shippingAddress.wardCode);
        // const districtInfo = await ghnService.getDistrictInfo(shippingAddress.districtCode);
        const randomAddress = await ghnService.getRandomAddress();
        console.log(`
            ${randomAddress.ward.WardName}, 
            ${randomAddress.district.DistrictName}, 
            ${randomAddress.province.ProvinceName}`);

        const ghnOrderInfo: GHNOrderInfo = {
            to_name: order.user.fullName || order.user.username,
            to_phone: order.user.phone || '',
            to_address: `${randomAddress.ward.WardName}, ${randomAddress.district.DistrictName}, ${randomAddress.province.ProvinceName}`,
            to_ward_name: randomAddress.ward.WardName,
            to_district_name: randomAddress.district.DistrictName,
            to_ward_code: randomAddress.wardCode,
            weight: order.items.reduce((total, item) => total + item.product.weight * item.quantity, 0),
            length: Math.max(...order.items.map(item => item.product.length)),
            width: Math.max(...order.items.map(item => item.product.width)),
            height: Math.max(...order.items.map(item => item.product.height)),
            service_type_id: 2, // Giả sử sử dụng dịch vụ chuẩn
            payment_type_id: 2, // Giả sử thanh toán khi nhận hàng
            required_note: 'KHONGCHOXEMHANG',
            items: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price.toNumber()
            }))
        };

        const shippingOrder = await ghnService.createOrder(ghnOrderInfo);

        // Cập nhật đơn hàng với mã vận đơn
        const updatedOrder = await prismaService.order.update({
            where: { id: Number(orderId) },
            data: {
                status: OrderStatus.SHIPPING,
                shippingCode: shippingOrder.order_code,
                statusHistory: {
                    create: {
                        status: OrderStatus.SHIPPING,
                        createdBy: order.sellerId,
                        note: `Đơn hàng đã được gửi đi vận chuyển. Mã vận đơn: ${shippingOrder.order_code}`
                    }
                }
            }
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Lỗi khi tạo đơn vận chuyển:', error);
        res.status(500).json({ error: 'Không thể tạo đơn vận chuyển' });
    }
};
// Xem chi tiết đơn hàng
export const trackOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;

    try {
        const order = await prismaService.order.findUnique({
            where: { id: Number(orderId) },
            include: { statusHistory: true }
        });

        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
        }

        if (order.shippingCode) {
            const shippingStatus = await ghnService.getOrderDetail(order.shippingCode);
            // Xử lý và kết hợp thông tin từ GHN với thông tin đơn hàng
            // ...
        }

        res.json(order);
    } catch (error) {
        console.error('Lỗi khi theo dõi đơn hàng:', error);
        res.status(500).json({ error: 'Không thể theo dõi đơn hàng' });
    }
}

export const getOrderHistory = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const orders = await prismaService.order.findMany({
            where: { userId: Number(userId) },
            include: {
                statusHistory: true,
                items: { include: { product: true } }
            },
            orderBy: { orderDate: 'desc' }
        });

        const formattedOrders = orders.map(order => ({
            ...order,
            statusText: getStatusText(order.status),
            items: order.items.map(item => ({
                ...item,
                productName: item.product.name
            }))
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
        res.status(500).json({ error: 'Không thể lấy lịch sử đơn hàng' });
    }
}

function getStatusText(status: OrderStatus): string {
    switch (status) {
        case OrderStatus.PENDING: return 'Chờ thanh toán';
        case OrderStatus.SHIPPING: return 'Đang vận chuyển';
        case OrderStatus.DELIVERED: return 'Chờ giao hàng';
        case OrderStatus.COMPLETED: return 'Hoàn thành';
        case OrderStatus.CANCELLED: return 'Đã hủy';
        default: return 'Không xác định';
    }
}