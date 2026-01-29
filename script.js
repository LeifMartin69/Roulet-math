const rouletteWheel = [
  { number: 0, color: "green" },
  { number: 1, color: "red" },
  { number: 2, color: "black" },
  { number: 3, color: "red" },
  { number: 4, color: "black" },
  { number: 5, color: "red" },
  { number: 6, color: "black" },
  { number: 7, color: "red" },
  { number: 8, color: "black" },
  { number: 9, color: "red" },
  { number: 10, color: "black" },
  { number: 11, color: "black" },
  { number: 12, color: "red" },
  { number: 13, color: "black" },
  { number: 14, color: "red" },
  { number: 15, color: "black" },
  { number: 16, color: "red" },
  { number: 17, color: "black" },
  { number: 18, color: "red" },
  { number: 19, color: "red" },
  { number: 20, color: "black" },
  { number: 21, color: "red" },
  { number: 22, color: "black" },
  { number: 23, color: "red" },
  { number: 24, color: "black" },
  { number: 25, color: "red" },
  { number: 26, color: "black" },
  { number: 27, color: "red" },
  { number: 28, color: "black" },
  { number: 29, color: "black" },
  { number: 30, color: "red" },
  { number: 31, color: "black" },
  { number: 32, color: "red" },
  { number: 33, color: "black" },
  { number: 34, color: "red" },
  { number: 35, color: "black" },
  { number: 36, color: "red" },
];

const betTypeSelect = document.getElementById("bet-type");
const betOptionFields = document.querySelectorAll(".bet-option");
const betNumberInput = document.getElementById("bet-number");
const betColorSelect = document.getElementById("bet-color");
const betOddEvenSelect = document.getElementById("bet-odd-even");
const betHighLowSelect = document.getElementById("bet-high-low");
const betDozenSelect = document.getElementById("bet-dozen");
const betColumnSelect = document.getElementById("bet-column");
const betAmountInput = document.getElementById("bet-amount");
const form = document.getElementById("bet-form");
const menuButtons = document.querySelectorAll(".menu-button");
const gamePanels = document.querySelectorAll(".game-panel");
const resultNumber = document.getElementById("result-number");
const resultColor = document.getElementById("result-color");
const message = document.getElementById("message");
const balanceEl = document.getElementById("balance");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const probabilityValue = document.getElementById("probability-value");
const probabilityNote = document.getElementById("probability-note");
const togiOverlay = document.getElementById("togi-overlay");
const diceCountSelect = document.getElementById("dice-count");
const rollDiceButton = document.getElementById("roll-dice");
const diceDisplay = document.getElementById("dice-display");
const diceProbabilityValue = document.getElementById("dice-probability-value");
const diceTotalValue = document.getElementById("dice-total-value");
const diceTotalProbability = document.getElementById("dice-total-probability");

let balance = 1000;
let wins = 0;
let losses = 0;
const spinHistory = [];
const MAX_HISTORY = 20;

const formatMoney = (value) => `$${value.toLocaleString()}`;
const parseWager = (value) => Number(value.replace(/[^0-9.]/g, ""));
const getExactDiceProbability = (diceCount) => {
  const totalOutcomes = 6 ** diceCount;
  const percent = (1 / totalOutcomes) * 100;
  return { ratio: `1 / ${totalOutcomes}`, percent };
};
const sumWaysCache = new Map();
const getSumWays = (diceCount, targetSum) => {
  const cacheKey = `${diceCount}:${targetSum}`;
  if (sumWaysCache.has(cacheKey)) {
    return sumWaysCache.get(cacheKey);
  }
  if (diceCount === 1) {
    const ways = targetSum >= 1 && targetSum <= 6 ? 1 : 0;
    sumWaysCache.set(cacheKey, ways);
    return ways;
  }
  let ways = 0;
  for (let face = 1; face <= 6; face += 1) {
    ways += getSumWays(diceCount - 1, targetSum - face);
  }
  sumWaysCache.set(cacheKey, ways);
  return ways;
};
const getSumProbability = (diceCount, total) => {
  const totalOutcomes = 6 ** diceCount;
  const ways = getSumWays(diceCount, total);
  const percent = (ways / totalOutcomes) * 100;
  return { ways, totalOutcomes, percent };
};

const updateStats = () => {
  balanceEl.textContent = formatMoney(balance);
  winsEl.textContent = wins;
  lossesEl.textContent = losses;
};

