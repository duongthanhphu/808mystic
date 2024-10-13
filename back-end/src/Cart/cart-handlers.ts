import { query, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

const findCartById = async (req: Request, res: Response) => {
    const userId = 1
    console.log(userId)
    try {
            let cart = await prisma.cart.findUnique({
                where: { userId },
                include: {
                    items: {
                    include: {
                        product: true,
                        classification: true
                    }
                    }
                }
            })
            if (!cart) {
                cart = await prisma.cart.create({
                    data: { userId },
                    include: {
                    items: {
                        include: {
                        product: true,
                        classification: true
                        }
                    }
                    }
                })
            }
            res.json(cart)
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const createCart = async (req: Request, res: Response) => {
    const userId = 1
    const { productId, classificationId, quantity } = req.body
    console.log(req.body)
    try {
            const product = await prisma.product.findUnique({
                where: { id: productId }
            })
            if (!product) {
                return res.status(404).json({ error: 'Sản phẩm không tồn tại' })
            }

                // Lấy hoặc tạo giỏ hàng
            let cart = await prisma.cart.findUnique({
                where: { userId }
            })
            if (!cart) {
                cart = await prisma.cart.create({
                    data: { userId }
                })
            }
            const existingItem = await prisma.cartItem.findFirst({
                where: {
                    cartId: cart.id,
                    productId,
                    classificationId
                }
            })

            if (existingItem) {
            const updatedItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
                include: {
                product: true,
                classification: true
                }
            })
            res.json(updatedItem)
            } else {
                const newItem = await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        classificationId,
                        quantity
                    },
                    include: {
                    product: true,
                    classification: true
                    }
                })
                res.json(newItem)
            }
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const updateCart = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params
        const { quantity } = req.body
        const userId = 1

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: parseInt(itemId),
                cart: {
                userId
                }
            }
        })

        if (!cartItem) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng' })
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: parseInt(itemId) },
            data: { quantity },
            include: {
                product: true,
                classification: true
            }
        })

        res.json(updatedItem)
    } catch (error) {
        res.status(500).json({ error: 'Không thể cập nhật số lượng sản phẩm' })
    }
}

const deleteCart = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params
        const userId = 1
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: parseInt(itemId),
                cart: {
                userId
                }
            }
        })
        if (!cartItem) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng' })
        }
        await prisma.cartItem.delete({
            where: { id: parseInt(itemId) }
        })
        res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' })
    } catch (error) {
        res.status(500).json({ error: 'Không thể xóa sản phẩm khỏi giỏ hàng' })
    }
}

export default { 
    findCartById,
    updateCart,
    deleteCart,
    createCart

};