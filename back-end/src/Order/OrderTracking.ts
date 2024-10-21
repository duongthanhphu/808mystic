import axios from "axios"
import { Request, Response } from 'express';

let baseUrl = 'https://services-staging.ghtklab.com/'
let order_tracking = ''

// API Tài khoản giao hàng tiết kiệm 
// API 

const orderTracking = async (req: Request, res: Response) => {
    
    try {
        const ghtk = axios.post('https://services-staging.ghtklab.com/',{
            "products": [{
                "name": "bút",
                "weight": 0.1,
                "quantity": 1,
                "product_code": 1241
            }, {
                "name": "tẩy",
                "weight": 0.2,
                "quantity": 1,
                "product_code": 1254
            }],
                "order": {
                "id": "a4",
                "pick_name": "HCM-nội thành",
                "pick_address": "590 CMT8 P.11",
                "pick_province": "TP. Hồ Chí Minh",
                "pick_district": "Quận 3",
                "pick_ward": "Phường 1",
                "pick_tel": "0911222333",
                "tel": "0911222333",
                "name": "GHTK - HCM - Noi Thanh",
                "address": "123 nguyễn chí thanh",
                "province": "TP. Hồ Chí Minh",
                "district": "Quận 1",
                "ward": "Phường Bến Nghé",
                "hamlet": "Khác",
                "is_freeship": "1",
                "pick_date": "2016-09-30", 
                "pick_money": 47000,
                "note": "Khối lượng tính cước tối đa: 1.00 kg",
                "value": 3000000,
                "transport": "fly",
                "pick_option":"cod" ,// Đơn hàng xfast yêu cầu bắt buộc pick_option là COD
                "deliver_option" : "xteam", // nếu lựa chọn kiểu vận chuyển xfast
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Host': `OPEN_API`,
                'Token': `API_TOKEN`,
                'X-Client-Source': `PARTNER_CODE`
            }
        })

        
    }catch (error: unknown) {
        res.status(500).json({
            error: 'Error fetching products'
        });
    }
}

export default orderTracking