export interface Product {
    id: number;
    name: string;
    categoryId: number;
    sellerId: number;
    hasClassification: boolean;
    slug: string;
    status: string;
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
    id: number;
    name: string;
    options: ClassificationOption[];
}

export interface ClassificationOption {
    id: number;
    name: string;
    productClassifications: ProductClassification[];
}

export interface ProductClassification {
    id?: number;
    optionIds: number[];  
    price: number;
    stock: number;
    sku: string;
}