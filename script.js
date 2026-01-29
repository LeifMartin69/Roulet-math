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
const resultNumber = document.getElementById("result-number");
const resultColor = document.getElementById("result-color");
const message = document.getElementById("message");
const balanceEl = document.getElementById("balance");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const probabilityValue = document.getElementById("probability-value");
const probabilityNote = document.getElementById("probability-note");

let balance = 1000;
let wins = 0;
let losses = 0;
const spinHistory = [];
const MAX_HISTORY = 20;

const formatMoney = (value) => `$${value.toLocaleString()}`;

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
    const color = betColorSelect.value;
    return color === "green"
      ? { ratio: "1 / 37", percent: 2.7 }
      : { ratio: "18 / 37", percent: 48.6 };
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

betTypeSelect.addEventListener("change", toggleFields);
betColorSelect.addEventListener("change", () => updateProbability("color"));
betOddEvenSelect.addEventListener("change", () => updateProbability("odd-even"));
betHighLowSelect.addEventListener("change", () => updateProbability("high-low"));
betDozenSelect.addEventListener("change", () => updateProbability("dozen"));
betColumnSelect.addEventListener("change", () => updateProbability("column"));
betNumberInput.addEventListener("input", () => updateProbability("number"));

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const betType = betTypeSelect.value;
  const betAmount = Number(betAmountInput.value);
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

  if (betAmount <= 0 || Number.isNaN(betAmount)) {
    message.textContent = "Enter a valid wager.";
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
