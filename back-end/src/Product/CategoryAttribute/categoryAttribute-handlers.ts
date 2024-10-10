import { Request, Response } from 'express';
import query from './categoryAttribute-queries'

// Cho nay co bug ==> Chua fix
const createCategoryAttribute = async (req: Request, res: Response) => {
    try {
        console.log(req.body); 

        const { name, categoryId, value, formName, formType, require, slug } = req.body;

        const categoriesObjectData = {
            name,
            categoryId,
            value,
            formName,
            formType,
            require,
            slug
        };


        const newCategoryAttribute = await query.createCategory(categoriesObjectData)

        return res.json({
            message: 'success',
            data: newCategoryAttribute
        });

    } catch (error) {
        console.error('Error creating category attribute:', error);
        res.status(500).json({ 
            error: 'Error creating category attribute' 
        });
    }
};

const findAllCategoryAttribute = async (req: Request, res: Response) => {
    try {
        const categories = await query.findAll()
        return res.json({
            message: 'success',
            data: categories
        });

    } catch (error) {
        console.error('Error creating category attribute:', error);
        res.status(500).json({ 
            error: 'Error creating category attribute' 
        });
    }
};



export default {
    findAllCategoryAttribute,
    createCategoryAttribute,
    
}