import { useEffect, useState } from 'react';
import axios from 'axios';
import { useOutletContext, useParams } from 'react-router-dom';
import { Stack, Group, Title, ActionIcon, Table, Paper, Drawer, Text, Timeline, Button, TextInput } from '@mantine/core';
import { Modal, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconHash, IconUser, IconMail, IconPhone, IconMapPin  } from '@tabler/icons-react';
import DefaultPropertyPanel from '../../../Components/DefaultPropertyPanel/DefaultPropertyPanel';
import { formatPrice } from '../../../Utils/formatPrice';
import { formatDate } from '../../../Utils/formatDate';
interface OrderDetail {
  id: number;
  totalAmount: string;
  status: string;
  orderDate: string;
  items: Array<{
    id: number;
    quantity: number;
    price: string;
    product: {
      id: number;
      name: string;
      images: string[];
    };
    classification: {
      id: number;
      price: string;
      option1: {
        id: number;
        name: string;
      };
      option2: null | {
        id: number;
        name: string;
      };
    };
  }>;
  user: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
  };
  shippingAddress: {
    id: number;
    addressDetail: string;
    provinceId: number;
    districtId: number;
    wardId: number;
    user: {
      addresses: Array<{
        province: {
          Name: string;
        };
        district: {
          Name: string;
        };
        ward: {
          Name: string;
        };
      }>;
    };
  };
  statusHistory: Array<{
    id: number;
    status: string;
    note: string;
    createdAt: string;
    user: {
      id: number;
      fullName: string;
    };
  }>;
}

