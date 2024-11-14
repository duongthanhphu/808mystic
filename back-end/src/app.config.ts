// API version
const version = `v1`
const baseAPI = `/api/${version}/`


type routePath = {
    CATEGORY_ATTRIBUTE: string;
    CATEGORY: string;
    PRODUCT: string;
    USER: string;
    CART: string;
    ORDER: string;
    ADDRESS: string;
    SELLER: string;
    SHIPMENT: string;
    SHIPPING_PROVIDER: string;
    WAREHOUSE: string;
    INVENTORY: string;
    IMAGE: string; 
     USERUPDATE: string;

};

const routes : routePath = {
    CATEGORY_ATTRIBUTE: `${baseAPI}categories/categoryAttributes`,
    CATEGORY: `${baseAPI}categories`,
    PRODUCT: `${baseAPI}products`,
    USER: `${baseAPI}users`,
    CART: `${baseAPI}carts`,
    ORDER: `${baseAPI}orders`,
    ADDRESS: `${baseAPI}address`,
    SELLER: `${baseAPI}sellers`,
    SHIPMENT: `${baseAPI}shipment`,
    SHIPPING_PROVIDER: `${baseAPI}shipping-providers`,
    WAREHOUSE: `${baseAPI}warehouses`,
    INVENTORY: `${baseAPI}inventory`,
    IMAGE: `${baseAPI}image`,
    USERUPDATE: `${baseAPI}update`,
};

export default routes;