import { useState, useEffect } from 'react';
import { Paper, Title, Grid, Transition, TextInput, Select, Text } from '@mantine/core';
import axios from 'axios';
import ResourceURL from '../../Constants/ResourseUrl';

export default function BrandManage() {
    const [visible, setVisible] = useState([false, false, false, false]);
    const [options, setOptions] = useState([]);
    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState(null);
    const [item, setItem] = useState(null);

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
            console.log(categories);
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
    };

    const handleSubcategoryChange = (value) => {
        setSubcategory(value);
        setItem(null);
    };

    const selectedCategory = options.find((opt) => opt.value === category);
    const selectedSubcategory = selectedCategory?.childCategories.find(
        (sub) => sub.value === subcategory
    );
    const selectedItem = selectedSubcategory?.childCategories.find(
        (itm) => itm.value === item
    );

    const isCategoryFullySelected = () => {
        if (!category) return false;
        if (selectedCategory?.childCategories.length > 0 && !subcategory) return false;
        if (selectedSubcategory?.childCategories.length > 0 && !item) return false;
        return true;
    };

    const getFinalPath = () => {
        const path = [];
        if (selectedCategory) path.push(selectedCategory.label);
        if (selectedSubcategory) path.push(selectedSubcategory.label);
        if (selectedItem) path.push(selectedItem.label);
        return path.join(' / ');
    };

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
                                        2
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
                                        3
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