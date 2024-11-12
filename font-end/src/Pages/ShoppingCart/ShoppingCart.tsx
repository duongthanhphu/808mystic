import React, { useState, useEffect } from "react";
import ClientHeader from "../../Components/ClientHeader/ClientHeader";
import {
  Paper,
  Text,
  Group,
  Table,
  ActionIcon,
  Container,
  Grid,
  Stack,
  Checkbox,
  Button,
  Alert,
  Radio,
  Divider,
  Image,
} from "@mantine/core";
import {
  IconTrash,
  IconPlus,
  IconMinus,
  IconShoppingCart,
  IconAlertCircle,
  IconCash,
  IconBrandPaypal,
  IconCheck
} from "@tabler/icons-react";
import { getUserId, UserType } from "../../Utils/authentication";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export interface CartItem {
  id: number;
  userId: number;
  classificationId: number;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  classification: {
    id: number;
    productId: number;
    option1Id: number;
    option2Id: number | null;
    price: string;
    stock: number;
    status: string;
    product: {
      id: number;
      name: string;
      images: Array<{
        id: number;
        path: string;
      }>;
    };
    option1: {
      id: number;
      name: string;
      groupId: number;
      group?: {
        name: string;
      };
    } | null;
    option2: {
      id: number;
      name: string;
      groupId: number;
      group?: {
        name: string;
      };
    } | null;
    inventory: Array<{
      id: number;
      quantity: number;
    }>;
  };
}

