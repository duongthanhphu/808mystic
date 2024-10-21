import { query, Request, Response } from 'express';
import { PrismaClient, Prisma, Cart } from '@prisma/client';
const prisma = new PrismaClient();

const findCartById = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
            let cart = await prisma.cart.findUnique({
                where: { id: Number(id) },

            })

            res.json(cart)
    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

const findCarts = async (req: Request, res: Response) => {
    
    try {
            let cart = await prisma.cart.findMany({
                
            })

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

    const data = req.body
    console.log(data)
    try {
            

            let cartFromServer: any = await prisma.cart.findFirst({
                where: { 
                    userId: Number(data.userId) ,
                    classificationId: data.classificationId
                }
            })
            
            if (!cartFromServer) {
                let something = await prisma.cart.create({
                    data: data
                })
                console.log(something+ "123")
            }else{ 
                await prisma.cart.update({
                    where: {id: cartFromServer.id},
                    data: {quantity: cartFromServer?.quantity + data.quantity}
                })
            }
            return res.status(201).json(cartFromServer)
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
        const data = req.body
        

        const cartFromServer = await prisma.cart.findFirst({
            where: { id: Number(itemId) }
        })
        
        if (!cartFromServer) {
            return res.status(404).json({ error: 'Sản phẩm không tồn tại' })
        }
        if (data.quantity > 0){
            await prisma.cart.update({
                where: { id: parseInt(itemId) },
                data: {
                    quantity: data.quantity 
                }
            })
            console.log(data.quantity )
        }else {
            await prisma.cart.delete({
                where: { id: parseInt(itemId) },
                
            })
        }        

        const cartCreated = await prisma.cart.findFirst({
            where: { id: Number(cartFromServer.id) }
        })
        res.status(200).json({
            cart: cartCreated
        })
    } catch (error) {
        res.status(500).json({ error: 'Không thể cập nhật số lượng sản phẩm' })
    }
}

// const deleteCart = async (req: Request, res: Response) => {
//     try {
//         const { itemId } = req.params
//         const userId = 1
//         const cartItem = await prisma.cartItem.findFirst({
//             where: {
//                 id: parseInt(itemId),
//                 cart: {
//                 userId
//                 }
//             }
//         })
//         if (!cartItem) {
//             return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng' })
//         }
//         await prisma.cartItem.delete({
//             where: { id: parseInt(itemId) }
//         })
//         res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' })
//     } catch (error) {
//         res.status(500).json({ error: 'Không thể xóa sản phẩm khỏi giỏ hàng' })
//     }
// }

export default { 
    findCartById,
    updateCart,
    createCart,
    findCarts
};