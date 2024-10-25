// userUpdate-services.ts
import prismaService from "../../prisma.service";
import { User } from "@prisma/client";

export const findAddressNamesByCodes = async (
  provinceCode: string,
  districtCode: string,
  wardCode: string
) => {
  try {
    const province = await prismaService.province.findUnique({
      where: { Code: provinceCode },
      select: { Name: true },
    });

    const district = await prismaService.district.findUnique({
      where: { Code: districtCode },
      select: { Name: true },
    });

    const ward = await prismaService.ward.findUnique({
      where: { Code: wardCode },
      select: { Name: true },
    });

    return {
      provinceName: province?.Name || "Unknown Province",
      districtName: district?.Name || "Unknown District",
      wardName: ward?.Name || "Unknown Ward",
    };
  } catch (error) {
    console.error("Error finding address names by codes:", error);
    throw new Error(`Error finding address names: ${error}`);
  }
};

export const updateUserInfoService = async (
  id: number,
  userData: Partial<Pick<User, "email" | "fullName" | "phone">>
) => {
  try {
    const user = await prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prismaService.user.update({
      where: { id },
      data: {
        ...userData,
        updatedAt: new Date(),
      },
    });

    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user info: ${error}`);
  }
};

export const updateUserAddressService = async (
  id: number,
  addressData: {
    address: string;
    provinceCode: string;
    districtCode: string;
    wardCode: string;
  }
) => {
  try {
    const user = await prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prismaService.user.update({
      where: { id },
      data: {
        address: addressData.address,
        provinceCode: addressData.provinceCode,
        districtCode: addressData.districtCode,
        wardCode: addressData.wardCode,
        updatedAt: new Date(),
      },
    });

    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user address: ${error}`);
  }
};
