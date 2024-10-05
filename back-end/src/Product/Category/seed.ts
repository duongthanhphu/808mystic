import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import slugify from 'slugify';

const prisma = new PrismaClient();

interface CategoryData {
  mainCategory: string;
  subCategory1: string;
  subCategory2: string;
}

function createSlug(name: string): string {
  return slugify(name, {
    replacement: '-', 
    remove: undefined, 
    lower: true, 
    strict: false, 
    locale: 'vi', 
    trim: true 
  });
}

async function upsertCategory(
  name: string,
  description: string,
  parentCategoryId: number | null,
  level: number,
  path: string,
  slug: string,
  status: string
) {
  return prisma.category.upsert({
    where: { slug }, 
    update: {
      name,
      description,
      parentCategoryId,
      level,
      path,
      slug,
      status,
      updatedAt: new Date(), 
    },
    create: {
      name,
      description,
      parentCategoryId,
      level,
      path,
      slug,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}


async function main() {
  try {
    const data: CategoryData[] = JSON.parse(fs.readFileSync('categories.json', 'utf8'));
    const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi porttitor euismod tortor, et bibendum quam venenatis sed. Nullam viverra tellus sed augue rhoncus, quis semper turpis tincidunt. Quisque tempor ultrices turpis non varius. Ut nibh est, consequat sed est a, eleifend varius sapien. Aenean consectetur convallis condimentum. Duis venenatis tincidunt dui, sit amet lobortis sem tempus eget. Duis non ligula tellus. Integer dui nulla, lobortis et ullamcorper eget, finibus sit amet elit. ';
    const status = 'available';

    for (const item of data) {
      const mainCategory = await upsertCategory(
        item.mainCategory, 
        description, 
        null, 
        1, 
        item.mainCategory, 
        createSlug(item.mainCategory), 
        status
      );

      const subCategory1 = await upsertCategory(
        item.subCategory1, 
        description, 
        mainCategory.id, 
        2, 
        `${mainCategory.path}/${item.subCategory1}`, 
        createSlug(item.subCategory1), 
        status
      );

      await upsertCategory(
        item.subCategory2,
        description,
        subCategory1.id,
        3,
        `${subCategory1.path}/${item.subCategory2}`,
        createSlug(item.subCategory2),
        status
      );
    }

    console.log('Đã thêm hoặc cập nhật dữ liệu thành công');
  } catch (error) {
    console.error('Lỗi khi thêm hoặc cập nhật dữ liệu:', error);
  } finally {
    await prisma.$disconnect();
  }
}


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });