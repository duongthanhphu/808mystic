import { Anchor, Breadcrumbs, Text } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';

const CustomBreadcrumb = ({ items }) => {
    const location = useLocation();
    
    const breadcrumbItems = items.map((item, index, array) => {
        const isLast = index === array.length - 1;
        
        if (isLast) {
            return (
                <Text key={index} className="text-gray-600">
                    {item.title}
                </Text>
            );
        }

        return (
            <Link 
                key={index}
                to={item.path}
                className="text-blue-500 hover:text-blue-700 no-underline"
            >
                {item.title}
            </Link>
        );
    });

    return (
        <Breadcrumbs 
        separator="/" 
        className="mb-5"
        separatorMargin="xs"
        >
        {breadcrumbItems}
        </Breadcrumbs>
    );
};

export  {
    CustomBreadcrumb
};