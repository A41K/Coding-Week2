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
        saveGame();
    }
}

function updateFloorButton() {
    const btn = document.getElementById("floor-button");
    const nextFloor = floorLevel + 1;
    btn.innerText = `Build Floor ${nextFloor} ($${floorCost})`;

    if (totalClickCount >= floorCost) {
        btn.style.backgroundColor = "#2e7d32"; 
        btn.disabled = false;
    } else {
        btn.style.backgroundColor = "#555";
    }
    saveGame();
}

function buyFloor() {
    if (totalClickCount >= floorCost) {
        totalClickCount -= floorCost;
        count.textContent = Math.floor(totalClickCount);
        
        floorLevel++;
        floorCost = Math.floor(floorCost * 3);
        
        document.getElementById("floor-level").innerText = floorLevel;
        updateFloorButton();
        if (typeof updateSlotUI === "function") updateSlotUI();
        console.log(`Upgraded to Floor ${floorLevel}!`);
        saveGame();
    } else {
        alert(`You need $${floorCost} to build the next floor!`);
    }
}

function buttonClick() {
  const machineOwned = itemsOwned.find((i) => i.name === "Espresso Machine");
  const machineLevel = machineOwned ? machineOwned.amount : 0;

    let clickValue = 1 + (machineLevel * 3);
  
  clickValue = clickValue * getFloorMultiplier();
  
  totalClickCount += clickValue;
  count.textContent = Math.floor(totalClickCount);
  
  updateFloorButton(); 
  saveGame();
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
    description: "Adds +3 to your click strength!",
    cost: 250,
    startingCost: 250,
  },
  {
    name: "Barista",
    description: "A pro. Generates 10 clicks/sec.",
    cost: 500,
    startingCost: 500,
    autoClickValue: 10,
  },
  {
      name: "Cafe Manager",
      description: "Runs the floor. Generates 50 clicks/sec.",
      cost: 2000,
      startingCost: 2000,
      autoClickValue: 50,
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
        saveGame();
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
    saveGame();

    console.log(`Bought ${itemName}!`);
  } else {
    console.log(`Not enough money! Need ${item.cost}`);
  }
}

