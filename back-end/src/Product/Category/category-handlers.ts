import { Request, Response } from 'express';
import query from './category-queries'

const findAllCategoryHandler = async (req: Request, res: Response) => {
    try {
        const categoriesFromServer = await query.findAll()
        res.json({
            message: 'success',
            categories: categoriesFromServer
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error fetching users' 
        });
    }
}


const findByIdCategoryHandler = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const categoryFromServer = await query.findByid(id)
        res.json({
            message: 'success',
            category: categoryFromServer
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error fetching users' 
        });
    }
}

const findByLevelCategoryHandler = async (req: Request, res: Response) => {
    const { level } = req.params
    try {
        const categoryFromServer = await query.findByLevel(level)
        
        res.json({
            message: 'success',
            categories: categoryFromServer
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error fetching users' 
        });
    }
}

const deleteCategoryHandler = async (req: Request, res: Response) => {
    const { level } = req.params
    try {
        const categoryFromServer = await query.deleteAll()
        
        res.json({
            message: 'success',
            categories: categoryFromServer
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error fetching users' 
        });
    }
}

const findCategoryAttributesByIdHandler = async (req: Request, res: Response) => {
    try {
        const {categoryId} = req.params
        console.log(categoryId)
        const categoriesFromServer = await query.findAttributesByCategoryId(categoryId)
        res.json({
            message: 'success',
            categories: categoriesFromServer
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error fetching users' 
        });
    }
}

export default {
    findAllCategoryHandler,
    findByIdCategoryHandler,
    findByLevelCategoryHandler,
    deleteCategoryHandler,
    findCategoryAttributesByIdHandler
}