import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const findAll = async () => {
    try {
        return await prisma.user.findMany({
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
        return await prisma.user.findUnique({
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
        return await prisma.user.findUnique({
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

        return await prisma.user.findFirst({
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
        return await prisma.user.findFirst({
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
        return await prisma.user.create({
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
        return await prisma.user.update({
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
        return await prisma.user.delete({
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
        return prisma.user.delete({
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