import { Table, Image, Button, ActionIcon, Group, Paper, Select, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { IconEye, IconFilter } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface ProductImage {
  path: string;
}

interface Product {
  name: string;
  images: ProductImage[];
}

interface Classification {
  price: string;
  product: Product;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  classification: Classification;
}

interface Ward {
  Name: string;
}

interface District {
  Name: string;
}

interface Province {
  Name: string;
}

interface ShippingAddress {
  addressDetail: string;
  ward: Ward;
  district: District;
  province: Province;
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: string;
  status: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

function SellerOrderManage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>('all');
  const navigate = useNavigate();
  const orderStatuses = [
    { value: 'all', label: 'Tất cả đơn hàng' },
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'SELLER_CONFIRMED', label: 'Đã xác nhận' },
    { value: 'SELLER_REJECTED', label: 'Đã từ chối' },
    { value: 'SHIPPING', label: 'Đang giao hàng' },
    { value: 'DELIVERED', label: 'Đã giao hàng' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
  ];
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/v1/orders/seller/1');
        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);
  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);
  const handleViewOrder = (orderId: number) => {
    navigate(`/seller/order/detail/${orderId}`);
  };
  const formatOrderStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'SELLER_CONFIRMED':
        return 'Đã xác nhận';
      case 'SELLER_REJECTED':
        return 'Đã từ chối';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'COMPLETED':
        return 'Hoàn thành';
      default:
        return status;
    }
  };
  const rows = filteredOrders.map((order) => (
    <Table.Tr key={order.id}>
      <Table.Td>{order.id}</Table.Td>
      <Table.Td>
        {order.items.map((item) => (
          <div key={item.id} className='flex gap-2'>
          <Image key={item.id} h={70} radius='md' fit='contain' src={item.classification.product.images[0].path} alt={item.classification.product.name} width={50} height={50} />

          </div>
        ))}     
      </Table.Td>
      <Table.Td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</Table.Td>
      <Table.Td>
        {
            order.items.map((item) => (
                <div key={item.id}>
                    {item.classification.product.name} x {item.quantity}
                </div>
            ))
        }
      </Table.Td>
      <Table.Td>
        {
            `
                ${order.shippingAddress.addressDetail}, 
                ${order.shippingAddress.ward.Name}, 
                ${order.shippingAddress.district.Name}, 
                ${order.shippingAddress.province.Name}
            `
        }
      </Table.Td>
      <Table.Td>{Number(order.totalAmount).toLocaleString('vi-VN')} đ</Table.Td>
      <Table.Td>{formatOrderStatus(order.status)}</Table.Td>
      <Table.Td>
        <ActionIcon variant='outline' color='green' onClick={() => handleViewOrder(order.id)}>
          <IconEye />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Paper shadow="xs" p="md" mb="md">
        <Group>
          <Group>
            <IconFilter size={20} />
            <Select
              placeholder="Lọc theo trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
              data={orderStatuses}
              clearable
              style={{ width: 200 }}
            />
          </Group>
          <Group>
            <Text size="sm">
              Hiển thị {filteredOrders.length} đơn hàng
            </Text>
          </Group>
        </Group>
      </Paper>
    <Table striped stickyHeader stickyHeaderOffset={60} horizontalSpacing="xl" withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Mã đơn hàng</Table.Th>
          <Table.Th>Hình ảnh</Table.Th>  
          <Table.Th>Ngày đặt hàng</Table.Th>
          <Table.Th>Sản phẩm</Table.Th>
          <Table.Th>Địa chỉ giao hàng</Table.Th>
          <Table.Th>Tổng tiền</Table.Th>
          <Table.Th>Trạng thái</Table.Th>
          <Table.Th>Thao tác</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
    </>
  );
}

export default SellerOrderManage;