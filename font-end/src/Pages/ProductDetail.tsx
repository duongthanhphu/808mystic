import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Image, Text, Group, Button, Paper, } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications';
import { ProductImageCarousel } from '../Components/Carousel/ImageCarousel'; 
import { getUserId } from '../Utils/authentication'; 
import { CustomBreadcrumb } from '../Components/CustomBreadcrumb/CustomBreadcrumb'
import ClientHeader from '../Components/ClientHeader/ClientHeader';
import { UserType } from '../Utils/authentication'; // Thêm import này nếu chưa có

// import ClientFooter from '../Components/ClientFooter/ClientFooter'
// import { Avatar, Table, Badge, Divider, Grid, Col } from "@mantine/core";
// import {
//     IconMessageCircle,
//     IconShoppingCart,
//     IconStore,
//   IconClock,
// } from "@tabler/icons-react";
import axios from 'axios';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [cartLoading, setCartLoading] = useState(false);
    useEffect(() => {
        fetchProduct();
    }, [id]);
    
    const breadcrumbItems = [
        { title: 'Trang chủ', path: '/' },
        // { title: `${product.name}`},
        { title: product?.name ?? 'Loading...' }
        
    ];
    

    const fetchProduct = async () => {
        try {
            const productResp = await axios(`http://localhost:4000/api/v1/products/${id}`);
            if (productResp.status === 200 && productResp.statusText === "OK") {
                setProduct(productResp.data.product);
                setSelectedOptions({});
            }     
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);    
        }        
    };

    const handleAddToCart = async () => {
        if (!isAllOptionsSelected() || quantity < 1) return;

        const userId = getUserId(UserType.CUSTOMER);
        if (!userId) {
            notifications.show({
                title: 'Yêu cầu đăng nhập',
                message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
                color: 'yellow'
            });
            navigate('/signin', { 
                state: { 
                    returnUrl: `/products/${id}`,
                    message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' 
                } 
            });
            return;
        }

        if (!(await checkUserAddress(userId))) return;

        const selectedClassification = getSelectedClassification();
        setCartLoading(true);

        try {
            // Kiểm tra sản phẩm trong giỏ hàng
            const cartResp = await axios.get('http://localhost:4000/api/v1/carts');
            const existingCartItem = cartResp.data.find(
                item => item.classificationId === selectedClassification.id && item.userId === userId
            );

            if (existingCartItem) {
                // Cập nhật số lượng nếu đã có
                await axios.put(`http://localhost:4000/api/v1/carts/${existingCartItem.id}`, {
                    classificationId: selectedClassification.id,
                    quantity: existingCartItem.quantity + quantity,
                    userId: userId
                });
            } else {
                // Thêm mới vào giỏ hàng
                await axios.post('http://localhost:4000/api/v1/carts', {
                    classificationId: selectedClassification.id,
                    quantity: quantity,
                    userId: userId
                });
            }

            notifications.show({
                title: 'Thành công',
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                color: 'green'
            });
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Khng thể thêm vào giỏ hàng',
                color: 'red'
            });
        } finally {
            setCartLoading(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAllOptionsSelected() || quantity < 1) return;

        const userId = getUserId(UserType.CUSTOMER);
        if (!userId) {
            notifications.show({
                title: 'Yêu cầu đăng nhập',
                message: 'Vui lòng đăng nhập để mua hàng',
                color: 'yellow'
            });
            navigate('/signin', { 
                state: { 
                    returnUrl: `/products/${id}`,
                    message: 'Vui lòng đăng nhập để mua hàng' 
                } 
            });
            return;
        }

        if (!(await checkUserAddress(userId))) return;

        const selectedClassification = getSelectedClassification();
        setCartLoading(true);

        try {
            // Thêm vào giỏ hàng trước
            await axios.post('http://localhost:4000/api/v1/carts', {
                classificationId: selectedClassification.id,
                quantity: quantity,
                userId: userId
            });

            // Chuyển hướng đến trang giỏ hàng
            navigate(`/shopping-cart/${userId}`);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể thêm vào giỏ hàng',
                color: 'red'
            });
        } finally {
            setCartLoading(false);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        const selectedClassification = getSelectedClassification();
        if (selectedClassification && newQuantity > selectedClassification.stock) {
            notifications.show({
                title: 'Cảnh báo',
                message: 'Số lượng vượt quá hàng tồn kho',
                color: 'yellow'
            });
            return;
        }
        setQuantity(newQuantity);
    };

    const handleIncreaseQuantity = () => {
        handleQuantityChange(quantity + 1);
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            handleQuantityChange(quantity - 1);
        }
    };

    const handleOptionSelect = (groupIndex, option) => {
        // Reset all subsequent options when changing a previous option
        const newSelectedOptions = {...selectedOptions};
        Object.keys(newSelectedOptions).forEach(key => {
            if (parseInt(key) > groupIndex) {
                delete newSelectedOptions[key];
            }
        });
        
        newSelectedOptions[groupIndex] = option;
        setSelectedOptions(newSelectedOptions);
    };

    const isOptionAvailable = (groupIndex, option) => {
        if (!product || !product.classifications) return false;

        const previousSelections = {};
        for (let i = 0; i < groupIndex; i++) {
            if (selectedOptions[i]) {
                previousSelections[`option${i + 1}`] = selectedOptions[i];
            }
        }

        return product.classifications.some(classification => {
            const previousMatch = Object.entries(previousSelections).every(([key, value]) => 
                classification[key].id === value.id
            );

            const optionMatch = classification[`option${groupIndex + 1}`].id === option.id;

            return previousMatch && optionMatch;
        });
    };

    const isAllOptionsSelected = () => {
        if (!product || !product.classificationGroups) return false;
        return product.classificationGroups.every((_, index) => selectedOptions[index]);
    };

    const getSelectedClassification = () => {
        if (!product || !product.classificationGroups || !isAllOptionsSelected()) return null;
        
        return product.classifications.find(c => 
            product.classificationGroups.every((group, index) => 
                c[`option${index + 1}`].id === selectedOptions[index].id
            )
        );
    };

    const getDefaultPrice = () => {
        if (!product) return null;
        if (product.classifications && product.classifications.length > 0) {
            return Math.min(...product.classifications.map(c => parseFloat(c.price))).toFixed(2);
        }
        return product.price;
    };

    const getDefaultStock = () => {
        if (!product) return null;
        if (product.classifications && product.classifications.length > 0) {
            return product.classifications.reduce((sum, c) => sum + c.stock, 0);
        }
        return product.stock;
    };

    const checkUserAddress = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/v1/users/${userId}`);
            const user = response.data;
            console.log(user)
            if (user.addresses.length === 0 && (!user.provinceCode || !user.districtCode || !user.wardCode)) {
                notifications.show({
                    title: 'Thiếu thông tin địa chỉ',
                    message: 'Vui lòng cập nhật địa chỉ giao hàng trước khi đặt hàng',
                    color: 'yellow'
                });
                navigate('/profile', { state: { returnUrl: `/products/${id}` } });
                return false;
            }
            return true;
        } catch (error) {
            console.error('Lỗi khi kiểm tra địa chỉ người dùng:', error);
            return false;
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!product) return <div>No product found</div>;

    const selectedClassification = getSelectedClassification();
    const defaultPrice = getDefaultPrice();
    const defaultStock = getDefaultStock();

    return (
        <>
            <Container fluid className='shadow-md py-2'>
                <ClientHeader />
            </Container>
            <Container fluid className='mx-48 mt-10'>
                <Paper shadow='xl' p={15} pb={30} px={30}>
                    <div className="flex justify-between gap-8">
                        <div className="flex flex-col w-1/2">
                            <div className='flex mb-5'>
                                <CustomBreadcrumb items={breadcrumbItems} />
                            </div>
                            <div className="w-full">
                                {product.images && product.images.length > 0 && (
                                    <ProductImageCarousel images={product.images} />
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-start w-1/2 gap-5">
                            <div className='flex gap-1'>
                                <Text className='font-semibold'>Thương hiệu: </Text>
                                <Text className='text-blue-500'>{product.category.name}</Text>
                            </div>
                            
                            <Text className='font-semibold text-2xl'>{product.name}</Text>
                            
                            <Text className='text-gray-400'>
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Asperiores expedita vel.
                            </Text>
                            
                            <Text>
                                Tồn kho: {selectedClassification ? selectedClassification.stock : defaultStock}
                            </Text>
                            
                            <Text className='font-semibold'>Phân loại</Text>
                            
                            <div className='bg-gray-100 rounded-md p-4 w-full'>
                                <Text className='text-pink-600 text-2xl font-semibold'>
                                    {selectedClassification ? selectedClassification.price : defaultPrice} VND
                                </Text>
                            </div>

                            <div>
                                {product.ProductAttributeValue?.map((attr, index) => {
                                    const attributeName = attr.attributeValue.attribute.name;
                                    const valueId = attr.attributeValue.value.originName.id;
                                    const attributeValue = attr.attributeValue.attribute.value[0].originName.find(
                                        item => item.id === valueId
                                    )?.name;

                                    return (
                                        <div key={`attr-${index}-${valueId}`} className="flex gap-2">
                                            <Text fw={500}>{attributeName}:</Text>
                                            <Text>{attributeValue}</Text>
                                        </div>
                                    );
                                })}
                                
                                {product.classificationGroups.map((group, groupIndex) => (
                                    <div key={`group-${group.id || groupIndex}`}>
                                        <Text fw={550} mb="xs">{group.name}</Text>
                                        <Group>
                                            {group.options.map((option) => (
                                                <Button 
                                                    key={`option-${option.id}`}
                                                    variant={selectedOptions[groupIndex]?.id === option.id ? "filled" : "outline"}
                                                    onClick={() => handleOptionSelect(groupIndex, option)}
                                                    disabled={!isOptionAvailable(groupIndex, option)}
                                                >
                                                    {option.name}
                                                </Button>
                                            ))}
                                        </Group>
                                    </div>
                                ))}
                            </div>

                            <div className='flex gap-1'>
                                <div className='border p-1 rounded-md cursor-pointer' onClick={handleDecreaseQuantity}>
                                    <IconMinus stroke={1}/>
                                </div>
                                <div className='border p-1 rounded-md bottom-1 px-5'>
                                    {quantity}
                                </div>
                                <div className='border p-1 rounded-md cursor-pointer' onClick={handleIncreaseQuantity}>
                                    <IconPlus stroke={1}/>
                                </div>
                            </div>
                                
                            <div className='flex gap-5'>
                                <Button 
                                    color='pink' 
                                    size='lg' 
                                    loading={cartLoading}
                                    disabled={!isAllOptionsSelected() || quantity < 1}
                                    onClick={handleAddToCart}
                                >
                                    Giỏ hàng
                                </Button>
                                <Button 
                                    color='pink' 
                                    size='lg' 
                                    variant='light' 
                                    
                                    onClick={handleBuyNow}
                                >
                                    Đặt hàng
                                </Button>
                            </div>
                        </div>
                    </div>
                </Paper>
                {/* <Paper shadow='sm' p={15} mt={20}>
                                <Text className='font-semibold'>Thông tin cửa hàng</Text>
                                <Text>Tên cửa hàng: {product.seller?.seller?.storeName || 'Chưa có thông tin'}</Text>
                                <Text>Ngày tham gia: {product.seller?.seller?.createdAt ? new Date(product.seller.createdAt).toLocaleDateString() : 'Chưa có thông tin'}</Text>
                                <Button 
                                    variant="outline" 
                                    onClick={() => navigate(`/shop/${product.seller?.id}`)} // Giả sử bạn có route cho shop
                                >
                                    Xem chi tiết shop
                                </Button>
                </Paper>
                */}

            </Container>
            {/* <ClientFooter/> */}
        </>
    );
}
