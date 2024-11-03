import { Request, Response } from 'express';
import { Prisma, UserType, UserStatus, SellerStatus, EmailVerificationStatus } from '@prisma/client';
import { generateOTP, sendVerificationEmail } from '../Utils/EmailService';
import prismaService from '../prisma.service';
import passwordBcrypt from '../Utils/bcrypt';
import jwt from 'jsonwebtoken';

const registerOrUpgradeToSeller = async (req: Request, res: Response) => {
    const { 
        username, 
        password, 
        email, 
        phone, 
        storeName, 
        pickUpAddress, 
        provinceId, 
        districtId, 
        wardId 
    } = req.body;
    
    if (!username || !email || !phone || !storeName || !pickUpAddress || !provinceId || !districtId || !wardId) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    const passwordClient = passwordBcrypt.passwordGenerate(password);
    try {
        const result = await prismaService.$transaction(async (prisma) => {
            // Find or create User
            const user = await prisma.user.upsert({
                where: { email },
                update: {
                    userType: UserType.SELLER,
                    status: UserStatus.UNAVAILABLE,
                },
                create: {
                    username,
                    email,
                    phone,
                    passwordSalt: password ? passwordClient.salt : '',
                    passwordHash: password ? passwordClient.hash : '',
                    passwordIterations: 10000,
                    avatar: 'default_avatar.png',
                    fullName: username,
                    userType: UserType.SELLER,
                    status: UserStatus.UNAVAILABLE,
                    emailVerified: false,
                    emailVerificationStatus: EmailVerificationStatus.PENDING,
                },
            });
            console.log(passwordBcrypt.comparePassword(password, user.passwordSalt, user.passwordHash));

            // Find or create Seller
            const seller = await prisma.seller.upsert({
                where: { userId: user.id },
                update: {
                    storeName,
                    pickupAddress: pickUpAddress,
                    status: SellerStatus.PENDING,
                },
                create: {
                    userId: user.id,
                    storeName,
                    pickupAddress: pickUpAddress,
                    email: user.email || '',
                    status: SellerStatus.PENDING,
                },
            });

            const sellerAddress = await prisma.address.upsert({
                where: { 
                    userId_sellerId: {
                        userId: user.id,
                        sellerId: seller.id
                    }
                },
                update: {
                    provinceId,
                    districtId,
                    wardId,
                },
                create: {
                    userId: user.id,
                    sellerId: seller.id,
                    provinceId,
                    districtId,
                    wardId,
                },
            });

            const defaultWarehouse = await prisma.warehouse.create({
                data: {
                    sellerId: seller.id,
                    name: "Kho mặc định",
                    code: `WH-${seller.id}-${Date.now()}`,
                    address: pickUpAddress,
                    provinceId: Number(sellerAddress.provinceId),
                    districtId: Number(sellerAddress.districtId),
                    wardId: Number(sellerAddress.wardId),
                    status: "ACTIVE",
                    description: "Kho hàng mặc định được tạo tự động"
                }
            });


            return { user, seller, defaultWarehouse };
        });

        if (!result.user.emailVerified) {
            const otp = generateOTP().substring(0, 4);
            await prismaService.user.update({
                where: { id: result.user.id },
                data: { 
                    otp,
                    otpExpires: new Date(Date.now() + 15 * 60 * 1000)
                }
            });

            await sendVerificationEmail(email, otp);

            return res.status(201).json({
                message: "Vui lòng kiểm tra email để xác thực và hoàn tất đăng ký người bán.",
                userId: result.user.id,
                warehouseId: result.defaultWarehouse.id // Thêm warehouseId vào response
            });
        } else {
            return res.status(200).json({
                message: "Tài khoản đã được nâng cấp thành người bán thành công",
                sellerId: result.seller.id
            });
        }
    } catch (error) {
        console.error('Lỗi trong quá trình đăng ký/nâng cấp người bán:', error);
        return res.status(500).json({ error: 'Lỗi xử lý yêu cầu', details: error });
    }
};

const verifyEmailAndActivateSeller = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        const user = await prismaService.user.findUnique({
            where: { email },
            include: { seller: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ success: false, message: 'Email đã được xác thực trước đó' });
        }

        if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
            return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn' });
        }

        const updatedUser = await prismaService.user.update({
            where: { id: user.id },
            data: { 
                emailVerified: true,
                status: UserStatus.AVAILABLE,
                userType: UserType.SELLER,
                otp: null,
                otpExpires: null,
                emailVerificationStatus: EmailVerificationStatus.VERIFIED,
                seller: {
                    update: {
                        status: SellerStatus.APPROVED
                    }
                }
            },
            include: { seller: true }
        });

        res.status(200).json({ 
            success: true, 
            message: 'Email đã được xác thực và tài khoản người bán đã được kích hoạt thành công',
            sellerId: updatedUser.seller?.id
        });
    } catch (error) {
        console.error('Lỗi khi xác thực email và kích hoạt tài khoản người bán:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi xử lý yêu cầu' });
    }
};

