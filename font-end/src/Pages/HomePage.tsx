import {

    Container,
    Group,
    Flex,

} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import ClientHeader from '../Components/ClientHeader/ClientHeader';
import ClientFooter from '../Components/ClientFooter/ClientFooter';

export default function HomePage(){
    return <>
        <Container fluid>
                <ClientHeader />
        </Container>
        <Container fluid>
                <Flex>
                    
                </Flex>
        </Container>
        <Carousel slideSize="70%" height={200} slideGap="md" controlsOffset="lg" loop>
            {/* ...slides */}
        </Carousel>
        
        {/* <Container fluid>
                <ClientFooter />
        </Container> */}
    </>
}