function saveGame() {
    const gameData = {
        totalClickCount: totalClickCount,
        floorLevel: floorLevel,
        floorCost: floorCost,
        itemsOwned: itemsOwned,
        shopName: shopName.innerText,
        currentSkin: currentSkin,
        ownedSkins: ownedSkins
    };
    localStorage.setItem('coffeeShopSave', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('coffeeShopSave');
    if (savedData) {
        try {
            const gameData = JSON.parse(savedData);
            
            totalClickCount = gameData.totalClickCount || 0;
            floorLevel = gameData.floorLevel || 1;
            floorCost = gameData.floorCost || 5000;
            itemsOwned = gameData.itemsOwned || [];
            if (gameData.shopName) {
                shopName.innerText = gameData.shopName;
            }
            if (gameData.currentSkin) {
                currentSkin = gameData.currentSkin;
                if (gameData.ownedSkins) ownedSkins = gameData.ownedSkins;
                updateSkinDisplay();
            }

            count.textContent = Math.floor(totalClickCount);
            document.getElementById("floor-level").innerText = floorLevel;
            
            shopItems.forEach(item => {
                const owned = itemsOwned.find(i => i.name === item.name);
                if (owned) {
                    item.cost = Math.floor(item.startingCost * (1.15 ** owned.amount));
                }
            });
        } catch (e) {
            console.error("Failed to load save data", e);
        }
    }
}

setInterval(() => {
    saveGame();
}, 10000);

const cupSkins = [
    { name: "Paper Cup", cost: 0, img: "https://img.icons8.com/color/480/coffee-to-go.png" },
    { name: "Espresso Cup", cost: 500, img: "https://img.icons8.com/color/480/espresso-cup.png" },
    { name: "Iced Coffee", cost: 2000, img: "https://img.icons8.com/color/480/iced-coffee.png" },
    { name: "Milkshake", cost: 5000, img: "https://img.icons8.com/color/480/milkshake.png" },
    { name: "Golden Chalice", cost: 50000, img: "https://img.icons8.com/color/480/trophy.png" }
];

let currentSkin = "Paper Cup";
let ownedSkins = ["Paper Cup"];

function createSkinShop() {
    const skinContainer = document.getElementById("skin-items");
    skinContainer.innerHTML = "";

    cupSkins.forEach(skin => {
        const isOwned = ownedSkins.includes(skin.name);
        const isSelected = currentSkin === skin.name;
        
        const skinItem = document.createElement("div");
        skinItem.className = "shop-item"; 
        skinItem.style.display = "flex";
        skinItem.style.justifyContent = "space-between";
        skinItem.style.alignItems = "center";
        
        let btnHtml = "";
        
        if (isSelected) {
            btnHtml = `<button disabled style="background:#2e7d32; cursor:default;">Equipped</button>`;
        } else if (isOwned) {
            btnHtml = `<button onclick="equipSkin('${skin.name}')">Equip</button>`;
        } else {
            btnHtml = `<button onclick="buySkin('${skin.name}')">$${skin.cost}</button>`;
        }

        skinItem.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${skin.img}" width="30" height="30">
                <span style="font-weight:bold;">${skin.name}</span>
            </div>
            ${btnHtml}
        `;
        skinContainer.appendChild(skinItem);
    });
}
function buySkin(skinName) {
    const skin = cupSkins.find(s => s.name === skinName);
    if (!skin) return;

    if (totalClickCount >= skin.cost) {
        totalClickCount -= skin.cost;
        count.textContent = Math.floor(totalClickCount);
        
        ownedSkins.push(skin.name);
        equipSkin(skinName);
        console.log("Skin bought:", skinName);
    } else {
        alert("Not enough cash!");
    }
}
function equipSkin(skinName) {
    if (ownedSkins.includes(skinName)) {
        currentSkin = skinName;
        const skin = cupSkins.find(s => s.name === skinName);
        if (skin) {
            const img = document.querySelector("#click-button img");
            if (img) img.src = skin.img;
        }
        createSkinShop();
        saveGame();
    }
}
function updateSkinDisplay() {
     const skin = cupSkins.find(s => s.name === currentSkin);
     if (skin) {
         const img = document.querySelector("#click-button img");
        if (img) img.src = skin.img;
     }
}

const slotSymbols = ['☕', '🍩', '🍪', '🍰', '🥐'];

function getSlotCost() {
    return 100 * floorLevel;
}

let isSpinning = false;

function spinSlots() {
    if (isSpinning) return;
    
    const cost = getSlotCost();
    const slotMsg = document.getElementById('slot-msg');
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    
    if (totalClickCount >= cost) {
        totalClickCount -= cost;
        count.textContent = Math.floor(totalClickCount);
        
        isSpinning = true;
        
        document.getElementById('spin-btn').disabled = true;
        
        let spins = 0;
        const maxSpins = 15;
        const interval = setInterval(() => {
            reels.forEach(reel => {
                reel.innerText = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            });
            spins++;
            if (spins >= maxSpins) {
                clearInterval(interval);
                finalizeSpin(reels, cost);
            }
        }, 100);
        
        slotMsg.innerText = "Spinning...";
        slotMsg.style.color = "#555";
        
    } else {
        slotMsg.innerText = "Not enough cash!";
        slotMsg.style.color = "red";
        setTimeout(() => {
            updateSlotUI();
        }, 2000);
    }
}

function finalizeSpin(reels, cost) {
    const r1 = reels[0].innerText;
    const r2 = reels[1].innerText;
    const r3 = reels[2].innerText;
    const slotMsg = document.getElementById('slot-msg');
    
    let win = 0;
    
    if (r1 === r2 && r2 === r3) {
        win = cost * 15;
        slotMsg.innerText = `JACKPOT! Won $${win}!`;
        slotMsg.style.color = "green";
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        win = cost * 2;
        slotMsg.innerText = `Winner! Won $${win}!`;
        slotMsg.style.color = "#2e7d32";
    } else {
        slotMsg.innerText = "No luck this time.";
        slotMsg.style.color = "#555";
    }
    
    if (win > 0) {
        totalClickCount += win;
        count.textContent = Math.floor(totalClickCount);
    }
    
    isSpinning = false;
    document.getElementById('spin-btn').disabled = false;
    saveGame();

    setTimeout(() => {
        if (!isSpinning) {
            updateSlotUI();
        }
    }, 2000);
}

function updateSlotUI() {
    const slotMsg = document.getElementById('slot-msg');
    const slotCostSpan = document.getElementById('slot-cost');
    if (slotMsg) {
        slotMsg.innerHTML = `Spin to win! Cost: $<span id="slot-cost">${getSlotCost()}</span>`;
        slotMsg.style.color = "";
    }
    if (slotCostSpan) {
        slotCostSpan.innerText = getSlotCost();
    }
}

loadGame();
createShopItems();
createSkinShop();
updateFloorButton();
updateSlotUI();