const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const accessTokenFromEnv: string | undefined = process.env.ACCESS_TOKEN;
    const refreshTokenFromEnv: string | undefined = process.env.REFRESH_TOKEN;
    console.log('Thông tin đăng nhập:', { username, password });

    try {
        const user = await prismaService.user.findUnique({ 
            where: { 
                username: username
            } 
        });

        if (!user) {
            return res.status(401).json({ error: 'Không tìm thấy người dùng' });
        }

        console.log('Thông tin người dùng:', { 
            passwordSalt: user.passwordSalt, 
            passwordHash: user.passwordHash 
        });

        const isPasswordValid = passwordBcrypt.comparePassword(password, user.passwordSalt, user.passwordHash);
        console.log('Kết quả kiểm tra mật khẩu:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Mật khẩu không đúng' });
        }

        if (!accessTokenFromEnv || !refreshTokenFromEnv) {
            return res.status(500).json({ error: 'Lỗi cấu hình máy chủ' });
        }

        const accessToken = jwt.sign({ userId: user.id, role: user.userType }, accessTokenFromEnv, { expiresIn: '2d' });
        const refreshToken = jwt.sign({ userId: user.id, role: user.userType }, refreshTokenFromEnv, { expiresIn: '7d' });
        
        await prismaService.session.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
            }
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 24 * 60 * 60 * 1000 // 2 ngày
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        return res.status(200).json({ 
            message: 'Đăng nhập thành công',
            success: true,
            user: {
                id: user.id,
                email: user.email,
                userType: user.userType,
                username: user.username,
                role: user.userType
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi xử lý yêu cầu đăng nhập', details: error });
    }
};

const getSellerDetails = async (req: Request, res: Response) => {
    const { sellerId } = req.params;

    try {
        const seller = await prismaService.seller.findUnique({
            where: { id: Number(sellerId) },
            include: {
                user: true,
                addresses: {
                    include: {
                        province: true,
                        district: true,
                        ward: true
                    }
                },
            }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Không tìm thấy người bán' });
        }

        const productCount = await prismaService.product.count({
            where: { sellerId: seller.userId }
        });

        const sellerDetails = {
            id: seller.id,
            userId: seller.userId,
            storeName: seller.storeName,
            email: seller.email,
            status: seller.status,
            fullAddress: seller.addresses.length > 0 
                ? `${seller.pickupAddress}, ${seller.addresses[0].ward.Name}, ${seller.addresses[0].district.Name}, ${seller.addresses[0].province.Name}`
                : 'Chưa cập nhật địa chỉ',
            joinDate: seller.createdAt,
            totalProducts: productCount,
            user: {
                username: seller.user.username,
                fullName: seller.user.fullName,
                phone: seller.user.phone,
                avatar: seller.user.avatar
            }
        };

        res.status(200).json(sellerDetails);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin chi tiết người bán:', error);
        res.status(500).json({ error: 'Lỗi xử lý yêu cầu' });
    }
};

const getSellerProducts = async (req: Request, res: Response) => {
    const { sellerId } = req.params;

    try {
        const products = await prismaService.product.findMany({
            where: { sellerId: Number(sellerId) },
            include: {
                images: true,
                category: true,
                classifications: {
                    include: {
                        option1: true,
                        option2: true
                    }
                },
                classificationGroups: {
                    include: {
                        options: true
                    }
                }
            }
        });

        const formattedProducts = products.map(product => {
            let minPrice = Infinity;
            let maxPrice = 0;

            if (product.hasClassification && product.classifications.length > 0) {
                product.classifications.forEach(classification => {
                    const price = Number(classification.price);
                    if (price < minPrice) minPrice = price;
                    if (price > maxPrice) maxPrice = price;
                });
            }

            return {
                id: product.id,
                name: product.name,
                shortDescription: product.shortDescription,
                longDescription: product.longDescription,
                slug: product.slug,
                status: product.status,
                categoryName: product.category.name,
                hasClassification: product.hasClassification,
                priceRange: product.hasClassification 
                    ? `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} đ`
                    : product.classifications.length > 0
                        ? `${Number(product.classifications[0].price).toLocaleString()} đ`
                        : 'Liên hệ',
                images: product.images.map(img => ({
                    id: img.id,
                    path: img.path,
                    isThumbnail: img.isThumbnail
                })),
                classificationGroups: product.classificationGroups.map(group => ({
                    id: group.id,
                    name: group.name,
                    options: group.options.map(option => ({
                        id: option.id,
                        name: option.name
                    }))
                })),
                classifications: product.classifications.map(classification => ({
                    id: classification.id,
                    option1: classification.option1.name,
                    option2: classification.option2 ? classification.option2.name : null,
                    price: Number(classification.price).toLocaleString() + ' đ',
                    stock: classification.stock
                }))
            };
        });

        res.status(200).json({ 
            success: true, 
            products: formattedProducts
        });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm của người bán:', error);
        res.status(500).json({ success: false, error: 'Lỗi xử lý yêu cầu' });
    }
};


export default {
    registerOrUpgradeToSeller,
    verifyEmailAndActivateSeller,
    login,
    getSellerDetails,
    getSellerProducts,
}
