import { Paper, TextInput, Title,Text, Stack, Radio, Flex, Select, Checkbox } from "@mantine/core";
function SellerAddressConfig() {
    return (
        <>
            <div>
                <div>
                    <Title order={3} my={10}>Cấu hình địa chỉ</Title>
                </div>
                <Paper shadow="xs" p="md" w="70%">
                    <Title order={5} mb={10}>Thông tin gói hàng mặc định</Title>
                    <Text fw={500} mb={10}>Khối lượng</Text>
                    <Flex justify="flex-start" direction="column" gap="xs" >
                        <Radio
                            label="Theo sản phẩm trong đơn hàng"
                        />
                        <Radio
                            label="Tùy chỉnh"
                        />
                    </Flex>
                    <Flex>
                        <div className="w-1/3 flex gap-2">
                            <TextInput label="Dài" placeholder="10cm" />
                            <TextInput label="Rộng" placeholder="10cm" />
                            <TextInput label="Cao" placeholder="10cm" />
                        </div>
                        <div  className="ml-10 w-1/2">
                            <Select label="Đơn vị" data={[
                            'Cho xem hàng không cho thử',
                            'Cho xem hàng và cho thử',
                                'Không cho xem hàng'
                            ]} />
                        </div>
                    </Flex>
                    {/* <Checkbox label="Gói hàng có thể được đóng gói trong thùng carton" /> */}
                </Paper>
            </div>
        </>
    )
}

export default SellerAddressConfig; 