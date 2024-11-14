import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  Avatar,
  Divider,
  TextInput,
  Select,
  Modal,
  Input,
} from "@mantine/core";
import { IconPhone, IconMail, IconLock, IconMapPin } from "@tabler/icons-react";
import { Notifications } from "@mantine/notifications";
import axios from "axios";
import { useDisclosure } from "@mantine/hooks";
import { getUserId } from "../../../Utils/authentication";
interface AddressItem {
  Code?: string;
  Name: string;
}
const AccountContent = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [address, setAddress] = useState("");
  const [provinces, setProvinces] = useState<
    { value: string; label: string }[]
  >([]);
  const [districts, setDistricts] = useState<
    { value: string; label: string }[]
  >([]);
  const [wards, setWards] = useState<{ value: string; label: string }[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [fullAddress, setFullAddress] = useState("");
  const userId = getUserId();

  const formatAddressData = (data: AddressItem[]) => {
    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return [];
    }

    const filteredData = data.filter((item) => item && item.Name);

    const formattedData = filteredData.map((item: AddressItem) => ({
      value: (item.Code || "").toString(),
      label: item.Name,
    }));

    return formattedData;
  };

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/v1/address/province/")
      .then((response) => {
        const formattedData = formatAddressData(response.data);
        setProvinces(formattedData);
      })
      .catch((error) => console.error("Error fetching provinces:", error));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(
          `http://localhost:4000/api/v1/address/province/${selectedProvince}/district/`
        )
        .then((response) => {
          const formattedData = formatAddressData(response.data);
          setDistricts(formattedData);
        })
        .catch((error) => console.error("Error fetching districts:", error));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(
          `http://localhost:4000/api/v1/address/province/district/${selectedDistrict}/ward/`
        )
        .then((response) => {
          const formattedData = formatAddressData(response.data);
          setWards(formattedData);
        })
        .catch((error) => console.error("Error fetching wards:", error));
    }
  }, [selectedDistrict]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/v1/users/${userId}`
        );

        const userData = response.data;
        console.log("userId", userData.id);
        console.log("userData", response.data);

        setEmail(userData.email);
        setFullName(userData.fullName);
        setUsername(userData.username);
        setPhone(userData.phone);
        setAddress(userData.address);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAddressFromUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/v1/update/user/${userId}/address`
        );
        setFullAddress(response.data.fullAddress);
        console.log(fullAddress);
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    };

    fetchAddressFromUser();
  }, [userId]);

  const handleUpdateUser = async () => {
    const userData = {
      fullName,
      email,
      phone,
    };
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/update/user/${userId}`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Updated user data:", { fullName, email, phone });

      Notifications.show({
        title: "Thông báo",
        message: response.data.message,
      });
      setIsEditingFullName(false);
      setIsEditingEmail(false);
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Failed to update user", error);
      const errUpdateMessage = "Fail to update user data";
      Notifications.show({
        title: "Thông báo",
        message: errUpdateMessage,
      });
    }
  };
  const handleUpdateAddress = async () => {
    if (!address || !selectedProvince || !selectedDistrict || !selectedWard) {
      console.error("No address data provided.");
      Notifications.show({
        title: "Thông báo",
        message:
          "Vui lòng chọn đầy đủ, Tên đường, Tỉnh/Thành phố, Quận/Huyện và Phường/Xã.",
      });
      return;
    }

    try {
      const addressData = {
        address: address,
        provinceCode: String(selectedProvince),
        districtCode: String(selectedDistrict),
        wardCode: String(selectedWard),
      };
      console.log("Address muốn cập nhật", addressData);

      const response = await axios.put(
        `http://localhost:4000/api/v1/update/user/${userId}/address`,
        addressData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Notifications.show({
        title: "Thông báo",
        message: response.data.message,
      });
      close();
    } catch (error) {
      console.error("Failed to update address", error);
      if (error.response) {
        Notifications.show({
          title: "Thông báo",
          message: "Cập nhật địa chỉ không thành công.",
        });
      }
    }
  };

  return (
    <Box className="p-8 w-full border-md shadow-xl bg-white">
      <Text className="text-xl font-bold mb-6">Thông tin tài khoản</Text>
      <Box className="grid grid-cols-2 gap-8">
        <Box>
          <Text className="font-bold text-gray-500 mb-4">
            Thông tin cá nhân
          </Text>
          <Box className="flex justify-between mb-4 flex-wrap">
            <div className="flex flex-row ">
              <Avatar
                size="lg"
                radius="xl"
                src={avatar}
                className="mr-4 text-blue-400"
              />
              <div>
                {isEditingFullName ? (
                  <TextInput
                    value={fullName}
                    onChange={(e) => setFullName(e.currentTarget.value)}
                    placeholder="Nhập họ và tên mới"
                  />
                ) : (
                  <div>
                    <Text className="font-semibold">{fullName}</Text>
                    <Text className="text-sm text-gray-500">@{username}</Text>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-1/4 max-w-32"
              onClick={() =>
                isEditingFullName
                  ? handleUpdateUser()
                  : setIsEditingFullName(true)
              }
            >
              {isEditingFullName ? "Lưu" : "Cập nhật"}
            </Button>
          </Box>
          <Divider my="md" />
          <Box className="flex items-center mb-4">
            <IconMapPin size={20} className="mr-2 text-blue-400" />
            <Text className="flex-grow">Địa chỉ: {fullAddress}</Text>

            <Button onClick={open} variant="outline" className="w-1/3 max-w">
              Cập nhật
            </Button>

            <Modal
              opened={opened}
              onClose={close}
              title="Nhập địa chỉ mới"
              centered
            >
              <TextInput
                label="Tên đường"
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                placeholder="Nhập tên đường"
              />
              <Select
                label="Tỉnh/Thành phố"
                placeholder="Chọn Tỉnh/Thành phố"
                data={provinces}
                value={selectedProvince}
                onChange={(value) => {
                  setSelectedProvince(value);
                  setSelectedDistrict(null);
                  setSelectedWard(null);
                  console.log("Selected Province:", value);
                }}
              />
              <Select
                label="Quận/Huyện"
                placeholder="Chọn Quận/Huyện"
                data={districts}
                value={selectedDistrict}
                onChange={(value) => {
                  setSelectedDistrict(value);
                  setSelectedWard(null);
                  console.log("Selected District:", value);
                }}
                disabled={!selectedProvince}
              />
              <Select
                label="Phường/Xã"
                placeholder="Chọn Phường/Xã"
                data={wards}
                value={selectedWard}
                onChange={(value) => {
                  setSelectedWard(value);
                  console.log("Selected Ward:", value);
                }}
                disabled={!selectedDistrict}
              />

              <Button onClick={handleUpdateAddress}>Lưu địa chỉ</Button>
            </Modal>
          </Box>
        </Box>

        <Box>
          <Text className="font-bold text-gray-500 mb-4">
            Số điện thoại và Email
          </Text>

          {/* Số điện thoại */}
          <Box className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <IconPhone size={20} className="mr-2 text-blue-400" />
              {isEditingPhone ? (
                <TextInput
                  value={phone}
                  onChange={(e) => setPhone(e.currentTarget.value)}
                  placeholder="Nhập số điện thoại mới"
                />
              ) : (
                <Text>Số điện thoại: {phone}</Text>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() =>
                isEditingPhone ? handleUpdateUser() : setIsEditingPhone(true)
              }
            >
              {isEditingPhone ? "Lưu" : "Cập nhật"}
            </Button>
          </Box>

          {/* Email */}
          <Box className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <IconMail size={20} className="mr-2 text-blue-400" />
              {isEditingEmail ? (
                <TextInput
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder="Nhập email mới"
                />
              ) : (
                <Text>Email: {email}</Text>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() =>
                isEditingEmail ? handleUpdateUser() : setIsEditingEmail(true)
              }
            >
              {isEditingEmail ? "Lưu" : "Cập nhật"}
            </Button>
          </Box>

          <Box className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <IconLock size={20} className="mr-2 text-blue-400" />
              <Text>Đổi mật khẩu</Text>
            </div>
            <Button variant="outline" disabled>
              Cập nhật
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AccountContent;
