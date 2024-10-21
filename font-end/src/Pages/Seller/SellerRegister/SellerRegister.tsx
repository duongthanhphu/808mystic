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
    Select,
    Button,
    Container,
    TextInput
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import axios from 'axios';
function SellerRegister(){
    const [loading, setLoading] = useState(false); 
    const [countdown, setCountdown] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (values) => {
        setLoading(true); 
        try {
            const response = await axios.post('http://localhost:4000/api/v1/sellers/register', {
                username: values.username,
                password: values.password,
            },{ withCredentials: true });
            setSuccess(true);
            
            Notifications.show({
                title: 'Thông báo',
                message: response.data.message,
            })
            setCountdown(3);
        } catch (err) {
            const errorMessage =  err.response && err.response.data.error 
                                ?  err.response.data.error 
                                : 'Đăng nhập thất bại, vui lòng thử lại!';
            Notifications.show({
                color: 'red',
                title: 'Thông báo',
                message: errorMessage,
            })
        } finally {
            setLoading(false); 
        }
    }

    const form = useForm({
        initialValues: {
            username: '',
            password: '',
            accepted: false,
        },

        validate: {
            username: (value) => value.trim().length === 0 ? 'Tên tài khoản không được để trống' : null,
            password: (value) => value.length < 2 ? 'Mật khẩu phải có ít nhất 6 ký tự' : null,
        },
    });

    useEffect(() => {
        let timer;
        if (countdown !== null && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            navigate('/homepage');
        }
        return () => clearInterval(timer);
    }, [countdown, navigate]);
    return <>
        <Container fluid className='shadow-md py-2'>
            <SellerHeader />
        </Container>
        <Container fluid>
            <div className="flex items-center justify-center h-screen">
                <Paper shadow="lg" withBorder p="xl" className="w-96 ">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <TextInput
                            label="Tài khoản"
                            placeholder="Nhập tên tài khoản"
                            error="Sai tên đăng nhập"
                            {...form.getInputProps('username')}
                        />
                        <PasswordInput
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu"
                            mt="md"
                            error="Sai mật khẩu"
                            {...form.getInputProps('password')}
                        />
                        <TextInput
                            label="Tên cửa hàng"
                            placeholder="Nhập tên cửa hàng"
                            mt="md"
                            error="Invalid name"
                            {...form.getInputProps('storename')}
                        />
                        <TextInput
                            label="Email"
                            placeholder="Nhập Email"
                            mt="md"
                            error="Sai email"
                            {...form.getInputProps('storename')}
                        />
                        <Select
                            label="Tỉnh / Thành Phố"
                            placeholder="Chọn tỉnh-thành phố"
                            mt="md"
                        >
                        </Select>
                        <Select
                            label="Huyện / Quận"
                            placeholder="Chọn quận-huyện"
                            mt="md"
                        >
                            
                        </Select>
                        <Select
                            label="Xã / Phường"
                            placeholder="Chọn Xã-Phường"
                            mt="md"
                        >
                            
                        </Select>
                        <Button type="submit" fullWidth mt="xl" loading={loading} >
                            {   loading ? 'Đang đăng nhập...' : 
                                success ? `Chuyển trang sau ${countdown}s` : 
                                'Đăng ký'
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

export default SellerRegister
