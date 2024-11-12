import { Request, Response } from 'express';
import prismaService from '../prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';
import GHNService, { GHNOrderInfo } from '../Shipment/ghn-service';

const ghnService = new GHNService({
        token: '8854a258-9aef-11ef-9834-7e8875c3faf5',
        environment: 'prod',
        shopId: 5370939 
    });

const createOrder = async (req: Request, res: Response) => {
    const { userId, items } = req.body;
    
    try {
        const userIdNumber = Number(userId);
        if (isNaN(userIdNumber)) {
            return res.status(400).json({ error: 'UserId không hợp lệ' });
        }

        // Kiểm tra user có tồn tại không
        const user = await prismaService.user.findUnique({
            where: { id: userIdNumber },
            include: { addresses: true }
        });

        if (!user) {
            return res.status(400).json({ error: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra địa chỉ giao hàng
        let shippingAddress;
        if (user.addresses.length > 0) {
            shippingAddress = user.addresses[0];
        } else {
            return res.status(400).json({ error: 'Không tìm thấy địa chỉ giao hàng cho người dùng này' });
        }

        // Tính toán tổng tiền và xử lý items
        let totalAmount = 0;
        interface OrderItem {
            productId: number;
            classificationId?: number;
            quantity: number;
            price: number;
        }

        let processedItems = items.map((item: OrderItem) => {
            const price = Number(item.price);
            if (isNaN(price)) {
                throw new Error(`Giá không hợp lệ cho sản phẩm: ${item.productId}`);
            }
            totalAmount += price * item.quantity;
            return {
                ...item,
                price: price
            };
        });

        // Lấy thông tin sản phẩm và người bán
        const productIds = processedItems.map((item: OrderItem) => item.productId);
        const products = await prismaService.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            select: {
                id: true,
                sellerId: true
            }
        });

        if (products.length === 0) {
            return res.status(400).json({ error: 'Không tìm thấy sản phẩm' });
        }

        const productMap = new Map(products.map(p => [p.id, p]));
        processedItems = processedItems.map((item: OrderItem) => ({
            ...item,
            product: productMap.get(item.productId)
        }));

        // Tạo đơn hàng với trạng thái PENDING
        const order = await prismaService.order.create({
            data: {
                userId: userIdNumber,
                sellerId: processedItems[0].product.sellerId,
                status: OrderStatus.PENDING, 
                totalAmount,
                shippingAddressId: user.addresses[0]?.id,
                items: {
                    create: processedItems.map((item: OrderItem) => ({
                        productId: item.productId,
                        classificationId: item.classificationId || null,
                        quantity: item.quantity,
                        price: item.price,
                    }))
                },
                statusHistory: {
                    create: {
                        status: OrderStatus.PENDING,
                        createdBy: userIdNumber,
                        note: 'Đơn hàng mới được tạo'
                    }
                }
            },
            include: {
                items: true,
                shippingAddress: true,
                statusHistory: true
            }
        });

        res.status(201).json({ 
            success: true,
            message: 'Đơn hàng đã được tạo và đang chờ người bán xác nhận',
            order 
        });

    } catch (error: unknown) {
        console.error('Lỗi chi tiết khi tạo đơn hàng:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: 'Lỗi khi tạo đơn hàng', details: error.message });
        } else {
            res.status(500).json({ error: 'Lỗi không xác định khi tạo đơn hàng' });
        }
    }
};

const confirmOrderBySeller = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { sellerId, action, note } = req.body; 
    try {
        // Kiểm tra đơn hàng tồn tại
        const order = await prismaService.order.findUnique({
            where: { id: Number(orderId) },
            include: { 
                items: true,
                statusHistory: true
            }
        });
        const sellerFromServer = await prismaService.user.findUnique({
            where: { id: Number(sellerId) },
            include: {
                seller: true,
                addresses: true
            }
        })
        const userFromServer = await prismaService.user.findUnique({
            where: { id: Number(order?.userId) },
            include: {
                addresses: true
            }
        })
        const warehouseFromServer = await prismaService.warehouse.findFirst({ 
                where: { sellerId: sellerFromServer?.seller?.id },
            }); 
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
        }

        // Kiểm tra quyền của người bán
        if (order.sellerId !== Number(sellerId)) {
            return res.status(403).json({ error: 'Bạn không có quyền xác nhận đơn hàng này' });
        }

        // Kiểm tra trạng thái hiện tại của đơn hàng
        if (order.status !== OrderStatus.PENDING) {
            return res.status(400).json({ 
                error: 'Không thể xác nhận đơn hàng này',
                message: 'Đơn hàng không ở trạng thái chờ xác nhận'
            });
        }

        let newStatus;
        let statusNote;

        if (action === 'confirm') {
            newStatus = OrderStatus.SELLER_CONFIRMED;
            statusNote = note || 'Đơn hàng đã được người bán xác nhận';

            // Map địa chỉ người bán và người mua với GHN
            const addressUserFromServer = await prismaService.address.findUnique({  
                where: { id: order.shippingAddressId as number },
            });
            const addressSellerFromServer = await prismaService.address.findUnique({  
                where: { id: sellerFromServer?.addresses[0].id },
            });

            // Map địa chỉ với GHN
            const [addressAfterMapFromUser, addressAfterMapFromSeller] = await Promise.all([
                mapAddressToGHN(
                    addressUserFromServer?.addressDetail as string,
                    addressUserFromServer?.provinceId as number,
                    addressUserFromServer?.districtId as number,
                    addressUserFromServer?.wardId as number
                ),
                mapAddressToGHN(
                    addressSellerFromServer?.addressDetail as string,
                    warehouseFromServer?.provinceId as number,
                    warehouseFromServer?.districtId as number,
                    warehouseFromServer?.wardId as number
                )
            ]);

            // Tính tổng khối lượng đơn hàng  
            const totalWeight = order.items.reduce((sum, item) => sum + (item.quantity * 200), 0); // 200g mỗi sản phẩm

            // Tạo đơn hàng trên GHN
            const ghnOrderInfo: GHNOrderInfo = {
                payment_type_id: 2, 
                note: order.sellerNote || "Không có ghi chú",
                required_note: "KHONGCHOXEMHANG", 
                from_phone: sellerFromServer?.phone as string,
                from_address: addressAfterMapFromSeller.addressDetail,
                from_province_name: addressAfterMapFromSeller.provinceName,
                from_district_name: addressAfterMapFromSeller.districtName,
                from_ward_name: addressAfterMapFromSeller.wardName,
                from_ward_code: addressAfterMapFromSeller.wardCode,
                to_name: userFromServer?.fullName as string,    
                to_phone: '0903585234' as string,
                to_address: addressAfterMapFromUser.addressDetail,
                to_ward_name: addressAfterMapFromUser.wardName,
                to_ward_code: addressAfterMapFromUser.wardCode,
                to_district_name: addressAfterMapFromUser.districtName,
                content: `Đơn hàng #${order.id}`,
                weight: totalWeight,
                length: 20,
                width: 20,
                height: 10,
                service_type_id: 2, // 2: Standard delivery
                items: order.items.map(item => ({
                    name: `Sản phẩm #${item.productId}`,
                    quantity: item.quantity,
                    price: Number(item.price),
                    weight: 200
                }))
            };
            // Tạo đơn hàng trên GHN
            const ghnOrderResult = await ghnService.createOrder(ghnOrderInfo);
            const printOrder = await ghnService.printOrder(ghnOrderResult.data.order_code);
            await prismaService.order.update({
                where: { id: Number(orderId) },
                data: {
                    shippingCode: ghnOrderResult.data.order_code || 'Không có mã ORDER ',  
                    status: newStatus,
                    statusHistory: {
                        create: {
                            status: newStatus,
                            createdBy: Number(sellerId),
                            note: statusNote
                        }
                    }
                }
            });

            // Cập nhật số lượng trong kho
            for (const item of order.items) {
                await prismaService.inventory.update({
                    where: {
                        warehouseId_productId_classificationId: {
                            warehouseId: warehouseFromServer?.id as number,
                            productId: item.productId,
                            classificationId: item.classificationId as number
                        }
                    },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Đơn hàng đã được xác nhận và tạo vận đơn thành công',
                ghnOrderResult: ghnOrderResult,
                printOrder: printOrder
            });
        } else if (action === 'reject') {
            newStatus = OrderStatus.SELLER_REJECTED;
            statusNote = note || 'Đơn hàng đã bị từ chối bởi người bán';
        } else {
            return res.status(400).json({ error: 'Hành động không hợp lệ' });
        }

        // Cập nhật trạng thái đơn hàng
        const updatedOrder = await prismaService.order.update({
            where: { id: Number(orderId) },
            data: {
                status: newStatus,
                confirmedAt: action === 'confirm' ? new Date() : null,
                statusHistory: {
                    create: {
                        status: newStatus,
                        createdBy: Number(sellerId),
                        note: statusNote
                    }
                }
            },
            include: {
                items: true,
                statusHistory: true
            }
        });

        res.json({
            success: true,
            message: `Đơn hàng đã được ${action === 'confirm' ? 'xác nhận' : 'từ chối'}`,
            order: updatedOrder
        });

    } catch (error) {
        console.error('Lỗi khi xác nhận đơn hàng:', error);
        return res.status(500).json({
            success: false,
            error: 'Có lỗi xảy ra khi xác nhận đơn hàng',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

const printOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    try {
        const orderIdNumber = Number(orderId);
        if (isNaN(orderIdNumber)) {
            return res.status(400).json({ error: 'OrderId không hợp lệ' });
        }
        const orderFromServer = await prismaService.order.findUnique({    
            where: { id: orderIdNumber },
        });
        if (!orderFromServer) {
            return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
        }
        if (!orderFromServer.shippingCode) {
            return res.status(400).json({ error: 'Đơn hàng chưa có mã vận đơn' });
        }
        
        const printData = await ghnService.printOrder(orderFromServer.shippingCode);
        res.json({
            success: true,
            message: 'Lấy link in đơn hàng thành công',
            data: printData
        });
    } catch (error) {
        console.error('Lỗi khi in đơn hàng:', error);
        res.status(500).json({ error: 'Không thể in đơn hàng' });
    }
}

const orderDetail = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    try {
        const order = await prismaService.order.findUnique({
        where: {
            id: Number(orderId),
        },
        include: {
            items: {
            include: {
                product: {
                include: {
                    images: {
                    where: {
                        isThumbnail: true
                    },
                    take: 1
                    }
                }
                },
                classification: {
                    include: {
                        option1: true,
                        option2: true
                    }
                }
            }
            },
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    addresses: true
                }
            },
            seller: {
                select: {
                        id: true,
                            seller: {
                                select: {
                                    storeName: true,
                                    email: true,
                                    pickupAddress: true
                                }
                    }
                }
            },
            shippingAddress: {
                include: {
                    user: {
                        select: {
                            addresses: true
                        }
                    },
                    
                }
            },
            statusHistory: {
                include: {
                    user: {
                        select: {
                                id: true,
                                fullName: true
                            }
                        }
            },
                orderBy: {
                    createdAt: 'desc'
                }
            },
                cancellation: true
            }
        });
        res.json({
            success: true,
            message: 'Lấy chi tiết đơn hàng thành công',
            data: order
        });
    }catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        res.status(500).json({ error: 'Không thể lấy chi tiết đơn hàng' });
    }
}

