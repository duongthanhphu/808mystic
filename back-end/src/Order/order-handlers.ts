import { Request, Response } from 'express';
import * as OrderService from './order-services';

export async function createOrder(req: Request, res: Response) {
  try {
    const orderData = req.body;
    const order = await OrderService.createOrder(orderData);
    res.status(201).json(order);
  } catch (error: unknown) {
    if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.id);
    const order = await OrderService.getOrderById(orderId);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
    res.json(updatedOrder);
  } catch (error: unknown) {
    if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
  }
}

export async function cancelOrder(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.id);
    const { reason } = req.body;
    const cancelledOrder = await OrderService.cancelOrder(orderId, reason);
    res.json(cancelledOrder);
  } catch (error: unknown) {
    if (error instanceof Error) {
            console.error(error.message);
            res.status(400).json({ error: error.message });
    } else {
            console.error('Unexpected error:', error);
    }
  }
}
