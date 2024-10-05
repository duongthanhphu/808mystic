import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

import '@mantine/core/styles.css';
import '@mantine/core/styles/global.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DefaultShell from './Components/DefaultShell/DefaultShell'
import AdminDashboard from './Pages/AdminDashboard'
// Category Import
import CategoryManage from './Pages/Category/CategoryManage'
import CategoryCreate from './Pages/Category/CategoryCreate'
import CategoryUpdate from './Pages/Category/CategoryUpdate'
// Brand Import
import BrandManage from './Pages/Brand/BrandManage'

// Product Import
import ProductManage from './Pages/Product/ProductManage'
// Client
    // Sign-in
import ClientSignIn from './Pages/ClientSignIn/ClientSignIn'
    // Sign-up
import ClientSignUp from './Pages/ClientSignUp/ClientSignUp'
import HomePage from './Pages/HomePage'; 
function App() {
    return (
        
        <MantineProvider >
            <Notifications />
            <ModalsProvider>
                <Router>
                    <Routes>            
                        <Route path="/admin" element={<DefaultShell />}>
                        <Route index element={<AdminDashboard />} />
                        // Category Route
                        <Route path="category" element={<CategoryManage />} />
                        <Route path="category/create" element={<CategoryCreate />} />
                        <Route path="category/update/:id" element={<CategoryUpdate />} />
                        { /*Brand Route */ }
                        <Route path="brand" element={<BrandManage />} />
                        { /*Product  Route*/    }  
                        <Route path="product" element={<ProductManage />} />
                        </Route>
                        <Route>
                            <Route index element={<HomePage />} />
                            <Route path="signin" element={<ClientSignIn />} />
                            <Route path="signup" element={<ClientSignUp />} />
                            <Route path="homepage" element={<HomePage />} />
                        </Route>
                    </Routes>
                </Router>
            </ModalsProvider>
                
        </MantineProvider>
    )
}

export default App
