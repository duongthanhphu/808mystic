import React from 'react';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';

export default function DropzoneComponent({ setSelectedFiles, ...props }: Partial<DropzoneProps> & { setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>> }) {
    const handleDrop = (files: File[]) => {
        console.log('Accepted files:', files);
        setSelectedFiles(files); // Cập nhật các file vào state từ `ProductManage`
    };

    const handleReject = (files: File[]) => {
        console.log('Rejected files:', files);
        // Xử lý khi file bị từ chối
    };

    return (
        <Dropzone
            onDrop={handleDrop}
            onReject={handleReject}
            maxSize={5 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
            {...props}
        >
            {/* Nội dung của Dropzone */}
        </Dropzone>
    );
}
