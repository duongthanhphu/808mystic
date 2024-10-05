import React, { useEffect, useState } from 'react';
import { Title, Stack, Select, Paper, Text, Divider, Input, Button, Table, FileInput, Group, Fieldset, TextInput, ActionIcon, Switch, Modal } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { randomId, useDisclosure } from '@mantine/hooks';
import axios from 'axios';
import ResourceURL from '../../Constants/ResourseUrl';

const CategoryManage = () => {
  const [options, setOptions] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [item, setItem] = useState(null);
  const [attributeName, setAttributeName] = useState('');
  const [attributes, setAttributes] = useState([]);

  const [opened, { open, close }] = useDisclosure(false);

  const modalForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      details: [{ name: '', value: '', key: randomId() }],
      file: null,
      formType: 'Select',
      required: true,
    },
  });

  const fetchCategories = async () => {
    try {
      const resp = await axios.get(ResourceURL.CATEGORY + '/level/' + 1);
      const categories = resp.data.categories;
      const formattedData = categories.map((category) => ({
        value: category.id.toString(),
        label: category.name,
        childCategories: category.childCategories?.map((sub) => ({
          value: sub.id.toString(),
          label: sub.name,
          childCategories: sub.childCategories?.map((subsub) => ({
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
  };

  const handleSubcategoryChange = (value) => {
    setSubcategory(value);
    setItem(null);
  };

  const selectedCategory = options.find(opt => opt.value === category);
  const selectedSubcategory = selectedCategory?.childCategories.find(sub => sub.value === subcategory);
  const selectedItem = selectedSubcategory?.childCategories.find(itm => itm.value === item);

  const getFinalPath = () => {
    const path = [];
    if (selectedCategory) path.push(selectedCategory.label);
    if (selectedSubcategory) path.push(selectedSubcategory.label);
    if (selectedItem) path.push(selectedItem.label);
    return path.join(' / ');
  };

  const submitAttributeForm = async (values) => {
    try {
      const payload = {
        name: attributeName,
        categoryId: parseInt(item || subcategory || category),
        value: values.details.map(detail => ({
          [detail.name]: detail.value
        })),
        formName: attributeName,
        formType: values.formType,
        require: values.required,
        slug: attributeName.toLowerCase().replace(/ /g, '-')
      };

      const response = await axios.post('http://localhost:4000/api/v1/categories/categoryAttributes/', payload);
      console.log('API Response:', response.data.data);

      setAttributes([...attributes, response.data.data]);
      setAttributeName('');
      modalForm.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderFieldSet = () => {
    return modalForm.values.details.map((detail, index) => (
      <Group key={detail.key} >
        <TextInput
          label="Tên chi tiết thuộc tính"
          placeholder="Nhập tên chi tiết thuộc tính"
          {...modalForm.getInputProps(`details.${index}.name`)}
          withAsterisk
          style={{ flex: 1 }}
        />
        <TextInput
          label="Giá trị thuộc tính"
          placeholder="Nhập giá trị thuộc tính"
          {...modalForm.getInputProps(`details.${index}.value`)}
          withAsterisk
          style={{ flex: 1 }}
        />
        <ActionIcon color="red" onClick={() => {
          modalForm.removeListItem('details', index);
        }}>
          <IconTrash size="1rem" />
        </ActionIcon>
      </Group>
    ));
  };

  return (
    <Paper p="md">
      <Title order={2} mb="md">Quản lý danh mục</Title>
      <Paper shadow="xs" p="xl">
        <Stack>
          <Text>Ngành hàng đang chọn : {getFinalPath()}</Text>
          <Select
            label="Ngành hàng"
            placeholder="Chọn ngành hàng"
            value={category}
            onChange={handleCategoryChange}
            data={options.map(option => ({ value: option.value, label: option.label }))}
          />
          
          {category && (
            <Select
              label="Ngành hàng cấp 2"
              placeholder="Chọn ngành hàng cấp 2"
              value={subcategory}
              onChange={handleSubcategoryChange}
              data={selectedCategory?.childCategories.map(sub => ({
                value: sub.value,
                label: sub.label,
              })) || []}
            />
          )}
          
          {subcategory && (
            <Select
              label="Ngành hàng cấp 3"
              placeholder="Chọn ngành hàng cấp 3"
              value={item}
              onChange={setItem}
              data={selectedSubcategory?.childCategories.map(subsub => ({
                value: subsub.value,
                label: subsub.label,
              })) || []}
            />
          )}

          <Divider my="xs" label="Thuộc tính ngành hàng" labelPosition="center" />
          <Stack>
            <Input.Wrapper label="Tên thuộc tính" description="Ví dụ : Thương hiệu, Xuất xứ ... của sản phẩm">
              <Input 
                placeholder="Nhập tên thuộc tính" 
                value={attributeName}
                onChange={(event) => setAttributeName(event.currentTarget.value)}
              />
            </Input.Wrapper>
            <Button
              variant="outline"
              gradient={{ from: 'blue', to: 'cyan', deg: 96 }}
              leftSection={<IconPlus size={18} />}
              onClick={open}
            >
              Thêm thông tin chi tiết cho thuộc tính 
            </Button>
            <Modal opened={opened} onClose={close} title="Thêm thông tin chi tiết">
              <form onSubmit={modalForm.onSubmit((values) => submitAttributeForm(values))}>
                  <Stack>
                    <Fieldset legend={`Tên thuộc tính: ${attributeName}`}>
                      {renderFieldSet()}
                      <Button
                        mt = {10}
                        onClick={() => {
                          modalForm.insertListItem('details', { name: '', value: '', key: randomId() });
                        }}
                        variant='light'
                      >
                        Thêm chi tiết thuộc tính
                      </Button>
                    </Fieldset>
                    <Select
                      label="Loại form"
                      {...modalForm.getInputProps('formType')}
                      data={[
                        { value: 'Select', label: 'Select' },
                        { value: 'Input', label: 'Input' },
                        { value: 'Checkbox', label: 'Checkbox' },
                      ]}
                    />
                    <Switch
                      label="Bắt buộc"
                      {...modalForm.getInputProps('required', { type: 'checkbox' })}
                    />
                    <FileInput
                      label="Thêm tệp để đọc dữ liệu"
                      accept=".exe,.json"
                      {...modalForm.getInputProps('file')}
                    />
                    <Group  mt="md">
                      <Button type="submit">Submit</Button>
                    </Group>
                  </Stack>
                </form>
            </Modal>
            
            <Table.ScrollContainer minWidth={500}>
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Tên thuộc tính</Table.Th>
                    <Table.Th>Loại form</Table.Th>
                    <Table.Th>Bắt buộc</Table.Th>
                    <Table.Th>Chi tiết</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {attributes.map((attr, index) => (
                    
                    <Table.Tr key={index}>
                      <Table.Td>{attr.name}</Table.Td>
                      <Table.Td>{attr.formType}</Table.Td>
                      <Table.Td>{attr.require ? 'Có' : 'Không'}</Table.Td>
                      <Table.Td>{JSON.stringify(attr.value)}</Table.Td>
                    </Table.Tr>
                  ))
                  
                  }
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Stack>
          <Group justify="space-between">
            <Button variant="filled" color="gray">Huỷ</Button>
            <Button>Lưu</Button>
          </Group>
        </Stack>
      </Paper>
    </Paper>
  );
};

export default CategoryManage;
