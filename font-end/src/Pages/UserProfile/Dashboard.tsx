import { useState } from "react";
import { Box, LoadingOverlay } from "@mantine/core";
import Sidebar from "./Sidebar";
import AccountContent from "./Contents/AccountContent";
import SettingsContent from "./Contents/SettingContent";
import OrderManagementContent from "./Contents/OrderManagermentContent";
import Header from "../../Components/ClientHeader/ClientHeader";
import ReviewContent from "./Contents/ReviewContent";

const Dashboard = () => {
  const [selectedItem, setSelectedItem] = useState("Tài khoản");
  const [visible, setVisible] = useState(false);

  const renderContent = () => {
    switch (selectedItem) {
      case "Tài khoản":
        return <AccountContent />;
      case "Thiết đặt":
        return <SettingsContent />;
      case "Quản lý đơn hàng":
        return <OrderManagementContent />;
      case "Đánh giá sản phẩm":
        return <ReviewContent />;
      default:
        return <AccountContent />;
    }
  };

  const handleItemClick = (item: string) => {
    setVisible(true);
    setTimeout(() => {
      setSelectedItem(item);
      setVisible(false);
    }, 500);
  };

  return (
    <div className="h-screen flex flex-col ">
      <div className="shadow-md py-2">
        <Header />
      </div>

      <div className="flex flex-grow ml-44">
        {/* Sidebar */}

        <Sidebar onItemClick={handleItemClick} />

        {/* Content */}
        <Box className="flex-grow p-12 mr-32">
          <LoadingOverlay
            visible={visible}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
            loaderProps={{ color: "blue", type: "bars" }}
          />
          {renderContent()}
        </Box>
      </div>
    </div>
  );
};

export default Dashboard;
