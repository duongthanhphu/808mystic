import React, { useState, useEffect } from 'react';
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
import {
    IconSearch,
    IconShoppingCart,
    IconFileBarcode,
    IconBell,
    IconList,
    IconUser
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from './ClientHeader.module.css';
import Logo from '../Logo/808logo';
import { checkAuthStatus } from '../../Utils/authentication';


export default function ClientHeader() {
        const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
        useEffect(() => {
            const checkAuth = async () => {
                const authStatus = await checkAuthStatus();
                setIsAuthenticated(authStatus);
            };

            checkAuth();
        }, []);
    return (
        <header className={classes.header}>
            <Container fluid >
                <Stack
                    justify="flex-start"
                    gap="xs"
                > 
                        <Flex justify='space-between' className='mx-40' >
                            <Group component={Link} >
                                    <Link to="/homepage"><Logo /></Link>
                            </Group>
                            <TextInput
                                    placeholder="Bạn tìm gì..."
                                    variant="filled"
                                    size="md"
                                    radius="md"
                                    leftSection={<IconSearch size={16} />}
                                    className='min-w-[600px]'
                            />
                            <Group justify='flex-end'>
                                    {isAuthenticated ? (
                                <>
                                    <Tooltip label="Giỏ hàng" position="bottom">
                                        <UnstyledButton component={Link} to="/cart">
                                            <Group px="sm" py="xs">
                                                <IconShoppingCart strokeWidth={1} />
                                                <Text size="sm">0</Text>
                                            </Group>
                                        </UnstyledButton>
                                    </Tooltip>
                                    <Tooltip label="Đơn hàng" position="bottom">
                                        <UnstyledButton component={Link} to="/order">
                                            <Group px="sm" py="xs" className={classes.iconGroup}>
                                                <IconFileBarcode strokeWidth={1} />
                                            </Group>
                                        </UnstyledButton>
                                    </Tooltip>
                                    <Tooltip label="Thông báo" position="bottom">
                                        <UnstyledButton>
                                            <Indicator size={14} color="pink" withBorder>
                                                <Group px="sm" py="xs" className={classes.iconGroup}>
                                                    <IconBell strokeWidth={1} />
                                                </Group>
                                            </Indicator>
                                        </UnstyledButton>
                                    </Tooltip>
                                    <Tooltip label="Tài khoản" position="bottom">
                                        <UnstyledButton>
                                            <Group px="sm" py="xs" className={classes.iconGroup}>
                                                <IconUser strokeWidth={1} />
                                            </Group>
                                        </UnstyledButton>
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    <Link to="/signin">Đăng nhập</Link>
                                    <Link to="/signup">Đăng ký</Link>
                                </>
                            )}
                                    
                            </Group>
                        </Flex >  
                        <Flex justify='space-between' align="center" className='mx-40'>
                                    <Flex  flex-1 gap={10}>
                                        <Button leftSection={<IconList size={16} />} radius="md" className='pr-[50px] text-center'>
                                            Danh mục sản phẩm
                                        </Button>
                                        <Flex justify="center"  className=''> 
                                            <Button variant="subtle" radius="md" >
                                                Sản phẩm mới
                                            </Button>
                                            <Button variant="subtle" color="green" radius="md">
                                                Sản phẩm xu hướng
                                            </Button>
                                            <Button variant="subtle" color="pink" radius="md">
                                                Khuyến mại
                                            </Button>
                                        </Flex>
                                    </Flex>
                                    
                                    <Flex justify='flex-end' gap={20}>
                                        <Badge color="pink" size="xs" variant="filled">Hot</Badge>
                                        <Text size="sm">Miễn phí giao hàng cho đơn hàng trên 1 triệu đồng</Text>
                                    </Flex>
                        </Flex>  
                </Stack>
                
                
            </Container>
        </header>
    );
}

