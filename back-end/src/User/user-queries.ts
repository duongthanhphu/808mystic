import prismaService from "../prisma.service";
import { Prisma } from '@prisma/client';

const findAll = async () => {
    try {
        return await prismaService.user.findMany({
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const findById = async (id: string) => {
    try {
        return await prismaService.user.findUnique({
            where: {
                id: Number(id)
            },
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const findByUsername = async (username: string) => {
    try {
        console.log(username)
        return await prismaService.user.findUnique({
            where: {
                username: username
            }
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const findByPassword = async (
    passwordSalt: string,
    passwordHash: string,
    passwordIterations: number
) => {
    try {
        const whereClause = {
            passwordSalt,
            passwordHash,
            passwordIterations
        } as Prisma.UserWhereInput;

        return await prismaService.user.findFirst({
            where: whereClause
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
};

const findExistingUser = async (username: string, email: string) => {
    try {
        return await prismaService.user.findFirst({
            where: {
                OR: [
                { username },
                { email }
                ]
            }
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const createUser = async (
    user: Prisma.UserUncheckedCreateInput
) => {
    try {
        return await prismaService.user.create({
            data: user
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const updateUser = async (id: number, user: Prisma.UserUncheckedCreateInput) => {
    try {
        return await prismaService.user.update({
            where: {
                id: id
            },
            data: user
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const deleteUser = async (id: number) => {
    try {
        return await prismaService.user.delete({
            where: {
                id: id
            },
        })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const deleteManyUser = (id: number) => {
    try {
        return prismaService.user.delete({
                    where: {
                        id: id
                    },
                })
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

export {
    findAll,
    findById,
    findExistingUser,
    findByUsername,
    findByPassword,
    createUser,
    updateUser,
    deleteUser,
    deleteManyUser
}