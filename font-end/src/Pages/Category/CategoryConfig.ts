import ManagerPath from "../../Constants/ManagerPath";
import ResourseUrl from "../../Constants/ResourseUrl";

interface PropertyConfig {
    label: string;
    type: 'string' | 'number';
    isShowInTable?: boolean;
}

// Định nghĩa giao diện cho cấu hình danh mục sản phẩm
interface CategoryConfigsType {
    properties: {
        [key: string]: PropertyConfig;
    };
    initialCreateUpdateFormValues: {
        name: string;
        slug: string;
        description: string;
        thumbnail: string;
        parentCategoryId: string | null;
        status: string;
    };
}

// Làm cho CategoryConfigs mở rộng từ Configs
export default class CategoryConfigs extends Configs implements CategoryConfigsType {
    static managerPath = ManagerPath.CATEGORY;
    static resourceUrl = ResourseUrl.CATEGORY;
    static resourceKey = 'categories';
    static createTitle = 'Thêm danh mục sản phẩm';
    static updateTitle = 'Cập nhật danh mục sản phẩm';
    static manageTitle = 'Quản lý danh mục sản phẩm';
    
    static properties = {
        name: {
        label: 'Tên danh mục sản phẩm',
        type: 'string',
        isShowInTable: true,
        },
        slug: {
        label: 'Slug danh mục sản phẩm',
        type: 'string',
        isShowInTable: true,
        },
        description: {
        label: 'Mô tả danh mục sản phẩm',
        type: 'string',
        },
        thumbnail: {
        label: 'Hình đại diện',
        type: 'string',
        isShowInTable: true,
        },
        parentCategoryId: {
        label: 'Danh mục cha',
        type: 'number',
        },
        status: {
        label: 'Trạng thái danh mục sản phẩm',
        type: 'number',
        isShowInTable: true,
        },
    };

    static initialCreateUpdateFormValues = {
        name: '',
        slug: '',
        description: '',
        thumbnail: '',
        parentCategoryId: null,
        status: '1',
    };
}