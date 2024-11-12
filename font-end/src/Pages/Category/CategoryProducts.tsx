import { useState, useEffect } from 'react';
import {
    Container,
    Group,
    Title,
    Text,
    Checkbox,
    Stack,
    RangeSlider,
    Grid,
    Card,
    Image,
    Pagination,
    Loader,
    Collapse,
    Button,
    Radio
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import ClientHeader from '../../Components/ClientHeader/ClientHeader';
import ClientFooter from '../../Components/ClientFooter/ClientFooter';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
    level: number;
    parentCategoryId?: number;
    childCategories?: Category[];
}

interface Product {
    id: number;
    name: string;
    images: Array<{ path: string }>;
    classifications: Array<{ price: number }>;
    status: string;
}

interface FilterOption {
    id: string;
    name: string;
    options: string[];
}

interface SortOption {
    value: string;
    label: string;
}

interface CategoryAttribute {
    id: number;
    name: string;
    value: Array<{
        originName: Array<{
            id: number;
            name: string;
        }>;
    }>;
    formName: string;
}

interface SelectedAttributesType {
    [key: string]: string;
}

interface PaginationType {
    currentPage: number;
    totalPages: number;
    total: number;
    pageSize: number;
}

const MOCK_FILTERS: FilterOption[] = [
    {
        id: 'brand',
        name: 'Thương hiệu',
        options: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus']
    },
    {
        id: 'status',
        name: 'Tình trạng',
        options: ['Mới', 'Đã sử dụng']
    },
    {
        id: 'shipping',
        name: 'Đơn vị vận chuyển',
        options: ['Hỏa tốc', 'Nhanh', 'Tiết kiệm']
    }
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'price_asc', label: 'Giá thấp đến cao' },
    { value: 'price_desc', label: 'Giá cao đến thấp' }
] as const;

type SortValue = typeof SORT_OPTIONS[number]['value'];

