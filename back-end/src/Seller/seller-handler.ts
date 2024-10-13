import { Request, Response } from 'express';
import {  Prisma, UserType, UserStatus, User, SellerStatus } from '@prisma/client';
import prismaService from '../prisma.service';
import passwordBcrypt from '../Utils/bcrypt'
import jwt from 'jsonwebtoken';


export const registerOrUpgradeToSeller = async (req: Request, res: Response) => {
    const { username, storeName, password, pickUpAddress, email, provinceId, districtId, wardId } = req.body;

    if (!username || !storeName || !pickUpAddress || !email && !(provinceId && districtId && wardId)) {
        return res
        .status(400)
        .json({ error: 'Missing required username or storeName or pickUpAddress or email  or complete address ' });
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

            return res.status(200).json({
                message: "User upgraded to seller successfully.",
                userId: updatedUser.id,
                userAddress: updatedUser.addresses[0],
                sellerAddress: updatedUser.seller?.addresses[0]
            });
        } else {
            // Nếu người dùng chưa tồn tại, tạo mới và đặt làm Seller
            if (!password) return res.status(400).json({ error: 'Password is required for new user registration' });
            
            
            const passwordClient = passwordBcrypt.passwordGenerate(password);
            const newUser = await prismaService.user.create({
                data: {
                    username,
                    email,
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

export default {
    registerOrUpgradeToSeller,
    login
}

