import { Request, Response } from 'express';
import {  Prisma, UserType, UserStatus, User } from '@prisma/client';
import prismaService from '../prisma.service';
import passwordBcrypt from '../Utils/bcrypt'
import jwt from 'jsonwebtoken';


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
        })
        user === null || user === undefined
        ? res.status(404).json({ error: 'User not found' }) 
        : res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
};

const signup = async (req: Request, res: Response) => {
    const { 
        username,
        password,
        email, 
        fullName,
        avatar,
    } = req.body;
    try {
        const passwordClient = passwordBcrypt.passwordGenerate(password);
        const userFromClient = {
            username: username,
            email: email,
            passwordSalt: passwordClient.salt, 
            passwordHash: passwordClient.hash, 
            passwordIterations: 10000, 
            avatar: avatar,
            fullName: fullName,
            userType: UserType.CUSTOMER, 
            status: UserStatus.AVAILABLE, 
            emailVerified: false,
            verificationToken: passwordClient.verificationPin, 
            tokenExpiry: passwordClient.pinExpiry, 
            createdAt: new Date(), 
        };
        const newUser = await prismaService.user.create({data: userFromClient});
        console.log("Người dùng chưa tồn tại: " + newUser)
        res.status(201).json({ 
            message: "User created successfully."
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Username or email already exists' });
            } else {
                res.status(400).json({ error: 'Invalid user data' });
            }
        } else {
            console.error(error); 
            res.status(500).json({ error: 'Error creating user' });
        }
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
            const session = await prismaService.session.create({
                    data: {
                        userId: user.id,
                        refreshToken,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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


export default {
    findAllUserHandler,
    findUserByIdHandler,
    signup,
    signin,
}