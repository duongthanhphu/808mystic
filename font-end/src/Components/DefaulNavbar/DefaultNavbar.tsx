import { Stack, Text, NavLink, Box, Divider, rem } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import {
  IconBoxMultiple1,
  IconBoxMultiple2,
  IconBoxMultiple3,
  IconBoxMultiple4,
  IconBoxMultiple5,
  IconBoxMultiple6,
  IconBoxMultiple7,
  IconBox,
} from "@tabler/icons-react";

interface NavbarChildLink {
  link: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavbarLink {
  link: string;
  label: string;
  icon: React.ReactNode;
  childLink?: NavbarChildLink[];
}

const navbarLinks: NavbarLink[] = [
  {
    link: "/admin/product",
    label: "Sản phẩm",
    icon: <IconBox size={35} />,
    childLink: [
      {
        link: "/admin/category",
        label: "Danh mục sản phẩm",
        icon: <IconBoxMultiple1 size={25} />,
      },
      {
        link: "/admin/brand",
        label: "Nhãn hiệu",
        icon: <IconBoxMultiple2 size={25} />,
      },
      {
        link: "/admin/supplier",
        label: "Nhà cung cấp",
        icon: <IconBoxMultiple3 size={25} />,
      },
      {
        link: "/admin/tag",
        label: "Nhãn dán",
        icon: <IconBoxMultiple4 size={25} />,
      },
      {
        link: "/admin/unit",
        label: "Đơn vị tính",
        icon: <IconBoxMultiple5 size={25} />,
      },
      {
        link: "/admin/property",
        label: "Thuộc tính sản phẩm",
        icon: <IconBoxMultiple6 size={25} />,
      },
      {
        link: "/admin/specification",
        label: "Thông số sản phẩm",
        icon: <IconBoxMultiple7 size={25} />,
      },
    ],
  },
  // Thêm các sections khác nếu cần
];

export default function DefaultNavbar() {
  const location = useLocation();

  return (
    <Box className="h-full p-4">
      <Stack spacing="xs">
        {navbarLinks.map((section) => (
          <Box key={section.label} className="mb-4">
            {/* Section Header */}
            <NavLink
              component={Link}
              to={section.link}
              label={
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">{section.icon}</div>
                  <Text size="sm" fw={600} className="text-gray-700">
                    {section.label}
                  </Text>
                </div>
              }
              className={`rounded-md mb-2 hover:bg-blue-150 ${
                location.pathname === section.link ? "bg-blue-100" : ""
              }`}
              active={location.pathname === section.link}
            />

            {/* Child Links Container */}
            <Box className="space-y-1 ml-3">
              {section.childLink?.map((child) => (
                <NavLink
                  key={child.link}
                  component={Link}
                  to={child.link}
                  label={
                    <div className="flex items-center gap-3">
                      <div className="text-gray-900">{child.icon}</div>
                      <Text size="sm" className="text-gray-700 font-bold">
                        {child.label}
                      </Text>
                    </div>
                  }
                  className={`rounded-md hover:bg-blue-100 transition-colors ${
                    location.pathname === child.link
                      ? "bg-blue-100 text-blue-600"
                      : ""
                  }`}
                  active={location.pathname === child.link}
                  styles={(theme) => ({
                    root: {
                      "&[data-active]": {
                        backgroundColor: theme.colors.gray[1],
                      },
                    },
                  })}
                />
              ))}
            </Box>

          </Box>
        ))}
      </Stack>
    </Box>
  );
}
