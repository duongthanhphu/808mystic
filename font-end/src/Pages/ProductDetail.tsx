import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Image, Text, Group, Stack, SimpleGrid, Button, Paper, Select, NumberInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ClientHeader from '../Components/ClientHeader/ClientHeader';

export default function ProductDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClassification, setSelectedClassification] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/v1/products/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product data');
                }
                const data = await response.json();
                setProduct(data.products);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCart = async () => {
        if (!selectedClassification) {
            notifications.show({ title: 'Error', message: 'Please select a classification', color: 'red' });
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/v1/carts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: product.id,
                    classificationId: parseInt(selectedClassification),
                    quantity: quantity,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
            notifications.show({title: 'Thông báo', message: 'Sản phẩm đã thêm vào giỏ hàng! 🌟'})
        } catch (err) {
            notifications.show({title: 'Thông báo', message: err.message})
        }
    };

    const orderProduct = () => {
        if (!selectedClassification) {
            notifications.show({ title: 'Error', message: 'Please select a classification', color: 'red' });
            return;
        }

        const cartItem = {
            productId: product.id,
            classificationId: parseInt(selectedClassification),
            quantity: quantity,
        };

        let currentCart = JSON.parse(localStorage.getItem('cart') || '[]');

        currentCart.push(cartItem);

        localStorage.setItem('cart', JSON.stringify(currentCart));

        navigate('/confirm-order');
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!product) return <div>No product found</div>;

    return (
        <>
            <ClientHeader />
            <Container size="xl">
                <SimpleGrid cols={2} spacing="xl" verticalSpacing="xl">
                    <div>
                        {product.images && product.images.length > 0 && (
                            <Image src={product.images[0].path} alt={product.name} />
                        )}
                    </div>
                    <Stack spacing="md">
                        <Text size="xl" weight={700}>{product.name}</Text>
                        <Text>Category: {product.category.name}</Text>
                        <Text>Status: {product.status}</Text>
                        
                        {product.attributeValues && product.attributeValues.map((attr, index) => (
                            <Text key={index}>{attr.attributeValue.attribute.name}: {attr.attributeValue.value.name}</Text>
                        ))}

                        {product.classificationGroups && product.classificationGroups.map((group, index) => (
                            <Paper key={index} p="sm">
                                <Text weight={500}>{group.name}:</Text>
                                <Group>
                                    {group.options.map((option, optionIndex) => (
                                        <Button key={optionIndex} variant="outline">{option.name}</Button>
                                    ))}
                                </Group>
                            </Paper>
                        ))}

                        <Select
                            label="Select Classification"
                            placeholder="Choose a classification"
                            data={product.classifications.map(c => ({
                                value: c.id.toString(),
                                label: `${c.option1.name}: ${c.price} VND (Stock: ${c.stock})`
                            }))}
                            onChange={(value) => setSelectedClassification(value)}
                        />

                        <NumberInput
                            label="Quantity"
                            value={quantity}
                            onChange={(value) => setQuantity(value)}
                            min={1}
                            max={selectedClassification ? 
                                product.classifications.find(c => c.id.toString() === selectedClassification).stock 
                                : 99999}
                        />

                        <Button onClick={addToCart} disabled={!selectedClassification}>
                            Thêm vào giỏ hàng
                        </Button>
                        <Button onClick={orderProduct}>
                            Đặt hàng
                        </Button>
                    </Stack>
                </SimpleGrid>
                
            </Container>
        </>
    );
}