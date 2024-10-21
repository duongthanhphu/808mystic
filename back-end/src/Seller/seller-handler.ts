import { Request, Response } from 'express';
import {  Prisma, UserType, UserStatus, User, SellerStatus } from '@prisma/client';
import prismaService from '../prisma.service';
import { createGHTKShop } from '../Order/GHTK/ghtk-service';
import passwordBcrypt from '../Utils/bcrypt'
import jwt from 'jsonwebtoken';
import { countProductsBySeller, getProductsBySeller } from './seller-queries';

export const registerOrUpgradeToSeller = async (req: Request, res: Response) => {
    const { username, storeName, password, pickUpAddress, email, provinceId, districtId, wardId, phone } = req.body;
    console.log(req.body)
    if (!username || !storeName || !pickUpAddress || !email || !phone || !(provinceId && districtId && wardId)) {
        return res
            .status(400)
            .json({ error: 'Missing required fields: username, storeName, pickUpAddress, email, phone or complete address' });
    }

    try {
        const existingUser = await prismaService.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            const updatedUser = await prismaService.user.update({
                where: { id: existingUser.id },
                data: {
                    userType: UserType.SELLER,
                    phone, 
                    seller: {
                        create: {
                            storeName,
                            pickupAddress: pickUpAddress,
                            email,
                            status: SellerStatus.PENDING,
                            addresses: {
                                create: {
                                    provinceId,
                                    districtId,
                                    wardId
                                }
                            }
                        }
                    },
                    addresses: {
                        create: {
                            provinceId,
                            districtId,
                            wardId
                        }
                    }
                },
                include: {
                    addresses: true,
                    seller: {
                        include: {
                            addresses: true
                        }
                    }
                }
            });

            // try {
            //     // Create GHTK shop for existing user
            //     const ghtkResponse = await createGHTKShop(updatedUser.seller!.id, updatedUser.addresses[0]);
                
            //     // Update seller with GHTK shop ID if available
            //     if (ghtkResponse.success && ghtkResponse.data?.shop_id) {
            //         await prismaService.seller.update({
            //             where: { id: updatedUser.seller!.id },
            //             data: {
            //                 ghtkShopId: ghtkResponse.data.shop_id
            //             }
            //         });
            //     }
            //     console.log(ghtkResponse)
            // } catch (ghtkError) {
            //     console.error('Failed to create GHTK shop:', ghtkError);
                
            // }

            return res.status(200).json({
                message: "User upgraded to seller successfully.",
                userId: updatedUser.id,
                userAddress: updatedUser.addresses[0],
                sellerAddress: updatedUser.seller?.addresses[0]
            });
        } else {
            if (!password) {
                return res.status(400).json({ error: 'Password is required for new user registration' });
            }

            const passwordClient = passwordBcrypt.passwordGenerate(password);
            const newUser = await prismaService.user.create({
                data: {
                    username,
                    email,
                    phone, // Add phone number
                    passwordSalt: passwordClient.salt,
                    passwordHash: passwordClient.hash,
                    passwordIterations: 10000,
                    avatar: 'default_avatar.png',
                    fullName: username,
                    userType: UserType.SELLER,
                    status: UserStatus.AVAILABLE,
                    emailVerified: false,
                    seller: {
                        create: {
                            storeName,
                            pickupAddress: pickUpAddress,
                            email,
                            status: SellerStatus.PENDING,
                            addresses: {
                                create: {
                                    provinceId,
                                    districtId,
                                    wardId
                                }
                            }
                        }
                    },
                    addresses: {
                        create: {
                            provinceId,
                            districtId,
                            wardId
                        }
                    }
                },
                include: {
                    addresses: true,
                    seller: {
                        include: {
                            addresses: true
                        }
                    }
                }
            });

            // try {
            //     // Create GHTK shop for new user
            //     const ghtkResponse = await createGHTKShop(newUser.seller!.id, newUser.addresses[0]);
                
            //     // Update seller with GHTK shop ID if available
            //     if (ghtkResponse.success && ghtkResponse.data?.shop_id) {
            //         await prismaService.seller.update({
            //             where: { id: newUser.seller!.id },
            //             data: {
            //                 ghtkShopId: ghtkResponse.data.shop_id
            //             }
            //         });
            //     }
            //     console.log(ghtkResponse)
            // } catch (ghtkError) {
            //     console.error('Failed to create GHTK shop:', ghtkError);
            //     // Continue with the response but log the error
            // }

            return res.status(201).json({
                message: "New seller account created successfully.",
                userId: newUser.id,
                userAddress: newUser.addresses[0],
                sellerAddress: newUser.seller?.addresses[0]
            });
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Username or email already exists' });
            } else {
                res.status(400).json({ error: 'Invalid user data' });
            }
        } else {
            console.error('Error in user registration or upgrade:', error);
            res.status(500).json({ error: 'Error processing request' });
        }
    }
};

const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const accessTokenFromEnv: string | undefined = process.env.ACCESS_TOKEN;
    const refreshTokenFromEnv: string | undefined = process.env.REFRESH_TOKEN;
    
    try {
        const user = await prismaService.user.findUnique({ where: { username } });
        if (user && passwordBcrypt.comparePassword(password, user.passwordSalt, user.passwordHash)) {

            if (!accessTokenFromEnv) return res.status(500).json({ error: 'Internal server error' });
            if (!refreshTokenFromEnv) return res.status(500).json({ error: 'Internal server error' });
            

            const accessToken = jwt.sign({ userId: user.id }, accessTokenFromEnv, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ userId: user.id }, refreshTokenFromEnv, { expiresIn: '7d' });
            const session = await prismaService.session.create({
                    data: {
                        userId: user.id,
                        refreshToken,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
                    }
            });
            res.cookie('accessToken', accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000 // 15 phút
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
            });


            return res.status(200).json({ message: 'Đăng nhập thành công' }); 
        }

        return res.status(401).json({ error: 'Sai mật khẩu hoặc tài khoản' });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Error during login' 
        });
    }
}

const getShopDetails = async (req: Request, res: Response) => {
    const { sellerId } = req.params;
    console.log(sellerId)
    try {
        const seller = await prismaService.seller.findUnique({
            where: { id: Number(sellerId) },
            include: { user: true } // Bao gồm thông tin người dùng
        });

        if (!seller) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        res.status(200).json({
            shop: {
                id: seller.id,
                storeName: seller.storeName,
                email: seller.email,
                phone: seller.user.phone,
                productCount: await countProductsBySeller(seller.id),
                // createdAt: seller.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching shop details:', error);
        res.status(500).json({ error: 'Error fetching shop details' });
    }
};
const getProductsForShop = async (req: Request, res: Response) => {
    const { sellerId } = req.params;
    console.log(sellerId)
    try {
        const products = await getProductsBySeller(Number(sellerId));

        res.status(200).json({
            products
        });
    } catch (error) {
        console.error('Error fetching products for shop:', error);
        res.status(500).json({ error: 'Error fetching products for shop' });
    }
};

export default {
    registerOrUpgradeToSeller,
    login,
    getShopDetails,
    getProductsForShop
}



