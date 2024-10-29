import { AppShell, Burger, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet  } from 'react-router-dom';
import { checkAuthStatus, getUserId } from '../../Utils/authentication';
import {useState, useEffect} from 'react'

import SellertNavbar from '../SellerNavbar/SellerNavbar'
import SellerHeader from '../SellerHeader/SellerHeader'
export default function DefaultShell() {
    const [opened, { toggle }] = useDisclosure();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | null>(null);

        useEffect(() => {
            const checkAuth = async () => {
                const authStatus = await checkAuthStatus();
                setIsAuthenticated(authStatus);
                if (authStatus) {
                    const id = getUserId();
                    setUserId(id);
                }
            };
            
            checkAuth();
        }, []);
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
          <Outlet />
        </AppShell.Main>
      </AppShell>
    );
}

