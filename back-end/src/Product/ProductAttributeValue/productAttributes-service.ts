import { PrismaClient, Prisma } from '@prisma/client';
import { handlePrismaError } from '../../Utils/DatabaseError';
const prisma = new PrismaClient();


const createProductAttributesValue = async (productAttributeValueData: Prisma.ProductAttributeValueUncheckedCreateInput) => {
    try {
        const existingAttribute = await prisma.attributeValue.findUnique({
            where: { id: productAttributeValueData.attributeValueId },
        });

        if (!existingAttribute) throw new Error(`CategoryAttribute with id ${ productAttributeValueData.attributeValueId } not found`);
        


        return await prisma.productAttributeValue.create({
            data: productAttributeValueData,
        });
    }catch(error){
        handlePrismaError(error);
    }
}

const updateProductAttributeValue = async (id: string ,productAttributeValueData: Prisma.ProductAttributeValueCreateInput) => {
    try {
        return await prisma.productAttributeValue.update({
            where: { id: Number(id) },
            data: productAttributeValueData,
        });
    }catch(error){
        handlePrismaError(error);
    }
}

export default {
    createProductAttributesValue,
    updateProductAttributeValue
}