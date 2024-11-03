import { useEffect, useState } from 'react';
import { Table, Group, Text, Button, TextInput, Select, Pagination, Badge } from '@mantine/core';
import axios from 'axios';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';

interface Warehouse {
    id: number;
    code: string;
    name: string;
    address: string;
    status: string;
    province: { Name: string };
    district: { Name: string };
    ward: { Name: string };
    inventory: { _count: number };
}

interface WarehouseResponse {
    success: boolean;
    data: Warehouse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

function ManageWarehouse() {
    const { userId } = useOutletContext<{ userId: string }>();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            const response = await axios.get<WarehouseResponse>(
                `http://localhost:4000/api/v1/warehouses/${userId}`,
                {
                    params: {
                        page,
                        limit: 10,
                        search,
                        status,
                        sortBy: 'createdAt',
                        sortOrder: 'desc'
                    }
                }
            );

            setWarehouses(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, [page, search, status, userId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'green';
            case 'INACTIVE':
                return 'red';
            case 'MAINTENANCE':
                return 'yellow';
            default:
                return 'gray';
        }
    };

    const handleViewDetail = (warehouseId: string) => {
        navigate(`/seller/warehouse/detail/${warehouseId}`);
    }

    return (
        <div style={{ padding: '20px' }}>
            <Group mb="md">
                <Text size="xl">Quản lý kho hàng</Text>
                <Button>Thêm kho mới</Button>
            </Group>

            <Group mb="md">
                <TextInput
                    placeholder="Tìm kiếm theo tên, mã kho..."
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    style={{ width: '300px' }}
                />
                <Select
                    placeholder="Trạng thái"
                    value={status}
                    onChange={setStatus}
                    data={[
                        { value: 'ACTIVE', label: 'Hoạt động' },
                        { value: 'INACTIVE', label: 'Ngừng hoạt động' },
                        { value: 'MAINTENANCE', label: 'Bảo trì' }
                    ]}
                    clearable
                />
            </Group>

            <Table striped withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Mã kho</Table.Th>
                        <Table.Th>Tên kho</Table.Th>
                        <Table.Th>Địa chỉ</Table.Th>
                        <Table.Th>Trạng thái</Table.Th>
                        <Table.Th>Số lượng SP</Table.Th>
                        <Table.Th>Thao tác</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {warehouses.map((warehouse) => (
                        <Table.Tr key={warehouse.id}>
                            <Table.Td>{warehouse.code}</Table.Td>
                            <Table.Td>{warehouse.name}</Table.Td>
                            <Table.Td>
                                {`${warehouse.address}, ${warehouse.ward.Name}, 
                                ${warehouse.district.Name}, ${warehouse.province.Name}`}
                            </Table.Td>
                            <Table.Td>
                                <Badge color={getStatusColor(warehouse.status)}>
                                    {warehouse.status}
                                </Badge>
                            </Table.Td>
                            <Table.Td>{warehouse.inventory._count}</Table.Td>
                            <Table.Td>
                                <Group spacing="xs">
                                    <Button 
                                        variant="outline" 
                                        size="xs"
                                        onClick={() => handleViewDetail(warehouse.id)}
                                    >
                                        Chi tiết
                                    </Button>
                                    <Button variant="outline" size="xs" color="red">
                                        Xóa
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

export default ManageWarehouse;
    