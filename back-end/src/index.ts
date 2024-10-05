import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import {
    USER,
    CATEGORY,
    PRODUCT,
    CATEGORY_ATTRIBUTE
} from './app.config'
dotenv.config()
const app = express();


app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));


//---------------------- ROUTES ----------------------------------------------//
import categoryRouter from '../src/Product/Category/cateogory-routers'; 
import categoryAttributeRouter from '../src/Product/CategoryAttribute/categoryAttribute-routers'
import imageRouter from './Image/image-routers'; 

import productRouter from '../src/Product/product-routers'

import userRouter from './User/user-routes'


//---------------------- USE ROUTER ----------------------------------------
app.use('/api/v1/image', imageRouter);
app.use(CATEGORY_ATTRIBUTE, categoryAttributeRouter);
app.use(CATEGORY, categoryRouter);
app.use(PRODUCT, productRouter);
app.use(USER, userRouter);



app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
