import SellerHeader from "../../../Components/SellerHeader/SellerHeader"
import SellerFooter from "../../../Components/SellerFooter/SellerFooter"
import {
    PasswordInput,
    Checkbox,
    Anchor,
    Paper,
    Title,
    Text,
    Group,
    Button,
    Container,
    TextInput
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import axios from 'axios';
import { checkAuthStatus } from '../../../utils/authentication';

function SellerLogin(){
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:4000/api/v1/sellers/login', {
                username: values.username,
                password: values.password,
            }, { withCredentials: true });

            if (response.data.success) {
                setSuccess(true);
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const authStatus = await checkAuthStatus();
                if (authStatus) {
                    Notifications.show({
                        title: 'Thành công',
                        message: 'Đăng nhập thành công',
                        color: 'green'
                    });
                    navigate('/seller/dashboard', { replace: true });
                } else {
                    throw new Error('Không thể xác thực người dùng');
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Đăng nhập thất bại, vui lòng thử lại!';
            Notifications.show({
                color: 'red',
                title: 'Lỗi',
                message: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const form = useForm({
        initialValues: {
            username: '',
            password: '',
            accepted: false,
        },

        validate: {
            username: (value) => value.trim().length === 0 ? 'Tên tài khoản không được để trống' : null,
            password: (value) => value.length < 0 ? 'Mật khẩu phải có ít nhất 6 ký tự' : null,
        },
    });

    return <>
        <Container fluid className="shadow-lg p-2">
            <SellerHeader />
        </Container>
        <Container fluid>
            <div className="flex items-center justify-center h-screen">
                <Paper shadow="lg" withBorder p="xl" className="w-96 ">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <TextInput
                            label="Tài khoản"
                            placeholder="Nhập tên tài khoản"
                            error="Invalid name"
                            {...form.getInputProps('username')}
                        />
                        <PasswordInput
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu"
                            mt="md"
                            error="Invalid name"
                            {...form.getInputProps('password')}
                        />
                        <Group justify="space-between" mt="lg">
                            <Checkbox label="Remember me" {...form.getInputProps('accepted', { type: 'checkbox' })} />
                            <Anchor component="button" size="sm">
                                Quên mật khẩu
                            </Anchor>
                        </Group>
                        <Button type="submit" fullWidth mt="xl" loading={loading} >
                            {   loading ? 'Đang đăng nhập...' : 
                                success ? 'Chuyển trang sau 3s' : 
                                'Đăng nhập'
                            }
                        </Button>
                    </form>
                </Paper>
            </div>
            
        </Container>
        <Container fluid>
            <SellerFooter/>
        </Container>
        
    </>
}

export default SellerLogin