import { useEffect, useState } from 'react';
import { Table, Group, Text, Button, TextInput, Select, Pagination, Badge, Image, LoadingOverlay } from '@mantine/core';
import axios from 'axios';
import { useParams, useLocation, } from 'react-router-dom';

interface Classification {
    id: number;
    option1: { name: string };
    option2?: { name: string };
    price: { price: number };
}

interface Inventory {
    id: number;
    product: {
        name: string;
        code: string;
        images: string[];
        price: number;
    };
    classification: Classification;
    warehouse: {
        name: string;
        code: string;
    };
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    status: string;
}

function InventoryManage() {
    const { sellerId } = useParams();
    const { search } = useLocation();
    const warehouseId = new URLSearchParams(search).get('warehouseId');
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [status, setStatus] = useState<string | null>(null);

    const fetchInventories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:4000/api/v1/inventory/1`,
                {
                    params: {
                        page,
                        limit: 10,
                        search: searchText,
                        warehouseId,
                        status
                    }
                }
            );

            if (response.data.success) {
                setInventories(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching inventories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventories();
    }, [page, searchText, status, warehouseId]);

    return (
        <div style={{ padding: '20px' }}>
            <LoadingOverlay visible={loading} />
            
            <Group mb="md">
                <TextInput
                    placeholder="Tìm kiếm theo tên sản phẩm hoặc phân loại"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
                <Select
                    placeholder="Trạng thái"
                    value={status}
                    onChange={setStatus}
                    data={[
                        { value: 'ACTIVE', label: 'Còn hàng' },
                        { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
                        { value: 'LOW_STOCK', label: 'Sắp hết hàng' }
                    ]}
                    clearable
                />
            </Group>

            <Table striped >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Sản phẩm</Table.Th>
                        <Table.Th>Phân loại</Table.Th>
                        <Table.Th>Giá bán</Table.Th>
                        <Table.Th>Kho hàng</Table.Th>
                        <Table.Th>Tồn kho</Table.Th>
                        <Table.Th>Trạng thái</Table.Th>
                        <Table.Th>Thao tác</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {inventories.map((inventory) => (
                        <Table.Tr key={inventory.id}>
                            <Table.Td>
                                <Group>
                                    {inventory.product.images?.[0] && (
                                        <Image
                                            src={inventory.product.images[0].path}
                                            style={{ width: '50px', height: '50px' }}
                                            radius="sm"
                                        />
                                    )}
                                    <div>
                                        <Text size="sm">{inventory.product.name}</Text>
                                        <Text size="xs">{inventory.product.code}</Text>
                                    </div>
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                {`${inventory.classification.option1.name}${
                                    inventory.classification.option2
                                        ? ` - ${inventory.classification.option2.name}`
                                        : ''
                                }`}
                            </Table.Td>
                            <Table.Td>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(inventory.classification.price)}
                            </Table.Td>
                            <Table.Td>{inventory.warehouse.name}</Table.Td>
                            <Table.Td>
                                <Text>{inventory.quantity}</Text>
                                <Text size="xs" >
                                    Min: {inventory.minQuantity} - Max: {inventory.maxQuantity}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <Badge 
                                    color={inventory.status === 'ACTIVE' ? 'green' : 
                                            inventory.status === 'LOW_STOCK' ? 'yellow' : 'red'}
                                >
                                    {inventory.status === 'ACTIVE' ? 'Còn hàng' :
                                        inventory.status === 'LOW_STOCK' ? 'Sắp hết' : 'Hết hàng'}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <Group spacing="xs">
                                    <Button variant="outline" size="xs">
                                        Nhập kho
                                    </Button>
                                    
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Group mt="md">
                <Pagination
                    total={totalPages}
                    value={page}
                    onChange={setPage}
                />
            </Group>
        </div>
    );
}

export default InventoryManage;
