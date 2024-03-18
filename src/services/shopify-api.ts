// import Shopify from 'shopify-api-node';

export default class ShopifyAAPIService {
  private client: any;

  constructor() {
    this.client = new Shopify({
      apiKey: process.env.SHOPIFY_API_KEY,
      password: process.env.SHOPIFY_PASSWORD,
      shopName: process.env.SHOPIFY_DOMAIN
    })
  }


  async getShopifyOrders(){
    console.log("Fetching orders ...")
  }
}