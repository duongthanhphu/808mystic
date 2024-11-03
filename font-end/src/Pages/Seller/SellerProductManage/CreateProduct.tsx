import React, { useState, useEffect, ContextType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Paper, Stack, Group, Button, TextInput, Textarea, Select, Badge, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { IconChevronLeft } from '@tabler/icons-react';
import DropzoneComponent from "../../../Components/Dropzone";
import { ProductClassification, ProductClassificationData } from '../../Product/ProductClassification.tsx';
import { useOutletContext } from 'react-router-dom';

interface Category {
    id: string;
    name: string;
    childCategories?: Category[];
}

interface Attribute {
    id: number;
    name: string;
    formType: string;
    value: { originName: { id: number; name: string }[] }[];
    slug: string;
    require: boolean;
}

interface SelectedCategoryInfo {
    id: string;
    name: string;
    path: string[];
}

const CategoryBadge: React.FC<{
        category: Category;
        onSelect: (category: Category) => void;
        isSelected: boolean;
    }> = ({ category, onSelect, isSelected }) => (
    <Badge
        onClick={() => onSelect(category)}
        style={{ cursor: 'pointer' }}
        color={isSelected ? 'blue' : 'gray'}
    >
        {category.name}
    </Badge>
);

const CategoryList: React.FC<{
        categories: Category[];
        onSelect: (category: Category) => void;
        onBack?: () => void;
        currentPath: string[];
        selectedCategory: SelectedCategoryInfo | null;
    }> = ({ categories, onSelect, onBack, currentPath, selectedCategory }) => (
    <div className='w-full'>
        <div className='flex gap-2 items-center mb-5'>
        {onBack && (
            <IconChevronLeft onClick={onBack} style={{ cursor: 'pointer' }} />
        )}
        <h3 className='text-lg font-semibold'>
            {currentPath.length > 0 ? `Ngành hàng ${currentPath[currentPath.length - 1]}` : 'Ngành hàng chính'}
        </h3>
        </div>
        <div className='flex flex-wrap gap-2 mb-4'>
        {Array.isArray(categories) && categories.map((category) => (
            <CategoryBadge 
            key={category.id} 
            category={category} 
            onSelect={onSelect}
            isSelected={selectedCategory?.id === category.id}
            />
        ))}
        </div>
    </div>
);

export default function CreateProduct() {
    const navigate = useNavigate();
    const { userId } = useOutletContext<{ userId: string }>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [currentCategories, setCurrentCategories] = useState<Category[]>([]);
    const [categoryPath, setCategoryPath] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<SelectedCategoryInfo | null>(null);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [classificationData, setClassificationData] = useState<ProductClassificationData | null>(null);
    const form = useForm({
        initialValues: {
            productName: '',
            productCode: '',
            productSlug: '',
            shortDescription: '',
            fullDescription: '',
            selectedFiles: [],
            categoryId: '',
            classificationGroups: [],
            classifications: [],
            quantity: undefined,
            stock: undefined,
        },
        validate: {
            productName: (value) => (value ? null : 'Tên sản phẩm là bắt buộc'),
            productSlug: (value) => (value ? null : 'Slug sản phẩm là bắt buộc'),
            shortDescription: (value) => (value ? null : 'Mô tả ngắn là bắt buộc'),
            fullDescription: (value) => (value ? null : 'Mô tả chi tiết là bắt buộc'),
            selectedFiles: (value) => (value.length > 0 ? null : 'Cần ít nhất một hình ảnh'),
            categoryId: (value) => (value ? null : 'Vui lòng chọn ngành hàng'),
        },
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/v1/categories/level/1');
            if (Array.isArray(response.data.categories.data)) {
                setCategories(response.data.categories.data);
                setCurrentCategories(response.data.categories.data);
            } else {
                console.error('Dữ liu categories không phải là mng:', response.data.categories);
                setCategories([]);
                setCurrentCategories([]);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách ngành hàng:', error);
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải danh sách ngành hàng',
                color: 'red',
            });
        }
    };

    const fetchAttributes = async (categoryId: string) => {
        try {
            console.log('Đang tải thuộc tính cho danh mục:', categoryId);
            const response = await axios.get(`http://localhost:4000/api/v1/categories/${categoryId}/attributes?page=1&pageSize=10`);
            console.log('Dữ liệu trả về từ API:', response.data);

            if (!response.data || !Array.isArray(response.data.data)) {
                console.error('Dữ liệu thuộc tính không hợp lệ:', response.data);
                notifications.show({
                    title: 'Lỗi',
                    message: 'Dữ liệu thuộc tính không hợp lệ',
                    color: 'red',
                });
                return;
            }

            setAttributes(response.data.data);
            
            // Thêm các trường thuộc tính vào form
            const newFormFields = {};
            response.data.data.forEach(attr => {
                newFormFields[attr.slug] = '';
                console.log(`Đã thêm trường ${attr.slug} vào form`);
            });
            form.setValues(prevValues => ({ ...prevValues, ...newFormFields }));
            
            // Thêm validation cho các trường thuộc tính bắt buộc
            const newValidators = { ...form.validate };
            response.data.data.forEach(attr => {
                if (attr.require) {
                    newValidators[attr.slug] = (value) => (value ? null : `${attr.name} là bắt buộc`);
                    console.log(`Đã thêm validation cho trường ${attr.slug}`);
                }
            });
            
            // Cập nhật validate object của form
            form.validate = newValidators;

            console.log('Đã cập nhật form với các thuộc tính mới');
        } catch (error) {
            console.error('Lỗi khi tải thuộc tính:', error);
            if (axios.isAxiosError(error)) {
                console.error('Lỗi Axios:', error.response?.data);
            }
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải thuộc tính ngành hàng: ' + (error.response?.data?.message || error.message),
                color: 'red',
            });
        }
    };

    const handleCategorySelect = (category: Category) => {
        if (category.childCategories && category.childCategories.length > 0) {
            setCurrentCategories(category.childCategories);
            setCategoryPath(prevPath => [...prevPath, category.name]);
        } else {
            setSelectedCategory({
                id: category.id,
                name: category.name,
                path: [...categoryPath, category.name]
            });
            form.setFieldValue('categoryId', category.id);
            fetchAttributes(category.id);
        }
    };

    const handleBack = () => {
        if (categoryPath.length > 0) {
            const newPath = [...categoryPath];
            newPath.pop();
            setCategoryPath(newPath);
            if (newPath.length === 0) {
                setCurrentCategories(categories);
            } else {
                // Tìm danh mục cha dựa trên đường dẫn hiện tại
                let parentCategory = categories;
                for (let i = 0; i < newPath.length - 1; i++) {
                    parentCategory = parentCategory.find(cat => cat.name === newPath[i])?.childCategories || [];
                }
                setCurrentCategories(parentCategory);
            }
            setSelectedCategory(null);
        }
    };

    const handleClassificationDataChange = (data: ProductClassificationData) => {
        setClassificationData(data);
        form.setFieldValue('classificationGroups', data.classificationGroups);
        form.setFieldValue('classifications', data.classifications);
        if (data.quantity !== undefined) form.setFieldValue('quantity', data.quantity);
        if (data.stock !== undefined) form.setFieldValue('stock', data.stock);
    };

    const handleSubmit = async (values: typeof form.values) => {
        console.log('handleSubmit called');
        console.log('Form values:', values);
        try {
            const formData = new FormData();

            formData.append('name', values.productName);
            formData.append('categoryId', selectedCategory?.id || '');
            formData.append('sellerId', userId); 
            formData.append('shortDescription', values.shortDescription);
            formData.append('longDescription', values.fullDescription);
            formData.append('slug', values.productSlug);
            formData.append('status', 'ACTIVE');
            formData.append('hasClassification', classificationData ? 'true' : 'false');
            const attributeValues = attributes.map((attr) => {
            const selectedValue = values[attr.slug];
            if (selectedValue) {
                const [attrId, valueId] = selectedValue.split('_').map(Number);
                return {
                    categoryAttributeId: attrId,
                    categoryAttributeValueId: valueId,
                    value: { originName: { id: valueId } }
                };
            }
                return null;
            }).filter(Boolean);
            formData.append('attributeValues', JSON.stringify(attributeValues));

            if (classificationData) {
                formData.append('classificationGroups', JSON.stringify(classificationData.classificationGroups));
                formData.append('productClassifications', JSON.stringify(classificationData.classifications));
            }

            values.selectedFiles.forEach((file) => {
                formData.append('images', file);
            });

            console.log('Request data:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            console.log(Array.isArray(JSON))
            console.log(formData)
            const response = await axios.post('http://localhost:4000/api/v1/products/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Response:', response.data);

            if (response.status === 201) {
                notifications.show({
                    title: 'Thành công',
                    message: 'Sản phẩm đã được tạo thành công',
                    color: 'green',
                });
                navigate('/seller/product');
            } else {
                throw new Error(response.data.message || 'Có lỗi xảy ra khi tạo sản phẩm');
            }
        } catch (error) {
            console.error('Lỗi khi tạo sản phẩm:', error);
            let errorMessage = 'Có lỗi xảy ra khi tạo sản phẩm';
            if (axios.isAxiosError(error) && error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                errorMessage = error.response.data.message || errorMessage;
            }
            notifications.show({
                title: 'Lỗi',
                message: errorMessage,
                color: 'red',
            });
        }
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <div className="w-full max-w-3xl mx-auto">
                <Title order={3}>Thêm sản phẩm</Title>
                <Paper shadow="sm" my={20} p={15}>
                    <Stack gap="md">
                        <CategoryList
                            categories={currentCategories}
                            onSelect={handleCategorySelect}
                            onBack={categoryPath.length > 0 ? handleBack : undefined}
                            currentPath={categoryPath}
                            selectedCategory={selectedCategory}
                        />
                        {selectedCategory && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-md">
                                <Text>{selectedCategory.path.join(' \\ ')}</Text>
                            </div>
                        )}
                        <TextInput
                            label="Tên sản phẩm"
                            withAsterisk
                            placeholder="Nhập tên sản phẩm"
                            {...form.getInputProps('productName')}
                        />
                        <Group grow>
                            <TextInput
                                label="Mã sản phẩm"
                                placeholder="Nhập mã sản phẩm"
                                {...form.getInputProps('productCode')}
                            />
                            <TextInput
                                label="Slug sản phẩm"
                                withAsterisk
                                placeholder="Nhập slug sản phẩm"
                                {...form.getInputProps('productSlug')}
                            />
                        </Group>
                        <Textarea
                            label="Mô tả ngắn"
                            withAsterisk
                            placeholder="Nhập mô tả ngắn"
                            {...form.getInputProps('shortDescription')}
                        />
                        <Textarea
                            label="Mô tả chi tiết"
                            withAsterisk
                            placeholder="Nhập mô tả chi tiết"
                            {...form.getInputProps('fullDescription')}
                        />
                        <DropzoneComponent 
                            setSelectedFiles={(files) => form.setFieldValue('selectedFiles', files)} 
                        />
                        <div className='grid grid-cols-2 gap-2'>
                            {attributes.map(attr => (
                            attr.formType === 'Select' ? (
                                <Select
                                    key={attr.id}
                                    label={attr.name}
                                    placeholder={`Chọn ${attr.name.toLowerCase()}`}
                                    data={attr.value[0].originName.map((v, index) => ({ 
                                        value: `${attr.id}_${v.id}_${index}`,
                                        label: v.name 
                                    }))}
                                    {...form.getInputProps(attr.slug)}
                                    required={attr.require}
                                />
                                ) : null
                            ))}
                        </div>
                        <ProductClassification onDataChange={handleClassificationDataChange} />
                        <Button type="submit" >
                            Tạo sản phẩm
                        </Button>
                    </Stack>
                </Paper>
            </div>
        </form>
    );
}
