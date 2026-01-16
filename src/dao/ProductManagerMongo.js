import ProductModel from "../models/Product.model.js";

export default class ProductManagerMongo {

  async getProducts({ limit = 10, page = 1, sort, query } = {}) {
    const filter = {};
    if (query) {
      filter.$or = [
        { category: query },
        { status: query === "true" }
      ];
    }

    const options = {
      limit,
      page,
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : undefined,
      lean: true
    };
    
    return await ProductModel.paginate(filter, options);
  }

  async createProduct(product) {
    return await ProductModel.create(product);
  }

  async getProductById(pid) {
    return await ProductModel.findById(pid).lean();
  }

    async updateProduct(pid, updatedData) {
    return await ProductModel.findByIdAndUpdate(pid, updatedData, { new: true }).lean();
  }

  async deleteProduct(pid) {
    return await ProductModel.findByIdAndDelete(pid).lean();
  }
}
