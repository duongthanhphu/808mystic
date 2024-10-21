import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Text, Paper, Button, Title, Image, Grid, Group, Avatar, Badge } from '@mantine/core';
import { IconMail, IconPhone, IconCalendar, IconPackage } from '@tabler/icons-react';
import ClientHeader from '../Components/ClientHeader/ClientHeader';
import ClientFooter from '../Components/ClientFooter/ClientFooter';
import OrderConfirmation from './Pages/OrderConfirmation';

const ShopDetail = () => {
    const { sellerId } = useParams();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchShopDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/v1/sellers/${sellerId}`);
                setShop(response.data.shop);
                
                const productsResponse = await axios.get(`http://localhost:4000/api/v1/sellers/${sellerId}/products`);
                setProducts(productsResponse.data.products || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchShopDetails();
    }, [sellerId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!shop) return <div>No shop found</div>;

    return (
        <>
            <Container fluid className='shadow-md py-2'>
                <ClientHeader />
            </Container>
            <Container size="xl" mt={40}>
                <Paper shadow="md" p="xl" radius="md" withBorder>
                    <Group align="flex-start">
                        <Group>
                            
                            {shop.avatar ? (
                                <Avatar size={100} radius={50} src={shop.avatar}  />
                            ) : (
                                <div className='border-2 border-blue-500 rounded-full p-12 '>
                                    {shop.storeName.charAt(0).toUpperCase() + shop.storeName.charAt(shop.storeName.length-1)}
                                </div>
                            )}
                            <div>
                                <Title order={2}>{shop.storeName}</Title>
                                <Group mt="xs">
                                    <IconMail size={16} />
                                    <Text size="sm">{shop.email}</Text>
                                </Group>
                                <Group mt="xs">
                                    <IconPhone size={16} />
                                    <Text size="sm">{shop.phone}</Text>
                                </Group>
                                <Group mt="xs">
                                    <IconPackage size={16} />
                                    <Text size="sm">{shop.productCount} sản phẩm</Text>
                                </Group>
                                <Group mt="xs">
                                    <IconCalendar size={16} />
                                    <Text size="sm">Tham gia từ {new Date(shop.createdAt).toLocaleDateString()}</Text>
                                </Group>
                            </div>
                        </Group>
                        <Button variant="outline" color="blue">
                            Theo dõi cửa hàng
                        </Button>
                    </Group>
                </Paper>

                <Title order={3} mt={40} mb={20}>Sản phẩm của cửa hàng</Title>
                <Grid>
                    {products.map(product => (
                        <Grid.Col key={product.id} span={3}>
                            <Paper shadow="sm" p="md" radius="md" withBorder>
                                {product.images && product.images.length > 0 && (
                                    <Image
                                        src={product.images[0].path}
                                        alt={product.name}
                                        height={200}
                                        fit="cover"
                                    />
                                )}
                                <Text mt="md" lineClamp={2}>{product.name}</Text>
                                <Group mt="md">
                                    <Badge color="pink" variant="light">
                                        {product.price ? `${product.price.toLocaleString()} đ` : 'Liên hệ'}
                                    </Badge>
                                    <Text size="sm">Đã bán: {product.soldCount || 0}</Text>
                                </Group>
                                <Button variant="light" color="blue" fullWidth mt="md">
                                    Xem chi tiết
                                </Button>
                            </Paper>
                        </Grid.Col>
                    ))}
                </Grid>
            </Container>
            <ClientFooter />
        </>
    );
};

export default ShopDetail;
