import React, { useState, useEffect } from 'react';
import {

    Container,
    Group,
    Flex,
    Title,
    Paper,
    Text,
    Button,
    SimpleGrid,
    Image ,
    Card, 
    Stack,
    Pagination
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { Carousel } from '@mantine/carousel';
import ClientHeader from '../Components/ClientHeader/ClientHeader';
import ClientFooter from '../Components/ClientFooter/ClientFooter';

export default function HomePage(){
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        pageSize: 10
    });

    useEffect(() => {
        fetchProducts();
    }, [pagination.currentPage, pagination.pageSize]);
    const fetchProducts = async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/v1/products?page=${pagination.currentPage}&pageSize=${pagination.pageSize}`);
            const data = await response.json();
            setProducts(data.data);
            setPagination(prev => ({
                ...prev,
                totalPages: data.metadata.totalPages,
                total: data.metadata.total
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };
    const handleProductClick = async (productId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/v1/products/${productId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const productData = await response.json();
            navigate(`/product/${productId}`, { state: { productData } });
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    return <>
        <Container fluid className='shadow-md py-2'>
                <ClientHeader />
        </Container>
        <Container className='my-10'>
            
        </Container>
        <Container fluid className='mx-48'>
            <Group justify='space-between'>
                <Title order={2} className='text-orange-500'>Danh mục nổi bật</Title>
                <Button variant='light'>Xem tất cả </Button>
            </Group>
            <SimpleGrid   cols={{ base: 1, sm: 2, lg: 5 }} spacing="xs" className='my-5'>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        1
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        2
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        3
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        4
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        5
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        6
                    </div>
                    

            </SimpleGrid>
        </Container>
        <Container fluid className='mx-48'>
            <Group justify='space-between'>
                <Title order={2} className='text-orange-500'>Sản phẩm mới nhất</Title>
                <Button variant='light'>Xem tất cả </Button>
            </Group>
            <SimpleGrid   cols={{ base: 1, sm: 4, lg: 4, xl: 4 }} spacing="xs" className='my-5'>
                    
                    {products.map((product) => (
                        <div   onClick={() => handleProductClick(product.id)}
                            key={product.id} 
                            className='w-full 
                            max-w-[250px] 
                            min-h-[300px] 
                            h-[300px] 
                            lg:h-[200px] 
                            xl:h-[350px] 
                            p-3 
                            shadow-lg 
                            rounded-md'>
                            <div>
                                <div className='
                                card-section 
                                w-full'>
                                    <Image
                                        src={product.images[0]?.path || "https://via.placeholder.com/250x250"}
                                        className='min-h-[200px] h-[200px] lg:h-[200px] xl:h-[250px]'
                                        alt={product.name}
                                    />
                                </div>
                                <Flex
                                    direction="column"  
                                    className='my-2'
                                >
                                    <Text fw={500}>{product.name}</Text>
                                    <p className='text-md font-semibold text-pink-500'>Price information not available</p>
                                    <p className='text-xs font-semibold text-gray-500'>Status: {product.status}</p>
                                </Flex>
                            </div>
                        </div>
                    ))}
                    
                    
                    

            </SimpleGrid>
            <Pagination 
                        total={pagination.totalPages} 
                        value={pagination.currentPage} 
                        onChange={handlePageChange} 
                        className='my-5' 
                    />
        </Container>
        <Container fluid className='shadow-md py-2'>
                <ClientFooter />
        </Container>
    </>
}
