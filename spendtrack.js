const budgetForm = document.getElementById("budget-form");
const incomeInput = document.getElementById("income");
const rentInput = document.getElementById("rent-amount");
const entryDropdown = document.getElementById("entry-dropdown");
const addEntryButton = document.getElementById("add-entry");
const clearButton = document.getElementById("clear");
const output = document.getElementById("output");

let isError = false;

const STORAGE_KEY = "spendTracData";

// Clean input values
function cleanInputString(str) {
  const regex = /[+\-\s]/g;
  return str.replace(regex, "");
}

// Check invalid number input
function isInvalidInput(str) {
  const regex = /\d+e\d+/i;
  return str.match(regex);
}

// Add dynamic expense inputs
function addEntry() {
  const category = entryDropdown.value;

  const targetInputContainer = document.querySelector(
    `#${category} .input-container`
  );

  const entryNumber =
    targetInputContainer.querySelectorAll('input[type="text"]').length + 1;

  const HTMLString = `
    <label for="${category}-${entryNumber}-name">
      Expense ${entryNumber} Name
    </label>

    <input type="text" id="${category}-${entryNumber}-name" placeholder="Name"/>

    <label for="${category}-${entryNumber}-amount">
      Expense ${entryNumber} Amount
    </label>

    <input type="number" min="0" id="${category}-${entryNumber}-amount" placeholder="Amount"/>`;

  targetInputContainer.insertAdjacentHTML("beforeend", HTMLString);

  saveFormData();
}

// Calculate budget
function calculateBudget(e) {
  e.preventDefault();

  isError = false;

  const foodInputs = document.querySelectorAll(
    "#food input[type='number']"
  );

  const utilitiesInputs = document.querySelectorAll(
    "#utilities input[type='number']"
  );

  const entertainmentInputs = document.querySelectorAll(
    "#entertainment input[type='number']"
  );

  const rent = getTotalFromInputs([rentInput]);
  const food = getTotalFromInputs(foodInputs);
  const utilities = getTotalFromInputs(utilitiesInputs);
  const entertainment = getTotalFromInputs(entertainmentInputs);
  const income = getTotalFromInputs([incomeInput]);

  if (isError) {
    return;
  }

  const expenses = rent + food + utilities + entertainment;
  const netRemaining = income - expenses;

  let statusText = "";
  let statusClass = "";

  if (netRemaining < 0) {
    statusText = `Over Budget by $${Math.abs(netRemaining)}`;
    statusClass = "deficit";
  } else {
    statusText = `$${netRemaining} Remaining`;
    statusClass = "surplus";
  }

  output.innerHTML = `<span class="${statusClass}">${statusText}</span>
    <hr>
    <p>$${income} Total Income</p>
    <p>$${expenses} Total Expenses</p>`;

  output.classList.remove("hide");

  // Save calculated budget
  saveFormData();
}

// Get total from input fields
function getTotalFromInputs(list) {
  let total = 0;

  for (const item of list) {
    const currVal = cleanInputString(item.value);
    const invalidInputMatch = isInvalidInput(currVal);

    if (invalidInputMatch) {
      alert(`Invalid Input: ${invalidInputMatch[0]}`);
      isError = true;
      return null;
    }

    total += Number(currVal);
  }

  return total;
}

// Save form data to Local Storage
function saveFormData() {
  const entries = {};

  const categories = [
    "food",
    "utilities",
    "entertainment"
  ];

  for (const category of categories) {
    const container = document.querySelector(
      `#${category} .input-container`
    );

    const nameInputs = container.querySelectorAll(
      'input[type="text"]'
    );

    const amountInputs = container.querySelectorAll(
      'input[type="number"]'
    );

    entries[category] = [];

    for (let i = 0; i < nameInputs.length; i++) {
      entries[category].push({
        name: nameInputs[i].value,
        amount: amountInputs[i].value
      });
    }
  }

  const budgetData = {
    income: incomeInput.value,
    rent: rentInput.value,
    entries: entries
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(budgetData)
  );
}

// Load saved data from Local Storage
function loadFormData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return;
  }

  const budgetData = JSON.parse(savedData);

  incomeInput.value = budgetData.income || "";
  rentInput.value = budgetData.rent || "";

  const categories = [
    "food",
    "utilities",
    "entertainment"
  ];

  for (const category of categories) {
    const container = document.querySelector(
      `#${category} .input-container`
    );

    container.innerHTML = "";

    const savedEntries = budgetData.entries[category] || [];

    savedEntries.forEach((entry, index) => {
      const entryNumber = index + 1;

      const HTMLString = `
        <label for="${category}-${entryNumber}-name">
          Expense ${entryNumber} Name
        </label>

        <input
          type="text"
          id="${category}-${entryNumber}-name"
          placeholder="Name"
          value="${entry.name}"
        />

        <label for="${category}-${entryNumber}-amount">
          Expense ${entryNumber} Amount
        </label>

        <input type="number" min="0" id="${category}-${entryNumber}-amount" placeholder="Amount" value="${entry.amount}"/>`;

      container.insertAdjacentHTML(
        "beforeend",
        HTMLString
      );
    });
  }
}

// Clear form and Local Storage
function clearForm() {
  const inputContainers = Array.from(
    document.querySelectorAll(".input-container")
  );

  for (const container of inputContainers) {
    container.innerHTML = "";
  }

  incomeInput.value = "";
  rentInput.value = "";

  output.innerText = "";
  output.classList.add("hide");

  localStorage.removeItem(STORAGE_KEY);
}

// Save draft whenever the user changes an input
budgetForm.addEventListener("input", saveFormData);

// Event listeners
addEntryButton.addEventListener("click", addEntry);

budgetForm.addEventListener("submit", calculateBudget);

clearButton.addEventListener("click", clearForm);

// Restore saved data when the page loads
loadFormData();