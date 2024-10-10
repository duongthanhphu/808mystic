import { useState, useEffect } from 'react';
import { Paper, Title, Grid, Transition, TextInput, Select, Text, Button, Stack } from '@mantine/core';
import axios from 'axios';
import ResourceURL from '../../Constants/ResourseUrl';
import DropzoneComponent from '../../Components/Dropzone';
export default function BrandManage() {
    const [visible, setVisible] = useState([false, false, false, false]);
    const [options, setOptions] = useState([]);
    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState(null);
    const [item, setItem] = useState(null);
    const [attributes, setAttributes] = useState([]);
const [hasClassification, setHasClassification] = useState(false);
    useEffect(() => {
        if (isCategoryFullySelected()) {
            const timers = [1, 2, 3].map((_, i) => {
                return setTimeout(() => {
                    setVisible((prev) => {
                        const newVisible = [...prev];
                        newVisible[i + 1] = true;
                        return newVisible;
                    });
                }, (i + 1) * 100);
            });

            return () => timers.forEach((timer) => clearTimeout(timer));
        }
    }, [category, subcategory, item]);

    const fetchCategories = async () => {
        try {
            const resp = await axios.get(ResourceURL.CATEGORY + '/level/' + 1);
            const categories = resp.data.categories;
            const formattedData = categories.map((category) => ({
                value: category.id.toString(),
                label: category.name,
                childCategories:
                    category.childCategories?.map((sub) => ({
                        value: sub.id.toString(),
                        label: sub.name,
                        childCategories:
                            sub.childCategories?.map((subsub) => ({
                                value: subsub.id.toString(),
                                label: subsub.name,
                            })) || [],
                    })) || [],
            }));
            setOptions(formattedData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryChange = (value) => {
        setCategory(value);
        setSubcategory(null);
        setItem(null);
        setVisible([true, false, false, false]);
        fetchAttributes(value);
    };

    const handleSubcategoryChange = (value) => {
        setSubcategory(value);
        setItem(null);
    };

    const fetchAttributes = async (categoryId) => {
        try {
            const response = await axios.get(`${ResourceURL.CATEGORY}/${categoryId}/attributes`);
            setAttributes(response.data.categories);
            
            response.data.categories[0].value[0].originName.map(option => console.log(option.name))
        } catch (error) {
            console.error('Error fetching attributes:', error);
        }
    };

    const selectedCategory = options.find((opt) => opt.value === category);
    const selectedSubcategory = selectedCategory?.childCategories.find(
        (sub) => sub.value === subcategory
    );
    const selectedItem = selectedSubcategory?.childCategories.find(
        (itm) => itm.value === item
    );

    const isCategoryFullySelected = () => {
        // if (!category) return false;
        // if (selectedCategory?.childCategories.length > 0 && !subcategory) return false;
        // if (selectedSubcategory?.childCategories.length > 0 && !item) return false;
        return true;
    };

    const getFinalPath = () => {
        const path = [];
        if (selectedCategory) path.push(selectedCategory.label);
        if (selectedSubcategory) path.push(selectedSubcategory.label);
        if (selectedItem) path.push(selectedItem.label);
        return path.join(' / ');
    };

    const renderDynamicForm = () => {
        return attributes.map((attribute) => {
            switch (attribute.formType) {
                case 'Select': {
                    const options = attribute.value[0]?.originName || [];
                    return (
                        <Select
                            key={attribute.id}
                            label={attribute.formName}
                            placeholder={`Select ${attribute.formName}`}
                            data={options.map((item) => ({
                                value: item.id.toString(),
                                label: item.name,
                            }))}
                            required={attribute.require}
                        />
                    );
                }
                default: {
                    return (
                        <TextInput
                            key={attribute.id}
                            label={attribute.formName}
                            placeholder={`Enter ${attribute.formName}`}
                            required={attribute.require}
                        />
                    );
                }
            }
        });
    };
    const renderClassification = () => {
    if (hasClassification) {
        return (
            <div>
                <TextInput
                    label="Tên phân loại"
                    placeholder="Nhập tên phân loại"
                />
                <TextInput
                    label="Tuỳ chọn"
                    placeholder="Nhập tuỳ chọn"
                />
            </div>
        );
    } else {
        return (
            <div>
                <Button onClick={() => setHasClassification(true)}>Thêm phân loại hàng</Button>
                <div>
                    <TextInput
                    label="Giá"
                    placeholder="Nhập giá tiền"
                    />
                    <TextInput
                        label="Kho hàng"
                        placeholder="Nhập số lượng"
                    />
                </div>
            </div>
        );
    }
}
    return (
        <>
            <Title order={2} mb="md">
                Thêm sản phẩm
            </Title>
            <Grid grow>
                <Grid.Col span={4}>
                    <Paper shadow="xs" p="xl">
                        <Title order={4}>Thông tin sản phẩm</Title>
                        <TextInput
                            label="Đặt tên cho sản phẩm"
                            placeholder="Đặt tên cho sản phẩm"
                        />
                        <Stack className='my-3' gap="xs">
                            <Text>Chọn hình ảnh cho sản phẩm</Text>
                            <DropzoneComponent />
                        </Stack>
                        
                        <Select
                            label="Ngành hàng"
                            placeholder="Chọn ngành hàng"
                            value={category}
                            onChange={handleCategoryChange}
                            data={options.map((option) => ({
                                value: option.value,
                                label: option.label,
                            }))}
                        />
                        {selectedCategory?.childCategories.length > 0 && (
                            <Select
                                label="Ngành hàng cấp 2"
                                placeholder="Chọn ngành hàng cấp 2"
                                value={subcategory}
                                onChange={handleSubcategoryChange}
                                data={selectedCategory.childCategories.map((sub) => ({
                                    value: sub.value,
                                    label: sub.label,
                                }))}
                            />
                        )}
                        {selectedSubcategory?.childCategories.length > 0 && (
                            <Select
                                label="Ngành hàng cấp 3"
                                placeholder="Chọn ngành hàng cấp 3"
                                value={item}
                                onChange={setItem}
                                data={selectedSubcategory.childCategories.map((subsub) => ({
                                    value: subsub.value,
                                    label: subsub.label,
                                }))}
                            />
                        )}
                        <Text>Ngành hàng đang chọn : {getFinalPath()}</Text>
                    </Paper>
                </Grid.Col>

                {isCategoryFullySelected() && (
                    <>
                        <Grid.Col span={4}>
                            <Transition
                                transition="fade-right"
                                duration={400}
                                timingFunction="ease"
                                mounted={visible[1]}
                            >
                                {(styles) => (
                                    <Paper shadow="xs" p="xl" style={styles}>
                                    <Title order={4}>Thông tin chi tiết</Title>
                                    {renderDynamicForm()}
                                    </Paper>
                                )}
                            </Transition>
                        </Grid.Col>

                        <Grid.Col span={10}>
                            <Transition
                                transition="fade-right"
                                duration={400}
                                timingFunction="ease"
                                mounted={visible[2]}
                            >
                                {(styles) => (
                                    <Paper shadow="xs" p="xl" style={styles}>
                                        <Title order={4}>Thông tin bán hàng</Title>
                                        {renderClassification()}
                                    </Paper>
                                )}
                            </Transition>
                        </Grid.Col>

                        <Grid.Col span={10}>
                            <Transition
                                transition="fade-right"
                                duration={400}
                                timingFunction="ease"
                                mounted={visible[3]}
                            >
                                {(styles) => (
                                    <Paper shadow="xs" p="xl" style={styles}>
                                        4
                                    </Paper>
                                )}
                            </Transition>
                        </Grid.Col>
                    </>
                )}
            </Grid>
        </>
    );
}