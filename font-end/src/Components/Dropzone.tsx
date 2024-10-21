import React, { useCallback, useState } from 'react';
import { Group, Text, useMantineTheme, rem, Image } from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto } from '@tabler/icons-react';

interface DropzoneComponentProps {
    setSelectedFiles: (files: File[]) => void;
    error?: string;
}

export default function DropzoneComponent({ setSelectedFiles, error }: DropzoneComponentProps) {
    const theme = useMantineTheme();
    const [files, setFiles] = useState<FileWithPath[]>([]);

    const handleDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
        setSelectedFiles(acceptedFiles);
        },
        [setSelectedFiles]
    );

    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return (
        <Image
            key={index}
            src={imageUrl}
            imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
            width={100}
            height={100}
            fit="cover"
            radius="md"
        />
        );
    });

    return (
    <>
        <Dropzone
            onDrop={handleDrop}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={3 * 1024 ** 2}
            accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp']}
            multiple
        >
                <Group style={{ minHeight: rem(100), pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                        <IconUpload
                        size="3.2rem"
                        stroke={1.5}
                        color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
                        />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX
                        size="3.2rem"
                        stroke={1.5}
                        color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
                        />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <IconPhoto size="3.2rem" stroke={1.5} />
                    </Dropzone.Idle>

                    <div>
                        <Text size="xl" inline>
                        Kéo ảnh vào đây hoặc nhấp để chọn file
                        </Text>
                        <Text size="sm" inline mt={7}>
                        Mỗi file không được vượt quá 5MB
                        </Text>
                    </div>
                </Group>
        </Dropzone>
        {error && <Text>{error}</Text>}
        {files.length > 0 && (
            <Group mt="md">
                {previews}
            </Group>
        )}
    </>
  );
}
