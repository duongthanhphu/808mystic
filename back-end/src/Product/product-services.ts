import { PrismaClient, Prisma } from '@prisma/client';
import { handlePrismaError } from '../Utils/DatabaseError'
import {Product, AttributeValue, ClassificationGroup, ProductClassification, ProductFilterQuery, SearchProductsParams, FilterProductsParams} from './product-model'
import query from './product-queries'
import imageService from '../Image/image-services'
const prisma = new PrismaClient();


const createProductService = async (
    productData: Product,
    attributeValues: AttributeValue[],
    classificationGroups: ClassificationGroup[],
    productClassifications: ProductClassification[],
    files: Express.Multer.File[]
) => {
    try {
        const productTransaction = await prisma.$transaction(async (prismaTransaction) => {
            const newProductDetails: Prisma.ProductCreateInput = {
                name: productData.name,
                shortDescription: productData.shortDescription,
                longDescription: productData.longDescription,
                category: {
                    connect: {
                        id: Number(productData.categoryId)
                    }
                },
                seller: {
                    connect: {
                        id: Number(productData.sellerId)
                    }
                },
                hasClassification: productData.hasClassification,
                slug: 'something', 
            }
            const createdProductInDB = await prismaTransaction.product.create({data: newProductDetails})
            
            if (Array.isArray(attributeValues)) {
                console.log(attributeValues)
                await Promise.all(attributeValues.map(async (element) => {
                    let attributeValue = await prismaTransaction.attributeValue.findFirst({
                        where: {
                            categoryAttributeValueId: element.categoryAttributeValueId,
                        }
                    });
                    if (!attributeValue) {
                        console.log('Attribute value not found, creating new one');
                        attributeValue = await prismaTransaction.attributeValue.create({
                            data: {
                                categoryAttributeValueId: element.categoryAttributeValueId,
                                value: element.value
                            
                            }
                        });
                    } else {
                        console.log('Existing attribute value found:', attributeValue);
                    }
                    
                    await prismaTransaction.productAttributeValue.upsert({
                        where: {
                            productId_attributeValueId: {
                                productId: createdProductInDB.id,
                                attributeValueId: attributeValue.id,
                            }
                        },
                        update: {}, // Không cần cập nhật gì nếu đã tồn tại
                        create: {
                            productId: createdProductInDB.id,
                            attributeValueId: attributeValue.id,
                        }
                    });
                }));
            }
            if (Array.isArray(classificationGroups) && Array.isArray(productClassifications)) {
                const createdGroups = await Promise.all(classificationGroups.map(async (group) => {
                    if (!group.name) {
                        throw new Error('Classification group name is required');
                    }
                    if (!Array.isArray(group.options) || group.options.length === 0) {
                        throw new Error(`Classification group "${group.name}" must have at least one valid option`);
                    }
                    return await prismaTransaction.classificationGroup.create({
                        data: {
                            name: group.name,
                            product: { connect: { id: createdProductInDB.id } },
                            options: {
                                create: group.options.map((optionName) => ({ name: optionName })),
                            },
                        },
                        include: { options: true },
                    });
                }));

                const optionNameToId = new Map();
                createdGroups.forEach(group => {
                    group.options.forEach(option => {
                        optionNameToId.set(option.name, option.id);
                    });
                });

                await Promise.all(productClassifications.map(async (classification) => {
                    const optionConnections: any = {};
                    Object.entries(classification).forEach(([key, value]) => {
                        if (key.startsWith('option')) {
                            const optionId = optionNameToId.get(value);
                            if (!optionId) {
                                throw new Error(`Option ${value} not found`);
                            }
                            optionConnections[key] = { connect: { id: optionId } };
                        }
                    });

                    return prismaTransaction.productClassification.create({
                        data: {
                            price: classification.price,
                            stock: classification.stock,
                            product: { connect: { id: createdProductInDB.id } },
                            ...optionConnections,
                        },
                    });
                }));
            }
            return createdProductInDB
        });
        

        
        return productTransaction;
    } catch (error) {
        console.error(`Error processing attribute value:`, error);
        throw error; 
    }
};


const uploadProductImages = async (files: Express.Multer.File[], productId: string) => {
    try {
        return await imageService.uploadManyImageService(files, productId)
    }catch (error: unknown) {
        handlePrismaError(error)
    }
}


const findByIdService = async (id: number) => {
    try {
        return await query.findProductDetail(id)
    }catch(error){
        console.error(`Error find by product:`, error);
        throw error; 
    }
}

const findAllService = async (page: number = 1, pageSize: number = 10) => {
    try {
        return await query.findAll(page, pageSize )
    }catch(error){
        console.error(`Error find all products:`, error);
        throw error; 
    }
}


