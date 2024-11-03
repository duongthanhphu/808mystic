import { Request, Response } from 'express';
import prismaService from '../prisma.service';

const defaultShippingProvider : any = {
    name: 'Giao hàng nhanh',
    code: 'GHN',
    website: 'https://giaohangnhanh.vn',
    apiEndpoint: 'https://online-gateway.ghn.vn',
    description: 'Giao hàng nhanh',
    policies: 'Chính sách giao hàng nhanh'
}

const initShippingProvider = async (req: Request, res: Response) => {
    try {
        
        if(!req.body || Object.keys(req.body).length === 0) {
            const shippingProvider = await prismaService.shippingProvider.upsert({
                where: { code: defaultShippingProvider.code },
                update: defaultShippingProvider,
                create: defaultShippingProvider
            });
            return res.status(200).json(shippingProvider);
        }
        const { name, code, website, apiEndpoint, description, policies } = req.body;
        const shippingProvider = await prismaService.shippingProvider.upsert({
            where: { code },
            update: { name, code, website, apiEndpoint, description, policies },
            create: { name, code, website, apiEndpoint, description, policies }
        });
        return res.status(200).json(shippingProvider);

    } catch (error) {
        console.error('Error in initShippingProvider:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prismaService.$disconnect();
    }
}

const getShippingProviders = async (req: Request, res: Response) => {
    try {
        const shippingProviders = await prismaService.shippingProvider.findMany();
        return res.status(200).json(shippingProviders);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}   
export default {
    initShippingProvider,
    getShippingProviders
}
