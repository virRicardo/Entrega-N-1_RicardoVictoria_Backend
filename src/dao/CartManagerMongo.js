import CartModel from "../models/Cart.model.js";

export default class CartManagerMongo {

  async createCart() {
    return await CartModel.create({ products: [] });
  }

  async getCartById(cid) {
    return await CartModel.findById(cid)
      .populate("products.product")
      .lean();
  }

  async addProductToCart(cid, pid) {
    const cart = await CartModel.findById(cid);

    if (!cart) throw new Error("Carrito no encontrado");

    const productIndex = cart.products.findIndex(
      p => p.product.toString() === pid
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity++;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    return cart;
  }

  async deleteProductFromCart(cid, pid) {
    return await CartModel.findByIdAndUpdate(
      cid,
      { $pull: { products: { product: pid } } },
      { new: true }
    );
  }

  async clearCart(cid) {
    return await CartModel.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );
  }
}
