import React from "react";
import {
  Container, Title, Text, Table, Button, Divider, Group, Image, Grid, Badge, LoadingOverlay
} from "@mantine/core";
import { IconCash } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { formatDate } from "../../../Utils/formatDate";
import { formatPrice } from "../../../Utils/formatPrice";

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

const OrderDetail: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  if (loading) return <LoadingOverlay visible={true} />;
  if (!order) return <Text>Không tìm thấy đơn hàng</Text>;

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
    <Container className="py-6 px-6 bg-white shadow-md rounded-lg">
      <Text className="text-xl font-bold mb-6">Chi tiết đơn hàng</Text>

      <div className="bg-gray-100 p-4 flex justify-between">
        <Text className="text-center text-gray-900">
          Mã đơn hàng: &nbsp;
          <Text span className="font-semibold">
            #{order.id}
          </Text>
        </Text>

        <Text className="text-center text-gray-900">
          Ngày tạo: &nbsp;
          <Text span className="font-semibold">
            {formatDate(order.orderDate)}
          </Text>
        </Text>
        <div>
          <Badge color="blue" className="mr-4">
            {getStatusText(order.status)}
          </Badge>
        </div>
      </div>

      <Divider className="mb-4" />

      <Grid>
        <Grid.Col span={4}>
          <div className="bg-gray-100 p-4 rounded-lg h-full">
            <Text className="font-semibold">Thông tin người nhận:</Text>
            <Text>{order.user.fullName}</Text>
            <Text>
            {`${order.shippingAddress.addressDetail}, ${order.shippingAddress.user.addresses[0].ward.Name}, ${order.shippingAddress.user.addresses[0].district.Name}, ${order.shippingAddress.user.addresses[0].province.Name}`}
            </Text>
          </div>
        </Grid.Col>
        <Grid.Col span={4}>
          <div className="bg-gray-100 p-4 rounded-lg h-full flex flex-col">
            <Text className="font-semibold">Hình thức giao hàng:</Text>
            <Image
              src="https://static.topcv.vn/company_logos/OGqLJHnpFxl6XGEbcr1lyLsCl3qgNwV9_1718254913____8873f135791ad4e4672224e260b114ff.png"
              className="size-2/3 -mt-4"
            />
          </div>
        </Grid.Col>
        <Grid.Col span={4}>
          <div className="bg-gray-100 p-4 rounded-lg h-full flex flex-col">
            <Text className="font-semibold">Hình thức thanh toán</Text>
            <div className="flex items-center">
              <IconCash className="ml-2 mr-2" size={20} />
              <Text>Tiền mặt</Text>
            </div>
          </div>
        </Grid.Col>
      </Grid>

      <Table striped highlightOnHover stickyHeader stickyHeaderOffset={60} horizontalSpacing="xl" withTableBorder mt='md' >
        <Table.Thead>
          <Table.Tr>
            <Table.Th className="text-left">Mặt hàng</Table.Th>
            <Table.Th className="text-right">Đơn giá</Table.Th>
            <Table.Th className="text-right">Số lượng</Table.Th>
            <Table.Th className="text-right">Thành tiền</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <tbody>
          {order.items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <Group>
                  <div>
                    <Text>{item.product.name}</Text>
                    {item.classification.option1 && (
                      <Text size="sm" color="dimmed">
                        Màu sắc: {item.classification.option1.name}
                      </Text>
                    )}
                    {item.classification.option2 && (
                      <Text size="sm" color="dimmed">
                        Kích cỡ: {item.classification.option2.name}
                      </Text>
                    )}
                  </div>
                </Group>
              </Table.Td>
              <Table.Td className="text-right">{formatPrice(item.price)}</Table.Td>
              <Table.Td className="text-right">{item.quantity}</Table.Td>
              <Table.Td className="text-right">{formatPrice(Number(item.price) * item.quantity)}</Table.Td>
            </Table.Tr>
          ))}
        </tbody>
      </Table>

      <Divider className="mb-4" />

      <div className="flex-row w-64 ml-auto mr-0">
        <div className="flex justify-between">
          <Text span className="text-xl font-semibold leading-9">
            Tổng tiền:
          </Text>
          <Text span className="text-lg font-bold leading-9 text-blue-600">
            {formatPrice(order.totalAmount)}
          </Text>
        </div>
      </div>

      {order.status === 'PENDING' && (
        <Button variant="outline" color="red" className="mt-2 w-full">
          Hủy đơn hàng
        </Button>
      )}
    </Container>
  );
};

export default OrderDetail;