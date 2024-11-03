import { useState, useEffect } from "react";
import { Group, ActionIcon, Text, UnstyledButton } from "@mantine/core";
import {
  IconBell,
  IconMessage,
  IconWorld,
  IconSearch,
  IconUser,
  IconSun,
  IconMoonStars,
  IconLogout,
  IconLogin,
} from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import { Link } from "react-router-dom";
import { checkAuthStatus } from "../../Utils/authentication"; // Giữ nguyên import này

export function SellerHeader() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  // Giữ nguyên logic authentication từ code cũ
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus);
    };
    checkAuth();
  }, []);
  const handleLogout = () => {
    // Xử lý logout
  };

  return (
    <div className="flex justify-between items-center w-full px-4 py-2">
      {/* Logo */}
      <div className="flex items-center">
        <Text className="text-gray-900 font-bold text-3xl">
          808mystic<span className="text-blue-500 font-bold text-4xl">.</span>
        </Text>
      </div>

      {/* Right Section */}
      <Group spacing="xl">
        {isAuthenticated ? (
          <>
            {/* Tài khoản */}
            <UnstyledButton
              component={Link}
              to="/account"
              className="text-sm text-gray-900 hover:text-blue-500"
            >
              <div className="flex items-center gap-1">
                <IconUser size={20} />
                <span>Tài khoản</span>
              </div>
            </UnstyledButton>

            {/* Thông báo */}
            <UnstyledButton
              component={Link}
              to="/notifications"
              className="text-sm text-gray-900 hover:text-blue-500"
            >
              <div className="flex items-center gap-1">
                <IconBell size={20} />
                <span>Thông báo</span>
              </div>
            </UnstyledButton>

            {/* Tin nhắn */}
            <UnstyledButton
              component={Link}
              to="/messages"
              className="text-sm text-gray-900 hover:text-blue-500"
            >
              <div className="flex items-center gap-1">
                <IconMessage size={20} />
                <span>Tin nhắn</span>
              </div>
            </UnstyledButton>

            {/* Website */}
            <UnstyledButton
              component={Link}
              to="/website"
              className="text-sm text-gray-900 hover:text-blue-500"
            >
              <div className="flex items-center gap-1">
                <IconWorld size={20} />
                <span>Website</span>
              </div>
            </UnstyledButton>
          </>
        ) : (
          <UnstyledButton
            component={Link}
            to="/seller-login"
            className="text-sm text-gray-900 hover:text-blue-500"
          >
            <div className="flex items-center gap-1">
              <IconLogin size={20} />
              <span>Đăng nhập</span>
            </div>
          </UnstyledButton>
        )}

        {/* Theme Toggles */}
        <Group spacing={8}>
          <ActionIcon
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200"
            size="md"
          >
            <IconSearch size={20} />
          </ActionIcon>
          <ActionIcon
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200"
            size="md"
            onClick={() => toggleColorScheme()}
          >
            {isDark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
          </ActionIcon>
          {isAuthenticated && (
            <ActionIcon
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200"
              size="md"
              onClick={handleLogout}
            >
              <IconLogout size={20} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </div>
  );
}

export default SellerHeader;
