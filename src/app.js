
import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import methodOverride from "method-override";

const app = express();

connectDB();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine(
  "handlebars",
  handlebars.engine({
    helpers: {
      multiply: (a, b) => a * b
    }
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("src/public"));


app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter); 
app.use("/", viewsRouter);

const server = app.listen(8080, () => {
  console.log("Servidor iniciado en el puerto 8080");
});

const io = new Server(server);

app.get("/api/products", async (req, res) => {
  try {
    const result = await productManager.getProducts(req.query);

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
        ? `/api/products?page=${result.prevPage}`
        : null,
      nextLink: result.hasNextPage
        ? `/api/products?page=${result.nextPage}`
        : null
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message
    });
  }
});

app.get("/api/products/:pid", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    const product = products.find((p) => p.id === req.params.pid);

    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const products = await productManager.addProduct(req.body);

    io.emit("products", await productManager.getProducts());

    res.status(201).json({ message: "Producto agregado", products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const updates = req.body;

    if (updates.id) {
      return res
        .status(400)
        .json({ error: "No se puede modificar el ID del producto" });
    }

    const products = await productManager.setProductById(pid, updates);
    res.json({ message: "Producto actualizado", products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:pid", async (req, res) => {
  try {
    const products = await productManager.deleteProductById(req.params.pid);

    io.emit("products", await productManager.getProducts());

    res.json({ message: "Producto eliminado", products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("home", { products });
});

app.get("/realtimeproducts", async (req, res) => {
  res.render("realTimeProducts");
});

app.post("/api/carts", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/carts/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.json(cart.products);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.post("/api/carts/:cid/product/:pid", async (req, res) => {
  try {
    const updatedCart = await cartManager.addProductToCart(
      req.params.cid,
      req.params.pid
    );

    res.json({ message: "Producto agregado al carrito", cart: updatedCart });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


app.delete("/api/carts/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await cartManager.deleteProductFromCart(
      req.params.cid,
      req.params.pid
    );
    res.json({ status: "success", cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

app.delete("/api/carts/:cid", async (req, res) => {
  try {
    const cart = await cartManager.clearCart(req.params.cid);
    res.json({ status: "success", cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});


io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  socket.emit("products", await productManager.getProducts());

  socket.on("addProduct", async (product) => {
    await productManager.addProduct(product);
    io.emit("products", await productManager.getProducts());
  });

  socket.on("deleteProduct", async (id) => {
    await productManager.deleteProductById(id);
    io.emit("products", await productManager.getProducts());
  });
});
