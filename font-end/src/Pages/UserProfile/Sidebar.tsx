import React, { useState } from "react";
import { Box, Text } from "@mantine/core";
import {
  IconUser,
  IconSettings,
  IconBell,
  IconPackage,
  IconStar,
  IconHeart,
  IconAward,
  IconCalendar,
  IconMessageCircle,
} from "@tabler/icons-react";

interface SidebarProps {
  onItemClick: (item: string) => void; // Định nghĩa kiểu dữ liệu cho prop
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const [activeItem, setActiveItem] = useState<string | null>(null); // State để lưu item đang được chọn

  const items = [
    { label: "Tài khoản", icon: <IconUser size={20} /> },
    { label: "Thiết đặt", icon: <IconSettings size={20} /> },
    { label: "Thông báo", icon: <IconBell size={20} /> },
    { label: "Quản lý đơn hàng", icon: <IconPackage size={20} /> },
    { label: "Đánh giá sản phẩm", icon: <IconStar size={20} /> },
    { label: "Sản phẩm yêu thích", icon: <IconHeart size={20} /> },
    { label: "Điểm thưởng", icon: <IconAward size={20} /> },
    { label: "Đặt trước sản phẩm", icon: <IconCalendar size={20} /> },
    { label: "Yêu cầu tư vấn", icon: <IconMessageCircle size={20} /> },
  ];

  const handleItemClick = (item: string) => {
    setActiveItem(item); // Cập nhật item đang được chọn
    onItemClick(item); // Gọi hàm prop khi item được nhấn
  };

  return (
    <Box className="w-64 h-screen pt-8">
      <nav>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.label}
              className={`flex items-center space-x-2 text-blue-500 p-2 rounded-lg cursor-pointer ${
                activeItem === item.label ? "bg-blue-100" : "" // Thay đổi màu nền khi item được chọn
              }`}
              onClick={() => handleItemClick(item.label)} // Sử dụng hàm handleItemClick
            >
              {item.icon}
              <Text className="font-bold">{item.label}</Text>
            </li>
          ))}
        </ul>
      </nav>
    </Box>
  );
};

export default Sidebar;
