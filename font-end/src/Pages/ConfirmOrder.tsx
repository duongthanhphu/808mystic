import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Title, Text, List, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ClientHeader from '../Components/ClientHeader/ClientHeader';
import ClientFooter from '../Components/ClientFooter/ClientFooter';
import { getUserId } from '../Utils/authentication';

export default function OrderConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userAddress, setUserAddress] = useState(null);

    useEffect(() => {
        const currentUserId = getUserId();
        setUserId(currentUserId);
        const fetchOrderDetails = async () => {
            const orderId = location.state?.orderId;
            if (orderId && currentUserId) {
                try {
                    const response = await axios.get(`http://localhost:4000/api/v1/orders/${orderId}`, {
                        headers: {
                            'Authorization': `Bearer ${currentUserId}`
                        }
                    });
                    setOrder(response.data.order);
                } catch (error) {
                    console.error('Error fetching order details:', error);
                    notifications.show({
                        title: 'Lỗi',
                        message: 'Không thể tải thông tin đơn hàng',
                        color: 'red'
                    });
                }
            }
        };

        fetchOrderDetails();
    }, [location.state]);

    const handleConfirmOrder = async () => {
        if (!order) return;

        setIsConfirming(true);
        try {
            const response = await axios.put(`http://localhost:4000/api/v1/orders/${order.id}/confirm`);
            setOrder(response.data.order);
            notifications.show({
                title: 'Thành công',
                message: 'Đơn hàng đã được xác nhận',
                color: 'green'
            });
        } catch (error) {
            console.error('Error confirming order:', error);
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xác nhận đơn hàng',
                color: 'red'
            });
        } finally {
            setIsConfirming(false);
        }
    };

    if (!order) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <ClientHeader />
            <Container>
                <Paper shadow="xs">
                    <Title order={2}>Xác nhận đơn hàng</Title>
                    <Text>Mã đơn hàng: {order.id}</Text>
                    <Text>Trạng thái: {order.status}</Text>
                    <Text>Địa chỉ giao hàng: 
                        {userAddress ? 
                            `${userAddress.address}, ${userAddress.wardName}, ${userAddress.districtName}, ${userAddress.provinceName}` 
                            : 'Không có thông tin địa chỉ giao hàng'}
                    </Text>
                    <Title order={3}>Sản phẩm:</Title>
                    <List>
                        {order.items.map((item) => (
                            <List.Item key={item.id}>
                                {item.product.name} - Số lượng: {item.quantity} - Giá: {item.price.toLocaleString('vi-VN')} VNĐ
                            </List.Item>
                        ))}
                    </List>
                    <Text fw={700} mt="md">Tổng giá trị đơn hàng: {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 0} VNĐ</Text>
                    {order.status === 'PENDING' && (
                        <Button 
                            onClick={handleConfirmOrder} 
                            loading={isConfirming}
                            disabled={isConfirming}
                            mt="md"
                        >
                            Xác nhận đơn hàng
                        </Button>
                    )}
                </Paper>
            </Container>
            <ClientFooter />
        </>
    );
}
