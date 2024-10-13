import {useState, useEffect} from 'react'
import {
    Container,
    Stack,
    Group,
    Center,
    TextInput,
    Tooltip,
    UnstyledButton,
    Text,
    Menu,
    Button,
    Badge,
    Indicator,
    Flex
} from '@mantine/core';
import SellerLogo from '../Logo/sellerLogo';
import classes from './SellerHeader.module.css'
import { checkAuthStatus } from '../../Utils/authentication';
import { Link } from 'react-router-dom';

function SellerHeader(){
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
        useEffect(() => {
            const checkAuth = async () => {
                const authStatus = await checkAuthStatus();
                setIsAuthenticated(authStatus);
            };

            checkAuth();
        }, []);
    return <>
        <header className={classes.header}>
            <Container fluid >
                <Stack
                    justify="flex-start"
                    gap="xs"
                > 
                        <Flex justify='space-between' className='mx-40' >
                            <Group component={Link} >
                                    <Link to="/homepage" className='no-underline'><SellerLogo /></Link>
                            </Group>
                            
                            <Group justify='flex-end'>
                                    {isAuthenticated ? (
                                <>
                                    
                                    
                                    <Tooltip label="Tài khoản" position="bottom">
                                        <UnstyledButton>
                                            <Group px="sm" py="xs" className={classes.iconGroup}>
                                            </Group>
                                        </UnstyledButton>
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    <Link to="/seller-login">Đăng nhập</Link>
                                    <Link to="/seller-register">Đăng ký</Link>
                                </>
                            )}
                                    
                            </Group>
                        </Flex >  
                </Stack>
                
                
            </Container>
        </header>
    </>
}

export default SellerHeader