const checkoutOrder = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    // Lấy id người dùng hiện tại
    const userId = req.params.userId; 
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user',
      });
    }
    // 1. Validate shipping address
    const shippingAddress = await prismaService.address.findFirst({
      where: {
        userId: Number(userId),
      },
      include: {
        province: true,
        district: true,
        ward: true,
      },
    });
    const userFromServer = await prismaService.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shipping address',
      });
    }

    // Get first product to identify seller
    const firstProduct = await prismaService.product.findUnique({
      where: { 
        id: items[0].productId,
      },
      select: {
        sellerId: true
      }
    });

    if (!firstProduct) {
      return res.status(400).json({
        success: false,
        error: 'Product not found'
      });
    }

    const userRoleSeller = await prismaService.user.findUnique({
      where: { id: firstProduct.sellerId },
      include: {
        seller: true,
        addresses: true
      }
    })

    if (!userRoleSeller) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller',
      });
    }

    // 3. Validate and calculate items prices
    let subtotal = 0;
    const checkoutItems = [];

    for (const item of items) {
      // Get product with classification if specified
      const product = await prismaService.product.findUnique({
        where: { 
          id: item.productId,
        },
        include: {
          classifications: item.classificationId ? {
            where: { id: item.classificationId }
          } : undefined
        }
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.productId} not found`
        });
      }

      // Validate all products belong to same seller
      if (product.sellerId !== firstProduct.sellerId) {
        return res.status(400).json({
          success: false,
          error: `All products must be from the same seller`
        });
      }

      // Check inventory
      const inventory = await prismaService.inventory.findFirst({
        where: {
          productId: product.id,
          classificationId: item.classificationId,
          status: 'ACTIVE',
          quantity: {
            gte: item.quantity
          }
        }
      });

      if (!inventory) {
        return res.status(400).json({
          success: false,
          error: `Insufficient inventory for product ${product.id}`
        });
      }

      // Get price based on classification or base product price
      const price = item.classificationId && product.classifications[0] 
        ? product.classifications[0].price
        : null;

      const itemTotal = Number(price) * item.quantity;
      subtotal += itemTotal;

      checkoutItems.push({
        productId: item.productId,
        classificationId: item.classificationId,
        name: product.name,
        quantity: item.quantity,
        price: Number(price),
        totalPrice: itemTotal
      });
    }

    const shippingFee = await calculateShippingFee(
      userRoleSeller.addresses[0].addressDetail, 
      userRoleSeller.addresses[0].provinceId, 
      userRoleSeller.addresses[0].districtId, 
      userRoleSeller.addresses[0].wardId, 
      shippingAddress.addressDetail, 
      shippingAddress.province.id, 
      shippingAddress.district.id, 
      shippingAddress.ward.id
    );

    // 5. Return checkout summary
    const checkoutSummary = {
      subtotal,
      userName: userFromServer?.fullName,
      phone: userFromServer?.phone,
      shippingFee: shippingFee,
      total: subtotal + shippingFee,
      items: checkoutItems,
      shippingAddress: {
        addressDetail: shippingAddress.addressDetail,
        province: shippingAddress.province.Name,
        district: shippingAddress.district.Name,
        ward: shippingAddress.ward.Name
      },
      seller: {
        id: userRoleSeller.id,
        storeName: userRoleSeller.seller?.storeName
      }
    };

    return res.status(200).json({
      success: true,
      data: checkoutSummary
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const calculateShippingFee = async (
  addressDetailFromSeller: string,
  provinceIdOfSeller: number,
  districtIdOfSeller: number,
  wardIdOfSeller: number,
  addressDetailFromUser: string,
  provinceIdOfUser: number,
  districtIdOfUser: number,
  wardIdOfUser: number
): Promise<number> => {
  try {
    // 1. Fetch address details from database
    const [sellerWard, sellerProvince, sellerDistrict, userWard, userProvince, userDistrict] = await Promise.all([
      prismaService.ward.findUnique({ where: { id: wardIdOfSeller } }),
      prismaService.province.findUnique({ where: { id: provinceIdOfSeller } }),
      prismaService.district.findUnique({ where: { id: districtIdOfSeller } }),
      prismaService.ward.findUnique({ where: { id: wardIdOfUser } }),
      prismaService.province.findUnique({ where: { id: provinceIdOfUser } }),
      prismaService.district.findUnique({ where: { id: districtIdOfUser } })
    ]);

    // Check if all the database queries were successful
    if (
           !sellerWard 
        || !sellerProvince 
        || !sellerDistrict 
        || !userWard 
        || !userProvince 
        || !userDistrict

      ) {
        throw new Error('Failed to fetch address details from database');
      }

    // 2. Fetch provinces from GHN
    const provinceRespFromGHN = await ghnService.getProvinces();
    const provinces = provinceRespFromGHN.data || provinceRespFromGHN;

    if (!Array.isArray(provinces)) {
      throw new Error('Failed to fetch provinces from GHN');
    }

    // 3. Match seller address with GHN
    console.log('Matching seller address with GHN...');
    const matchedSellerProvinceFromGHN = provinces.find((p: any) => p.ProvinceName === sellerProvince.Name);
    if (!matchedSellerProvinceFromGHN) {
      throw new Error('Failed to match seller province with GHN');
    }

    const sellerDistrictsFromGHN = await ghnService.getDistricts(matchedSellerProvinceFromGHN.ProvinceID);
    const sellerDistricts = sellerDistrictsFromGHN.data || sellerDistrictsFromGHN;

    if (!Array.isArray(sellerDistricts)) {
      throw new Error('Failed to get districts data from GHN');
    }

    const matchedSellerDistrictFromGHN = sellerDistricts.find(
      (d: any) => d.DistrictName.toLowerCase().includes(sellerDistrict?.Name?.toLowerCase())
    );

    if (!matchedSellerDistrictFromGHN) {
      throw new Error('Failed to match seller district with GHN');
    }

    const sellerWardsFromGHN = await ghnService.getWards(matchedSellerDistrictFromGHN.DistrictID);
    const sellerWards = sellerWardsFromGHN.data || sellerWardsFromGHN;
    const matchedSellerWardFromGHN = sellerWards.find((w: any) => w.WardName.toLowerCase().includes(sellerWard?.Name?.toLowerCase()));
    if (!matchedSellerWardFromGHN) {
      throw new Error('Failed to match seller ward with GHN');
    }

    // 4. Match user address with GHN
    console.log('Matching user address with GHN...');
    const matchedUserProvinceFromGHN = provinces.find((p: any) => p.ProvinceName === userProvince.Name);
    if (!matchedUserProvinceFromGHN) {
      throw new Error('Failed to match user province with GHN');
    }

    const userDistrictsFromGHN = await ghnService.getDistricts(matchedUserProvinceFromGHN.ProvinceID);
    const userDistricts = userDistrictsFromGHN.data || userDistrictsFromGHN;

    const matchedUserDistrictFromGHN = userDistricts.find((d: any) => d.DistrictName.toLowerCase().includes(userDistrict?.Name?.toLowerCase()));
    if (!matchedUserDistrictFromGHN) {
      throw new Error('Failed to match user district with GHN');
    }

    const userWardsFromGHN = await ghnService.getWards(matchedUserDistrictFromGHN.DistrictID);
    const userWards = userWardsFromGHN.data || userWardsFromGHN;
    const matchedUserWardFromGHN = userWards.find((w: any) => w.WardName.toLowerCase().includes(userWard?.Name?.toLowerCase()));
    if (!matchedUserWardFromGHN) {
      throw new Error('Failed to match user ward with GHN');
    }

    // 5. Calculate shipping fee
    console.log('Calculating shipping fee...');
    const shippingFee = await ghnService.calculateSimpleShippingFee({
      fromDistrictId: matchedSellerDistrictFromGHN.DistrictID,
      fromWardCode: matchedSellerWardFromGHN.WardCode,
      toDistrictId: matchedUserDistrictFromGHN.DistrictID,
      toWardCode: matchedUserWardFromGHN.WardCode,
      weight: 1000,
      insuranceValue: 0
    });

    return shippingFee;
  } catch (error) {
    console.error('Error calculating shipping fee:', error);
    throw error;
  }
}

const mapAddressToGHN = async (
  addressDetail: string,
  provinceId: number,
  districtId: number, 
  wardId: number
) => {
  try {
    // 1. Lấy thông tin địa chỉ từ database
    const [ward, province, district] = await Promise.all([
      prismaService.ward.findUnique({ where: { id: wardId } }),
      prismaService.province.findUnique({ where: { id: provinceId } }),
      prismaService.district.findUnique({ where: { id: districtId } })
    ]);

    if (!ward || !province || !district) {
      throw new Error('Không tìm thấy thông tin địa chỉ trong database');
    }

    // 2. Lấy danh sách tỉnh/thành từ GHN
    const provinceRespFromGHN = await ghnService.getProvinces();
    const provinces = provinceRespFromGHN.data || provinceRespFromGHN;

    if (!Array.isArray(provinces)) {
      throw new Error('Không thể lấy danh sách tỉnh/thành từ GHN');
    }

    // 3. Map tỉnh/thành
    const matchedProvinceFromGHN = provinces.find(
      (p: any) => p.ProvinceName === province.Name
    );
    if (!matchedProvinceFromGHN) {
      throw new Error('Không thể map tỉnh/thành với GHN');
    }

    // 4. Map quận/huyện
    const districtsFromGHN = await ghnService.getDistricts(matchedProvinceFromGHN.ProvinceID);
    const districts = districtsFromGHN.data || districtsFromGHN;

    const matchedDistrictFromGHN = districts.find(
      (d: any) => d.DistrictName.toLowerCase().includes(district?.Name?.toLowerCase())
    );
    if (!matchedDistrictFromGHN) {
      throw new Error('Không thể map quận/huyện với GHN');
    }

    // 5. Map phường/xã
    const wardsFromGHN = await ghnService.getWards(matchedDistrictFromGHN.DistrictID);
    const wards = wardsFromGHN.data || wardsFromGHN;
    
    const matchedWardFromGHN = wards.find(
      (w: any) => w.WardName.toLowerCase().includes(ward?.Name?.toLowerCase())
    );
    if (!matchedWardFromGHN) {
      throw new Error('Không thể map phường/xã với GHN');
    }

    // 6. Trả về đối tượng địa chỉ đã được map
    return {
      provinceId: matchedProvinceFromGHN.ProvinceID,
      provinceName: matchedProvinceFromGHN.ProvinceName,
      districtId: matchedDistrictFromGHN.DistrictID,
      districtName: matchedDistrictFromGHN.DistrictName,
      wardCode: matchedWardFromGHN.WardCode,
      wardName: matchedWardFromGHN.WardName,
      addressDetail: addressDetail
    };

  } catch (error) {
    console.error('Lỗi khi map địa chỉ với GHN:', error);
    throw error;
  }
};

const getUserOrders = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.query;
  
  try {
    const orders = await prismaService.order.findMany({
      where: {
        userId: Number(userId),
        ...(status ? { status: status as OrderStatus } : {})
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy danh sách đơn hàng' 
    });
  }
};

export default {
    createOrder,
    confirmOrderBySeller,
    // printOrder,
    // orderDetail,
    checkoutOrder,
    getUserOrders
}
