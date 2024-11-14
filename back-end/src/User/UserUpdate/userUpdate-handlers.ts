// // userUpdate-handlers.ts
// import { Request, Response } from "express";
// import {
//   updateUserInfoService,
//   updateUserAddressService,
//   findAddressNamesByCodes,
// } from "./userUpdate-services";
// import prismaService from "../../prisma.service";

// export const getAddressHandler = async (req: Request, res: Response) => {
//   const userId = Number(req.params.id);

//   try {
//     const user = await prismaService.user.findUnique({
//       where: { id: userId },
//       select: {
//         address: true,
//         provinceCode: true,
//         districtCode: true,
//         wardCode: true,
//       },
//     });

//     if (!user || !user.provinceCode || !user.districtCode || !user.wardCode) {
//       return res.status(404).json({ error: "Address not found" });
//     }

//     const { provinceName, districtName, wardName } =
//       await findAddressNamesByCodes(
//         user.provinceCode,
//         user.districtCode,
//         user.wardCode
//       );

//     const fullAddress = `${user.address}, phường ${wardName}, huyện ${districtName}, ${provinceName}`;
//     res.status(200).json({ fullAddress });
//   } catch (error) {
//     console.error("Error fetching address:", error);
//     res.status(500).json({ error: "Error fetching address" });
//   }
// };

// const updateUserInfo = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const userData = req.body;
//   console.log("Received user data:", userData);
//   if (!userData) {
//     return res.status(400).json({ error: "Invalid user data" });
//   }
//   try {
//     const updatedUser = await updateUserInfoService(Number(id), userData);
//     res.json({
//       message: "User information updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Update user info error:", error);
//     res.status(500).json({ error });
//   }
// };

// const updateUserAddress = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const addressData = req.body;

//   try {
//     const updatedUser = await updateUserAddressService(Number(id), addressData);
//     res.json({
//       message: "User address updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Update user address error:", error);
//     res.status(500).json({ error });
//   }
// };

// export default {
//   updateUserInfo,
//   updateUserAddress,
//   getAddressHandler,
// };
