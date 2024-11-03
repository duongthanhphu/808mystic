import {useState, useEffect} from 'react'
import { AppShell, Burger, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate  } from 'react-router-dom';
import { checkAuthStatus, getUserId } from '../../Utils/authentication';
import SellerHeader from '../SellerHeader/SellerHeader'
import SellertNavbar from '../SellerNavbar/SellerNavbar'
export default function DefaultShell() {
    const [opened, { toggle }] = useDisclosure();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | null>(null);
        const navigate = useNavigate();

        useEffect(() => {
            const checkAuth = async () => {
                const authStatus = await checkAuthStatus();
                setIsAuthenticated(authStatus);
                if (authStatus) {
                    const id = getUserId();
                    setUserId(id);
                } else {
                    if (!window.location.pathname.includes('/seller-login')) {
                        navigate('/seller-login');
                    }
                }
            };
            
            checkAuth();
        }, [navigate]);
    return (
        <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header px="md">
          <SellerHeader />
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            className="absolute top-3 right-4"
          />
        </AppShell.Header>
        <AppShell.Navbar p="md">
          <SellertNavbar />
        </AppShell.Navbar>
        <AppShell.Main>
          <Outlet context={{ userId }}/>
        </AppShell.Main>
      </AppShell>
    );
}

