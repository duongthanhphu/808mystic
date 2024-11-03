import React, { useEffect, useState } from "react";
import {
  Badge,
  Paper,
  Button,
  Text,
  Divider,
  Stack,
  Input,
  Table,
  Group,
  Modal,
  Switch,
  Fieldset,
  Select,
  TextInput,
  ActionIcon,
  Checkbox,
} from "@mantine/core";
import { randomId, useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { getRandomColor } from "../../Types/ColorPalate";
import { IconChevronLeft, IconPlus, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import "./CategoryCreate.css";
interface Category {
  id: string;
  name: string;
  childCategories?: Category[];
}

interface SelectedCategoryInfo {
  id: string;
  name: string;
  path: string[];
}
interface AttributeDetail {
  id: number;
  name: string;
}

interface AttributeValue {
  [key: string]: AttributeDetail[];
}

interface CategoryAttribute {
  id: number;
  categoryId: number;
  name: string;
  value: AttributeValue[];
  formName: string | null;
  formType: string | null;
  slug: string | null;
  require: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const CategoryBadge: React.FC<{
  category: Category;
  onSelect: (category: Category) => void;
  isSelected: boolean;
}> = ({ category, onSelect, isSelected }) => (
  <Badge
    key={category.id}
    color={getRandomColor()}
    variant={isSelected ? "filled" : "light"}
    radius="lg"
    onClick={() => onSelect(category)}
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
  <div className="w-1/3">
    <div className="flex gap-2 items-center mb-5">
      {onBack && <IconChevronLeft onClick={onBack}></IconChevronLeft>}
      <h3 className=" text-lg font-semibold">
        {currentPath.length > 0
          ? `Ngành hàng  ${currentPath[currentPath.length - 1]}`
          : "Ngành hàng chính"}
      </h3>
    </div>
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => (
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

export default function CategoryCreate() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategories, setCurrentCategories] = useState<Category[]>([]);
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<SelectedCategoryInfo | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  // const [attributes, setAttributes] = useState([]);
  const [attributeName, setAttributeName] = useState("");
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const attributeForm = useForm({
    initialValues: {
      attributeSets: [
        {
          details: [
            {
              name: "originName", // Giá trị mặc định
              value: "",
              key: randomId(),
            },
          ],
        },
      ],
      formType: "Select",
      required: true,
    },
  });
  // const attributeForm = useForm({
  //   mode: "uncontrolled",
  //   initialValues: {
  //     details: [{ name: "", value: "", key: randomId() }],
  //     file: null,
  //     formType: "Select",
  //     required: true,
  //     attributeSets: [{ details: [{ name: "", value: "", key: randomId() }] }], // Add this line
  //   },
  // });

  // const handleAddAttributeSet = () => {
  //   attributeForm.insertListItem("attributeSets", {
  //     details: [{ name: "", value: "", key: randomId() }],
  //   });
  // };

  // const handleAddDetail = (setIndex: number) => {
  //   const firstDetail = attributeForm.values.attributeSets[setIndex].details[0];
  //   attributeForm.insertListItem(`attributeSets.${setIndex}.details`, {
  //     name: firstDetail.name,
  //     value: "",
  //     key: randomId(),
  //   });
  // };
const handleAddDetail = (setIndex: number) => {
  attributeForm.insertListItem(`attributeSets.${setIndex}.details`, {
    name: "originName", // Giữ nguyên tên khi thêm value mới
    value: "",
    key: randomId(),
  });
};
  useEffect(() => {
    loadCategoriesFromServer();
  }, []);

  const loadCategoriesFromServer = async () => {
    try {
      const categoriesResp = await axios.get(
        "http://localhost:4000/api/v1/categories/level/1"
      );
      if (categoriesResp.status === 200 && categoriesResp.statusText === "OK") {
        const categoriesFromServer = categoriesResp.data.categories.data;
        setCategories(categoriesFromServer);
        setCurrentCategories(categoriesFromServer);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategorySelect = (category: Category) => {
    const newPath = [...categoryPath, category.name];
    setSelectedCategory({
      id: category.id,
      name: category.name,
      path: newPath,
    });

    if (category.childCategories && category.childCategories.length > 0) {
      setCurrentCategories(category.childCategories);
      setCategoryPath(newPath);
    }
  };

  const handleBack = () => {
    if (categoryPath.length > 0) {
      const newPath = [...categoryPath];
      newPath.pop();
      setCategoryPath(newPath);

      let newCurrentCategories = categories;
      for (const categoryName of newPath) {
        const category = newCurrentCategories.find(
          (c) => c.name === categoryName
        );
        if (category && category.childCategories) {
          newCurrentCategories = category.childCategories;
        }
      }
      setCurrentCategories(newCurrentCategories);

      if (newPath.length > 0) {
        const parentCategory = newCurrentCategories.find(
          (c) => c.name === newPath[newPath.length - 1]
        );
        if (parentCategory) {
          setSelectedCategory({
            id: parentCategory.id,
            name: parentCategory.name,
            path: newPath,
          });
        }
      } else {
        setSelectedCategory(null);
      }
    }
  };

  const submitAttributeForm = async (values) => {
    try {
      // Format lại value để phù hợp với cấu trúc JSON trong database
      const formattedValue = values.attributeSets.map((set) => {
        const attributeName = set.details[0].name;
        const attributeValues = set.details.map((detail, index) => ({
          id: index + 1,
          name: detail.value,
        }));

        return {
          [attributeName]: attributeValues,
        };
      });

      // Payload cho API
      const payload: Partial<CategoryAttribute> = {
        name: attributeName,
        categoryId: Number(selectedCategory.id),
        value: formattedValue,
        formName: attributeName,
        formType: values.formType,
        require: values.required,
        slug: attributeName.toLowerCase().replace(/ /g, "-"),
        status: "available",
      };

      const response = await axios.post(
        "http://localhost:4000/api/v1/categories/categoryAttributes/",
        payload
      );
      console.log(response.data.data);
      
      // Cập nhật state với response từ API
      setAttributes((prev) => [...prev, response.data.data]);

      close();
      setAttributeName("");
      attributeForm.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Paper shadow="sm" my={20} p={15}>
      <CategoryList
        categories={currentCategories}
        onSelect={handleCategorySelect}
        onBack={categoryPath.length > 0 ? handleBack : undefined}
        currentPath={categoryPath}
        selectedCategory={selectedCategory}
      />
      {selectedCategory && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <Text>{selectedCategory.path.join(" \\ ")}</Text>
        </div>
      )}

      <Divider my="xs" label="Thuộc tính ngành hàng" labelPosition="center" />
      <Stack>
        <Input.Wrapper
          label="Tên thuộc tính"
          description="Ví dụ : Thương hiệu, Xuất xứ ... của sản phẩm"
        >
          <Input
            placeholder="Nhập tên thuộc tính"
            value={attributeName}
            onChange={(e) => setAttributeName(e.currentTarget.value)}
          />
        </Input.Wrapper>
        <Button
          variant="outline"
          gradient={{ from: "blue", to: "cyan", deg: 96 }}
          leftSection={<IconPlus size={18} />}
          onClick={open}
        >
          Thêm thông tin chi tiết cho thuộc tính
        </Button>
        <Modal
          opened={opened}
          onClose={close}
          title="Thêm thông tin chi tiết"
          centered
          size="lg"
        >
          <form
            onSubmit={attributeForm.onSubmit((values) =>
              submitAttributeForm(values)
            )}
          >
            <Stack>
              <Fieldset>
                {attributeForm.values.attributeSets.map((attrSet, setIndex) => (
                  <div key={setIndex} className="attribute-tree mb-4">
                    <div className="attribute-line" />
                    <div className="attribute-set">
                      {setIndex > 0 && <Divider my="sm" />}
                      <Group align="start" noWrap className="attribute-group">
                        <TextInput
                            label="Tên chi tiết thuộc tính"
                            placeholder="Nhập tên chi tiết thuộc tính"
                            {...attributeForm.getInputProps(
                                `attributeSets.${setIndex}.details.0.name`
                            )}
                            withAsterisk
                            style={{ flex: 1 }}
                            disabled
                            onChange={(event) => {
                                const value = event.currentTarget.value;
                                attributeForm.setFieldValue(
                                `attributeSets.${setIndex}.details.0.name`,
                                value
                                );
                                attrSet.details.forEach((_, i) => {
                                if (i !== 0) {
                                    attributeForm.setFieldValue(
                                    `attributeSets.${setIndex}.details.${i}.name`,
                                    value
                                    );
                                }
                                });
                            }}
                        />

                        <Stack style={{ flex: 1 }} className="values-tree pt-9">
                          {attrSet.details.map((detail, index) => (
                            <Group key={detail.key} className="value-item">
                              <div className="value-line" />
                              <TextInput
                                label={index === 0 ? "Giá trị thuộc tính" : ""}
                                placeholder="Nhập giá trị thuộc tính"
                                {...attributeForm.getInputProps(
                                  `attributeSets.${setIndex}.details.${index}.value`
                                )}
                                withAsterisk
                                style={{ flex: 1 }}
                              />
                              <ActionIcon
                                color="red"
                                onClick={() =>
                                  attributeForm.removeListItem(
                                    `attributeSets.${setIndex}.details`,
                                    index
                                  )
                                }
                                style={{
                                  marginTop: index === 0 ? "24px" : "0",
                                }}
                              >
                                <IconTrash size="1rem" />
                              </ActionIcon>
                            </Group>
                          ))}
                        </Stack>
                      </Group>
                      <div className="flex justify-end mr-10">
                        <Button
                          onClick={() => handleAddDetail(setIndex)}
                          variant="light"
                          size="sm"
                          mt="xs"
                        >
                          Thêm giá trị thuộc tính
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* <Group className="pt-3 pr-20" position="apart">
                  <Button variant="light" onClick={handleAddAttributeSet} disabled>
                    Thêm thuộc tính
                  </Button>
                </Group> */}
              </Fieldset>

              <Select
                label="Loại form"
                {...attributeForm.getInputProps("formType")}
                data={[
                  { value: "Select", label: "Select" },
                  { value: "Input", label: "Input" },
                  { value: "Checkbox", label: "Checkbox" },
                ]}
              />
              <Switch
                label="Bắt buộc"
                {...attributeForm.getInputProps("required", {
                  type: "checkbox",
                })}
              />
              {/* Preview section */}
              <div>
                <Text
                  size="md"
                  fw={900}
                  variant="gradient"
                  gradient={{ from: "violet", to: "grape", deg: 154 }}
                  className="text-center pt-2"
                >
                  Xem trước thuộc tính
                </Text>

                {attributeForm.values.formType === "Select" && (
                  <Select
                    label={attributeName || "Tên thuộc tính"}
                    placeholder={`Chọn ${attributeName}`}
                    data={attributeForm.values.attributeSets[0].details
                      .map((detail) => ({
                        value: detail.value,
                        label: detail.value,
                      }))
                      .filter((item) => item.value !== "")}
                  />
                )}

                {attributeForm.values.formType === "Input" && (
                  <TextInput
                    label={attributeName || "Tên thuộc tính"}
                    placeholder={`Nhập ${attributeName}`}
                    disabled
                  />
                )}

                {attributeForm.values.formType === "Checkbox" && (
                  <div>
                    <Text size="sm" weight={500} mb={8}>
                      {attributeName || "Tên thuộc tính"}
                    </Text>
                    <Stack spacing="xs">
                      {attributeForm.values.attributeSets[0].details
                        .filter((detail) => detail.value !== "")
                        .map((detail, index) => (
                          <Checkbox key={index} label={detail.value} disabled />
                        ))}
                    </Stack>
                  </div>
                )}
              </div>
              <Group mt="md">
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
                  <Table.Td>{attr.require ? "Có" : "Không"}</Table.Td>
                  <Table.Td>{JSON.stringify(attr.value)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Stack>
      <Group justify="space-between">
        <Button variant="filled" color="gray">
          Huỷ
        </Button>
        <Button>Lưu</Button>
      </Group>
    </Paper>
  );
}
