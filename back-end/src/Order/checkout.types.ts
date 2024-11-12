interface CheckoutItem {
  productId: number;
  classificationId?: number;
  quantity: number;
}

interface CheckoutRequestBody {
  sellerId: number;
  shippingAddressId: number;
  items: CheckoutItem[];
  shippingMethod?: string;
}

interface CheckoutResponse {
  subtotal: number;
  shippingFee: number;
  total: number;
  items: Array<{
    productId: number;
    classificationId?: number;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  shippingAddress: {
    addressDetail: string;
    province: string;
    district: string;
    ward: string;
  };
  seller: {
    id: number;
    storeName: string;
  };
}