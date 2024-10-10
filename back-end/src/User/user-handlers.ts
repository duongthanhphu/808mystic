import { PrismaClient, Prisma, User, UserType, UserStatus } from '@prisma/client';
const prisma = new PrismaClient();

import { Request, Response } from 'express';
import {
            generateRandomSalt,
            hashPassword,
            comparePassword
        } from '../Utils/bcrypt'
import {
        findAll,
        findById,
        findExistingUser,
        findByUsername,
        findByPassword,
        createUser,
        updateUser,
        deleteUser,
        deleteManyUser
    } from './user-queries'
import crypto from 'crypto'; 
import nodemailer from 'nodemailer';

const findAllUserHandler = async (req: Request, res: Response) => {
    try {
        const users = await findAll()
        res.json({
            message: 'success',
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
}

const findUserByIdHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await findById(id)
        user === null || user === undefined
        ? res.status(404).json({ error: 'User not found' }) 
        : res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
};

const generateVerificationPin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();  
}

const signup = async (req: Request, res: Response) => {
    const { 
        username,
        password,
        email, 
        fullName,
        avatar,
    } = req.body;
    console.log(req.body)
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            }
        });
        if (existingUser) return res.status(400).json({ error: 'Username or email already exists' });

        const passwordSalt = generateRandomSalt(10); 
        const passwordHash = hashPassword(password, passwordSalt);
        
        const verificationPin = generateVerificationPin();
        const pinExpiry = new Date(Date.now() + 1000 * 60 * 10); 

        const userFromClient = {
            username,
            email,
            passwordSalt,
            passwordHash,
            passwordIterations: 10000, 
            avatar,
            fullName,
            userType: UserType.CUSTOMER,
            status: UserStatus.UNAVAILABLE, 
            emailVerified: false,
            verificationToken: verificationPin, 
            tokenExpiry: pinExpiry,
            createdAt: new Date(),
        };

        const newUser = await prisma.user.create({
            data: userFromClient,
        });
        
        await sendVerificationEmail(email, verificationPin);

        res.status(201).json({ message: 'User created. Please verify your email.' });
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
const sendVerificationEmail = async (email: string, pin: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or another email provider
        auth: {
            user: 'haylamditmemay1996@gmail.com',
            pass: 'bwwr jrwg znwc ahiz',
        },
    });

    const mailOptions = {
        from: 'haylamditmemay1996@gmail.com',
        to: email,
        subject: 'Verify your email',
        html: `<h3>Verify your email using this code:</h3><h2>${pin}</h2>`,
    };

    await transporter.sendMail(mailOptions);
};

const verifyEmail = async (req: Request, res: Response) => {
    const { email, code } = req.body;
    console.log(email)

    try {
        const user = await prisma.user.findFirst({
            where: { email, verificationToken: code }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired PIN' });
        

        if (user.tokenExpiry && new Date() > user.tokenExpiry) return res.status(400).json({ error: 'PIN expired' });
        

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null, 
                tokenExpiry: null 
            }
        });

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error verifying email' });
    }
};


const signin = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const user = await findByUsername(username)

        if (!user) return res.status(401).json({ error: 'Invalid username or password' });
        

        const isPasswordValid = comparePassword(password, user.passwordSalt ,user.passwordHash);

        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid username or password' });
        

        const {  ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Error during login' 
        });
    }
};

export {
    findAllUserHandler,
    findUserByIdHandler,
    signup,
    signin,
    verifyEmail 
}