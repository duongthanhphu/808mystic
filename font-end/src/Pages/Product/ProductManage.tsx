import DefaultPropertyPanel from "../../Components/DefaultPropertyPanel/DefaultPropertyPanel"
import DropzoneComponent from "../../Components/Dropzone"
import { useDisclosure } from '@mantine/hooks';
import {Table , Title, Text, Paper, Flex, TextInput, Stack, Group, Textarea, Button, Modal, Loader, SimpleGrid, Pagination, Breadcrumbs, Anchor, Select   } from '@mantine/core';
import React, { useState, useEffect } from 'react';
import { ProductClassification } from "./ProductClassification";


export default function ProductManage(){
    const [opened, { open, close }] = useDisclosure(false);
    const [isCategoryModalOpen, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
    const [classificationData, setClassificationData] = useState<ProductClassificationData | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState([{ title: 'Categories', id: null }]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        pageSize: 10
    });
    useEffect(() => {
    loadCategories();
    }, []); 

    useEffect(() => {
        if (opened) {
            loadCategories();
        }
    }, [opened, pagination.currentPage]);


    useEffect(() => {
    if (selectedCategory && !selectedCategory.childCategories) {
        loadAttributes(selectedCategory.id);
    }
    }, [selectedCategory]);
    
    const handleClassificationDataChange = (data: ProductClassificationData) => {
    setClassificationData(data);
    };
    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const url = `http://localhost:4000/api/v1/categories/level/1?page=${pagination.currentPage}&pageSize=${pagination.pageSize}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('Expected data.data to be an array');
            }
            
            setCategories(data.data);
            
            if (data.metadata) {
                setPagination({
                    currentPage: data.metadata.page || 1,
                    totalPages: data.metadata.totalPages || 1,
                    total: data.metadata.total || 0,
                    pageSize: data.metadata.pageSize || 10
                });
            } else {
                console.warn('No metadata received from API');
            }
            
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
        if (category.childCategories && category.childCategories.length > 0) {
            setSubcategories(category.childCategories);
            setBreadcrumbs(prev => [...prev, { title: category.name, id: category.id }]);
        } else {
            await loadAttributes(category.id);
            closeCategoryModal();
        }
    };

    const handleSubcategoryClick = (subcategory) => {
    setSelectedCategory(subcategory);    
        if (subcategory.childCategories && subcategory.childCategories.length > 0) {
            setSubcategories(subcategory.childCategories);
            setBreadcrumbs(prev => [...prev, { title: subcategory.name, id: subcategory.id }]);
        } else {
            setSelectedCategory(subcategory);
            closeCategoryModal();
        }
    };

    const handleBreadcrumbClick = async (index) => {
        if (index === 0) {
                setSelectedCategory(null);
                setSubcategories([]);
                await loadCategories();
        } else {
                const category = breadcrumbs[index];
                setSelectedCategory(category);
                if (index < breadcrumbs.length - 1) {
                    const nextCategory = breadcrumbs[index + 1];
                    const parentCategory = categories.find(c => c.id === category.id) || 
                                        subcategories.find(c => c.id === category.id);
                    setSubcategories(parentCategory.childCategories || []);
                } else {
                    setSubcategories([]);
                }
        }
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const renderCategories = () => (
        <div>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md" className='my-5'>
            {categories.map((category) => (
                <Paper
                key={category.id}
                shadow="sm"
                p="md"
                withBorder
                className='cursor-pointer hover:bg-gray-100'
                onClick={() => handleCategoryClick(category)}
                >
                <Text>{category.name}</Text>
                </Paper>
            ))}
            </SimpleGrid>
            <Flex justify="space-between" align="center" mt="md">
                <Text>
                    Trang {pagination.currentPage} / {pagination.totalPages} (Tổng số: {pagination.total} mục)
                </Text>
                <Pagination 
                        total={pagination.totalPages} 
                        value={pagination.currentPage} 
                        onChange={handlePageChange} 
                />
            </Flex>
        </div>
    );

    
    
    const renderSubcategories = () => (
        <Stack>
            <Title order={4}>Subcategories of {selectedCategory.name}</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md" className='my-5'>
                {subcategories.map((subcategory) => (
                    <Paper
                        key={subcategory.id}
                        shadow="sm"
                        p="md"
                        withBorder
                        className='cursor-pointer hover:bg-gray-100'
                        onClick={() => handleSubcategoryClick(subcategory)}
                    >
                        <Text>{subcategory.name}</Text>
                    </Paper>
                ))}
            </SimpleGrid>
        </Stack>
    );

    const loadAttributes = async (categoryId) => {
        setIsLoading(true);
        console.log(categoryId)
        try {
            console.log(categoryId)
            const response = await fetch(`http://localhost:4000/api/v1/categories/${categoryId}/attributes?page=1&pageSize=10`);
            const data = await response.json();
            console.log(data)
            setAttributes(data.data);
        } catch (error) {
            console.error('Error loading attributes:', error);
        }
        setIsLoading(false);
    };

    const AttributesList = ({ attributes }) => (
    <Stack>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 2, xl: 2 }} spacing="xs" className='my-3'>
            {attributes.map((attribute) => (
                attribute.formType === 'Select' && (
                    <Select
                        key={attribute.id}
                        label={attribute.formName}
                        placeholder="Chọn một giá trị"
                        data={attribute.value[0].originName.map(item => ({ value: item.id.toString(), label: item.name }))}
                        required={attribute.require}
                    />
                )
            ))}
        </SimpleGrid>
    </Stack>
    );


    const [productName, setProductName] = useState('');
    const [productCode, setProductCode] = useState('');
    const [productSlug, setProductSlug] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [fullDescription, setFullDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const formData = new FormData();

        formData.append('name', productName);
        formData.append('categoryId', selectedCategory.id.toString());
        formData.append('hasClassification', classificationData ? 'true' : 'false');
        formData.append('sellerId', '1');

        if (attributes.length > 0) {
            const attributeValues = attributes.map(attr => ({
            attributeId: attr.id,
            value: { name: attr.value[0].originName[0].name }
            }));
            formData.append('attributeValues', JSON.stringify(attributeValues));
        }

        if (classificationData) {
            if (classificationData.classificationGroups) {
                formData.append('classificationGroups', JSON.stringify(classificationData.classificationGroups));
            }
            if (classificationData.classifications) {
                formData.append('classifications', JSON.stringify(classificationData.classifications));
            }
        } else {
            if (quantity !== undefined) {
                formData.append('quantity', quantity.toString());
            }
            if (stock !== undefined) {
                formData.append('stock', stock.toString());
            }
        }

        selectedFiles.forEach((file) => {
            formData.append('images', file, file.name);
        });

        const response = await fetch('http://localhost:4000/api/v1/products/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create product');
        }

        const result = await response.json();
        console.log('Product created successfully:', result);

        } catch (error) {
        console.error('Error creating product:', error);
        } finally {
        setIsSubmitting(false);
        }
    };
    return <>
        <div className="w-1/2">
            <Title order={3}>Thêm sản phẩm</Title>
            <DefaultPropertyPanel />
            <Paper shadow="sm" my={20} p={15}>
                <Flex gap={"xs"} direction="column" align="flex-start">
                    <Title order={4}>Thông tin cơ bản</Title>
                    <Text fw={450} className="text-gray-500">Một số thông tin cơ bản</Text>
                </Flex>
                <Stack gap={"xs"}>
                    <TextInput
                        label="Tên sản phẩm"
                        withAsterisk
                        placeholder="Nhập tên sản phẩm bạn muốn !"
                        value={productName}
                        onChange={(e) => setProductName(e.currentTarget.value)}
                    />
                    <Group justify={"space-between"} grow>
                        <TextInput
                            label="Mã sản phẩm"
                            placeholder="Nhập mã sản phẩm !"
                            value={productCode}
                            onChange={(e) => setProductCode(e.currentTarget.value)}
                        />
                        <TextInput
                            label="Slug sản phẩm"
                            withAsterisk
                            placeholder="Nhập slug sản phẩm !"
                            value={productSlug}
                            onChange={(e) => setProductSlug(e.currentTarget.value)}
                        />
                    </Group>
                    <Textarea
                            label="Mô tả ngắn"
                            withAsterisk
                            placeholder=""
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.currentTarget.value)}
                    />
                    <Textarea
                            label="Mô tả "
                            withAsterisk
                            resize="vertical"
                            value={fullDescription}
                            onChange={(e) => setFullDescription(e.currentTarget.value)}
                    />
                    <div>
                        <Text fw={500}>Hình sản phẩm </Text>
                        <DropzoneComponent setSelectedFiles={setSelectedFiles} />
                    </div>
                    <Flex justify={"flex-start"} direction={"column"}>
                        <Text fw={500}>Thuộc tính của sản phẩm </Text>
                        <Text>Thêm thuộc tính sản phẩm </Text>
                        <Button variant="outline" fullWidth my="10" onClick={openCategoryModal}>
                            {selectedCategory ? 
                            `Đã chọn Ngành hàng : ${selectedCategory.name}` : 'Chọn thuộc tính sản phẩm theo ngành hàng'}
                        </Button>
                    </Flex>
                    {selectedCategory && (
                        <div>
                            
                            <Breadcrumbs mb={20}>
                            {breadcrumbs.map((item, index) => (
                                <Anchor key={item.id} onClick={() => handleBreadcrumbClick(index)}>
                                    {item.title} 
                                </Anchor>
                            ))}
                            {selectedCategory.name}
                            </Breadcrumbs>
                            
                            {isLoading ? (
                                <Loader size="sm" />
                            ) : (
                                <AttributesList attributes={attributes} />
                            )}
                        </div>
                    )}
                    <Modal 
                        opened={isCategoryModalOpen} 
                        onClose={closeCategoryModal} 
                        overlayProps={{
                            backgroundOpacity: 0.55,
                            blur: 3,
                        }}
                        size={"100%"}
                        withCloseButton={false}
                        h={500}
                    >
                        {selectedCategory && breadcrumbs[breadcrumbs.length - 1].id !== selectedCategory.id && (
                            <Anchor onClick={() => handleBreadcrumbClick(breadcrumbs.length)}>
                                {selectedCategory.name}
                            </Anchor>
                        )}
                        {isLoading ? (
                            <Loader size="xl" className="mx-auto" />
                        ) : breadcrumbs.length > 1 ? (
                            renderSubcategories()
                        ) : (
                            renderCategories()
                        )}            
                    </Modal>
                    
                    <ProductClassification onDataChange={handleClassificationDataChange} />
                    <Button 
                        onClick={handleSubmit} 
                        loading={isSubmitting}
                        disabled={!productName || !selectedCategory}
                    >
                        {isSubmitting ? 'Đang tạo sản phẩm...' : 'Tạo sản phẩm'}
                    </Button>
                </Stack>
            </Paper>
        </div>
    </>
}