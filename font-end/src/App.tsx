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

//Buyer
import Dashboard from './Pages/UserProfile/Dashboard'


// Client
import ClientSignIn from './Pages/ClientSignIn/ClientSignIn'
import ClientSignUp from './Pages/ClientSignUp/ClientSignUp'
import HomePage from './Pages/HomePage'; 
import ProductDetail from './Pages/ProductDetail'
import ShopDetail from './Pages/ShopDetail'; 
import OrderConfirmation from './Pages/ConfirmOrder';
import CategoryFilter from './Pages/CategoryFilter';
// Cart
import ShoppingCart from "./Pages/ShoppingCart/ShoppingCart"
function App() {
    return (
      <MantineProvider>
        <Notifications />
        <ModalsProvider>
          <Router>
            <Routes>
              <Route path="/admin" element={<DefaultShell />}>
                <Route index element={<AdminDashboard />} />
                <Route path="category" element={<CategoryCreate />} />
                <Route path="category/create" element={<CategoryCreate />} />
                <Route
                  path="category/update/:id"
                  element={<CategoryUpdate />}
                />
                <Route path="product" element={<ProductManage />} />
              </Route>
              <Route path="/seller" element={<SellerShell />}>
                <Route index element={<SellerDashboard />} />
                <Route path="product/create" element={<CreateProduct />} />
                <Route path="product/update/:id" element={<UpdateProduct />} />
                <Route path="product" element={<ManageProduct />} />
              </Route>

              <Route>
                <Route index element={<HomePage />} />
                <Route path="signin" element={<ClientSignIn />} />
                <Route path="signup" element={<ClientSignUp />} />
                <Route path="homepage" element={<HomePage />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="seller-register" element={<SellerRegister />} />
                <Route path="seller-login" element={<SellerLogin />} />
                <Route path="/shop/:sellerId" element={<ShopDetail />} />
                <Route
                  path="/order-confirmation"
                  element={<OrderConfirmation />}
                />
                <Route path="/category-filter" element={<CategoryFilter />} />
                <Route path="/shopping-cart" element={<ShoppingCart />} />

                <Route path="profile" element={<Dashboard />} />
              </Route>
            </Routes>
          </Router>
        </ModalsProvider>
      </MantineProvider>
    );
}

export default App
