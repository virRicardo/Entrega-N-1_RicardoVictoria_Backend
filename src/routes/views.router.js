import { Router } from "express";
import ProductManagerMongo from "../dao/ProductManagerMongo.js";
import CartManagerMongo from "../dao/CartManagerMongo.js";

const router = Router();

const productManager = new ProductManagerMongo();
const cartManager = new CartManagerMongo();

// carrito fijo para pruebas
const CART_ID = "696817032928f443c9793d31";

router.get("/products", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const result = await productManager.getProducts({
      page,
      limit: 10
    });

    res.render("index", {
      products: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      cartId: CART_ID
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error cargando productos");
  }
});

router.get("/products/:pid", async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("productDetail", {
      product,
      cartId: CART_ID
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    res.render("cart", {
      cartId: req.params.cid,
      products: cart.products
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;

