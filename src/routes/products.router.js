import { Router } from "express";
import ProductManagerMongo from "../dao/ProductManagerMongo.js";

const router = Router();
const productManager = new ProductManagerMongo();

router.get("/", async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort,
      query
    } = req.query;

    const result = await productManager.getProducts({
      limit: Number(limit),
      page: Number(page),
      sort,
      query
    });

    const baseUrl = "/api/products";

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `${baseUrl}?page=${result.prevPage}&limit=${limit}&sort=${sort ?? ""}&query=${query ?? ""}`
        : null,
      nextLink: result.hasNextPage
        ? `${baseUrl}?page=${result.nextPage}&limit=${limit}&sort=${sort ?? ""}&query=${query ?? ""}`
        : null
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message
    });
  }
});


router.post("/", async (req, res) => {
  try {
    const product = req.body;
    const newProduct = await productManager.createProduct(product);
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    await productManager.deleteProduct(req.params.pid);
    res.json({ status: "success" });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
