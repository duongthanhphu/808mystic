import { ActionIcon, Flex } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

interface ButtonProperties {
    resourceKey: string;
}

function ButtonHeader({ resourceKey }: ButtonProperties) {
    return (
        <Flex my='10' justify={'flex-end'} gap="xs" wrap="wrap">
            <Link to={`/admin/${resourceKey}/create`}>
                <ActionIcon
                    variant="outline"
                    style={{ width: '100px' }}
                >
                    <IconPlus style={{ width: '100%', height: '100%' }} stroke={1.5} />
                </ActionIcon>
            </Link>
            <ActionIcon
                variant="outline"
                color="red"
                style={{ width: '100px' }}
            >
                <IconTrash style={{ width: '100%', height: '70%' }} stroke={1.5} />
            </ActionIcon>
        </Flex>
    );
}

export default ButtonHeader;
