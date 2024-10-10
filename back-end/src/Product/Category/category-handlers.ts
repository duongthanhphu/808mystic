import { Request, Response } from 'express';
import query from './category-queries';

const findAllCategoryHandler = async (req: Request, res: Response) => {
    const { page = 1, pageSize = 10 } = req.query;
    try {
        const result = await query.findAll(Number(page), Number(pageSize));
        res.json({
            message: 'success',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching categories'
        });
    }
};

const findByIdCategoryHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const categoryFromServer = await query.findByid(id);
        res.json({
            message: 'success',
            category: categoryFromServer
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching category'
        });
    }
};

const findByLevelCategoryHandler = async (req: Request, res: Response) => {
    const { level } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    try {
        const result = await query.findByLevel(level, Number(page), Number(pageSize));
        res.json({
            message: 'success',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching categories'
        });
    }
};

const deleteCategoryHandler = async (req: Request, res: Response) => {
    try {
        const result = await query.deleteAll();
        res.json({
            message: 'success',
            deletedCount: result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error deleting categories'
        });
    }
};

const findCategoryAttributesByIdHandler = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    try {
        const result = await query.findAttributesByCategoryId(categoryId, Number(page), Number(pageSize));
        res.json({
            message: 'success',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching category attributes'
        });
    }
};

export default {
    findAllCategoryHandler,
    findByIdCategoryHandler,
    findByLevelCategoryHandler,
    deleteCategoryHandler,
    findCategoryAttributesByIdHandler
};