interface CheckoutResponse {
  userName: string;
  phone: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: Array<{
    productId: number;
    classificationId: number;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  shippingAddress: {
    addressDetail: string;
    province: string;
    district: string;
    ward: string;
  };
  seller: {
    id: number;
    storeName: string;
  };
}

const ShoppingCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    if (selectedItems.size > 0) {
      handleCheckout();
    } else {
      setCheckoutData(null);
    }
  }, [selectedItems]);
  const handlePlaceOrder = async () => {
    try {
      const userId = getUserId(UserType.CUSTOMER);
      if (!userId) return;

      const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
      const orderItems = selectedCartItems.map(item => ({
          productId: item.classification.product.id,
          classificationId: item.classification.id,
          quantity: item.quantity,
          price: Number(item.classification.price)
      }));

      const response = await axios.post(
        'http://localhost:4000/api/v1/orders',
        {
          userId,
          items: orderItems
        }
      );

      if (response.data.success) {
        setOrderSuccess(true);
        setOrderMessage(response.data.message);
        // Chuyển đến trang đơn hàng sau 2 giây
        setTimeout(() => {
          navigate('/user/orders');
        }, 2000);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setCheckoutError("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    }
  };
  const fetchCartItems = async () => {
    try {
      const userId = getUserId(UserType.CUSTOMER);
      if (!userId) return;

      const response = await axios.get(`http://localhost:4000/api/v1/carts/${userId}`);
      
      if (Array.isArray(response.data)) {
        setCartItems(response.data);
      } else if (response.data && typeof response.data === 'object') {
        setCartItems([response.data]);
      } else {
        setCartItems([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItems([]);
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      setCheckoutError(null);
      const userId = getUserId(UserType.CUSTOMER);
      if (!userId) return;

      const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
      const checkoutItems = selectedCartItems.map(item => ({
        productId: item.classification.product.id,
        classificationId: item.classification.id,
        quantity: item.quantity,
        price: Number(item.classification.price)
      }));

      const response = await axios.post(
        `http://localhost:4000/api/v1/orders/${userId}/checkout`,
        { items: checkoutItems }
      );

      setCheckoutData(response.data.data);
    } catch (error) {
      console.error("Error during checkout:", error);
      setCheckoutError("Có lỗi xảy ra trong quá trình checkout. Vui lòng thử lại.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (updatingItems.has(id)) return;
    
    try {
      setUpdatingItems(prev => new Set(prev).add(id));

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      await axios.put(`http://localhost:4000/api/v1/carts/${id}`, {
        quantity: newQuantity
      });

      await fetchCartItems();
    } catch (error) {
      console.error("Error updating quantity:", error);
      await fetchCartItems();
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleIncrease = (id: number) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;
    updateQuantity(id, item.quantity + 1);
  };

  const handleDecrease = (id: number) => {
    const item = cartItems.find(item => item.id === id);
    if (!item || item.quantity <= 1) return;
    updateQuantity(id, item.quantity - 1);
  };

  const handleRemove = (id: number) => {
    updateQuantity(id, 0);
  };

  const handleToggleItem = (id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const calculateSubtotal = () => {
    if (!checkoutData) return 0;
    return checkoutData.subtotal;
  };


  const calculateTotal = () => {
    if (!checkoutData) return 0;
    const subtotal = calculateSubtotal();
    return subtotal + (checkoutData.shippingFee || 0);
  };

  const renderClassifications = (item: CartItem) => {
    return (
      <Stack>
        {item.classification.option1 && item.classification.option1.group && (
          <Text size="sm">
            {item.classification.option1.group.name}: {item.classification.option1.name}
          </Text>
        )}
        {item.classification.option2 && item.classification.option2.group && (
          <Text size="sm">
            {item.classification.option2.group.name}: {item.classification.option2.name}
          </Text>
        )}
      </Stack>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Container fluid className="shadow-md py-2">
        <ClientHeader />
      </Container>
      <div className="px-24 py-10 bg-gray-50">
        <Grid mx={120}>
          <Grid.Col span={9}>
            <Text size="xl" className="font-bold flex items-center pt-4">
              <IconShoppingCart size={24} style={{ marginRight: 8 }} />
              Giỏ hàng
            </Text>
            <Paper shadow="sm" p={20} mt={20} withBorder>
              <Table horizontalSpacing="l" verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th></Table.Th>
                    <Table.Th>Mặt hàng</Table.Th>
                    <Table.Th>Đơn giá</Table.Th>
                    <Table.Th>Số lượng</Table.Th>
                    <Table.Th>Thành tiền</Table.Th>
                    <Table.Th>Thao tác</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cartItems.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text>Giỏ hàng của bạn trống.</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    cartItems.map((item) => (
                      <Table.Tr key={item.id}>
                        <Table.Td>
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleToggleItem(item.id)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            {item.classification.product.images && item.classification.product.images[0] && (
                              <img
                                src={item.classification.product.images[0].path}
                                alt={item.classification.product.name}
                                style={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: "5px",
                                }}
                              />
                            )}
                            <div>
                              <Text fw={500} size="sm" mb={4}>
                                {item.classification.product.name}
                              </Text>
                              {renderClassifications(item)}
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>
                            {Number(item.classification.price).toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <ActionIcon 
                              variant="light"
                              onClick={() => handleDecrease(item.id)}
                              disabled={updatingItems.has(item.id)}
                              size="sm"
                            >
                              <IconMinus size={14} />
                            </ActionIcon>
                            <Text size="sm" w={30} ta="center">
                              {item.quantity}
                            </Text>
                            <ActionIcon 
                              variant="light"
                              onClick={() => handleIncrease(item.id)}
                              disabled={updatingItems.has(item.id)}
                              size="sm"
                            >
                              <IconPlus size={14} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>
                            {(Number(item.classification.price) * item.quantity).toLocaleString(
                              "vi-VN",
                              {
                                style: "currency",
                                currency: "VND",
                              }
                            )}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon
                            color="red"
                            onClick={() => handleRemove(item.id)}
                            disabled={updatingItems.has(item.id)}
                            variant="light"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          </Grid.Col>

          <Grid.Col span={3}>
            <div className="pt-10">
              <div className="p-4 rounded-2xl shadow-md bg-white overflow-hidden">
                <Text size="sm">Giao tới</Text>
                <Divider my="sm" />
                <Stack>
                  {checkoutData?.shippingAddress ? (
                    <>
                      <Text fw={500}>{checkoutData.userName}</Text>
                      <Text fw={500}>{checkoutData.phone}</Text>
                      <Text className="text-gray-600">
                        {checkoutData.shippingAddress.addressDetail}, 
                        {checkoutData.shippingAddress.ward}, 
                        {checkoutData.shippingAddress.district}, 
                        {checkoutData.shippingAddress.province}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-600">
                      Vui lòng chọn sản phẩm để xem thông tin giao hàng
                    </Text>
                  )}
                </Stack>
              </div>

              <div className="mt-4 p-4 rounded-2xl shadow-md bg-white">
                <Text size="sm">Hình thức giao hàng</Text>
                <Divider my="sm" />
                <div className="flex items-center">
                  <Radio
                    value="shipping-method"
                    name="shipping-method"
                    checked
                  />
                  <Text size="l"
                  ml={20}
                        fw={900}
                        variant="gradient"
                        gradient={{ from: 'red', to: 'orange', deg: 19 }}>Giao hàng nhanh</Text>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl shadow-md bg-white">
                <Text size="sm">Hình thức thanh toán</Text>
                <Divider my="sm" />
                <Stack>
                  <div className="flex items-center">
                    <Radio 
                      checked={paymentMethod === 'cash'} 
                      value="cash" 
                      name="payment-method"
                      onChange={(e) => setPaymentMethod(e.currentTarget.value)}
                    />
                    <IconCash className="ml-2 mr-2" size={20} />
                    <Text>Tiền mặt</Text>
                  </div>
                  <div className="flex items-center">
                    <Radio 
                      checked={paymentMethod === 'paypal'} 
                      value="paypal" 
                      name="payment-method"
                      onChange={(e) => setPaymentMethod(e.currentTarget.value)}
                    />
                    <IconBrandPaypal className="ml-2 mr-2" size={20} />
                    <Text>PayPal</Text>
                    </div>
                </Stack>
              </div>

              <div className="mt-4 p-4 rounded-2xl shadow-md bg-white space-y-2">
                <div className="flex justify-between">
                  <Text size="sm">Tạm tính:</Text>
                  <Text size="sm">
                    {calculateSubtotal().toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text size="sm">Phí vận chuyển</Text>
                  <Text size="sm">
                    {checkoutData?.shippingFee.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text size="lg" className="font-bold">
                    Tổng tiền:
                  </Text>
                  <Text size="lg"  className="font-bold">
                    {calculateTotal().toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Text>
                </div>
              </div>

              {checkoutError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" mt="md">
                  {checkoutError}
                </Alert>
              )}

              <Button 
                fullWidth 
                mt="lg" 
                size="md"
                loading={checkoutLoading}
                disabled={selectedItems.size === 0}
                onClick={handlePlaceOrder}
              >
                Đặt mua
              </Button>
              {orderSuccess && (
              <Alert icon={<IconCheck size={16} />} color="green" mt="md">
                {orderMessage}
              </Alert>
            )}
            </div>
          </Grid.Col>
        </Grid>
      </div>
    </>
  );
};

export default ShoppingCart;