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
    IconUserCircle,
    IconUser,
    IconSettings,
    IconStar,
    IconHeart,
    IconAward,
    IconAlarm,
    IconMessageCircle,
    IconLogout,
    IconList
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from './ClientHeader.module.css';

// Custom MantineLogo component as a placeholder
const MantineLogo = () => (
  <div style={{ fontWeight: 'bold', fontSize: 30 }}>808mystic</div>
);

export default function ClientHeader() {
    return (
        <header className={classes.header}>
            <Container fluid>
                <Stack >
                    <Group  justify="center" gap="xl" grow>
                        <Center component={Link} to="/">
                            <MantineLogo  />
                        </Center>
                        <TextInput
                            placeholder="Bạn tìm gì..."
                            variant="filled"
                            size="md"
                            radius="md"
                            leftSection={<IconSearch size={16} />}
                            style={{ width: 600 , flex: 4}} 
                        />
                        <Group justify="center">
                            <Tooltip label="Giỏ hàng" position="bottom">
                                <UnstyledButton component={Link} to="/cart">
                                    <Group spacing="xs" px="sm" py="xs" className={classes.iconGroup}>
                                        <IconShoppingCart strokeWidth={1} />
                                        <Text weight={500} size="sm">0</Text>
                                    </Group>
                                </UnstyledButton>
                            </Tooltip>

                            <Tooltip label="Đơn hàng" position="bottom">
                                <UnstyledButton component={Link} to="/order">
                                    <Group spacing="xs" px="sm" py="xs" className={classes.iconGroup}>
                                        <IconFileBarcode strokeWidth={1} />
                                    </Group>
                                </UnstyledButton>
                            </Tooltip>

                            <Tooltip label="Thông báo" position="bottom">
                                <UnstyledButton>
                                    <Indicator size={14} color="pink" withBorder>
                                        <Group spacing="xs" px="sm" py="xs" className={classes.iconGroup}>
                                            <IconBell strokeWidth={1} />
                                        </Group>
                                    </Indicator>
                                </UnstyledButton>
                            </Tooltip>

                            
                        </Group>
                    </Group>
                    <Group  justify="center" gap="xl" grow>
                        <Group justify="center" component={Link} to="/" className='ml-16'>
                            <Button leftSection={<IconList size={16} />} radius="md" className='pr-[50px] text-center'>
                                Danh mục sản phẩm
                            </Button>
                        </Group>
                        <Group justify="center" gap="xl"> 
                            <Button variant="subtle" radius="md" >
                                Sản phẩm mới
                            </Button>
                            <Button variant="subtle" color="green" radius="md">
                                Sản phẩm xu hướng
                            </Button>
                            <Button variant="subtle" color="pink" radius="md">
                                Khuyến mại
                            </Button>
                        </Group>
                        <Group justify="center" gap="xl">
                            <Badge color="pink" size="xs" variant="filled">Hot</Badge>
                            <Text size="sm" color="dimmed">Miễn phí giao hàng cho đơn hàng trên 1 triệu đồng</Text>
                        </Group>
                    </Group>
                    
                </Stack>
            </Container>
        </header>
    );
}


{/* <Menu
                                control={(
                                    <Tooltip label="Tài khoản" position="bottom">
                                        <UnstyledButton>
                                            <Group spacing="xs" px="sm" py="xs" className={classes.iconGroup}>
                                                <IconUserCircle strokeWidth={1} />
                                            </Group>
                                        </UnstyledButton>
                                    </Tooltip>
                                )}
                            >
                                <Menu.Item icon={<IconUser size={14} />} component={Link} to="/user">
                                    Tài khoản
                                </Menu.Item>
                                <Menu.Item icon={<IconSettings size={14} />} component={Link} to="/user/setting">
                                    Thiết đặt
                                </Menu.Item>
                                <Menu.Item icon={<IconStar size={14} />} component={Link} to="/user/review">
                                    Đánh giá sản phẩm
                                </Menu.Item>
                                <Menu.Item icon={<IconHeart size={14} />} component={Link} to="/user/wishlist">
                                    Sản phẩm yêu thích
                                </Menu.Item>
                                <Menu.Item icon={<IconAward size={14} />} component={Link} to="/user/reward">
                                    Điểm thưởng
                                </Menu.Item>
                                <Menu.Item icon={<IconAlarm size={14} />} component={Link} to="/user/preorder">
                                    Đặt trước sản phẩm
                                </Menu.Item>
                                <Menu.Item icon={<IconMessageCircle size={14} />} component={Link} to="/user/chat">
                                    Yêu cầu tư vấn
                                </Menu.Item>
                                <Menu.Item color="pink" icon={<IconLogout size={14} />}>
                                    Đăng xuất
                                </Menu.Item>
                            </Menu> */}