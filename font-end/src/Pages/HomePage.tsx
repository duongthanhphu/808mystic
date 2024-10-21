import { useState, useEffect } from 'react';
import {
    Container,
    Group,
    Flex,
    Title,
    Text,
    Button,
    SimpleGrid,
    Image ,
    Pagination
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import ClientHeader from '../Components/ClientHeader/ClientHeader';
import { Carousel } from '@mantine/carousel';
import ClientFooter from '../Components/ClientFooter/ClientFooter';
import axios from 'axios';

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
            const productsResp = await axios.get(`http://localhost:4000/api/v1/products?page=${pagination.currentPage}&pageSize=${pagination.pageSize}`);
    
            if (productsResp.status === 200 && productsResp.statusText === "OK") {
                const productFromServer = productsResp.data.products.data
                const productMetadata = productsResp.data.products.metadata
                setProducts(productFromServer);
                if (productMetadata) {
                    setPagination(prev => ({
                        ...prev,
                        totalPages: productMetadata.totalPages,
                        total: productMetadata.total
                    }));
                }
            } 
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };
    const handleProductClick = async (productId) => {
        try {
            console.log(productId)
            navigate(`/product/${productId}`, { state: { productId } });
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
        <ClientFooter />
    </>
}
