import {
  MedusaRequest,
  MedusaResponse,
  ProductService,
} from "@medusajs/medusa";
import ShopifyService from "src/services/shopify";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const data = req.body;

  try {
    const productService = req.scope.resolve<ProductService>("productService");
    const shopifyService = req.scope.resolve<ShopifyService>("shopifyService");

    const {products, status} = await shopifyService.getShopifyProducts()

    res.status(status).json({ products });
  } catch (error) {
    res.status(500).json({ products: []});
  }
}
