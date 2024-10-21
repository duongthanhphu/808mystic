import { PrismaClient, Seller, Address } from '@prisma/client';
import axios from 'axios';
import { GHTK_CONFIG } from '../GHTK/Config/ghtk.config';

const prisma = new PrismaClient();

type CreateShopResponse = {
    success: boolean;
    message: string;
    data?: {
        shop_id: string;
        name: string;
        area: string;
    };
};

interface GHTKShopData {
    name: string;
    first_address: string;
    province: string;
    district: string;
    tel: string;
    email: string;
}

export async function createGHTKShop(sellerId: number, address: Address) {
    try {
        const [province, district] = await Promise.all([
            prisma.province.findFirst({ where: { id: address.provinceId } }),
            prisma.district.findFirst({ where: { id: address.districtId } })
        ]);

        const sellerFromServer = await prisma.seller.findFirst({
            where: {
                id: sellerId
            },
            include: {
                user: true
            }
        });

        if (!province || !district) {
            throw new Error('Không tìm thấy thông tin tỉnh/quận');
        }

        if (!sellerFromServer) {
            throw new Error('Không tìm thấy thông tin người bán');
        }

        if (!sellerFromServer.storeName || 
            !sellerFromServer.pickupAddress || 
            !province.Name || 
            !district.Name || 
            !sellerFromServer.user.phone || 
            !sellerFromServer.email) {
            throw new Error('Thiếu thông tin cần thiết để tạo shop GHTK');
        }

        
        const shopData: GHTKShopData = {
            name: sellerFromServer.storeName,
            first_address: sellerFromServer.pickupAddress,
            province: province.Name,
            district: district.Name,
            tel: sellerFromServer.user.phone,
            email: sellerFromServer.email
        };
        console.log("Shop data:", JSON.stringify(shopData, null, 2));
        const params = new URLSearchParams();
        Object.entries(shopData).forEach(([key, value]) => {
            params.append(key, value);
        });
        
        // Gọi API tạo shop GHTK
        const response = await axios.post<CreateShopResponse>(
            `${GHTK_CONFIG.BASE_URL}/services/shops/add`,
            params,
            {
                headers: {
                    'Token': GHTK_CONFIG.TOKEN,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                validateStatus: (status) => status < 500 
            }
        );
        if (!response.data.success) {
            throw new Error(`Lỗi từ GHTK: ${response.data.message}`);
        }
        return response.data;
    } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Lỗi khi gọi API GHTK:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                throw new Error(`Lỗi khi gọi API GHTK: ${error.response?.data?.message || error.message}`);
            }
            console.error('Lỗi khi tạo shop GHTK:', error);
            throw error;
        
    }
}