const addProductClassification = async (
    productId: number,
    data: {
        option1Id: number;
        option2Id?: number;
        stock: number;
        price: number;
    }
) => {
    const classification = await prisma.productClassification.create({
        data: {
            productId,
            ...data
        }
    });

    // Tự động tạo inventory cho classification mới
    await prisma.inventory.create({
        data: {
            productId,
            classificationId: classification.id,
            warehouseId: 1, // Lấy warehouse mặc định
            quantity: data.stock,
            minQuantity: 10,
            maxQuantity: 100
        }
    });

    return classification;
};

const removeProductClassification = async (classificationId: number) => {
    // Xóa inventory trước
    await prisma.inventory.deleteMany({
        where: { classificationId }
    });

    // Sau đó xóa classification
    return await prisma.productClassification.delete({
        where: { id: classificationId }
    });
};

const searchProducts = async ({
  searchTerm,
  categoryId,
  minPrice,
  maxPrice,
  attributes,
  page = 1,
  limit = 10
}: SearchProductsParams) => {
  const where: Prisma.ProductWhereInput = {
    status: "available",
    deletedAt: null,
    AND: [
      searchTerm ? {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { shortDescription: { contains: searchTerm, mode: 'insensitive' } }
        ]
      } : {},
      categoryId ? { categoryId } : {},
      // Xử lý điều kiện giá
      minPrice || maxPrice ? {
        OR: [
          // Cho sản phẩm không có phân loại
          {
            hasClassification: false,
            classifications: {
              some: {
                AND: [
                  minPrice ? { price: { gte: minPrice } } : {},
                  maxPrice ? { price: { lte: maxPrice } } : {}
                ]
              }
            }
          },
          // Cho sản phẩm có phân loại
          {
            hasClassification: true,
            classifications: {
              some: {
                AND: [
                  minPrice ? { price: { gte: minPrice } } : {},
                  maxPrice ? { price: { lte: maxPrice } } : {}
                ]
              }
            }
          }
        ]
      } : {},
      // Xử lý điều kiện thuộc tính
      ...attributes?.map(attr => ({
        ProductAttributeValue: {
          some: {
            attributeValue: {
              categoryAttributeValueId: attr.attributeId,
              value: { in: attr.values }
            }
          }
        }
      })) ?? []
    ]
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        ProductAttributeValue: {
          include: {
            attributeValue: true
          }
        },
        classifications: true,
        images: true
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};



const filterByCategory = async ({
  categoryId,
  minPrice,
  maxPrice,
  attributes,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  page = 1,
  limit = 10
}: FilterProductsParams) => {
  console.log('Received filter params:', { categoryId, minPrice, maxPrice, attributes });

  // Parse attributes nếu nó là string
  const parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
  console.log('Parsed attributes:', parsedAttributes);

  const where: Prisma.ProductWhereInput = {
    status: "available",
    deletedAt: null,
    AND: [
      // Điều kiện về category
      {
        OR: [
          { categoryId },
          {
            category: {
              path: {
                contains: `/${categoryId}/`
              }
            }
          }
        ]
      },
      // Điều kiện về giá
      minPrice || maxPrice ? {
        classifications: {
          some: {
            AND: [
              minPrice ? { price: { gte: minPrice } } : {},
              maxPrice ? { price: { lte: maxPrice } } : {}
            ]
          }
        }
      } : {},
      // Điều kiện về thuộc tính sản phẩm
      ...(parsedAttributes && parsedAttributes.length > 0 ? parsedAttributes.map((attr: any) => ({
        ProductAttributeValue: {
          some: {
            attributeValue: {
              AND: [
                { categoryAttributeValueId: attr.attributeId },
                { 
                  value: {
                    equals: JSON.stringify({
                      originName: [{ id: Number(attr.values[0]) }]
                    })
                  }
                }
              ]
            }
          }
        }
      })) : [])
    ]
  };

  console.log('Generated where clause:', JSON.stringify(where, null, 2));

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          ProductAttributeValue: {
            include: {
              attributeValue: true
            }
          },
          classifications: true,
          images: true
        },
        orderBy: sortBy === 'price' 
          ? {
              createdAt: sortOrder
            }
          : { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Sắp xếp theo giá sau khi query nếu cần
    if (sortBy === 'price') {
      products.sort((a, b) => {
        const priceA = Math.min(...a.classifications.map(c => Number(c.price)));
        const priceB = Math.min(...b.classifications.map(c => Number(c.price)));
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    return {
      products,
      metadata: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error in filterByCategory:', error);
    throw error;
  }
};
export default {
    createProductService,
    uploadProductImages,
    findByIdService,
    findAllService,
    addProductClassification,
    removeProductClassification,
    searchProducts,
    filterByCategory
}
