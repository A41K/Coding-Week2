const button = document.getElementById("click-button");
const count = document.getElementById("click-count");
let totalClickCount = 0;

function buttonClick() {
  totalClickCount++;

  count.textContent = totalClickCount;
}

button.addEventListener("click", function () {
  buttonClick();
});

const shopItems= [
    {
        name: "Other Cookies",
        description:"Delicious cookies made with love",
        cost: 10,
        startingCost: 10,
    },
    {
        name: "Multiplier",
        description: "Doubles your cookie production",
        cost: 50,
        startingCost: 50
    }
]

function createShopItems() {
  document.querySelectorAll(".shop-item").forEach((element) => {
    element.remove();
  });

  shopItems.forEach((item) => {
    const shopItem = document.createElement("div");
    shopItem.className = "shop-item";

    shopItem.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
      </div>
      <button onclick="buyItem('${item.name}')">
        Buy $${item.cost}
      </button>
    `;

    shopContainer.appendChild(shopItem);
  });
}

