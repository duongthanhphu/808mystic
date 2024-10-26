import {
    TextInput,
    PasswordInput,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
    Stepper,
    Stack,
    PinInput,
    LoadingOverlay,
    Select
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Notifications } from '@mantine/notifications';
import { hasLength, isEmail, matches } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import SellerHeader from "../../../Components/SellerHeader/SellerHeader";
import SellerFooter from "../../../Components/SellerFooter/SellerFooter";
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/v1';
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

function SellerRegister() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [countdown, setCountdown] = useState(3);
    const [success, setSuccess] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [showVerification, setShowVerification] = useState(false);

    const form = useForm({
        initialValues: {
            username: '',
            password: '',
            storeName: '',
            pickUpAddress: '',
            email: '',
            provinceId: '',
            districtId: '',
            wardId: '',
            phone: '',
        },
        validate: {
            username: matches(
                /^[a-zA-Z0-9]+$/,
                'Tên đăng nhập chỉ được chứa chữ cái và số'
            ),
            password: hasLength(
                { min: 6 },
                'Mật khẩu phải có ít nhất 6 ký tự'
            ),
            storeName: (value) => value.trim().length === 0 ? 'Tên cửa hàng không được để trống' : null,
            pickUpAddress: (value) => value.trim().length === 0 ? 'Địa chỉ lấy hàng không được để trống' : null,
            email: isEmail('Email không hợp lệ'),
            provinceId: (value) => !value ? 'Vui lòng chọn tỉnh/thành phố' : null,
            districtId: (value) => !value ? 'Vui lòng chọn quận/huyện' : null,
            wardId: (value) => !value ? 'Vui lòng chọn xã/phường' : null,
            phone: (value) => !/^\d{10}$/.test(value) ? 'Số điện thoại không hợp lệ' : null,
        },
        validateInputOnChange: true
    });

    useEffect(() => {
        let timer;
        if (success && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            navigate('/seller/dashboard');
        }
        return () => clearInterval(timer);
    }, [success, countdown, navigate]);

    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        console.log('Provinces state updated:', provinces);
    }, [provinces]);

    const fetchProvinces = async () => {
        try {
            const response = await axiosInstance.get('/address/province');
            setProvinces(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
            Notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải danh sách tỉnh/thành phố',
                color: 'red'
            });
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const response = await axiosInstance.get(`/address/province/${provinceCode}/district`);
            setDistricts(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quận/huyện:', error);
            Notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải danh sách quận/huyện',
                color: 'red'
            });
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const response = await axiosInstance.get(`/address/province/district/${districtCode}/ward`);
            setWards(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phường/xã:', error);
            Notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải danh sách phường/xã',
                color: 'red'
            });
        }
    };

    const handleSignup = async (values) => {
        setLoading(true);
        try {
            await axiosInstance.post('sellers/register', values);
            Notifications.show({
                title: 'Đăng ký thành công',
                message: 'Vui lòng nhập mã xác nhận đã được gửi đến email của bạn.',
                color: 'green'
            });
            setShowVerification(true);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Đã xảy ra lỗi trong quá trình đăng ký';
            Notifications.show({
                title: 'Lỗi',
                message: errorMessage,
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async () => {
        if (verificationCode.length !== 4) {
            Notifications.show({
                title: 'Lỗi',
                message: 'Vui lòng nhập đủ 4 số',
                color: 'red'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('sellers/verify-email', {
                email: form.values.email,
                otp: verificationCode
            });
            
            if (response.data.success) {
                Notifications.show({
                    title: 'Xác thực thành công',
                    message: 'Email của bạn đã được xác thực',
                    color: 'green'
                });
                navigate('/seller/dashboard');
            } else {
                throw new Error(response.data.message || 'Xác thực không thành công');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Mã xác thực không chính xác';
            Notifications.show({
                title: 'Lỗi',
                message: errorMessage,
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('sellers/resend-otp', {
                email: form.values.email
            });
            if (response.data.success) {
                Notifications.show({
                    title: 'Đã gửi lại mã',
                    message: 'Vui lòng kiểm tra email của bạn',
                    color: 'green'
                });
            } else {
                throw new Error(response.data.message || 'Không thể gửi lại mã xác thực');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Không thể gửi lại mã xác thực';
            Notifications.show({
                title: 'Lỗi',
                message: errorMessage,
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Container fluid className='shadow-md py-2'>
                <SellerHeader />
            </Container>

            <Container>
                <Title order={2} ta="center" mt="md" mb="md">
                    Đăng ký làm người bán
                </Title>
            </Container>

            <Container size={420} my={40}>
                <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
                    <LoadingOverlay visible={loading} overlayBlur={2} />
                    <form onSubmit={form.onSubmit(handleSignup)}>
                        <Stack>
                            <TextInput
                                label="Email"
                                placeholder="Nhập email của bạn"
                                required
                                {...form.getInputProps('email')}
                            />
                            <TextInput
                                label="Tài khoản"
                                placeholder="Nhập tên tài khoản"
                                required
                                {...form.getInputProps('username')}
                            />
                            <TextInput
                                label="Tên cửa hàng"
                                placeholder="Nhập tên cửa hàng"
                                required
                                {...form.getInputProps('storeName')}
                            />
                            <PasswordInput
                                label="Mật khẩu"
                                placeholder="Nhập mật khẩu"
                                required
                                {...form.getInputProps('password')}
                            />
                            <TextInput
                                label="Số điện thoại"
                                placeholder="Nhập số điện thoại"
                                required
                                {...form.getInputProps('phone')}
                            />
                            <Select
                                label="Tỉnh / Thành Phố"
                                placeholder="Chọn tỉnh-thành phố"
                                data={provinces.map(p => ({ value: p.Code, label: p.Name }))}
                                {...form.getInputProps('provinceCode')}
                                onChange={(value) => {
                                    form.setFieldValue('provinceCode', value);
                                    form.setFieldValue('districtCode', '');
                                    form.setFieldValue('wardCode', '');
                                    if (value) fetchDistricts(value);
                                }}
                                searchable
                            />
                            <Select
                                label="Quận / Huyện"
                                placeholder="Chọn quận-huyện"
                                data={districts.map(d => ({ value: d.Code, label: d.Name }))}
                                {...form.getInputProps('districtCode')}
                                onChange={(value) => {
                                    form.setFieldValue('districtCode', value);
                                    form.setFieldValue('wardCode', '');
                                    if (value) fetchWards(value);
                                }}
                                disabled={!form.values.provinceCode}
                                searchable
                            />
                            <Select
                                label="Xã / Phường"
                                placeholder="Chọn xã-phường"
                                data={wards.map(w => ({ value: w.Code, label: w.Name }))}
                                {...form.getInputProps('wardCode')}
                                disabled={!form.values.districtCode}
                                searchable
                            />
                            <TextInput
                                label="Địa chỉ chi tiết"
                                placeholder="Nhập địa chỉ chi tiết"
                                required
                                {...form.getInputProps('pickUpAddress')}
                            />
                            {showVerification && (
                                <>
                                    <Text size="sm">Nhập mã xác nhận đã được gửi đến email của bạn:</Text>
                                    <PinInput
                                        length={4}
                                        onChange={setVerificationCode}
                                        type="number"
                                        placeholder=""
                                    />
                                    <Button onClick={handleVerification} fullWidth mt="sm">
                                        Xác nhận
                                    </Button>
                                    <Button variant="subtle" onClick={handleResendOTP} fullWidth mt="xs">
                                        Gửi lại mã
                                    </Button>
                                </>
                            )}
                        </Stack>
                        {!showVerification && (
                            <Button type="submit" fullWidth mt="xl" loading={loading}>
                                Đăng ký
                            </Button>
                        )}
                    </form>
                </Paper>
            </Container>

            <Container fluid>
                <SellerFooter/>
            </Container>
        </>
    );
}

export default SellerRegister;
