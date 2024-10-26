import axios, { AxiosInstance } from 'axios';

interface GHNConfig {
    token: string;
    environment: 'dev' | 'prod';
}

interface ShopInfo {
    name: string;
    phone: string;
    address: string;
    ward_code: string;
    district_id: number;
}

interface OrderInfo {
    to_name: string;
    to_phone: string;
    to_address: string;
    to_ward_name: string;
    to_district_id: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    service_type_id: number;
    payment_type_id: number;
    cod_amount?: number;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

export interface GHNOrderInfo {
    // Các trường bắt buộc
    to_name: string;
    to_phone: string;
    to_address: string;
    to_ward_name: string;
    to_district_name: string;
    to_ward_code: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    service_type_id: number;
    payment_type_id: number;
    required_note: 'CHOTHUHANG' | 'CHOXEMHANGKHONGTHU' | 'KHONGCHOXEMHANG';
    items: Array<{
        name: string;
        quantity: number;
        code?: string;
        price?: number;
        length?: number;
        width?: number;
        weight?: number;
        height?: number;
        category?: {
            level1?: string;
            level2?: string;
            level3?: string;
        };
    }>;

    // Các trường không bắt buộc
    from_name?: string;
    from_phone?: string;
    from_address?: string;
    from_ward_name?: string;
    from_ward_code?: string;
    from_district_name?: string;
    from_province_name?: string;
    return_phone?: string;
    return_address?: string;
    return_district_name?: string;
    return_ward_name?: string;
    client_order_code?: string;
    cod_amount?: number;
    content?: string;
    pick_station_id?: number;
    insurance_value?: number;
    coupon?: string;
    pick_shift?: number[];
    pickup_time?: number;
    note?: string;
    cod_failed_amount?: number;
}

export default class GHNService {
    private client: AxiosInstance;
    private readonly baseURL = {
        dev: 'https://dev-online-gateway.ghn.vn',
        prod: 'https://online-gateway.ghn.vn'
    };

    constructor(private config: GHNConfig & { shopId: number }) {
        this.client = axios.create({
            baseURL: this.baseURL[config.environment],
            headers: {
                'Token': config.token,
                'Content-Type': 'application/json'
            }
        });
    }