const toggleFields = () => {
  const selected = betTypeSelect.value;
  betOptionFields.forEach((field) => {
    field.classList.toggle("hidden", field.dataset.bet !== selected);
  });
  updateProbability(selected);
};

const spinWheel = () => {
  const index = Math.floor(Math.random() * rouletteWheel.length);
  return rouletteWheel[index];
};

const updateResultDisplay = (spin) => {
  resultNumber.textContent = spin.number;
  resultColor.textContent = spin.color.toUpperCase();
  resultColor.className = `result-color ${spin.color}`;
};

const getColumn = (number) => {
  if (number === 0) {
    return null;
  }
  const remainder = number % 3;
  if (remainder === 1) {
    return "1st";
  }
  if (remainder === 2) {
    return "2nd";
  }
  return "3rd";
};

const getDozen = (number) => {
  if (number >= 1 && number <= 12) {
    return "1-12";
  }
  if (number >= 13 && number <= 24) {
    return "13-24";
  }
  if (number >= 25 && number <= 36) {
    return "25-36";
  }
  return null;
};

const calculatePayout = (betType, betValue, amount, spin) => {
  switch (betType) {
    case "number":
      return Number(betValue) === spin.number ? amount * 35 : -amount;
    case "color":
      return betValue === spin.color ? amount : -amount;
    case "odd-even": {
      if (spin.number === 0) {
        return -amount;
      }
      const parity = spin.number % 2 === 0 ? "even" : "odd";
      return betValue === parity ? amount : -amount;
    }
    case "high-low": {
      if (spin.number === 0) {
        return -amount;
      }
      const range = spin.number <= 18 ? "low" : "high";
      return betValue === range ? amount : -amount;
    }
    case "dozen": {
      const dozen = getDozen(spin.number);
      return betValue === dozen ? amount * 2 : -amount;
    }
    case "column": {
      const column = getColumn(spin.number);
      return betValue === column ? amount * 2 : -amount;
    }
    default:
      return 0;
  }
};

const getBaseProbability = (betType) => {
  if (betType === "number") {
    return { ratio: "1 / 37", percent: 2.7 };
  }
  if (betType === "color") {
    return { ratio: "18 / 37", percent: 48.6 };
  }
  if (betType === "odd-even" || betType === "high-low") {
    return { ratio: "18 / 37", percent: 48.6 };
  }
  if (betType === "dozen" || betType === "column") {
    return { ratio: "12 / 37", percent: 32.4 };
  }
  return null;
};

const didWinSpin = (betType, betValue, spin) => {
  switch (betType) {
    case "number":
      return Number(betValue) === spin.number;
    case "color":
      return betValue === spin.color;
    case "odd-even":
      return spin.number !== 0 && betValue === (spin.number % 2 === 0 ? "even" : "odd");
    case "high-low":
      return spin.number !== 0 && betValue === (spin.number <= 18 ? "low" : "high");
    case "dozen":
      return betValue === getDozen(spin.number);
    case "column":
      return betValue === getColumn(spin.number);
    default:
      return false;
  }
};

const updateProbability = (betType) => {
  const base = getBaseProbability(betType);
  let probabilityText = base ? `${base.ratio} (${base.percent.toFixed(1)}%)` : "—";
  let noteText = `Based on last ${spinHistory.length} spins`;

  if (spinHistory.length > 0) {
    let betValue;
    if (betType === "number") {
      betValue = betNumberInput.value;
    } else if (betType === "color") {
      betValue = betColorSelect.value;
    } else if (betType === "odd-even") {
      betValue = betOddEvenSelect.value;
    } else if (betType === "high-low") {
      betValue = betHighLowSelect.value;
    } else if (betType === "dozen") {
      betValue = betDozenSelect.value;
    } else if (betType === "column") {
      betValue = betColumnSelect.value;
    }

    if (betValue !== undefined && betValue !== "") {
      const winsInHistory = spinHistory.filter((spin) => didWinSpin(betType, betValue, spin))
        .length;
      const historyPercent = (winsInHistory / spinHistory.length) * 100;
      probabilityText = `${historyPercent.toFixed(1)}% (history)`;
      noteText = `Based on last ${spinHistory.length} spins`;
    }
  }

  probabilityValue.textContent = probabilityText;
  probabilityNote.textContent = noteText;
};

