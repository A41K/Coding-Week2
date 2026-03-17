const button = document.getElementById("click-button");
const count = document.getElementById("click-count");
const shopName = document.getElementById("shop-name");
let totalClickCount = 0;
let floorLevel = 1;
let floorCost = 5000;

const shopContainer = document.getElementById("shop-items");
let itemsOwned = [];

function getFloorMultiplier() {
    return 1 + ((floorLevel - 1) * 0.25);
}

function renameShop() {
    const newName = prompt("Enter your new Coffee Shop name:", shopName.innerText);
    if (newName && newName.trim().length > 0) {
        shopName.innerText = newName;
    }
}

function updateFloorButton() {
    const btn = document.getElementById("floor-button");
    const nextFloor = floorLevel + 1;
    btn.innerText = `Build Floor ${nextFloor} ($${floorCost})`;
    
    // Visual indication if you can afford it
    if (totalClickCount >= floorCost) {
        btn.style.backgroundColor = "#2e7d32"; 
        btn.disabled = false;
    } else {
        btn.style.backgroundColor = "#555";
    }
}

function buyFloor() {
    if (totalClickCount >= floorCost) {
        totalClickCount -= floorCost;
        count.textContent = Math.floor(totalClickCount);
        
        floorLevel++;
        floorCost = Math.floor(floorCost * 3);
        
        document.getElementById("floor-level").innerText = floorLevel;
        updateFloorButton();
        console.log(`Upgraded to Floor ${floorLevel}!`);
    } else {
        alert(`You need $${floorCost} to build the next floor!`);
    }
}

function buttonClick() {
  const machineOwned = itemsOwned.find((i) => i.name === "Espresso Machine");
  const machineLevel = machineOwned ? machineOwned.amount : 0;

  // Base click is 1, doubled for every machine level
  // Multiplied by Floor Level (1.25x per extra floor)
  let clickValue = 1 * (2 ** machineLevel);
  clickValue = clickValue * getFloorMultiplier();
  
  totalClickCount += clickValue;
  count.textContent = Math.floor(totalClickCount);
  
  updateFloorButton(); 
}

button.addEventListener("click", function () {
  buttonClick();
});

const shopItems = [
  {
    name: "Intern",
    description: "Autoclicks once per second. Works for tips.",
    cost: 15,
    startingCost: 15,
    autoClickValue: 1,
  },
  {
    name: "Espresso Machine",
    description: "Doubles your click power!",
    cost: 100,
    startingCost: 100,
  },
  {
    name: "Barista",
    description: "A pro. Generates 5 clicks/sec.",
    cost: 500,
    startingCost: 500,
    autoClickValue: 5,
  },
  {
      name: "Cafe Manager",
      description: "Runs the floor. Generates 20 clicks/sec.",
      cost: 2000,
      startingCost: 2000,
      autoClickValue: 20,
  }
];


function createShopItems() {
  const shopContainer = document.getElementById("shop-items");
  
  const existingItems = shopContainer.querySelectorAll(".shop-item");
  existingItems.forEach(el => el.remove());

  shopItems.forEach((item) => {
    const shopItem = document.createElement("div");
    shopItem.className = "shop-item";

    shopItem.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <p style="font-size: 0.8em; color: #666;">Owned: <span id="owned-${item.name.replace(/\s+/g, '')}">0</span></p>
      </div>
      <button onclick="buyItem('${item.name}')">
        $${item.cost}
      </button>
    `;

    shopContainer.appendChild(shopItem);
  });
  
  updateShopVisuals();
}

function updateShopVisuals() {
    itemsOwned.forEach(item => {
        const id = `owned-${item.name.replace(/\s+/g, '')}`;
        const el = document.getElementById(id);
        if (el) el.textContent = item.amount;
    });
}

setInterval(() => {
  let autoClick = 0;
  
  itemsOwned.forEach(ownedItem => {
      const shopItemDef = shopItems.find(i => i.name === ownedItem.name);
      if (shopItemDef && shopItemDef.autoClickValue) {
          autoClick += (shopItemDef.autoClickValue * ownedItem.amount);
      }
  });

  if (autoClick > 0) {
      autoClick = autoClick * getFloorMultiplier();
      totalClickCount += autoClick;
      count.textContent = Math.floor(totalClickCount);
      updateFloorButton(); 
  }
}, 1000);

function buyItem(itemName) {
  const item = shopItems.find((i) => i.name === itemName);
  if (totalClickCount >= item.cost) {
    totalClickCount -= item.cost;
    count.textContent = Math.floor(totalClickCount);

    const itemInArray = itemsOwned.find((obj) => obj.name === item.name);
    let amount = 1;

    if (itemInArray) {
      itemInArray.amount++;
      amount = itemInArray.amount;
    } else {
      itemsOwned.push({ name: item.name, amount: 1 });
    }

    item.cost = Math.floor(item.startingCost * (1.15 ** amount));
    
    createShopItems(); 
    updateFloorButton();

    console.log(`Bought ${itemName}!`);
  } else {
    console.log(`Not enough money! Need ${item.cost}`);
  }
}

// Initialize the shop
createShopItems();
updateFloorButton();