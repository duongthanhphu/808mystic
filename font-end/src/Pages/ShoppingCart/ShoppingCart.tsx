import React, { useState } from "react";
import ClientHeader from "../../Components/ClientHeader/ClientHeader";
import ClientFooter from "../../Components/ClientFooter/ClientFooter";
import {
  Paper,
  Text,
  Button,
  Group,
  Table,
  ActionIcon,
  Container,
  Divider,
  Stack,
  Grid,
  Image,
  Radio,
} from "@mantine/core";
import {
  IconTrash,
  IconPlus,
  IconMinus,
  IconShoppingCart,
  IconCash,
  IconBrandPaypal,
} from "@tabler/icons-react";

export interface CartItem {
  id: number;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const ShoppingCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Dell XPS 13 9315",
      size: "M",
      color: "Đỏ",
      price: 5500000,
      quantity: 2,
      imageUrl:
        "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk0v2sktvwdw35.webp",
    },
    {
      id: 2,
      name: "Loa Harman Kardon Onyx Studio 7",
      size: "L",
      color: "Xanh",
      price: 11000000,
      quantity: 1,
      imageUrl:
        "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lv1vjast92wp94@resize_w900_nl.webp",
    },
  ]);

  const handleIncrease = (id: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemove = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  return (
    <>
      <Container fluid className="shadow-md py-2">
        <ClientHeader />
      </Container>
      <div className="px-24 py-10 bg-gray-50">
        <Grid>
          <Grid.Col span={9}>
            <Text size="xl" className="font-bold flex items-center pt-4">
              <IconShoppingCart size={24} style={{ marginRight: 8 }} />
              Giỏ hàng
            </Text>
            <Paper shadow="sm" p={20} mt={20} withBorder>
              <Table verticalSpacing="md">
                <thead>
                  <tr>
                    <th>Mặt hàng</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <Text color="dimmed" align="center">
                          Giỏ hàng của bạn trống.
                        </Text>
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Group spacing="sm">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              style={{
                                width: 100,
                                height: 100,
                                borderRadius: "5px",
                              }}
                            />
                            <div>
                              <Text>{item.name}</Text>
                              <Text size="sm" color="dimmed">
                                Kích cỡ: {item.size}
                              </Text>
                              <Text size="sm" color="dimmed">
                                Màu sắc: {item.color}
                              </Text>
                            </div>
                          </Group>
                        </td>
                        <td>
                          {item.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </td>
                        <td>
                          <Group position="center" className="mx-2 -space-x-1">
                            <ActionIcon onClick={() => handleDecrease(item.id)}>
                              <IconMinus size={14} />
                            </ActionIcon>
                            <Text>{item.quantity}</Text>
                            <ActionIcon onClick={() => handleIncrease(item.id)}>
                              <IconPlus size={14} />
                            </ActionIcon>
                          </Group>
                        </td>
                        <td className="">
                          {(item.price * item.quantity).toLocaleString(
                            "vi-VN",
                            {
                              style: "currency",
                              currency: "VND",
                            }
                          )}
                        </td>
                        <td>
                          <div className="pl-5">
                            <ActionIcon
                              color="red"
                              onClick={() => handleRemove(item.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Paper>
          </Grid.Col>

          <Grid.Col span={3}>
            <div className="pt-10">
              <div className="p-4 rounded-2xl shadow-md bg-white overflow-hidden">
                <Text size="sm" className="">
                  Giao tới
                </Text>
                <Divider my="sm" />
                <Stack>
                  <Text fw={500}>Danila Treat</Text>
                  <Text fw={500}>0919944735</Text>
                  <Text className="text-gray-600">
                    3918 Bashford Junction, Phường Đa Kao, Quận 1
                  </Text>
                </Stack>
              </div>

              <div className="mt-4 p-4 rounded-2xl shadow-md bg-white">
                <div className="">
                  <Text size="sm">Hình thức giao hàng</Text>
                  <Divider my="sm" />
                  <div className="flex items-center">
                    <Radio
                      value="shipping-method"
                      name="shipping-method"
                      checked
                    />
                    <Image
                      src="https://careerhub.huflit.edu.vn/wp-content/uploads/2024/06/NEW-LOGO-FINAL.jpg"
                      className="ml-2 -my-12 h-20"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl shadow-md bg-white">
                <Text size="sm">Hình thức thanh toán</Text>
                <Divider my="sm" />
                <Stack>
                  <div className="flex items-center">
                    <Radio checked value="cash" name="payment-method" />
                    <IconCash className="ml-2 mr-2" size={20} />
                    <Text>Tiền mặt</Text>
                  </div>
                  <div className="flex items-center">
                    <Radio value="paypal" name="payment-method" />
                    <IconBrandPaypal className="ml-2 mr-2" size={20} />
                    <Text>PayPal</Text>
                  </div>
                </Stack>
              </div>

              <div className="mt-4 p-4 rounded-2xl shadow-md bg-white space-y-2">
                <div className="flex justify-between">
                  <Text size="sm">Tạm tính:</Text>
                  <Text size="sm">67.925.000 đ</Text>
                </div>
                <div className="flex justify-between">
                  <Text size="sm">Thuế (10%):</Text>
                  <Text size="sm">6.175.000 đ</Text>
                </div>
                <div className="flex justify-between">
                  <Text size="lg" color="blue" className="font-bold">
                    Tổng tiền:
                  </Text>
                  <Text size="lg" color="blue" className="font-bold">
                    74.100.000 đ
                  </Text>
                </div>
              </div>

              <Button fullWidth mt="lg" size="md">
                Đặt mua
              </Button>
            </div>
          </Grid.Col>
        </Grid>
      </div>

      <div>
        <ClientFooter />
      </div>
    </>
  );
};

export default ShoppingCart;
