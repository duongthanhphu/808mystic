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
// import CategoryManage from './Pages/Category/CategoryManage'
import CategoryCreate from './Pages/Category/CategoryCreate'
import CategoryUpdate from './Pages/Category/CategoryUpdate'


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
import SellerOrder from './Pages/Seller/SellerOrder/SellerOrderManage.tsx'
import SellerBill from './Pages/Seller/SellerBill/SellerBill'
import SellerInventory from './Pages/Seller/Inventory/InventoryManage'
import CreateWarehouse from './Pages/Seller/Warehouse/CreateWarehouse'
import ManageWarehouse from './Pages/Seller/Warehouse/ManageWarehouse'
import UpdateWarehouse from './Pages/Seller/Warehouse/UpdateWarehouse'
import SellerOrderDetail from './Pages/Seller/SellerOrder/SellerOrderDetail'
import SellerOrderManage from './Pages/Seller/SellerOrder/SellerOrderManage'
// Client
import ClientSignIn from './Pages/ClientSignIn/ClientSignIn'
import ClientSignUp from './Pages/ClientSignUp/ClientSignUp'
import HomePage from './Pages/HomePage'; 
import ProductDetail from './Pages/ProductDetail'
import ShopDetail from './Pages/ShopDetail'; 
import OrderConfirmation from './Pages/ConfirmOrder';
import UserOrders from './Pages/UserProfile/Contents/OrderManagermentContent.tsx'  
import ShoppingCart from "./Pages/ShoppingCart/ShoppingCart"

//Buyer
import Dashboard from './Pages/UserProfile/Dashboard'

import PrivateRoute from './Components/PrivateRoute'
import CategoryProducts from './Pages/Category/CategoryProducts';
import OrderDetail from './Pages/UserProfile/Contents/OrderDetail.tsx';

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
                                
                        </Route>
                        <Route path="/seller" element={
                            <PrivateRoute>
                                <SellerShell />
                            </PrivateRoute>
                        }>
                                <Route index element={<SellerDashboard />} />
                                <Route path="dashboard" element={<SellerDashboard />} />
                                <Route path="product/create" element={<CreateProduct />} />
                                <Route path="product/update/:id" element={<UpdateProduct />} />
                                <Route path="product" element={<ManageProduct />} />
                                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                                <Route path="/seller/address" element={<SellerAddress />} />
                                <Route path="/seller/address/shipping" element={<SellerShipping />} />
                                <Route path="/seller/address/config" element={<SellerAddressConfig />} />
                                <Route path="/seller/order" element={<SellerOrder />} />
                                <Route path="/seller/order/detail/:orderId" element={<SellerOrderDetail />} />  
                                <Route path="/seller/order/cancel" element={<SellerCancelOrder />} />
                                <Route path="/seller/bill" element={<SellerBill />} />
                                <Route path="/seller/inventory/" element={<SellerInventory />} />
                                <Route path="/seller/warehouse/create" element={<CreateWarehouse />} />
                                <Route path="/seller/warehouse/manage/" element={<ManageWarehouse />} />
                                <Route path="/seller/warehouse/detail/:warehouseId" element={<SellerInventory />} />
                                <Route path="/seller/warehouse/update/:id" element={<UpdateWarehouse />} />
                                <Route path="/seller/order/detail/:orderId" element={<SellerOrderDetail />} />
                                <Route path="/seller/order/manage" element={<SellerOrderManage />} />

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
                                <Route path="/shopping-cart/:userId" element={<ShoppingCart />} />
                                <Route path="/user/orders" element={< UserOrders/>} />
                                <Route path="/user/orders/:orderId" element={<OrderDetail />} />
                                <Route path="/category/:categoryId" element={<CategoryProducts />} />

                                <Route path="profile" element={<Dashboard />} />
                        </Route>
                    </Routes>
                </Router>
            </ModalsProvider>
                
        </MantineProvider>
    )
}

export default App
