export interface Product {
    id: number;
    name: string;
    categoryId: number;
    sellerId: number;
    shortDescription: string;
    longDescription: string;
    hasClassification: boolean;
    slug: string;
    status: string;
    warehouseId: number;
    attributeValues?: AttributeValue[];
    classificationGroups?: ClassificationGroup[];
    productClassifications?: ProductClassification[];
}

export interface AttributeValue {
    categoryAttributeValueId: number;
    value: {
        name: string;
    };
}

export interface ClassificationGroup {
    id?: number;
    name: string;
    options: string[];
}

export interface ProductClassification {
    id?: number;
    [key: string]: any;  
    price: number;
    stock: number;
}

export interface ProductFilterQuery {
    search?: string;
    categoryId?: number;
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    attributes?: Array<{
        attributeId: number;
        values: any[];
    }>;
    status?: string;
    sortBy?: 'price' | 'createdAt' | 'name';
    sortOrder?: 'asc' | 'desc';
}

export interface SearchProductsParams {
    searchTerm?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    attributes?: Array<{
        attributeId: number;
        values: any[];
    }>;
    page?: number;
    limit?: number;
}

export interface FilterProductsParams {
    categoryId: number;
    minPrice?: number;
    maxPrice?: number;
    attributes?: Array<{
        attributeId: number;
        values: any[];
    }>;
    classifications?: Array<{
        option1Id?: number;
        option2Id?: number;
    }>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
