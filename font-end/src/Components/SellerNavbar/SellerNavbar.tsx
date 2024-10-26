import {
    NavLink,
    MantineProvider,
} from '@mantine/core';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    IconBoxMultiple1,
    IconBoxMultiple2,
    IconDashboard ,
    IconMapPins ,
    IconTruckDelivery ,
    IconReceipt2 ,
    IconReceiptOff ,
    IconBox,
    IconTrolley 
} from '@tabler/icons-react';
import theme from './SellerNavbar.theme'; 
import classes from './SellerNabar.module.css'
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
        link: '/seller/dashboard',
        label: 'Thống kê',
        icon: <IconDashboard />,
        
    },
    {
        link: '/seller/address',
        label: 'Vận đơn',
        icon: <IconMapPins />,
        childLink: [
            { link: 'shipping', label: 'Kết nối vận chuyển', icon:  <IconTruckDelivery stroke={1.5} />},            
            { link: 'config', label: 'Cấu hình Vận chuyển', icon:  <IconTrolley stroke={1.5} />},            
        ],
        
    },
    {
        link: '/seller/product',
        label: 'Sản phẩm',
        icon: <IconBox />,
        childLink: [
            { link: '', label: 'Tất cả sản phẩm', icon:  <IconBoxMultiple1 stroke={1.5} />},
            { link: 'create', label: 'Thêm sản phẩm', icon:  <IconBoxMultiple2 />},
            
        ],
    },
    {
        link: '/seller/order',
        label: 'Đơn hàng',
        icon: <IconReceipt2 />,
        childLink: [
            { link: 'cancel', label: 'Lý do Huỷ đơn', icon:  <IconReceiptOff stroke={1.5} />},            
        ],
    },
    
];

export default function SellertNavbar() {
    const [active, setActive] = useState<number | null>(null);
    const [activeChild, setActiveChild] = useState<number | null>(null);
    const [openedIndex, setOpenedIndex] = useState<number | null>(null);

    const handleClick = (index: number, event: React.MouseEvent<HTMLAnchorElement>) => {
        if (navbarLinks[index].childLink) {
            event.preventDefault();
            setOpenedIndex(openedIndex === index ? null : index);
        } else {
            setOpenedIndex(null);
        }
        setActive(index);
        setActiveChild(null);
    };

    const handleChildClick = (parentIndex: number, childIndex: number, event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
        setActive(parentIndex);
        setActiveChild(childIndex);
        setOpenedIndex(parentIndex);
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
                                    backgroundColor: index === active ? '#e6f7ff' : (opened ? '#e6f7ff' : ''),
                                    color: index === active ? '#1890ff' : '#595959',
                                }}
                                classNames={classes}
                            />
                            {item.childLink && (
                                <div style={{ display: opened ? 'block' : 'none' }}>
                                    {item.childLink.map((childItem, childIndex) => (
                                        <NavLink
                                            key={`${item.link}-${childIndex}`}
                                            component={Link}
                                            to={`${item.link}/${childItem.link}`}
                                            leftSection={childItem.icon}
                                            label={childItem.label}
                                            active={index === active && childIndex === activeChild}
                                            onClick={(event) => handleChildClick(index, childIndex, event)}
                                            variant="light"
                                            style={{
                                                borderRadius: childIndex === item.childLink.length - 1 ? '0 0 0.2rem 0.2rem' : '0',
                                                textDecoration: 'none',
                                                backgroundColor: index === active && childIndex === activeChild ? '#e6f7ff' : '#f0f5ff', 
                                                color: index === active && childIndex === activeChild ? '#1890ff' : '#595959',
                                            }}
                                            classNames={classes}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            }
        </MantineProvider>
    );
}
