import {

    Container,
    Group,
    Flex,
    Title,
    Paper,
    Text,
    Button,
    SimpleGrid,
    Image ,
    Card, 
    Stack

} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import ClientHeader from '../Components/ClientHeader/ClientHeader';
import ClientFooter from '../Components/ClientFooter/ClientFooter';

export default function HomePage(){
    return <>
        <Container fluid className='shadow-md py-2'>
                <ClientHeader />
        </Container>
        <Container className='my-10'>
            
        </Container>
        <Container fluid className='mx-48'>
            <Group justify='space-between'>
                <Title order={2} className='text-orange-500'>Danh mục nổi bật</Title>
                <Button variant='light'>Xem tất cả </Button>
            </Group>
            <SimpleGrid   cols={{ base: 1, sm: 2, lg: 5 }} spacing="xs" className='my-5'>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        1
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        2
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        3
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        4
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        5
                    </div>
                    <div className='shadown-lg border bottom-1 rounded-md min-h-16 text-center'>
                        6
                    </div>
                    

            </SimpleGrid>
        </Container>
        <Container fluid className='mx-48'>
            <Group justify='space-between'>
                <Title order={2} className='text-orange-500'>Sản phẩm mới nhất</Title>
                <Button variant='light'>Xem tất cả </Button>
            </Group>
            <SimpleGrid   cols={{ base: 1, sm: 4, lg: 4, xl: 4 }} spacing="xs" className='my-5'>
                    
                    <div className='w-full max-w-[250px] min-h-[300px] h-[300px] lg:h-[200px] xl:h-[350px]  p-3 shadow-lg rounded-md'>
                            <div>
                                <div className='card-section w-full '>
                                    <Image
                                        src="https://media-api-beta.thinkpro.vn/media/core/products/2022/5/9/xps%2013%20plus%209320%201.png?w=700&h=700"
                                        className='min-h-[200px] h-[200px] lg:h-[200px] xl:h-[250px]'
                                    ></Image>
                                </div>
                                <Flex 
                                    direction="column"  
                                    className='my-2'
                                >
                                    <Text fw={500}>Dell XPS 13 9315</Text>
                                    <p className='text-md font-semibold text-pink-500'>5.000.000 - 10.000.000 đ</p>
                                    <p className='text-xs font-semibold text-gray-500'>3 phiên bản</p>
                                </Flex>
                            </div>
                    </div>
                    
                    
                    

            </SimpleGrid>
        </Container>
    </>
}
