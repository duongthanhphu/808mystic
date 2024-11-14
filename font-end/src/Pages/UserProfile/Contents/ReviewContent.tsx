import {
    Container,
    Flex,
    Text,
    Rating,
    Badge,
    Button,
    Pagination,
  } from "@mantine/core";
  import { IconTrash } from "@tabler/icons-react";
  
  const ReviewContent: React.FC = () => {
    return (
      <Container className="p-8 w-full border-md shadow-xl bg-white">
        <Text fw={700} className="font-bold text-2xl">
          Đánh giá sản phẩm
        </Text>
        <Flex className="mt-4">
          <Flex
            direction="row"
            className="bg-white border rounded-lg p-2 text-center"
          >
            <Container className="flex flex-row justify-center gap-2">
              <Text span className="h-5 w-5 bg-gray-400 rounded-full"></Text>
              <Text span>Chưa duyệt</Text>
            </Container>
  
            <Container className="flex justify-center gap-2">
              <Text span className="h-5 w-5 bg-green-500 rounded-full"></Text>
              <Text span>Đã duyệt</Text>
            </Container>
  
            <Container className="flex justify-center gap-2">
              <Text span className="h-5 w-5 bg-pink-500 rounded-full"></Text>
              <Text span>Không duyệt</Text>
            </Container>
          </Flex>
        </Flex>
  
        <div className="rounded-lg bg-green-200 mt-3 p-4">
          <div className="flex flex-row justify-between mb-2">
            <div className="flex flex-row gap-4 justify-center">
              <Text span className="text-blue-600 font-semibold">
                Dell 123 Del 123
              </Text>
  
              <Text span className="text-gray-600">
                00:12:01
              </Text>
  
              <Text span className="text-gray-600">
                26/04/2021
              </Text>
  
              <div className="inline-block">
                <Rating defaultValue={4} readOnly />
              </div>
  
              <Badge color="green">Đã duyệt</Badge>
            </div>
  
            <Button justify="center" variant="outline" color="red" size="xs">
              <IconTrash stroke={1.25} /> &nbsp; Xoá
            </Button>
          </div>
  
          <div className="text-gray-700">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Non corporis
            excepturi, odit debitis cumque corrupti rem temporibus minima qui
            quidem eius iusto quia dolor veritatis, ipsum quaerat reprehenderit
            officiis quam!
          </div>
        </div>
  
        <div className="mt-3">
          <Pagination total={2}></Pagination>
        </div>
      </Container>
    );
  };
  export default ReviewContent;
  