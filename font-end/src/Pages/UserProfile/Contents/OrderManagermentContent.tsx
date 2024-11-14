import React, { useState, useEffect } from 'react';
import { Container, Tabs, Paper, Text, Badge, Group, Image, Stack, Button } from '@mantine/core';
import { getUserId, UserType } from '../../../Utils/authentication';
import axios from 'axios';
import ClientHeader from '../../../Components/ClientHeader/ClientHeader';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: number;
  product: {
    name: string;
    images: Array<{ path: string }>;
  };
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
  statusHistory: Array<{
    status: string;
    note: string;
    createdAt: string;
  }>;
}

const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchOrders(activeTab !== 'all' ? activeTab : undefined);
  }, [activeTab]);

  const fetchOrders = async (status?: string) => {
    try {
      const userId = getUserId(UserType.CUSTOMER);
      if (!userId) return;

      const response = await axios.get(
        `http://localhost:4000/api/v1/orders/user/${userId}${status ? `?status=${status}` : ''}`
      );
      
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'SELLER_CONFIRMED': return 'blue';
      case 'SHIPPING': return 'indigo';
      case 'DELIVERED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };
  const handleViewDetail = (orderId: number) => {
    navigate(`/user/orders/${orderId}`);
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'SELLER_CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPING': return 'Đang vận chuyển';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <>
      <ClientHeader />
      <Container size="lg" py="xl">
        <Text size="xl" fw={700} mb="md">Đơn mua của tôi</Text>
        
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all">Tất cả</Tabs.Tab>
            <Tabs.Tab value="PENDING">Chờ xác nhận</Tabs.Tab>
            <Tabs.Tab value="SELLER_CONFIRMED">Đã xác nhận</Tabs.Tab>
            <Tabs.Tab value="SHIPPING">Đang vận chuyển</Tabs.Tab>
            <Tabs.Tab value="DELIVERED">Đã giao hàng</Tabs.Tab>
            <Tabs.Tab value="CANCELLED">Đã hủy</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={activeTab || 'all'}>
            <Stack mt="md">
              {orders.map((order) => (
                <Paper key={order.id} shadow="xs" p="md" withBorder>
                  <Group mb="md" justify='space-between'>
                    <div className='flex items-center gap-4'>
                      <Text fw={500}>Đơn hàng #{order.id}</Text>
                      <Badge color={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <Button 
                      variant="light"
                      onClick={() => handleViewDetail(order.id)}
                    >
                      Xem chi tiết
                    </Button>
                  </Group>
                  
                  {order.items.map((item) => (
                    <Group key={item.id} my="sm">
                      <div className='flex items-center gap-4'>
                        <Image
                            src={item.product.images[0]?.path}
                            h={5}
                            fit="contain"
                          />
                        <div style={{ flex: 1 }}>
                          <Text lineClamp={2}>{item.product.name}</Text>
                          <Text size="sm" color="dimmed">
                            Số lượng: {item.quantity}
                          </Text>
                          <Text fw={500}>
                            {Number(item.price).toLocaleString('vi-VN')}đ
                          </Text>
                        </div>
                      </div>
                    </Group>
                  ))}

                  <Group mt="md">
                    <Text>Tổng tiền:</Text>
                    <Text fw={700} size="lg">
                      {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                    </Text>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
};

export default UserOrders;
