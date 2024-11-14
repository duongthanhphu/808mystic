/**
 * Format số thành định dạng tiền Việt Nam
 * @param price - Số tiền cần format (string hoặc number)
 * @param currency - Đơn vị tiền tệ (mặc định là 'VND')
 * @param showCurrency - Có hiển thị ký hiệu tiền tệ không (mặc định là true)
 * @returns string - Chuỗi đã được format (ví dụ: "100.000 ₫" hoặc "100.000")
 */
export const formatPrice = (
    price: string | number,
    currency: string = 'VND',
    showCurrency: boolean = true
  ): string => {
    // Chuyển đổi price thành số
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Kiểm tra nếu không phải số hợp lệ
    if (isNaN(numericPrice)) {
      return '0 ₫';
    }
  
    // Format số theo locale vi-VN
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(numericPrice);
  
    // Thêm ký hiệu tiền tệ nếu showCurrency = true
    if (showCurrency) {
      switch (currency.toUpperCase()) {
        case 'VND':
          return `${formattedPrice} ₫`;
        case 'USD':
          return `$${formattedPrice}`;
        default:
          return `${formattedPrice} ${currency}`;
      }
    }
  
    return formattedPrice;
  };
  
  /**
   * Ví dụ sử dụng:
   * formatPrice(100000) => "100.000 ₫"
   * formatPrice("50000", 'VND', false) => "50.000"
   * formatPrice(25, 'USD') => "$25"
   */
  