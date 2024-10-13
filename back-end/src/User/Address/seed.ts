import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import { IProvince, IDistrict, IWard } from './address-model';

const prisma = new PrismaClient();

const loadAddressess = async () => {
  try {
    // Đọc file JSON
    const data = await fs.readFile('./data_vn.json', 'utf-8');
    const provinces: IProvince[] = JSON.parse(data);

    for (const province of provinces) {
      // Upsert Province
      const upsertedProvince = await prisma.province.upsert({
        where: { Code: province.Code },
        update: {
          Type: province.Type,
          Name: province.Name,
          NameEn: province.NameEn,
          FullName: province.FullName,
          FullNameEn: province.FullNameEn,
          CodeName: province.CodeName,
          AdministrativeUnitId: province.AdministrativeUnitId,
          AdministrativeRegionId: province.AdministrativeRegionId,
        },
        create: {
          Type: province.Type,
          Code: province.Code,
          Name: province.Name,
          NameEn: province.NameEn,
          FullName: province.FullName,
          FullNameEn: province.FullNameEn,
          CodeName: province.CodeName,
          AdministrativeUnitId: province.AdministrativeUnitId,
          AdministrativeRegionId: province.AdministrativeRegionId,
        },
      });

      for (const district of province.District) {
        // Upsert District
        const upsertedDistrict = await prisma.district.upsert({
          where: { Code: district.Code },
          update: {
            Type: district.Type,
            Name: district.Name,
            NameEn: district.NameEn,
            FullName: district.FullName,
            FullNameEn: district.FullNameEn,
            CodeName: district.CodeName,
            ProvinceCode: district.ProvinceCode,
            AdministrativeUnitId: district.AdministrativeUnitId,
          },
          create: {
            Type: district.Type,
            Code: district.Code,
            Name: district.Name,
            NameEn: district.NameEn,
            FullName: district.FullName,
            FullNameEn: district.FullNameEn,
            CodeName: district.CodeName,
            ProvinceCode: district.ProvinceCode,
            AdministrativeUnitId: district.AdministrativeUnitId,
          },
        });

        for (const ward of district.Ward) {
          // Upsert Ward
          await prisma.ward.upsert({
            where: { Code: ward.Code },
            update: {
              Type: ward.Type,
              Name: ward.Name,
              NameEn: ward.NameEn,
              FullName: ward.FullName,
              FullNameEn: ward.FullNameEn,
              CodeName: ward.CodeName,
              DistrictCode: ward.DistrictCode,
              AdministrativeUnitId: ward.AdministrativeUnitId,
            },
            create: {
              Type: ward.Type,
              Code: ward.Code,
              Name: ward.Name,
              NameEn: ward.NameEn,
              FullName: ward.FullName,
              FullNameEn: ward.FullNameEn,
              CodeName: ward.CodeName,
              DistrictCode: ward.DistrictCode,
              AdministrativeUnitId: ward.AdministrativeUnitId,
            },
          });
        }
      }
    }
    console.log('Đã cập nhập hoặc thêm Địa chỉ thành công');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

loadAddressess().then(async () => {
  await prisma.$disconnect()
})
.catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
});

export default loadAddressess;