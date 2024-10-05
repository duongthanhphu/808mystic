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
    PinInput
} from '@mantine/core';
import ClientHeader from '../../Components/ClientHeader/ClientHeader';
import ClientFooter from '../../Components/ClientFooter/ClientFooter';
import { TextGenerateEffect } from "../../Components/TextGenerateEffect/text-generate-effect";
import { useState } from 'react';
import axios from 'axios';

export default function ClientSignUp() {
    const [active, setActive] = useState(0); // Stepper active state
    const [email, setEmail] = useState(''); // User email state
    const [username, setUsername] = useState(''); // Username state
    const [password, setPassword] = useState(''); // Password state
    const [fullName, setFullName] = useState(''); // Full name state
    const [verificationCode, setVerificationCode] = useState(''); // Verification code state
    const [error, setError] = useState(''); // Error message state

    const nextStep = () => setActive((current) => (current < steps.length - 1 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const handleSubmit = async () => {
        setError(''); 

        const userData = {
            username,
            email,
            password,
            fullName
        };

        try {
            const response = await axios.post('http://localhost:4000/api/v1/users/signup', userData); // Call signup API
            console.log(response.data);
            nextStep(); 
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.error || 'An error occurred during signup'); // Display error
        }
    };

    const handleVerification = async () => {
        setError(''); 

        try {
            const response = await axios.post('http://localhost:4000/api/v1/users/verify-email', { email, code: verificationCode }); // Call verification API
            console.log(response.data);
            nextStep(); 
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.error || 'An error occurred during verification'); // Display error
        }
    };

    const steps = [
        {
            label: "Bước 1",
            description: "Tạo Tài khoản",
            content: (
                <Stack>
                    <TextInput
                        label="Email"
                        placeholder="Thêm email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.currentTarget.value)} // Set email state
                    />
                    <TextInput
                        label="Tài khoản"
                        placeholder="Thêm tài khoản"
                        required
                        value={username}
                        onChange={(event) => setUsername(event.currentTarget.value)} // Set username state
                    />
                    <TextInput
                        label="Họ và tên"
                        placeholder="Thêm Họ và tên"
                        required
                        value={fullName}
                        onChange={(event) => setFullName(event.currentTarget.value)} // Set full name state
                    />
                    <PasswordInput
                        label="Mật khẩu"
                        placeholder="Thêm mật khẩu"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)} 
                    />
                </Stack>
            )
        },
        {
            label: "Bước 2",
            description: "Xác thực email",
            content: (
                <Stack>
                    <Text>Chúng tôi đã gửi một mã xác thực đến email của bạn. Vui lòng nhập mã để tiếp tục.</Text>
                    <PinInput
                        mx={65}
                        value={verificationCode}
                        onChange={(value) => setVerificationCode(value)} 
                    />
                </Stack>
            )
        },
        {
            label: "Bước 3",
            description: "Hoàn thành",
            content: (
                <Stack>
                    <TextGenerateEffect duration={2} filter={false} words={'Chúc mừng! Bạn đã hoàn thành quá trình đăng ký.'} />
                    <Button onClick={() => window.location.href = '/login'}>Đăng nhập</Button>
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
                <Stepper active={active} onStepClick={setActive} iconPosition="right">
                    {steps.map((step, index) => (
                        <Stepper.Step key={index} label={step.label} description={step.description} />
                    ))}
                </Stepper>

                <Title ta="center" my={30}>
                    {steps[active].description}
                </Title>
            </Container>

            <Container size={420} my={40}>
                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    {steps[active].content}
                    {error && <Text color="red" mt="sm">{error}</Text>}
                    
                    <Group justify="space-between" mt="xl">
                        {active > 0 && (
                            <Button variant="default" onClick={prevStep}>
                                Trở lại
                            </Button>
                        )}
                        {active < steps.length - 1 ? (
                            <Button onClick={active === 0 ? handleSubmit : handleVerification}>
                                {active === 0 ? 'Tiếp theo' : 'Xác nhận'}
                            </Button>
                        ) : (
                            <Button onClick={() => window.location.href = '/signin'}>Hoàn thành</Button>
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
