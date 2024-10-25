import { useState } from "react";
import { Box, LoadingOverlay } from "@mantine/core";
import Sidebar from "./Sidebar";
import AccountContent from "./Contents/AccountContent";
import SettingsContent from "./Contents/SettingContent";
import Header from "../../Components/ClientHeader/ClientHeader";

const Dashboard = () => {
  const [selectedItem, setSelectedItem] = useState("Tài khoản");
  const [visible, setVisible] = useState(false);

  const renderContent = () => {
    switch (selectedItem) {
      case "Tài khoản":
        return <AccountContent />;
      case "Thiết đặt":
        return <SettingsContent />;
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
    <div className="h-screen flex flex-col">
      <div className="shadow-md py-2">
        <Header />
      </div>

      <div className="flex flex-grow ml-2 bg-gray-100 relative">
        {/* Sidebar */}
        <Sidebar onItemClick={handleItemClick} />

        {/* Content */}
        <Box className="flex-grow p-12 relative">
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
