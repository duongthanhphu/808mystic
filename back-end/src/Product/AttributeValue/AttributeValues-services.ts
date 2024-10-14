import { PrismaClient, Prisma } from '@prisma/client';
import { handlePrismaError } from '../../Utils/DatabaseError';
import { create } from 'domain';
const prisma = new PrismaClient();

const createAttributeService = async (attributeValueData: Prisma.AttributeValueUncheckedCreateInput) => {
    try {
        // Kiểm tra xem CategoryAttribute có tồn tại không
        const existingAttribute = await prisma.categoryAttribute.findUnique({
            where: { id: attributeValueData.attributeId },
        });

        if (!existingAttribute) throw new Error(`CategoryAttribute with id ${attributeValueData.attributeId} not found`);
        
        return await prisma.attributeValue.create({
            data: attributeValueData,
            include: {
                attribute: true, 
            },
        });
    }catch(error){
        handlePrismaError(error);
    }
}

const updateAttributeService = async (attributeValueId: string, attributeValueData: Prisma.AttributeValueCreateInput) => {
    try {
        return await prisma.attributeValue.update({
            where: {
                id: Number(attributeValueId),
            },
            data: attributeValueData
        });
    }catch(error){
        handlePrismaError(error);
    }
}

export default {
    createAttributeService,
    updateAttributeService
}