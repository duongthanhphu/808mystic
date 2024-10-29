import { NavLink } from "@mantine/core";
import { Link } from "react-router-dom";
import {
  IconHome2,
  IconMapPin,
  IconUser,
  IconUsers,
  IconUserCircle,
  IconBox,
  IconBuildingWarehouse,
  IconClipboardList,
  IconFileDescription,
  IconStars,
  IconCoin,
  IconMessage,
} from "@tabler/icons-react";
import { useState } from "react";

interface NavbarLink {
  link: string;
  label: string;
  icon: React.ReactNode;
}

const navbarLinks: NavbarLink[] = [
  {
    link: "/seller/",
    label: "Trang chủ",
    icon: <IconHome2 size={20} />,
  },
  {
    link: "/seller/product",
    label: "Sản phẩm",
    icon: <IconBox size={20} />,
  },
  {
    link: "/seller/address",
    label: "Địa chỉ",
    icon: <IconMapPin size={20} />,
  },
  {
    link: "/seller/users",
    label: "Người dùng",
    icon: <IconUser size={20} />,
  },
  {
    link: "/seller/staff",
    label: "Nhân viên",
    icon: <IconUserCircle size={20} />,
  },
  {
    link: "/seller/customers",
    label: "Khách hàng",
    icon: <IconUsers size={20} />,
  },

  {
    link: "/seller/inventory",
    label: "Tồn kho",
    icon: <IconBuildingWarehouse size={20} />,
  },
  {
    link: "/seller/orders",
    label: "Đơn hàng",
    icon: <IconClipboardList size={20} />,
  },
  {
    link: "/seller/documents",
    label: "Vận đơn",
    icon: <IconFileDescription size={20} />,
  },
  {
    link: "/seller/reviews",
    label: "Đánh giá",
    icon: <IconMessage size={20} />,
  },
  {
    link: "/seller/points",
    label: "Điểm thưởng",
    icon: <IconStars size={20} />,
  },
  {
    link: "/seller/balance",
    label: "Số quỹ",
    icon: <IconCoin size={20} />,
  },
];

export default function SellerNavbar() {
  const [active, setActive] = useState<string | null>(null);

  const items = navbarLinks.map((item) => (
    <NavLink
      key={item.label}
      component={Link}
      to={item.link}
      active={item.link === active}
      label={item.label}
      leftSection={item.icon}
      onClick={() => setActive(item.link)}
      variant="light"
          className={`
        font-bold
        text-lg
        rounded-md mb-1 
        hover:bg-blue-50 hover:text-blue-600
        ${item.link === active ? "bg-blue-50 text-blue-500" : "text-gray-700"}
      `}
    />
  ));

  return (
    <div className="h-full">

      {/* Navigation links */}
      <div className="px-3">{items}</div>
    </div>
  );
}
