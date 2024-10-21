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
import { notifications } from '@mantine/notifications';
import { hasLength, isEmail, matches } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import ClientHeader from '../../Components/ClientHeader/ClientHeader';
import ClientFooter from '../../Components/ClientFooter/ClientFooter';
import { TextGenerateEffect } from "../../Components/TextGenerateEffect/text-generate-effect";
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
export default function ClientSignUp() {
    const navigate = useNavigate();
    const [active, setActive] = useState(0);
    const [loading, setLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [countdown, setCountdown] = useState(3);
    const [success, setSuccess] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const form = useForm({
        initialValues: {
            email: '',
            username: '',
            password: '',
            fullName: '',
            provinceCode: '',
            districtCode: '',
            wardCode: ''
        },
        validate: {
            email: isEmail('Email không hợp lệ'),
            password: hasLength(
                { min: 6 },
                'Mật khẩu phải có ít nhất 6 ký tự'
            ),
            username: matches(
                /^[a-zA-Z0-9]+$/,
                'Tên đăng nhập chỉ được chứa ch cái và số'
            ),
            fullName: hasLength(
                { min: 2, max: 50 },
                'Họ tên phải từ 2 đến 50 ký tự'
            ),
            provinceCode: (value) => !value ? 'Vui lòng chọn tỉnh/thành phố' : null,
            districtCode: (value) => !value ? 'Vui lòng chọn quận/huyện' : null,
            wardCode: (value) => !value ? 'Vui lòng chọn phường/xã' : null
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
            navigate('/');
        }
        return () => clearInterval(timer);
    }, [success, countdown, navigate]);

    useEffect(() => {
        fetchProvinces();
    }, []);

    const fetchProvinces = async () => {
        try {
            const response = await axiosInstance.get('/address/province');
            setProvinces(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const response = await axiosInstance.get(`/address/province/${provinceCode}/district`);
            setDistricts(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quận/huyện:', error);
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const response = await axiosInstance.get(`/address/province/district/${districtCode}/ward`);
            setWards(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phường/xã:', error);
        }
    };

    const handleSignup = async (values: typeof form.values) => {
        setLoading(true);
        try {
            await axiosInstance.post('users/signup', values);
            notifications.show({
                title: 'Đăng ký thành công',
                message: 'Vui lòng kiểm tra email của bạn để lấy mã xác thực',
                color: 'green'
            });
            setActive(1);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Đã xảy ra lỗi trong quá trình đăng ký';
            notifications.show({
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
            notifications.show({
                title: 'Lỗi',
                message: 'Vui lòng nhập đủ 4 số',
                color: 'red'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('users/verify-email', {
                email: form.values.email,
                otp: verificationCode
            });
            
            // Kiểm tra xem cookies đã được set chưa
            if (document.cookie.includes('accessToken')) {
                // Store user info from response if needed
                const userData = response.data.user;
                // You can save user data to global state here (e.g., Redux, Context)
                
                notifications.show({
                    title: 'Xác thực thành công',
                    message: 'Email của bạn đã được xác thực',
                    color: 'green'
                });
                setActive(2);
                setSuccess(true);
            } else {
                throw new Error('Authentication failed - No token received');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Mã xác thực không chính xác';
            notifications.show({
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
            await axiosInstance.post('/resend-otp', {
                email: form.values.email
            });
            notifications.show({
                title: 'Đã gửi lại mã',
                message: 'Vui lòng kiểm tra email của bạn',
                color: 'green'
            });
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể gửi lại mã xác thực',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (active === 0) {
            form.validate();
            if (form.isValid()) {
                handleSignup(form.values);
            }
        } else if (active === 1) {
            handleVerification();
        }
    };

    const steps = [
        {
            label: "Bước 1",
            description: "Tạo Tài khoản",
            content: (
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
                            label="Họ và tên"
                            placeholder="Nhập họ và tên"
                            required
                            {...form.getInputProps('fullName')}
                        />
                        <PasswordInput
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu"
                            required
                            {...form.getInputProps('password')}
                        />
                        <Select
                            label="Tỉnh/Thành phố"
                            placeholder="Chọn tỉnh/thành phố"
                            data={provinces.map(p => ({ value: p.Code, label: p.Name }))}
                            {...form.getInputProps('provinceCode')}
                            onChange={(value) => {
                                form.setFieldValue('provinceCode', value);
                                form.setFieldValue('districtCode', '');
                                form.setFieldValue('wardCode', '');
                                fetchDistricts(value);
                            }}
                        />
                        <Select
                            label="Quận/Huyện"
                            placeholder="Chọn quận/huyện"
                            data={districts.map(d => ({ value: d.Code, label: d.Name }))}
                            {...form.getInputProps('districtCode')}
                            onChange={(value) => {
                                form.setFieldValue('districtCode', value);
                                form.setFieldValue('wardCode', '');
                                fetchWards(value);
                            }}
                            disabled={!form.values.provinceCode}
                        />
                        <Select
                            label="Phường/Xã"
                            placeholder="Chọn phường/xã"
                            data={wards.map(w => ({ value: w.Code, label: w.Name }))}
                            {...form.getInputProps('wardCode')}
                            disabled={!form.values.districtCode}
                        />
                    </Stack>
                </form>
            )
        },
        {
            label: "Bước 2",
            description: "Xác thực email",
            content: (
                <Stack>
                    <Text>Chúng tôi đã gửi một mã xác thực đến email của bạn.</Text>
                    <Text align="center" size="sm" c="dimmed">
                        {form.values.email}
                    </Text>
                    <PinInput
                        length={4}
                        size="lg"
                        mx="auto"
                        value={verificationCode}
                        onChange={setVerificationCode}
                        oneTimeCode
                        aria-label="Mã xác thực"
                    />
                    <Button 
                        variant="subtle" 
                        onClick={handleResendOTP}
                        disabled={loading}
                    >
                        Gửi lại mã xác thực
                    </Button>
                </Stack>
            )
        },
        {
            label: "Bước 3",
            description: "Hoàn thành",
            content: (
                <Stack align="center" spacing="lg">
                    <TextGenerateEffect 
                        words="Chúc mừng! Bạn đã hoàn thành quá trình đăng ký."
                        duration={2}
                        filter={false}
                    />
                    <Text size="lg" fw={500}>
                        {success ? `Chuyển về trang chủ sau ${countdown}s` : 'Đăng nhập thành công'}
                    </Text>
                </Stack>
            )
        }
    ];

    return (
        <>
            <Container fluid mb={50}>
                <ClientHeader />
            </Container>

            <Container>
                <Stepper active={active} iconPosition="right">
                    {steps.map((step, index) => (
                        <Stepper.Step 
                            key={index} 
                            label={step.label} 
                            description={step.description}
                        />
                    ))}
                </Stepper>

                <Title ta="center" my={30}>
                    {steps[active].description}
                </Title>
            </Container>

            <Container size={420} my={40}>
                <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
                    <LoadingOverlay visible={loading} overlayBlur={2} />
                    {steps[active].content}
                    
                    <Group justify="space-between" mt="xl">
                        {active > 0 && active < 2 && (
                            <Button 
                                variant="default" 
                                onClick={() => setActive(prev => prev - 1)}
                                disabled={loading}
                            >
                                Trở lại
                            </Button>
                        )}
                        {active < 2 && (
                            <Button 
                                onClick={handleNext}
                                disabled={loading || (active === 0 && !form.isValid())}
                                fullWidth={active === 0}
                                ml="auto"
                            >
                                {active === 0 ? 'Tiếp theo' : 'Xác nhận'}
                            </Button>
                        )}
                    </Group>
                </Paper>
            </Container>

            <Container fluid>
                <ClientFooter />
            </Container>
        </>
    );
}
