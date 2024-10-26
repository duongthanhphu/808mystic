import { Request, Response } from 'express';
import {  Prisma, UserType, UserStatus, User } from '@prisma/client';
import prismaService from '../prisma.service';
import passwordBcrypt from '../Utils/bcrypt'
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendVerificationEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification Code',
        html: `
            <h1>Email Verification</h1>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 15 minutes.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Step 1: Register with email verification
const registerWithVerification = async (req: Request, res: Response) => {
    const { 
        username,
        password,
        email, 
        fullName,
        avatar,
        provinceCode,
        districtCode,
        wardCode,
        address
    } = req.body;

    try {
        const existingUser = await prismaService.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const passwordClient = passwordBcrypt.passwordGenerate(password);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create unverified user
        const userFromClient = {
            username,
            email,
            passwordSalt: passwordClient.salt,
            passwordHash: passwordClient.hash,
            passwordIterations: 10000,
            avatar,
            fullName,
            userType: UserType.CUSTOMER,
            status: UserStatus.AVAILABLE,
            emailVerified: false,
            otp,
            otpExpires,
            createdAt: new Date(),
            provinceCode,
            districtCode,
            wardCode,
            address
        };

        await prismaService.user.create({ data: userFromClient });
        await sendVerificationEmail(email, otp);

        res.status(201).json({ 
            message: "Registration successful. Please check your email for verification code."
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error during registration' });
    }
};
// Step 2: Verify OTP
const verifyEmail = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const accessTokenFromEnv: string | undefined = process.env.ACCESS_TOKEN;
    const refreshTokenFromEnv: string | undefined = process.env.REFRESH_TOKEN;

    try {
        if (!accessTokenFromEnv || !refreshTokenFromEnv) {
            return res.status(500).json({ error: 'Internal server error - Token configuration missing' });
        }

        const user = await prismaService.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ error: 'No OTP found' });
        }

        if (new Date() > user.otpExpires) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Update user verification status
        await prismaService.user.update({
            where: { email },
            data: {
                emailVerified: true,
                otp: null,
                otpExpires: null
            }
        });

        // Generate tokens
        const accessToken = jwt.sign({ userId: user.id }, accessTokenFromEnv, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, refreshTokenFromEnv, { expiresIn: '7d' });

        // Store refresh token in session
        await prismaService.session.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            }
        });

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ 
            message: 'Email verified successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
                userType: user.userType,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Error during verification' });
    }
};
// Step 3: Resend OTP if needed
const resendOTP = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await prismaService.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

        await prismaService.user.update({
            where: { email },
            data: {
                otp,
                otpExpires
            }
        });

        await sendVerificationEmail(email, otp);

        res.json({ message: 'New OTP sent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Error resending OTP' });
    }
};

const signin = async (req: Request, res: Response) => {
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
            await prismaService.session.create({
                    data: {
                        userId: user.id,
                        refreshToken,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Ngày
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
};

const findAllUserHandler = async (req: Request, res: Response) => {
    try {
        const user = await prismaService.user.findMany({})
        res.json({
            message: 'success',
            user: user
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
}

const findUserByIdHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prismaService.user.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                addresses: true
            }
        })
        console.log(user)
        user === null || user === undefined
        ? res.status(404).json({ error: 'User not found' }) 
        : res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
};

const getProvinces = async (req: Request, res: Response) => {
    try {
        const provinces = await prismaService.province.findMany({
            select: { id: true, Name: true }
        });
        res.json(provinces);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách tỉnh/thành phố' });
    }
};

const getDistricts = async (req: Request, res: Response) => {
    const { provinceId } = req.params;
    try {
        const districts = await prismaService.district.findMany({
            where: { ProvinceCode: provinceId },
            select: { id: true, Name: true }
        });
        res.json(districts);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách quận/huyện' });
    }
};

const getWards = async (req: Request, res: Response) => {
    const { districtId } = req.params;
    try {
        const wards = await prismaService.ward.findMany({
            where: { DistrictCode: districtId },
            select: { id: true, Name: true }
        });
        res.json(wards);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách phường/xã' });
    }
};

export default {
    findAllUserHandler,
    findUserByIdHandler,
    registerWithVerification,
    signin,
    verifyEmail,
    resendOTP,
    getProvinces,
    getDistricts,
    getWards
}
