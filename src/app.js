import express from "express";
import ProductManager from "./productManager.js";
import CartManager from "./cartManager.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productManager = new ProductManager("./src/products.json");
const cartManager = new CartManager("./src/carts.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.get("/api/products", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

const server = app.listen(8080, () => {
  console.log("Servidor iniciado en el puerto 8080");
});

const io = new Server(server);

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
