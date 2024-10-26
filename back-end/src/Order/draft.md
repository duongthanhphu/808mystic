// Đơn vị đo lường
enum MeasurementUnit {
  GRAM       // g
  KILOGRAM   // kg
  CENTIMETER // cm
  METER      // m
}

// Trạng thái đơn hàng
enum OrderStatus {
  PENDING         // Chờ xử lý
  CONFIRMED       // Đã xác nhận
  SHIPPING        // Đang giao hàng
  COMPLETED       // Hoàn thành
  CANCELLED       // Đã hủy
  RETURNED        // Hoàn trả
}

// Trạng thái vận chuyển
enum ShipmentStatus {
  PENDING          // Chờ xử lý
  CONFIRMED        // Đã xác nhận
  PICKING          // Đang lấy hàng
  PICKED           // Đã lấy hàng
  IN_TRANSIT       // Đang vận chuyển
  DELIVERED        // Đã giao hàng
  FAILED_DELIVERY  // Giao hàng thất bại
  RETURNED         // Đã hoàn trả
  CANCELLED        // Đã hủy
}

// Chính sách kiểm tra hàng
enum InspectionPolicy {
  NO_INSPECTION    // Không cho xem hàng
  ALLOW_INSPECTION // Cho xem hàng
}

// Đơn vị vận chuyển (VD: GHN, GHTK, Viettel Post...)
model ShippingCarrier {
  id              Int       @id @default(autoincrement())
  name            String    @db.VarChar(100)  // Tên đơn vị vận chuyển
  code            String    @unique @db.VarChar(50)  // Mã định danh (vd: GHN, GHTK)
  description     String?   @db.VarChar(255)
  website         String?   @db.VarChar(255)
  supportPhone    String?   @db.VarChar(20)
  apiEndpoint     String?   @db.VarChar(255)  // URL endpoint để tích hợp API
  apiKey          String?   @db.VarChar(255)  // API key để xác thực
  status          String    @default("active") // active/inactive
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
  shippingMethods ShippingMethod[]

  @@map("shipping_carriers")
}

// Phương thức vận chuyển
model ShippingMethod {
  id              Int       @id @default(autoincrement())
  carrierId       Int       // FK to ShippingCarrier
  name            String    @db.VarChar(100)
  code            String    @unique @db.VarChar(50)
  description     String?   @db.VarChar(255)
  estimatedDays   Int       // Số ngày dự kiến giao hàng
  status          String    @default("active")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
  carrier         ShippingCarrier @relation(fields: [carrierId], references: [id])
  shipments       Shipment[]

  @@map("shipping_methods")
}

// Đơn hàng
model Order {
  id              Int         @id @default(autoincrement())
  userId          Int
  orderNumber     String      @unique @db.VarChar(50)  // Mã đơn hàng
  orderDate       DateTime    @default(now())
  totalAmount     Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  shippingAddress ShippingAddress?
  shipment        Shipment?

  @@map("orders")
}

// Địa chỉ giao hàng
model ShippingAddress {
  id              Int       @id @default(autoincrement())
  orderId         Int       @unique
  recipientName   String    @db.VarChar(100)
  phone           String    @db.VarChar(20)
  provinceCode    String
  districtCode    String  
  wardCode        String
  addressDetail   String    @db.VarChar(255)
  note            String?   @db.VarChar(255)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
  order           Order     @relation(fields: [orderId], references: [id])

  @@map("shipping_addresses")
}

// Quá trình vận chuyển
model Shipment {
  id                    Int       @id @default(autoincrement())
  orderId               Int       @unique
  shippingMethodId      Int
  trackingNumber        String    @unique @db.VarChar(100)
  status                ShipmentStatus @default(PENDING)
  estimatedDeliveryDate DateTime?
  actualDeliveryDate    DateTime?
  shippingFee           Decimal   @db.Decimal(10, 2)
  note                  String?   @db.VarChar(255)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?
  order                 Order     @relation(fields: [orderId], references: [id])
  shippingMethod        ShippingMethod @relation(fields: [shippingMethodId], references: [id])
  configuration         ShipmentConfiguration?
  trackingHistory       ShipmentTracking[]

  @@map("shipments")
}

// Cấu hình gói hàng
model ShipmentConfiguration {
  id                Int       @id @default(autoincrement())
  shipmentId        Int       @unique
  // Kích thước gói hàng
  packageWeight     Float     // Khối lượng
  packageLength     Float     @default(10)
  packageWidth      Float     @default(10)
  packageHeight     Float     @default(10)
  weightUnit        MeasurementUnit @default(GRAM)
  sizeUnit          MeasurementUnit @default(CENTIMETER)
  // Chính sách xem hàng
  inspectionPolicy  InspectionPolicy @default(NO_INSPECTION)
  inspectionNote    String?   @db.VarChar(255)
  // Các thông tin khác
  isUseProductDimension Boolean @default(true) // Sử dụng kích thước mặc định từ sản phẩm
  requireInsurance     Boolean @default(false) // Yêu cầu bảo hiểm
  codAmount           Decimal?  @db.Decimal(10, 2) // Số tiền thu hộ (COD)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?
  shipment            Shipment   @relation(fields: [shipmentId], references: [id])

  @@map("shipment_configurations")
}

// Lịch sử vận chuyển
model ShipmentTracking {
  id          Int       @id @default(autoincrement())
  shipmentId  Int
  status      ShipmentStatus
  location    String?   @db.VarChar(255)
  description String    @db.VarChar(255)
  createdAt   DateTime  @default(now())
  shipment    Shipment  @relation(fields: [shipmentId], references: [id])

  @@map("shipment_tracking")
}

// Kích thước sản phẩm
model ProductDimension {
  id          Int       @id @default(autoincrement())
  productId   Int       @unique
  weight      Float     // Khối lượng
  length      Float     @default(10) // Chiều dài
  width       Float     @default(10) // Chiều rộng
  height      Float     @default(10) // Chiều cao
  weightUnit  MeasurementUnit @default(GRAM)
  sizeUnit    MeasurementUnit @default(CENTIMETER)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
  product     Product   @relation(fields: [productId], references: [id])

  @@map("product_dimensions")
}