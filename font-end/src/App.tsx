import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/core/styles/global.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DefaultShell from './Components/DefaultShell/DefaultShell'
import AdminDashboard from './Pages/AdminDashboard'
// Category Import
import CategoryManage from './Pages/Category/CategoryManage'
import CategoryCreate from './Pages/Category/CategoryCreate'
import CategoryUpdate from './Pages/Category/CategoryUpdate'

// Product Import
import ProductManage from './Pages/Product/ProductManage'
// Seller 
import SellerShell from './Components/SellerShell/SellerShell'
import SellerRegister from './Pages/Seller/SellerRegister/SellerRegister'
import SellerLogin from './Pages/Seller/SellerLogin/SellerLogin'
import SellerDashboard from './Pages/Seller/SellerDashboard/Dashboard'
import CreateProduct from './Pages/Seller/SellerProductManage/CreateProduct'
import ManageProduct from './Pages/Seller/SellerProductManage/ManageProduct'
import UpdateProduct from './Pages/Seller/SellerProductManage/UpdateProduct'
import SellerAddress from './Pages/Seller/SellerAddress/SellerAddress'
import SellerShipping from './Pages/Seller/SellerAddress/SellerShipping'
import SellerAddressConfig from './Pages/Seller/SellerAddress/SellerAddressConfig'
import SellerCancelOrder from './Pages/Seller/SellerOrder/SellerCancelOrder'
import SellerOrder from './Pages/Seller/SellerOrder/SellerOrder'
import SellerBill from './Pages/Seller/SellerBill/SellerBill'



// Client
import ClientSignIn from './Pages/ClientSignIn/ClientSignIn'
import ClientSignUp from './Pages/ClientSignUp/ClientSignUp'
import HomePage from './Pages/HomePage'; 
import ProductDetail from './Pages/ProductDetail'
import ShopDetail from './Pages/ShopDetail'; 
import OrderConfirmation from './Pages/ConfirmOrder';

import ShoppingCart from "./Pages/ShoppingCart/ShoppingCart"

function App() {
    return (
        
        <MantineProvider >
            <Notifications />
            <ModalsProvider>
                <Router>
                    <Routes>            
                        <Route path="/admin" element={<DefaultShell />}>
                                <Route index element={<AdminDashboard />} />
                                <Route path="category" element={<CategoryCreate />} />
                                <Route path="category/create" element={<CategoryCreate />} />
                                <Route path="category/update/:id" element={<CategoryUpdate />} />
                                <Route path="product" element={<ProductManage />} />
                        </Route>
                        <Route path="/seller" element={<SellerShell />}>
                                <Route index element={<SellerDashboard />} />
                                <Route path="product/create" element={<CreateProduct />} />
                                <Route path="product/update/:id" element={<UpdateProduct />} />
                                <Route path="product" element={<ManageProduct />} />
                                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                                <Route path="/seller/address" element={<SellerAddress />} />
                                <Route path="/seller/address/shipping" element={<SellerShipping />} />
                                <Route path="/seller/address/config" element={<SellerAddressConfig />} />
                                <Route path="/seller/order" element={<SellerOrder />} />
                                <Route path="/seller/order/cancel" element={<SellerCancelOrder />} />
                                <Route path="/seller/bill" element={<SellerBill />} />
                        </Route>    

                        <Route>
                            <Route index element={<HomePage />} />
                            <Route path="signin" element={<ClientSignIn />} />
                            <Route path="signup" element={<ClientSignUp />} />
                            <Route path="homepage" element={<HomePage />} />
                            <Route path="product/:id" element={<ProductDetail />} />
                            <Route path="seller-register" element={<SellerRegister />} />
                            <Route path="seller-login" element={<SellerLogin />} />
                            <Route path="/shop/:sellerId" element={<ShopDetail/>} />
                            <Route path="/order-confirmation" element={<OrderConfirmation/>} />
                                            <Route path="/shopping-cart" element={<ShoppingCart />} />

                        </Route>
                    </Routes>
                </Router>
            </ModalsProvider>
                
        </MantineProvider>
    )
}

export default App
