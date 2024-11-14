import React from 'react';
import { Code, Group, Paper, Stack, Text } from '@mantine/core';
import { formatDate } from '../../Utils/formatDate';


interface DefaultPropertyPanel {
    id: string | number;
    createdAt?: string | number;
    updatedAt?: string | number;
    createdBy?: string | number;
    updatedBy?: string | number;
}

export default function DefaultPropertyPanel({
    id = '__',
    createdAt = '__/__/____',
    updatedAt = '__/__/____',
    createdBy = '1',
    updatedBy = '1',
}: DefaultPropertyPanel) {
    return (
        <Paper shadow="xs" p="sm">
            <Group>
                <Stack>
                    <Text size="sm">ID</Text>
                    <Text><Code color="#d0ebff">{id}</Code></Text>
                </Stack>
                <Stack>
                    <Text size="sm">Ngày tạo</Text>
                    <Text>
                        <Code color="#d0ebff">
                            {typeof createdAt === 'string' ? formatDate(createdAt) : createdAt}
                        </Code>
                    </Text>
                </Stack>
                <Stack>
                    <Text size="sm">Ngày cập nhật</Text>
                    <Text>
                        <Code color="#d0ebff">
                            {typeof updatedAt === 'string' ? formatDate(updatedAt) : updatedAt}
                        </Code>
                    </Text>
                </Stack>
            </Group>
        </Paper>
    );
}