const setActiveView = (view) => {
  menuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  gamePanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.view !== view);
  });
};

const renderDice = (values) => {
  diceDisplay.innerHTML = "";
  values.forEach((value) => {
    const die = document.createElement("div");
    die.className = "dice";
    die.textContent = value;
    diceDisplay.appendChild(die);
  });
};

const updateDiceProbability = (diceCount) => {
  const { ratio, percent } = getExactDiceProbability(diceCount);
  diceProbabilityValue.textContent = `${ratio} (${percent.toFixed(4)}%)`;
};
const updateDiceTotals = (diceCount, values) => {
  if (!values || values.length === 0) {
    diceTotalValue.textContent = "—";
    diceTotalProbability.textContent = "—";
    return;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  const { ways, totalOutcomes, percent } = getSumProbability(diceCount, total);
  diceTotalValue.textContent = total;
  diceTotalProbability.textContent = `${ways} / ${totalOutcomes} (${percent.toFixed(3)}%)`;
};

menuButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveView(button.dataset.view));
});

betTypeSelect.addEventListener("change", toggleFields);
betColorSelect.addEventListener("change", () => updateProbability("color"));
betOddEvenSelect.addEventListener("change", () => updateProbability("odd-even"));
betHighLowSelect.addEventListener("change", () => updateProbability("high-low"));
betDozenSelect.addEventListener("change", () => updateProbability("dozen"));
betColumnSelect.addEventListener("change", () => updateProbability("column"));
betNumberInput.addEventListener("input", () => updateProbability("number"));

diceCountSelect.addEventListener("change", () => {
  const diceCount = Number(diceCountSelect.value);
  updateDiceProbability(diceCount);
  updateDiceTotals(diceCount, []);
});

rollDiceButton.addEventListener("click", () => {
  const diceCount = Number(diceCountSelect.value);
  const values = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
  renderDice(values);
  updateDiceProbability(diceCount);
  updateDiceTotals(diceCount, values);
});

togiOverlay.addEventListener("animationend", () => {
  togiOverlay.classList.remove("show");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const betType = betTypeSelect.value;
  const wagerRaw = betAmountInput.value.trim();
  const betAmount = parseWager(wagerRaw);
  let betValue;

  if (wagerRaw.toLowerCase() === "togi") {
    togiOverlay.classList.remove("show");
    void togiOverlay.offsetWidth;
    togiOverlay.classList.add("show");
    message.textContent = "Togi moment! Try a real wager to spin.";
    return;
  }

  if (betType === "number") {
    betValue = betNumberInput.value;
  } else if (betType === "color") {
    betValue = betColorSelect.value;
  } else if (betType === "odd-even") {
    betValue = betOddEvenSelect.value;
  } else if (betType === "high-low") {
    betValue = betHighLowSelect.value;
  } else if (betType === "dozen") {
    betValue = betDozenSelect.value;
  } else if (betType === "column") {
    betValue = betColumnSelect.value;
  }

  if (betType === "number") {
    const numberValue = Number(betValue);
    if (Number.isNaN(numberValue) || betValue === "") {
      message.textContent = "Pick a number between 0 and 36.";
      return;
    }
    if (numberValue < 0 || numberValue > 36) {
      message.textContent = "Your number must be between 0 and 36.";
      return;
    }
  }

  if (!wagerRaw || betAmount <= 0 || Number.isNaN(betAmount)) {
    message.textContent = "Enter a valid wager amount.";
    return;
  }

  if (betAmount > balance) {
    message.textContent = "You do not have enough balance for that wager.";
    return;
  }

  const spin = spinWheel();
  updateResultDisplay(spin);
  spinHistory.unshift(spin);
  if (spinHistory.length > MAX_HISTORY) {
    spinHistory.pop();
  }

  const payout = calculatePayout(betType, betValue, betAmount, spin);
  balance += payout;

  if (payout > 0) {
    wins += 1;
    message.textContent = `You won ${formatMoney(payout)}!`;
  } else {
    losses += 1;
    message.textContent = `You lost ${formatMoney(Math.abs(payout))}. Try again!`;
  }

  updateStats();
  updateProbability(betType);
});

toggleFields();
updateStats();
updateDiceProbability(Number(diceCountSelect.value));
updateDiceTotals(Number(diceCountSelect.value), []);
