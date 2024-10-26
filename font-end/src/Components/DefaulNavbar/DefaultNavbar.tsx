import {
    NavLink,
    MantineProvider,
} from '@mantine/core';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    IconBoxMultiple1,
    IconBoxMultiple2,
    IconBoxMultiple3,
    IconBoxMultiple4,
    IconBoxMultiple5,
    IconBoxMultiple6,
    IconBoxMultiple7,
    IconBox,
} from '@tabler/icons-react';
import theme from './DefaultNavbar.theme'; // Import theme từ file theme.js
import classes from './DefaultNavbar.module.css'
interface NavbarLink {
    link: string;
    label: string;
    icon: React.ReactNode;
    childLink?: NavbarChildLink[];
}

interface NavbarChildLink {
    link: string;
    label: string;
    icon?: React.ReactNode;
}

const navbarLinks: NavbarLink[] = [
    {
        link: '/admin/product',
        label: 'Sản phẩm',
        icon: <IconBox />,
        childLink: [
            { link: '/admin/category', label: 'Danh mục sản phẩm', icon: <IconBoxMultiple1 stroke={1.5} /> },
            { link: '/admin/brand', label: 'Nhãn hiệu', icon: <IconBoxMultiple2 /> },
            { link: '/admin/supplier', label: 'Nhà cung cấp', icon: <IconBoxMultiple3 /> },
            { link: '/admin/tag', label: 'Nhãn dán', icon: <IconBoxMultiple4 /> },
            { link: '/admin/unit', label: 'Đơn vị tính', icon: <IconBoxMultiple5 /> },
            { link: '/admin/property', label: 'Thuộc tính sản phẩm', icon: <IconBoxMultiple6 /> },
            { link: '/admin/specification', label: 'Thông số sản phẩm', icon: <IconBoxMultiple7 /> },
        ],
    },
    
];

export default function DefaultNavbar() {
    const [active, setActive] = useState<number | null>(null);
    const [activeChild, setActiveChild] = useState<number | null>(null);
    const [openedIndex, setOpenedIndex] = useState<number | null>(null);

    const handleClick = (index: number, event: React.MouseEvent<HTMLAnchorElement>) => {
        if (navbarLinks[index].childLink) {
            event.preventDefault();
        }
        setOpenedIndex(openedIndex === index ? null : index);
        setActive(index);
        setActiveChild(null);
    };

    const handleChildClick = (childIndex: number) => {
        setActiveChild(childIndex);
    };

    return (
        <MantineProvider theme={theme}>
            {
                navbarLinks.map((item, index) => {
                    const opened = openedIndex === index;
                    return (
                        <div key={index}>
                            <NavLink
                                component={Link}
                                to={item.link}
                                label={item.label}
                                leftSection={item.icon}
                                active={index === active}
                                onClick={(event) => handleClick(index, event)}
                                variant="light"
                                style={{
                                    borderRadius: opened ? '0.2rem 0.2rem 0 0' : '0.2rem',
                                    backgroundColor: index === active ? theme.colors.myColor[5] : (opened ? theme.colors.myColor[3] : ''),
                                    color: index === active ? theme.colors.myColor[9] : theme.colors.myColor[9],
                                }}
                                classNames={classes}
                            />
                            {opened && item.childLink && item.childLink.map((childItem, childIndex) => (
                                <NavLink
                                    key={`${item.link}-${childIndex}`}
                                    leftSection={childItem.icon}
                                    component={Link}
                                    to={childItem.link}
                                    label={childItem.label}
                                    // active={childIndex === activeChild}
                                    onClick={() => handleChildClick(childIndex)}
                                    variant="light"
                                    style={{
                                        borderRadius: childIndex === item.childLink.length - 1 ? '0 0 0.2rem 0.2rem' : '0',
                                        textDecoration: 'none',
                                        // backgroundColor: childIndex === activeChild ? theme.colors.myColor[1] : '', 
                                        // color: theme.colors.myColor[0] ? theme.colors.myColor[9] : '',
                                        
                                    }}
                                    classNames={classes}
                                />
                            ))}
                        </div>
                    );
                })
            }
        </MantineProvider>
    );
}
