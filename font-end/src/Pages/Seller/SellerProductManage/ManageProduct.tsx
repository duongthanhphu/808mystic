import { Table, Pagination, Paper, Button, TextInput, Group, Text, Badge, Popover, ActionIcon } from '@mantine/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { IconEdit, IconEye, IconFilter, IconPlus, IconSearch, IconTrash, IconHash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: number;
    name: string;
    status: string;
    category: {
        name: string;
    };
    images: {
        path: string;
    }[];
    classificationGroups: {
        name: string;
        options: { name: string }[];
    }[];
    }

interface ProductsResponse {
    products: {
        data: Product[];
        metadata: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
        };
    };
}

export default function ManageProduct() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProduct = async (currentPage: number) => {
        try {
            const response = await axios.get<ProductsResponse>(`http://localhost:4000/api/v1/products?page=${currentPage}&pageSize=10`);
            setProducts(response.data.products.data);
            setTotalPages(response.data.products.metadata.totalPages);
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
        }
    };
    const handleCreateProduct = async () => {
        navigate('/seller/product/create');
    };

    useEffect(() => {
        fetchProduct(page);
    }, [page]);

    return (
    <>
        <div>
            <div className='flex justify-between items-center mb-5'>
                <div className='flex items-center gap-2'>
                    <IconHash />
                    <Text size='xl' fw={600}>Quản lí sản phẩm</Text>
                </div>
                <div className='flex gap-2'>
                    <Button variant='outline' leftSection={<IconPlus />} onClick={handleCreateProduct}>
                        Thêm mới
                    </Button>
                    <Button variant='outline' color='red' leftSection={<IconTrash />}>
                        Xoá hàng loạt
                    </Button>
                </div>
            </div>      
            <Paper shadow="sm" p="xs" withBorder mb="md">
                <Group justify="space-between">
                    <div className='flex items-center gap-2'>
                        <TextInput placeholder="Tìm kiếm sản phẩm" leftSection={<IconSearch />}/>
                        <TextInput placeholder="Lọc sản phẩm" leftSection={<IconFilter />}/>
                    </div>
                    <Button>Tìm kiếm sản phẩm</Button>
                </Group>
            </Paper>

            <Table striped withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Id</Table.Th>
                        <Table.Th>Tên sản phẩm</Table.Th>
                        <Table.Th>Hình đại diện</Table.Th>
                        <Table.Th>Trạng thái sản phẩm</Table.Th>
                        <Table.Th>Tên danh mục sản phẩm</Table.Th>
                        <Table.Th>Phiên bản</Table.Th>
                        <Table.Th>Thao tác</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {products.map((product) => (
                        <Table.Tr key={product.id}>
                            <Table.Td>{product.id}</Table.Td>
                            <Table.Td>{product.name}</Table.Td>
                            
                            <Table.Td>
                                {product.images.length > 0 && (
                                    <img src={product.images[0].path} alt={product.name} style={{ width: '50px', height: '50px' }} />
                                )}
                            </Table.Td>
                            <Table.Td>{product.status === 'available' ? <Badge color='blue' variant='light'>Có hiệu lực</Badge> : <Badge color='red' variant='light'>Vô hiệu hoá</Badge>}</Table.Td>
                            <Table.Td>{product.category.name}</Table.Td>
                            <Table.Td>
                                <Popover width={300} shadow="md">
                                    <Popover.Target>
                                        <Badge style={{ cursor: 'pointer' }}  color="teal" size="md" radius="sm">
                                            {product.classificationGroups.reduce((total, group) => total + group.options.length, 0)} phân loại
                                        </Badge>
                                    </Popover.Target>
                                    <Popover.Dropdown>
                                        <Table striped withTableBorder>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>Nhóm phân loại</Table.Th>
                                                    <Table.Th>Các tùy chọn</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {product.classificationGroups.map((group) => (
                                                    <Table.Tr key={group.name}>
                                                        <Table.Td>{group.name}</Table.Td>
                                                        <Table.Td>{group.options.map(option => option.name).join(', ')}</Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    </Popover.Dropdown>
                                </Popover>
                            </Table.Td>
                            <Table.Td>
                                <div className='flex gap-2'>
                                    <ActionIcon variant='outline' color='teal'>
                                    <IconEdit />
                                    </ActionIcon>
                                    <ActionIcon variant='outline' color='blue'>
                                        <IconEye />
                                    </ActionIcon>
                                    <ActionIcon variant='outline' color='red'>
                                        <IconTrash />
                                    </ActionIcon>
                                </div>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            <Pagination total={totalPages} value={page} onChange={setPage} mt="lg" />
        </div>
    </>
    );
}
