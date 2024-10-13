interface IWard {
    Type: string;
    Code: string;
    Name: string;
    NameEn: string;
    FullName: string;
    FullNameEn: string;
    CodeName: string;
    DistrictCode: string;
    AdministrativeUnitId: number;
}

interface IDistrict {
    Type: string;
    Code: string;
    Name: string;
    NameEn: string;
    FullName: string;
    FullNameEn: string;
    CodeName: string;
    ProvinceCode: string;
    AdministrativeUnitId: number;
    Ward: IWard[];
}

interface IProvince {
    Type: string;
    Code: string;
    Name: string;
    NameEn: string;
    FullName: string;
    FullNameEn: string;
    CodeName: string;
    AdministrativeUnitId: number;
    AdministrativeRegionId: number;
    District: IDistrict[];
}

export {
    IProvince,
    IDistrict,
    IWard
} 