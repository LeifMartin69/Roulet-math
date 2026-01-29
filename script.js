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
const numberField = document.getElementById("number-field");
const colorField = document.getElementById("color-field");
const betNumberInput = document.getElementById("bet-number");
const betColorSelect = document.getElementById("bet-color");
const betAmountInput = document.getElementById("bet-amount");
const form = document.getElementById("bet-form");
const resultNumber = document.getElementById("result-number");
const resultColor = document.getElementById("result-color");
const message = document.getElementById("message");
const balanceEl = document.getElementById("balance");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");

let balance = 1000;
let wins = 0;
let losses = 0;

const formatMoney = (value) => `$${value.toLocaleString()}`;

const updateStats = () => {
  balanceEl.textContent = formatMoney(balance);
  winsEl.textContent = wins;
  lossesEl.textContent = losses;
};

const toggleFields = () => {
  const isNumber = betTypeSelect.value === "number";
  numberField.classList.toggle("hidden", !isNumber);
  colorField.classList.toggle("hidden", isNumber);
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

const calculatePayout = (betType, betValue, amount, spin) => {
  if (betType === "number") {
    return Number(betValue) === spin.number ? amount * 35 : -amount;
  }

  if (betType === "color") {
    return betValue === spin.color ? amount : -amount;
  }

  return 0;
};

betTypeSelect.addEventListener("change", toggleFields);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const betType = betTypeSelect.value;
  const betAmount = Number(betAmountInput.value);
  const betValue = betType === "number" ? betNumberInput.value : betColorSelect.value;

  if (!betValue && betType === "number") {
    message.textContent = "Pick a number between 0 and 36.";
    return;
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
});

toggleFields();
updateStats();