function SellerOrderDetail() {
  const { orderId } = useParams();
  const { userId } = useOutletContext<{ userId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [confirmNote, setConfirmNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/orders/${orderId}`);
        setOrder(response.data.data);
      } catch (err) {
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'CONFIRMED': return 'blue';
      case 'SHIPPING': return 'indigo';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
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
  const ORDER_TIMELINE = [
    { status: 'PENDING', label: 'Chờ xác nhận' },
    { status: 'SELLER_CONFIRMED', label: 'Đã xác nhận' },
    { status: 'SHIPPING', label: 'Đang giao hàng' },
    { status: 'DELIVERED', label: 'Đã giao hàng' },
    { status: 'COMPLETED', label: 'Hoàn thành' }
  ];
  const handleConfirmOrder = async () => {
    try {
      setConfirming(true);
      
      const response = await axios.post(
        `http://localhost:4000/api/v1/orders/${orderId}/confirm`,
        {
          sellerId: userId,
          action: 'confirm',
          note: confirmNote || 'Xác nhận đơn hàng'
        }
      );

      if (response.data.success) {
        notifications.show({
          title: 'Thành công',
          message: 'Đã xác nhận đơn hàng',
          color: 'green'
        });
        
        // Refresh order data
        const orderResponse = await axios.get(`http://localhost:4000/api/v1/orders/${orderId}`);
        setOrder(orderResponse.data.data);
      }

      setConfirmModalOpened(false);
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể xác nhận đơn hàng',
        color: 'red'
      });
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!order) return <div>Không tìm thấy đơn hàng</div>;

  return (
    <div>
      <Stack>
        <Group>
          <Title order={2}>
            <Group>
              <ActionIcon>
                <IconHash />
              </ActionIcon>
              Chi tiết đơn hàng #{order.id}
            </Group>

          </Title>
            
        </Group>

        <DefaultPropertyPanel 
          id={order.id} 
          createdAt={order.orderDate} 
          updatedAt={order.orderDate} 
          createdBy={order.user.fullName} 
          updatedBy={order.user.fullName} 
        />
        <Group grow preventGrowOverflow={false} wrap="nowrap" align="start"> 
          <Stack>
            <Paper shadow="xs" p="md" className=''>
              <Text fw={500} my='md'>Danh sách mặt hàng</Text>
              <TextInput
                placeholder="Tìm kiếm sản phẩm"
                my='md'
              />
              <Table striped stickyHeader stickyHeaderOffset={60} horizontalSpacing="xl" withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                      <Table.Th>STT</Table.Th>
                      <Table.Th>Mặt hàng</Table.Th>
                      <Table.Th>Số lượng</Table.Th>
                      <Table.Th>Đơn giá</Table.Th>
                      <Table.Th>Thành tiền</Table.Th>
                      {/* <Table.Th>Thao tác</Table.Th> */}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                {order.items.map((item, index) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{item.product.name}</Table.Td>
                    <Table.Td>{item.quantity}</Table.Td>
                    <Table.Td>{formatPrice(item.price)}</Table.Td>
                    <Table.Td>{formatPrice(Number(item.price) * item.quantity)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>  
              </Table>
            </Paper>
            <Timeline 
              active={ORDER_TIMELINE.findIndex(t => t.status === order.status)} 
              bulletSize={24}
            >
              {ORDER_TIMELINE.map((timeline, index) => {
                const historyItem = order.statusHistory.find(h => h.status === timeline.status);
                
                return (
                  <Timeline.Item
                    key={index}
                    title={timeline.label}
                    color={getStatusColor(timeline.status)}
                    __active={index === ORDER_TIMELINE.length - 1}
                  >
                    {historyItem ? (
                      <Group>
                        <Stack>
                          <Text size="sm">{historyItem.note}</Text>
                          <Group>
                            <Text size="xs" color="dimmed">
                              Bởi: {historyItem.user.fullName}
                            </Text>
                            <Text size="xs" >•</Text>
                            <Text size="xs" >
                              {formatDate(historyItem.createdAt)}
                            </Text>
                          </Group>
                        </Stack>
                      </Group>
                    ) : (
                      <Text size="sm" color="dimmed">
                        Đang cập nhập theo bước tiếp theo
                      </Text>
                    )}
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Stack>
          <Paper shadow="xs" p="md" className=''>
            <Title order={3}>Thông tin khách hàng</Title>
            <Stack >
            <Paper shadow="xs" p="md">
              <Stack >
                <Group>
                  <IconUser size={20} />
                  <Text>Thông tin cá nhân</Text>
                </Group>
                
                <Stack>
                  <Text size="sm">Họ tên: {order.user.fullName}</Text>
                  <Group>
                    <IconMail size={16} />
                    <Text size="sm">{order.user.email}</Text>
                  </Group>
                  <Group>
                    <IconPhone size={16} />
                    <Text size="sm">{order.user.phone || 'Chưa cung cấp'}</Text>
                  </Group>
                </Stack>
              </Stack>
            </Paper>

            <Paper shadow="xs" p="md">
              <Stack>
                <Group>
                  <IconMapPin size={20} />
                  <Text>Địa chỉ giao hàng</Text>
                </Group>
                
                <Text size="sm">
                  {`${order.shippingAddress.addressDetail}, ${order.shippingAddress.user.addresses[0].ward.Name}, ${order.shippingAddress.user.addresses[0].district.Name}, ${order.shippingAddress.user.addresses[0].province.Name}`}
                </Text>
              </Stack>
            </Paper>

            {/* <Paper shadow="xs" p="md">
              <Stack>
                <Text>Đơn hàng gần đây</Text>
                
                <Timeline active={order.statusHistory.length - 1} bulletSize={24}>
                  {order.statusHistory.map((history, index) => (
                    <Timeline.Item
                      key={index}
                      title={history.status}
                      color={getStatusColor(history.status)}
                    >
                      <Text size="sm">{history.note}</Text>
                      <Text size="xs" >
                        {formatDate(history.createdAt)}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Stack>
            </Paper> */}

            <Paper shadow="xs" p="md">
              <Stack>
                <Text>Thống kê đơn hàng</Text>
                <Group grow>
                  <Stack align="center">
                    <Text size="lg">{formatPrice(order.totalAmount)}</Text>
                    <Text size="xs" >Tổng giá trị</Text>
                  </Stack>
                  <Stack align="center">
                    <Text size="lg">{order.items.length}</Text>
                    <Text size="xs" >Số sản phẩm</Text>
                  </Stack>
                </Group>
                </Stack>
              </Paper>
            </Stack>
            <Button 
              my='xl' 
              fullWidth 
              variant='light'
              loading={confirming}
              disabled={order.status !== 'PENDING'}
              onClick={() => setConfirmModalOpened(true)}
            >
              Xác nhận đơn hàng 
            </Button>
          </Paper>
        </Group>          
        <Modal
        opened={confirmModalOpened}
        onClose={() => setConfirmModalOpened(false)}
        title="Xác nhận đơn hàng"
      >
        <Stack>
          <Text size="sm">
            Bạn có chắc chắn muốn xác nhận đơn hàng #{order.id}?
          </Text>
          
          <Textarea
            label="Ghi chú"
            placeholder="Nhập ghi chú cho đơn hàng"
            value={confirmNote}
            onChange={(e) => setConfirmNote(e.currentTarget.value)}
            minRows={3}
          />

          <Group grow mt="md">
            <Button 
              variant="default" 
              onClick={() => setConfirmModalOpened(false)}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmOrder}
              loading={confirming}
            >
              Xác nhận
            </Button>
          </Group>
          </Stack>
        </Modal>
        
      </Stack>
    </div>
  );
}

export default SellerOrderDetail;    