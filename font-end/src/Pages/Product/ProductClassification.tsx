import React, { useState, useEffect } from 'react';
import {
  Select,
  TextInput,
  NumberInput,
  Table,
  Box,
  Stack,
  Group,
  Text,
  Paper,
  Button
} from '@mantine/core';

interface ClassificationGroup {
  name: string;
  options: string[];
}

interface Classification {
  option1: string;
  option2?: string;
  price: number;
  stock: number;
}

interface VariantRow {
  price: number;
  stock: number;
  sku: string;
  [key: string]: string | number;
}

export interface ProductClassificationData {
  classificationGroups: {
    name: string;
    options: string[];
  }[];
  classifications: {
    option1: string;
    option2?: string;
    price: number;
    stock: number;
  }[];
}

export interface ProductClassificationProps {
  onDataChange: (data: ProductClassificationData) => void;
}

export function ProductClassification({ onDataChange }: ProductClassificationProps) {
  const [numClassifications, setNumClassifications] = useState<string | null>(null);
  const [classifications, setClassifications] = useState<{
    name: string;
    options: string[];
  }[]>([]);
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number | undefined>(undefined);
  const [variants, setVariants] = useState<VariantRow[]>([]);

  useEffect(() => {
    updateProductData();
  }, [classifications, variants, quantity, stock]);

  const updateProductData = () => {
    const classificationGroups: ClassificationGroup[] = classifications.map(c => ({
      name: c.name,
      options: c.options.filter(opt => opt !== '')
    }));

    const classificationData: Classification[] = variants.map(variant => {
      const result: Classification = {
        option1: variant[classifications[0]?.name] as string,
        price: variant.price,
        stock: variant.stock
      };
      
      if (classifications.length > 1) {
        result.option2 = variant[classifications[1].name] as string;
      }
      
      return result;
    });

    const productData: ProductClassificationData = {
      classificationGroups,
      classifications: classificationData,
    };

    if (numClassifications === '0') {
      productData.quantity = quantity;
      productData.stock = stock;
    }

    onDataChange(productData);
  };

  const handleClassificationChange = (index: number, field: 'name' | 'options', value: string) => {
    const newClassifications = [...classifications];
    if (field === 'name') {
      const oldName = newClassifications[index].name;
      newClassifications[index].name = value;
      
      // Update variant keys
      const newVariants = variants.map(variant => {
        const newVariant = { ...variant };
        if (oldName in newVariant) {
          newVariant[value] = newVariant[oldName];
          delete newVariant[oldName];
        }
        return newVariant;
      });
      setVariants(newVariants);
    } else {
      newClassifications[index].options = value.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
    }
    setClassifications(newClassifications);
    generateVariants(newClassifications);
  };

  const addOption = (classificationIndex: number) => {
    const newClassifications = [...classifications];
    newClassifications[classificationIndex].options.push('');
    setClassifications(newClassifications);
  };

  const removeOption = (classificationIndex: number, optionIndex: number) => {
    const newClassifications = [...classifications];
    newClassifications[classificationIndex].options.splice(optionIndex, 1);
    setClassifications(newClassifications);
    generateVariants(newClassifications);
  };

  const handleOptionChange = (classificationIndex: number, optionIndex: number, value: string) => {
    const newClassifications = [...classifications];
    newClassifications[classificationIndex].options[optionIndex] = value;
    setClassifications(newClassifications);
    generateVariants(newClassifications);
  };

  const generateVariants = (currentClassifications: Classification[]) => {
    if (currentClassifications.some(c => !c.name || c.options.length === 0)) {
      setVariants([]);
      return;
    }

    const generateCombinations = (arrays: string[][]): string[][] => {
      if (arrays.length === 0) return [[]];
      const result: string[][] = [];
      const remaining = generateCombinations(arrays.slice(1));
      for (const item of arrays[0]) {
        for (const combo of remaining) {
          result.push([item, ...combo]);
        }
      }
      return result;
    };

    const optionArrays = currentClassifications.map(c => c.options.filter(opt => opt !== ''));
    const combinations = generateCombinations(optionArrays);
    
    const newVariants = combinations.map(combo => {
      const variant: VariantRow = {
        price: 0,
        stock: 0,
        sku: ''
      };
      currentClassifications.forEach((classification, index) => {
        variant[classification.name] = combo[index] || '';
      });
      return variant;
    });

    setVariants(newVariants);
  };

  const handleNumClassificationsChange = (value: string | null) => {
    setNumClassifications(value);
    if (value === '0') {
      setClassifications([]);
      setVariants([]);
    } else if (value) {
      const num = parseInt(value);
      const newClassifications = Array(num).fill(null).map(() => ({ 
        name: '', 
        options: [''] 
      }));
      setClassifications(newClassifications);
    }
  };

  const renderClassificationTable = () => {
    if (numClassifications === '0' || classifications.length === 0) return null;

    return (
      <Box mt="md">
        <Text size="sm" fw={500} mb="xs">Bảng phân loại</Text>
        <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              {classifications.map((c, i) => (
                <Table.Th key={i}>{c.name || `Phân loại ${i + 1}`}</Table.Th>
              ))}
              <Table.Th>Giá phân loại</Table.Th>
              <Table.Th>Tồn kho phân loại</Table.Th>
              <Table.Th>SKU phân loại</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {variants.length > 0 ? (
              variants.map((variant, variantIndex) => (
                <Table.Tr key={variantIndex}>
                  {classifications.map((classification, classIndex) => (
                    <Table.Td key={classIndex}>{variant[classification.name]}</Table.Td>
                  ))}
                  <Table.Td>
                    <TextInput
                      value={variant.price.toString()}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[variantIndex].price = parseFloat(e.target.value) || 0;
                        setVariants(newVariants);
                      }}
                      type="number"
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      value={variant.stock.toString()}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[variantIndex].stock = parseInt(e.target.value) || 0;
                        setVariants(newVariants);
                      }}
                      type="number"
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      value={variant.sku}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[variantIndex].sku = e.target.value;
                        setVariants(newVariants);
                      }}
                    />
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={classifications.length + 3} style={{ textAlign: 'center' }}>
                  Vui lòng điền đầy đủ thông tin phân loại
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Box>
    );
  };

  return (
        <Stack spacing="md">
      <Select
        label="Số lượng phân loại"
        value={numClassifications}
        onChange={handleNumClassificationsChange}
        data={[
          { value: '0', label: '0 phân loại' },
          { value: '1', label: '1 phân loại' },
          { value: '2', label: '2 phân loại' },
        ]}
      />

      {numClassifications === '0' && (
        <Group grow>
          <NumberInput
            label="Số lượng"
            value={quantity}
            onChange={(value) => setQuantity(value !== '' ? value : undefined)}
          />
          <NumberInput
            label="Tồn kho"
            value={stock}
            onChange={(value) => setStock(value !== '' ? value : undefined)}
          />
        </Group>
      )}

      {classifications.map((classification, classIndex) => (
        <Paper p="md" key={classIndex}>
          <Stack>
            <TextInput
              label={`Tên phân loại ${classIndex + 1}`}
              value={classification.name}
              onChange={(e) => handleClassificationChange(classIndex, 'name', e.target.value)}
            />
            <Text size="sm" weight={500}>Tùy chọn phân loại:</Text>
            {classification.options.map((option, optionIndex) => (
              <Group key={optionIndex}>
                <TextInput
                  style={{ flex: 1 }}
                  value={option}
                  onChange={(e) => handleOptionChange(classIndex, optionIndex, e.target.value)}
                />
                <Button 
                  color="red" 
                  onClick={() => removeOption(classIndex, optionIndex)}
                  disabled={classification.options.length === 1}
                >
                  Xóa
                </Button>
              </Group>
            ))}
            <Button onClick={() => addOption(classIndex)}>
              Thêm tùy chọn
            </Button>
          </Stack>
        </Paper>
      ))}

      {renderClassificationTable()}
    </Stack>
  );
}