    // 2. Tạo đơn hàng
    async createOrder(orderInfo: GHNOrderInfo) {
        try {
            console.log(orderInfo)
            const response = await this.client.post('/shiip/public-api/v2/shipping-order/create', orderInfo, {
                headers: {
                    'ShopId': this.config.shopId.toString(),
                    'Token': this.config.token
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Lỗi khi tạo đơn hàng:', error.response?.data || error.message);
            throw new Error(`Không thể tạo đơn hàng: ${error.response?.data?.message || error.message}`);
        }
    }

    // 3. Xem thông tin trả trước của đơn hàng
    async previewOrder(orderInfo: OrderInfo) {
        try {
            const response = await this.client.post('/shiip/public-api/v2/shipping-order/preview', orderInfo);
            return response.data;
        } catch (error: any) {
        throw new Error(`Failed to preview order: ${error.message}`);
        }
    }

    // 4. Tính thời gian dự kiến đơn hàng
    async calculateExpectedDeliveryTime(
        from_district_id: number,
        to_district_id: number,
        service_id: number
    ) {
        try {
            const response = await this.client.post('/shiip/public-api/v2/shipping-order/leadtime', {
                from_district_id,
                to_district_id,
                service_id
            });
       return response.data;
        } catch (error: any) {
        throw new Error(`Failed to calculate delivery time: ${error}`);
        }
    }

    // 5. Thay đổi thông tin đơn hàng
    async updateOrder(order_code: string, updateData: Partial<OrderInfo>) {
        try {
            const response = await this.client.post('/shiip/public-api/v2/shipping-order/update', {
                order_code,
                ...updateData
            });
        return response.data;
        } catch (error: any) {
        throw new Error(`Failed to update order: ${error}`);
        }
    }

    // 6. Huỷ đơn hàng
    async cancelOrder(order_code: string) {
        try {
            const response = await this.client.post('/shiip/public-api/v2/switch-status/cancel', {
                order_codes: [order_code]
            });
        return response.data;
        } catch (error: any) {
        throw new Error(`Failed to cancel order: ${error}`);
        }
    }

    // 7. Trả lại hàng
    async returnOrder(order_code: string) {
        try {
            const response = await this.client.post('/shiip/public-api/v2/shipping-order/return', {
                order_code
            });
        return response.data;
        } catch (error: any) {
        throw new Error(`Failed to return order: ${error}`);
        }
    }

    // 8. In thông tin đơn hàng
    async printOrder(order_code: string) {
        try {
            const response = await this.client.post('/shiip/public-api/v2/a5/gen-token', {
                order_codes: [order_code]
            });
        return response.data;
        } catch (error: any) {
        throw new Error(`Failed to print order: ${error}`);
        }
    }

    // 9. Lấy chi tiết đơn hàng
    async getOrderDetail(order_code: string) {
        try {
            const response = await this.client.post('/shiip/public-api/v2/shipping-order/detail', {
                order_code
            });
        return response.data;
        } catch (error: any) {
        throw new Error(`Failed to get order detail: ${error}`);
        }
    }

    // 10. Thay đổi COD đơn hàng
    async updateCOD(order_code: string, cod_amount: number) {
        try {
            const response = await this.client.post('/shiip/public-api/v2/shipping-order/update-cod', {
                order_code,
                cod_amount
            });
        return response.data;
        } catch (error: any) {
        throw new Error(`Failed to update COD: ${error}`);
        }
    }

    // 11. Lấy danh sách bưu cục
    async getStores(district_id: number) {
        try {
            const response = await this.client.post('/shiip/public-api/v2/store/all', {
                district_id
            });
        return response.data;
        } catch (error: any) {
        throw new Error(`Failed to get stores: ${error}`);
        }
    }

    // Lấy danh sách tỉnh/thành phố
    async getProvinces() {
        try {
            const response = await this.client.get('/shiip/public-api/master-data/province');
            return response.data.data;
        } catch (error: any) {
            console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error.response?.data || error.message);
            throw new Error(`Không thể lấy danh sách tỉnh/thành phố: ${error.message}`);
        }
    }

    // Lấy danh sách quận/huyện của một tỉnh/thành phố
    async getDistricts(province_id: number) {
        try {
            const response = await this.client.get('/shiip/public-api/master-data/district', {
                params: { province_id }
            });
            console.log(response.data.data)
            return response.data.data;
        } catch (error: any) {
            throw new Error(`Không thể lấy danh sách quận/huyện: ${error.message}`);
        }
    }

    // Lấy danh sách phường/xã của một quận/huyện
    async getWards(district_id: number) {
        try {
            const response = await this.client.get('/shiip/public-api/master-data/ward', {
                params: { district_id }
            });
            console.log(response.data.data)
            return response.data.data;
        } catch (error: any) {
            throw new Error(`Không thể lấy danh sách phường/xã: ${error.message}`);
        }
    }

    async getWardInfo(wardCode: string) {
        try {
            const response = await this.client.get('/shiip/public-api/master-data/ward', {
                params: { ward_code: wardCode }
            });
            console.log(response.data.data)
            return response.data.data[0]; // Giả sử API trả về một mảng và chúng ta lấy phần tử đầu tiên
        } catch (error: any) {
            throw new Error(`Không thể lấy thông tin phường/xã: ${error.message}`);
        }
    }

    async getDistrictInfo(districtId: number) {
        try {
            const response = await this.client.get('/shiip/public-api/master-data/district', {
                params: { district_id: districtId }
            });
            return response.data.data[0]; // Giả sử API trả về một mảng và chúng ta lấy phần tử đầu tiên
        } catch (error: any) {
            throw new Error(`Không thể lấy thông tin quận/huyện: ${error.message}`);
        }
    }
    // Lấy một địa chỉ ngẫu nhiên
    async getRandomAddress() {
        const provinces = await this.getProvinces();
        const randomProvince = provinces[Math.floor(Math.random() * provinces.length)];

        const districts = await this.getDistricts(randomProvince.ProvinceID);
        const randomDistrict = districts[Math.floor(Math.random() * districts.length)];

        const wards = await this.getWards(randomDistrict.DistrictID);
        const randomWard = wards[Math.floor(Math.random() * wards.length)];

        return {
            province: randomProvince,
            district: randomDistrict,
            ward: randomWard,
            wardCode: randomWard.WardCode 
        };
    }
}
