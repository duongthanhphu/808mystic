import GHNService, { GHNOrderInfo } from "./ghn-service";

async function testGHNService() {
    const ghnService = new GHNService({
        token: 'a98258af-8cc0-11ef-9b94-5ef2ee6a743d',
        environment: 'prod',
        shopId: 5396542
    });

    try {
        // Lấy địa chỉ ngẫu nhiên cho người nhận
        const shopAddress = await ghnService.getRandomAddress();
        const randomAddress = await ghnService.getRandomAddress();
        // Quan trọng: Lấy thông tin địa chỉ shop
        console.log(`${randomAddress.ward.WardName}, ${randomAddress.district.DistrictName}, ${randomAddress.province.ProvinceName}`);

        const orderInfo: GHNOrderInfo = {
            // Thông tin người gửi - bắt buộc phải có
            from_name: "Shop ABC",
            from_phone: "0334534719",
            from_address: `${randomAddress.ward.WardName}, ${randomAddress.district.DistrictName}, ${randomAddress.province.ProvinceName}`,
            from_ward_name: shopAddress.ward.WardName,
            from_ward_code: shopAddress.ward.WardCode,
            from_district_name: shopAddress.district.DistrictName,
            from_province_name: shopAddress.province.ProvinceName,

            // Thông tin người nhận
            to_name: "Nguyen Van A",
            to_phone: "0977654321",
            to_address: `${randomAddress.ward.WardName}, ${randomAddress.district.DistrictName}, ${randomAddress.province.ProvinceName}`,
            to_ward_name: randomAddress.ward.WardName,
            to_ward_code: randomAddress.wardCode,
            to_district_name: randomAddress.district.DistrictName,
            // Các thông tin khác
            weight: 200,
            length: 1,
            width: 19,
            height: 10,
            service_type_id: 2,
            payment_type_id: 2,
            required_note: "KHONGCHOXEMHANG",
            items: [
                {
                    name: "Áo Polo",
                    code: "Polo123",
                    quantity: 1,
                    price: 200000,
                    length: 12,
                    width: 12,
                    weight: 1200,
                    height: 12,
                    category: {
                        level1: "Áo"
                    }
                }
            ],
            cod_amount: 10000,
            content: "Theo New York Times",
            insurance_value: 100000,
            pick_shift: [2],
            note: "Tintest 123",
            cod_failed_amount: 2000,
        };

        // Tạo đơn hàng
        const order = await ghnService.createOrder(orderInfo);
        console.log('Đơn hàng đã tạo:', order);
    } catch (error) {
        console.error('Lỗi:', error);
    }
}


export default testGHNService;


