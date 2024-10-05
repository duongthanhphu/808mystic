import React from 'react';
import { ActionIcon, Group, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconChevronLeft  } from '@tabler/icons-react';

interface CreateUpdateTitleProps {
    managerPath: string;
    title: string;
}

function CreateUpdateTitle({
    managerPath,
    title,
}: CreateUpdateTitleProps) {
    return (
        <Group>
        <ActionIcon
            component={Link}
            to={managerPath}
            color="blue"
            variant="filled"
        >
            <IconChevronLeft />
        </ActionIcon>
        <Title order={3}>{title}</Title>
        </Group>
    );
}

export default React.memo(CreateUpdateTitle);
