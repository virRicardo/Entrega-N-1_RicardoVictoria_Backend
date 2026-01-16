import { Router } from "express";
import CartManagerMongo from "../dao/CartManagerMongo.js";

const router = Router();
const cartManager = new CartManagerMongo();

router.post("/", async (req, res) => {
  try {
    const cart = await cartManager.createCart();
    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const carts = await cartManager.getCarts();
    res.json({ status: "success", payload: carts });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    await cartManager.addProductToCart(cid, pid);

    res.redirect(`/carts/${cid}`);
  } catch (error) {
    res.status(500).send("Error al agregar producto al carrito");
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    await cartManager.deleteProductFromCart(cid, pid);

    res.redirect(`/carts/${cid}`);
  } catch (error) {
    res.status(500).send("Error al eliminar producto del carrito");
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.clearCart(req.params.cid);
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
