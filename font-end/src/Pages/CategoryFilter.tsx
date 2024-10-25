import { useState, useEffect } from "react";
import {
  TextInput,
  RadioGroup,
  Radio,
  Button,
  Checkbox,
  Card,
  Badge,
  Container,
  Breadcrumbs,
  Anchor,
  Group,
  Pagination,
} from "@mantine/core";
import ClientHeader from "../Components/ClientHeader/ClientHeader";
import ClientFooter from "../Components/ClientFooter/ClientFooter";
import axios from "axios";

const CategoryFilter = () => {
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>("newest");
  const [activePage, setActivePage] = useState(1);
  const productsPerPage = 5;
  
    // const [allProducts, setAllProducts] = useState([]); // Chứa sản phẩm từ API
  // const [loading, setLoading] = useState(true); 
  
  const items = [
    { title: "Trang Chủ", href: "http://localhost:5173/" },
    { title: "Laptop", href: "#" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  const allProducts = [
    {
      name: "Dell XPS 13 9315",
      price: "5.500.000 – 12.500.000 ₫",
      image:
        "https://product.hstatic.net/200000722513/product/1024_557c8f30-f366-40eb-ae81-d154586e0a9c_699x559_1fb32f5300d44d6d907c801fe6d67e93_grande.png",
      versions: 3,
    },
    {
      name: "Microsoft Surface Pro 9",
      price: "12.000.000 ₫",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:quality(100)/2024_3_20_638465244585369889_macbook-air-m3-13-2024-dd.jpg",
      versions: 1,
    },
    {
      name: "Lenovo ThinkPad X1 Nano Gen 2",
      price: "22.000.000 ₫",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:quality(100)/2023_11_1_638344474239513699_macbook-pro-14-2023-m3-pro-max-bac-dd.jpg",
      versions: 1,
    },
  ];

  // Tính toán các sản phẩm trên trang hiện tại
  const startIndex = (activePage - 1) * productsPerPage;
  const currentProducts = allProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  return (
    <>
      <Container fluid className="shadow-md py-2">
        <ClientHeader />
      </Container>
      <div className="bg-gray-100 px-20 py-10">
        <div className="bg-white shadow-sm p-6">
          <Breadcrumbs>{items}</Breadcrumbs>
        </div>
        <div className="pt-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Filter */}
            <div className="w-full md:w-1/4">
              <Card shadow="sm" padding="lg">
                <h2 className="text-lg font-bold mb-4">Bộ lọc</h2>
                <TextInput
                  placeholder="Tìm kiếm trong Laptop"
                  className="mb-4"
                />

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-2">Khoảng giá</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Dưới 10 tr",
                      "10 tr đến 20 tr",
                      "20 tr đến 30 tr",
                      "30 tr đến 40 tr",
                      "40 tr đến 50 tr",
                      "Trên 50 tr",
                    ].map((range) => (
                      <Badge
                        key={range}
                        onClick={() => setPriceRange(range)}
                        color={priceRange === range ? "blue" : "gray"}
                        className="cursor-pointer"
                      >
                        {range}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-2">Thương hiệu</h3>
                  {[
                    "Macbook",
                    "ASUS",
                    "DELL",
                    "Lenovo",
                    "Microsoft Surface",
                  ].map((brand) => (
                    <Checkbox key={brand} label={brand} className="mb-2" />
                  ))}
                </div>

                {/* Other Filters */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-2">Khác</h3>
                  <Checkbox label="Chỉ có sẵn hàng" />
                </div>

                {/* Reset Button */}
                <Button variant="outline" color="gray" fullWidth>
                  Đặt mặc định
                </Button>
              </Card>
            </div>

            {/* Main Product Section */}
            <div className="w-full md:w-3/4">
              <div className="flex justify-between items-center mb-4">
                <RadioGroup
                  value={sortOption}
                  onChange={setSortOption}
                  className="flex gap-4"
                >
                  <Group>
                    <Radio value="newest" label="Mới nhất" />
                    <Radio value="low-to-high" label="Giá thấp → cao" />
                    <Radio value="high-to-low" label="Giá cao → thấp" />
                  </Group>
                </RadioGroup>

                <span>{allProducts.length} sản phẩm</span>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentProducts.map((product) => (
                  <Card
                    key={product.name}
                    shadow="sm"
                    padding="lg"
                    className="hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={`${product.image}`}
                      alt={product.name}
                      className="w-full h-48 object-cover mb-4"
                    />
                    <h3 className="text-md font-bold">{product.name}</h3>
                    <p className="text-red-500 font-semibold">
                      {product.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.versions} phiên bản
                    </p>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex justify-center">
                <Pagination
                  page={activePage}
                  onChange={setActivePage}
                  total={Math.ceil(allProducts.length / productsPerPage)}
                  siblings={1}
                  boundaries={1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ClientFooter />
    </>
  );
};

export default CategoryFilter;