export default function CategoryProducts() {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [mainCategories, setMainCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
    const [pagination, setPagination] = useState<PaginationType>({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        pageSize: 12
    });
    const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string[]}>({});
    const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([]);
    const [sortValue, setSortValue] = useState<SortValue>('newest');
    const [parentCategory, setParentCategory] = useState<Category | null>(null);
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
    const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttributesType>({});

    useEffect(() => {
        fetchMainCategories();
    }, []);

    useEffect(() => {
        if (categoryId) {
            fetchCategoryDetails();
        }
    }, [categoryId]);

    useEffect(() => {
        if (selectedCategory) {
            fetchProducts();
            fetchCategoryAttributes();
        }
    }, [selectedCategory, sortValue, priceRange, selectedAttributes]);

    const fetchMainCategories = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/v1/categories/level/1?page=1&pageSize=10');
            if (response.status === 200) {
                setMainCategories(response.data.categories.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        if (!selectedCategory) return;

        try {
            setLoading(true);
            const sortParams = {
                sortBy: sortValue.startsWith('price') ? 'price' : 'createdAt',
                sortOrder: sortValue.endsWith('desc') || sortValue === 'newest' ? 'desc' : 'asc'
            };

            const attributeFilters = Object.entries(selectedAttributes)
                .filter(([_, value]) => value)
                .map(([attributeId, value]) => {
                    const attribute = attributes.find(attr => attr.id === Number(attributeId));
                    const option = attribute?.value[0]?.originName.find(opt => opt.name === value);
                    
                    console.log('Processing attribute:', {
                        attributeId,
                        value,
                        attribute,
                        option,
                        allAttributes: attributes
                    });

                    return {
                        attributeId: Number(attributeId),
                        values: [Number(option?.id)]
                    };
                })
                .filter(filter => filter.values[0] !== undefined && filter.values[0] !== null);

            const requestParams = {
                categoryId: selectedCategory,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                attributes: attributeFilters.length > 0 ? JSON.stringify(attributeFilters) : undefined,
                ...sortParams,
                page: pagination.currentPage,
                limit: pagination.pageSize
            };

            console.log('Request params:', requestParams);

            const response = await axios.get(`http://localhost:4000/api/v1/products/filter`, {
                params: requestParams
            });

            console.log('Full API Response:', response);

            if (response.status === 200) {
                setProducts(response.data.products);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.metadata.totalPages,
                    total: response.data.metadata.total
                }));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if (axios.isAxiosError(error)) {
                console.log('Error response:', error.response?.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const getPriceRange = (classifications: Array<{ price: number }>) => {
        if (!classifications || classifications.length === 0) return '';
        const prices = classifications.map(c => Number(c.price)).filter(p => p > 0);
        if (prices.length === 0) return '';
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice 
            ? `${minPrice.toLocaleString('vi-VN')}đ`
            : `${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ`;
    };

    const handleCategoryClick = async (catId: number) => {
        setSelectedCategory(catId);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        await fetchCategoryAttributes(catId);
    };

    const handleFilterChange = (filterId: string, value: string) => {
        setSelectedFilters(prev => {
            const current = prev[filterId] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            
            if (updated.length === 0) {
                const { [filterId]: _, ...rest } = prev;
                return rest;
            }
            
            return { ...prev, [filterId]: updated };
        });
    };

    const fetchCategoryDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/v1/categories/${categoryId}`);
            if (response.status === 200) {
                const category = response.data.categories;
                if (category.parentCategoryId) {
                    const parentResponse = await axios.get(`http://localhost:4000/api/v1/categories/${category.parentCategoryId}`);
                    if (parentResponse.status === 200) {
                        setParentCategory(parentResponse.data.categories);
                        const childCategories = parentResponse.data.categories.childCategories || [];
                        setSubCategories(childCategories);
                        
                        if (childCategories.length > 0) {
                            setSelectedCategory(childCategories[0].id);
                            await fetchCategoryAttributes(childCategories[0].id);
                        }
                    }
                } else {
                    setParentCategory(category);
                    const childCategories = category.childCategories || [];
                    setSubCategories(childCategories);
                    
                    if (childCategories.length > 0) {
                        setSelectedCategory(childCategories[0].id);
                        await fetchCategoryAttributes(childCategories[0].id);
                    }
                }
                setBreadcrumbs([category]);
            }
        } catch (error) {
            console.error('Error fetching category details:', error);
        }
    };

    const handleSortChange = (value: SortValue) => {
        setSortValue(value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        if (selectedCategory) {
            fetchProducts();
        }
    };

    const fetchCategoryAttributes = async (catId?: number) => {
        try {
            const idToFetch = catId || selectedCategory;
            if (!idToFetch) return;

            const response = await axios.get(`http://localhost:4000/api/v1/categories/${idToFetch}/attributes`);
            if (response.status === 200) {
                setAttributes(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching attributes:', error);
        }
    };

    const handleAttributeChange = (attributeId: number, value: string) => {
        console.log('Changing attribute:', {
            attributeId,
            value,
            currentValue: selectedAttributes[attributeId],
            allAttributes: attributes
        });

        setSelectedAttributes(prev => {
            const newAttributes = { ...prev };
            if (value === newAttributes[attributeId]) {
                delete newAttributes[attributeId];
            } else {
                newAttributes[attributeId] = value;
            }
            return newAttributes;
        });
    };

    return (
        <>
            <ClientHeader />
            <Container size="xl" my="md">
                {/* Breadcrumbs */}
                <Group mb="md">
                    <Text 
                        className="cursor-pointer hover:text-blue-500"
                        onClick={() => navigate('/')}
                    >
                        Trang chủ
                    </Text>
                    {breadcrumbs.map((cat, index) => (
                        <Group key={cat.id}>
                            <Text color="dimmed">/</Text>
                            <Text 
                                className={`${
                                    index === breadcrumbs.length - 1 
                                    ? 'text-blue-500 font-bold' 
                                    : 'cursor-pointer hover:text-blue-500'
                                }`}
                            >
                                {cat.name}
                            </Text>
                        </Group>
                    ))}
                </Group>

                <Grid>
                    {/* Sidebar với bộ lọc */}
                    <Grid.Col span={3}>
                        <Stack spacing="md">
                            {/* Chỉ hiển thị danh mục con */}
                            <Card withBorder>
                                <Title order={4} mb="md">
                                    {parentCategory?.name || 'Danh mục con'}
                                </Title>
                                <Stack>
                                    {subCategories.map(category => (
                                        <Text
                                            key={category.id}
                                            className={`cursor-pointer py-2 hover:text-blue-500 ${
                                                selectedCategory === category.id ? 'text-blue-500 font-bold' : ''
                                            }`}
                                            onClick={() => handleCategoryClick(category.id)}
                                        >
                                            {category.name}
                                        </Text>
                                    ))}
                                </Stack>
                            </Card>

                            {/* Bộ lọc giá */}
                            <Card withBorder>
                                <Title order={4}>Khoảng giá</Title>
                                <RangeSlider
                                    mt="md"
                                    value={priceRange}
                                    onChange={setPriceRange}
                                    min={0}
                                    max={1000000}
                                    step={10000}
                                    label={(value) => `${value.toLocaleString('vi-VN')}đ`}
                                />
                            </Card>

                            {/* Thêm các bộ lọc khác */}
                            {MOCK_FILTERS.map(filter => (
                                <Card key={filter.id} withBorder>
                                    <Title order={4} mb="md">{filter.name}</Title>
                                    <Stack spacing="xs">
                                        {filter.options.map((option, idx) => (
                                            <Checkbox
                                                key={idx}
                                                label={option}
                                                checked={selectedFilters[filter.id]?.includes(option) || false}
                                                onChange={() => handleFilterChange(filter.id, option)}
                                            />
                                        ))}
                                    </Stack>
                                </Card>
                            ))}

                            {/* Thêm phần sắp xếp */}
                            <Card withBorder>
                                <Title order={4} mb="md">Sắp xếp theo</Title>
                                <Radio.Group
                                    value={sortValue}
                                    onChange={(value) => handleSortChange(value as SortValue)}
                                >
                                    <Stack>
                                        {SORT_OPTIONS.map((option) => (
                                            <Radio
                                                key={option.value}
                                                value={option.value}
                                                label={option.label}
                                            />
                                        ))}
                                    </Stack>
                                </Radio.Group>
                            </Card>

                            {/* Phần thuộc tính sản phẩm */}
                            {attributes && attributes.map((attribute) => {
                                const options = attribute.value[0]?.originName || [];
                                
                                return (
                                    <Card key={attribute.id} withBorder>
                                        <Title order={4} mb="md">{attribute.formName}</Title>
                                        <Radio.Group
                                            value={selectedAttributes[attribute.id] || ''}
                                            onChange={(value) => {
                                                setSelectedAttributes(prev => ({
                                                    ...prev,
                                                    [attribute.id]: value
                                                }));
                                            }}
                                        >
                                            <Stack>
                                                {options.map((option) => (
                                                    <Radio
                                                        key={option.id}
                                                        value={option.name}
                                                        label={option.name}
                                                    />
                                                ))}
                                            </Stack>
                                        </Radio.Group>
                                    </Card>
                                );
                            })}

                            {/* Hiển thị các thuộc tính đã chọn */}
                            {Object.keys(selectedAttributes).length > 0 && (
                                <Card withBorder>
                                    <Title order={4} mb="md">Đã chọn</Title>
                                    <Stack>
                                        {Object.entries(selectedAttributes).map(([attrId, value]) => {
                                            const attribute = attributes.find(a => a.id === Number(attrId));
                                            return (
                                                <Group key={`${attrId}-${value}`}>
                                                    <Text size="sm">
                                                        {attribute?.formName}: {value}
                                                    </Text>
                                                    <Button
                                                        variant="subtle"
                                                        size="xs"
                                                        onClick={() => {
                                                            const newSelectedAttrs = {...selectedAttributes};
                                                            delete newSelectedAttrs[attrId];
                                                            setSelectedAttributes(newSelectedAttrs);
                                                        }}
                                                    >
                                                        ×
                                                    </Button>
                                                </Group>
                                            );
                                        })}
                                        <Button
                                            variant="light"
                                            size="xs"
                                            onClick={() => setSelectedAttributes({})}
                                        >
                                            Xóa tất cả
                                        </Button>
                                    </Stack>
                                </Card>
                            )}
                        </Stack>
                    </Grid.Col>

                    {/* Phần hiển thị sản phẩm */}
                    <Grid.Col span={9}>
                        {/* Thêm hiển thị sắp xếp hiện tại */}
                        <Group mb="md" justify="space-between">
                            <Text>
                                {products.length} sản phẩm
                            </Text>
                            <Text c="dimmed">
                                Sắp xếp theo: {SORT_OPTIONS.find(opt => opt.value === sortValue)?.label}
                            </Text>
                        </Group>

                        {/* Hiển thị các filter đã chọn */}
                        {Object.keys(selectedFilters).length > 0 && (
                            <Card withBorder mb="md">
                                <Group>
                                    <Text fw={500}>Bộ lọc đã chọn:</Text>
                                    {Object.entries(selectedFilters).map(([filterId, values]) => (
                                        values.map(value => (
                                            <Button
                                                key={`${filterId}-${value}`}
                                                variant="light"
                                                size="xs"
                                                rightSection="×"
                                                onClick={() => handleFilterChange(filterId, value)}
                                            >
                                                {MOCK_FILTERS.find(f => f.id === filterId)?.name}: {value}
                                            </Button>
                                        ))
                                    ))}
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        onClick={() => setSelectedFilters({})}
                                    >
                                        Xóa tất cả
                                    </Button>
                                </Group>
                            </Card>
                        )}

                        {loading ? (
                            <Group justify="center" py="xl">
                                <Loader />
                            </Group>
                        ) : (
                            <>
                                <Grid>
                                    {products.map(product => (
                                        <Grid.Col key={product.id} span={4}>
                                            <Card 
                                                withBorder
                                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                                onClick={() => navigate(`/product/${product.id}`)}
                                            >
                                                <Card.Section>
                                                    <Image
                                                        src={product.images[0]?.path || "https://via.placeholder.com/250x250"}
                                                        height={200}
                                                        alt={product.name}
                                                    />
                                                </Card.Section>
                                                <Text fw={500} mt="md" lineClamp={2}>{product.name}</Text>
                                                <Text c="dimmed" size="sm" className="text-pink-500 font-semibold">
                                                    {getPriceRange(product.classifications)}
                                                </Text>
                                            </Card>
                                        </Grid.Col>
                                    ))}
                                </Grid>

                                <Group justify="center" mt="xl">
                                    <Pagination
                                        total={pagination.totalPages}
                                        value={pagination.currentPage}
                                        onChange={page => setPagination(prev => ({ ...prev, currentPage: page }))}
                                    />
                                </Group>
                            </>
                        )}
                    </Grid.Col>
                </Grid>
            </Container>
            <ClientFooter />
        </>
    );
} 