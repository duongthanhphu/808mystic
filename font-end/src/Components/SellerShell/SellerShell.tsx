import { AppShell, Burger, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet  } from 'react-router-dom';
import { checkAuthStatus, getUserId } from '../../Utils/authentication';
import {useState, useEffect} from 'react'

import SellertNavbar from '../SellerNavbar/SellerNavbar'
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
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    {isAuthenticated ? (
                                <>
                                    <p>Đăng nhập thành công USER ID  {userId}</p>
                                    
                                    {/* <Tooltip label="Tài khoản" position="bottom">
                                        <UnstyledButton>
                                            <Group px="sm" py="xs" className={classes.iconGroup}>
                                            </Group>
                                        </UnstyledButton>
                                    </Tooltip> */}
                                </>
                            ) : (
                                <>
                                    <Link to="/seller-login">Đăng nhập</Link>
                                    <Link to="/seller-register">Đăng ký</Link>
                                </>
                            )}
                <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                <SellertNavbar/>
            </AppShell.Navbar>
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
            </AppShell>
    );
}

