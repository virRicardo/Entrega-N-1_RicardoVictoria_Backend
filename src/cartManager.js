import fs from "fs/promises";
import crypto from "crypto";

class CartManager {
  constructor(pathFile) {
    this.pathFile = pathFile;
  }

  generateNewId() {
    return crypto.randomUUID();
  }

  async getCarts() {
    try {
      const fileData = await fs.readFile(this.pathFile, "utf-8");
      return JSON.parse(fileData);
    } catch (error) {
      throw new Error("Error al leer los carritos: " + error.message);
    }
  }

  async saveCarts(carts) {
    try {
      await fs.writeFile(
        this.pathFile,
        JSON.stringify(carts, null, 2),
        "utf-8"
      );
    } catch (error) {
      throw new Error("Error al guardar los carritos: " + error.message);
    }
  }

  async createCart() {
    const carts = await this.getCarts();

    const newCart = {
      id: this.generateNewId(),
      products: []
    };

    carts.push(newCart);
    await this.saveCarts(carts);

    return newCart;
  }

  async getCartById(cid) {
    const carts = await this.getCarts();
    const cart = carts.find(c => c.id === cid);

    if (!cart) throw new Error("Carrito no encontrado");
    return cart;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex(c => c.id === cid);

    if (cartIndex === -1) throw new Error("Carrito no encontrado");

    const cart = carts[cartIndex];

    
    const productInCart = cart.products.find(p => p.product === pid);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({
        product: pid,
        quantity: 1
      });
    }

    carts[cartIndex] = cart;
    await this.saveCarts(carts);

    return cart;
  }
}

export default CartManager;
