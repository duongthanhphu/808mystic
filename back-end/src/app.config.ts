// API version
const version = `v1`
const baseAPI = `/api/${version}/`
// -------------------------API Routes-----------------
const CATEGORY_ATTRIBUTE: string = baseAPI + `categories` + `/categoryAttributes`;
const CATEGORY: string = baseAPI + `categories`;
const PRODUCT: string = baseAPI + `products`;
const USER: string = baseAPI + `users`;





export { 
    USER,
    CATEGORY,
    PRODUCT,
    CATEGORY_ATTRIBUTE
}