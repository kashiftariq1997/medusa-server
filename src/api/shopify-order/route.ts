// import { EntityManager } from "typeorm";
// import {
//   MedusaRequest,
//   MedusaResponse,
//   Order,
//   OrderStatus,
//   FulfillmentStatus,
//   PaymentStatus,
//   LineItem,
//   Address,
//   Discount,
//   DiscountRuleType,
//   Region,
//   Currency,
// } from "@medusajs/medusa";
// import ShopifyService from "src/services/shopify";

// export async function POST(
//   req: MedusaRequest,
//   res: MedusaResponse
// ): Promise<void> {
//   const data = req.body;

//   try {
//     const manager: EntityManager = req.scope.resolve("manager")
//     const OrderRepository = manager.getRepository(Order)

//     const shopifyService = req.scope.resolve<ShopifyService>("shopifyService");

//     const { orders, status } = await shopifyService.getShopifyOrders();

//     if (status === 200) {
//       const savedOrders = await Promise.all(
//         orders.map(async (shopifyOrder): Promise<Partial<Order>> => {
//           console.log(shopifyOrder.currency)
//           if(shopifyOrder){
//             const existingOrder = await OrderRepository.findOne({ where: { external_id: shopifyOrder.id.toString() }});

//             if (!existingOrder) {
//               const transformedOrder = await transformShopifyOrderToOrderData(shopifyOrder, manager);

//               try {
//                 // typeOrm mutation to feed data into database
//                 const newOrder = OrderRepository.create(transformedOrder);
//                 const save = await OrderRepository.save(newOrder)

//                 if(save){
//                   return newOrder
//                 } else {
//                   console.log(`********* Failed to save Order with ${shopifyOrder.id} **********`)
//                 }
//               } catch (error) {
//                 console.log(error)
//               }
//             }

//             return existingOrder;
//           }

//           return null;
//         })
//       );

//       res.status(200).json({ orders: savedOrders, message: "Orders are synced successfully" });
//     } else {
//       res.status(status).json({ message: "Failed to get Orders from Shopify Store"});
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error processing Shopify orders', error });
//   }
// }

// async function transformShopifyOrderToOrderData(shopifyOrder: any, manager: EntityManager): Promise<Partial<Order>> {
//   const RegionRepository = manager.getRepository(Region)
//   const CurrencyRepository = manager.getRepository(Currency)

//   const regions = await RegionRepository.find();
//   const defaultRegion = regions[0]

//   const currencies = await CurrencyRepository.find();
//   const defaultCurrency = currencies[0]

//   return {
//     external_id: shopifyOrder.id.toString(),
//     status: mapOrderStatus(shopifyOrder.financial_status),
//     fulfillment_status: mapFulfillmentStatus(shopifyOrder.fulfillment_status),
//     payment_status: mapPaymentStatus(shopifyOrder.financial_status), // Adjust based on your mapping
//     currency_code: defaultCurrency.code,
//     total: parseFloat(shopifyOrder.total_price),
//     subtotal: parseFloat(shopifyOrder.subtotal_price),
//     email: shopifyOrder.email,
//     discounts: shopifyOrder.discount_applications?.map(mapDiscounts) ?? [],
//     items: [],
//     region_id: defaultRegion.id,
//     region: defaultRegion,
//     // billing_address: mapAddress(shopifyOrder.billing_address),
//     // shipping_address: mapAddress(shopifyOrder.shipping_address),
//     customer: mapCustomer(shopifyOrder.customer) as any,
//     // Add other mappings here as necessary
//   };
// }

// function mapOrderStatus(shopifyStatus: string): OrderStatus {
//   switch (shopifyStatus) {
//       case 'pending':
//           return OrderStatus.PENDING;
//       case 'paid':
//           return OrderStatus.COMPLETED;
//       case 'refunded':
//           return OrderStatus.ARCHIVED;
//       case 'voided':
//           return OrderStatus.CANCELED;
//       default:
//           return OrderStatus.REQUIRES_ACTION; // Default case, adjust as needed
//   }
// }

// function mapFulfillmentStatus(shopifyStatus: string | null): FulfillmentStatus {
//   switch (shopifyStatus) {
//       case null:
//           return FulfillmentStatus.NOT_FULFILLED;
//       case 'partial':
//           return FulfillmentStatus.PARTIALLY_FULFILLED;
//       case 'fulfilled':
//           return FulfillmentStatus.FULFILLED;
//       default:
//           return FulfillmentStatus.REQUIRES_ACTION; // Adjust based on your logic
//   }
// }

// function mapPaymentStatus(shopifyStatus: string): PaymentStatus {
//   switch (shopifyStatus) {
//       case 'authorized':
//       case 'pending':
//           return PaymentStatus.AWAITING;
//       case 'paid':
//           return PaymentStatus.CAPTURED;
//       case 'partially_refunded':
//           return PaymentStatus.PARTIALLY_REFUNDED;
//       case 'refunded':
//           return PaymentStatus.REFUNDED;
//       case 'voided':
//           return PaymentStatus.CANCELED;
//       default:
//           return PaymentStatus.REQUIRES_ACTION;
//   }
// }

// function mapLineItems(shopifyItem: any): LineItem {
//   return {
//       product_id: shopifyItem.product_id.toString() ?? '',
//       variant_id: shopifyItem.variant_id.toString()  ?? '',
//       quantity: shopifyItem.quantity,
//       // Add additional fields as needed
//   } as LineItem;
// }

// function mapAddress(shopifyAddress: any): Address {
//   return {
//       first_name: shopifyAddress.first_name,
//       last_name: shopifyAddress.last_name,
//       address_1: shopifyAddress.address1,
//       address_2: shopifyAddress.address2,
//       city: shopifyAddress.city,
//       province: shopifyAddress.province,
//       country: shopifyAddress.country,
//   } as Address;
// }

// function mapCustomer(shopifyCustomer: any): Customer {
//   return {
//     customer_id: shopifyCustomer.id.toString() ?? "",
//     email: shopifyCustomer.email,
//     first_name: shopifyCustomer.first_name,
//     last_name: shopifyCustomer.last_name,
//   } as unknown as Customer;
// }

// function mapDiscounts(shopifyDiscountApplication: any): Discount {

//   let ruleType = DiscountRuleType.FIXED;
//   if (shopifyDiscountApplication.type === 'percentage') {
//       ruleType = DiscountRuleType.PERCENTAGE;
//   } else if (shopifyDiscountApplication.type === 'shipping') {
//       ruleType = DiscountRuleType.FREE_SHIPPING;
//   }

//   let ruleId = "";

//   return {
//       code: shopifyDiscountApplication.code,
//       is_dynamic: false,
//       rule_id: ruleId,
//       rule: {
//           type: ruleType,
//       } as any,
//       is_disabled: false,
//       parent_discount_id: "",
//       parent_discount: null,
//       starts_at: new Date(),
//       ends_at: null,
//       valid_duration: null,
//       usage_limit: shopifyDiscountApplication.usage_limit,
//       usage_count: 0,
//       metadata: {},
//   } as unknown as Discount;
// }
