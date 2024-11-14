/**
 * Format ngày giờ theo định dạng mong muốn
 * @param dateString - Chuỗi ngày giờ đầu vào
 * @param includeTime - Có hiển thị giờ phút giây không
 * @returns string - Chuỗi ngày giờ đã format
 */
export const formatDate = (dateString: string, includeTime: boolean = true): string => {
    const date = new Date(dateString);
    
    // Kiểm tra ngày hợp lệ
    if (isNaN(date.getTime())) {
      return '';
    }
  
    // Thêm số 0 phía trước nếu cần
    const pad = (num: number): string => num.toString().padStart(2, '0');
  
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    
    if (!includeTime) {
      return `${year}/${month}/${day}`;
    }
  
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
  
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}; 
