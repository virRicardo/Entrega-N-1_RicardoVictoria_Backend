const socket = io();

const list = document.getElementById("productList");

socket.on("products", (products) => {
  list.innerHTML = "";

  products.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
     <img src="${
       typeof p.thumbnail === "string" && p.thumbnail !== ""
         ? p.thumbnail
         : "/img/tecladoInalambrico.jpg"
     }" />


      <h3>${p.title}</h3>
      <p class="price">$ ${p.price}</p>
      <p class="product-id">ID: ${p.id}</p>
      <button onclick="deleteProduct('${p.id}')">Eliminar</button>
    `;

    list.appendChild(card);
  });
});

function deleteProduct(id) {
  socket.emit("deleteProduct", id);
}
