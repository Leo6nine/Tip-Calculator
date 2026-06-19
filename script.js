// Get the form and all of the important inputs and result elements.
const tipForm = document.getElementById('tip-form');
const billInput = document.getElementById('bill-amount');
const customTipInput = document.getElementById('custom-tip');
const peopleInput = document.getElementById('people-count');
const resetButton = document.getElementById('reset-button');
const increasePeopleButton = document.getElementById('increase-people');
const decreasePeopleButton = document.getElementById('decrease-people');
const tipButtons = document.querySelectorAll('.tip-option');

const billError = document.getElementById('bill-error');
const customTipError = document.getElementById('custom-tip-error');
const peopleError = document.getElementById('people-error');
const tipSelectionError = document.getElementById('tip-selection-error');

const tipAmountOutput = document.getElementById('tip-amount');
const totalAmountOutput = document.getElementById('total-amount');
const perPersonOutput = document.getElementById('per-person');
const tipSummaryOutput = document.getElementById('tip-summary');
const currentTotalAmountOutput = document.getElementById('current-total-amount');
const resultsGrid = document.getElementById('results-grid');
const resultsPanel = document.querySelector('.results-panel');

// Keep track of which preset button is currently selected.
let selectedTipPercentage = null;

// Format a number as currency text with two decimal places.
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

// Remove the active style from every preset tip button.
function clearActiveTipButtons() {
  tipButtons.forEach((button) => {
    button.classList.remove('is-active');
  });
}

// Show or clear an error message for a field wrapper.
function setFieldError(inputElement, errorElement, message) {
  const fieldGroup = inputElement.closest('.field-group');

  errorElement.textContent = message;

  if (fieldGroup) {
    fieldGroup.classList.toggle('has-error', message !== '');
  }
}

// Show an error message when the user has not chosen any tip percentage.
function setTipSelectionError(message) {
  tipSelectionError.textContent = message;
}

// Read and validate the bill amount entered by the user.
function getBillAmount() {
  const billAmount = Number(billInput.value);

  if (billInput.value.trim() === '' || Number.isNaN(billAmount) || billAmount < 0) {
    setFieldError(billInput, billError, 'Please enter a valid bill amount.');
    return null;
  }

  setFieldError(billInput, billError, '');
  return billAmount;
}

// Read and validate the custom tip percentage.
function getCustomTip() {
  if (customTipInput.value.trim() === '') {
    setFieldError(customTipInput, customTipError, '');
    return null;
  }

  const customTip = Number(customTipInput.value);

  if (Number.isNaN(customTip) || customTip < 0) {
    setFieldError(customTipInput, customTipError, 'Please enter a valid custom tip percentage.');
    return null;
  }

  setFieldError(customTipInput, customTipError, '');
  return customTip;
}

// Read and validate the number of people.
function getPeopleCount() {
  const peopleCount = Number(peopleInput.value);

  if (
    peopleInput.value.trim() === '' ||
    Number.isNaN(peopleCount) ||
    peopleCount < 1 ||
    !Number.isInteger(peopleCount)
  ) {
    setFieldError(peopleInput, peopleError, 'Please enter a whole number of at least 1.');
    return null;
  }

  setFieldError(peopleInput, peopleError, '');
  return peopleCount;
}

// Update the three result boxes with the latest calculation.
function displayResults(tipAmount, totalAmount, perPersonAmount) {
  tipAmountOutput.textContent = formatCurrency(tipAmount);
  totalAmountOutput.textContent = formatCurrency(totalAmount);
  currentTotalAmountOutput.textContent = formatCurrency(totalAmount);
  perPersonOutput.textContent = formatCurrency(perPersonAmount);
  tipSummaryOutput.textContent = formatCurrency(tipAmount / Number(peopleInput.value || 1));

  // Restart the animation so the results fade in every time we calculate.
  resultsGrid.classList.remove('is-updated');
  void resultsGrid.offsetWidth;
  resultsGrid.classList.add('is-updated');
  resultsPanel.classList.remove('is-empty');
}

// Calculate the values when the user clicks the button or presses Enter.
function calculateTip() {
  const billAmount = getBillAmount();
  const peopleCount = getPeopleCount();
  const customTip = getCustomTip();

  let tipPercentage = selectedTipPercentage;

  // If the user entered a custom tip, it wins over the preset buttons.
  if (customTip !== null) {
    tipPercentage = customTip;
  }

  if (tipPercentage === null) {
    setTipSelectionError('Please choose a tip percentage or enter a custom tip.');
    return;
  }

  setTipSelectionError('');

  if (billAmount === null || peopleCount === null || tipPercentage === null) {
    return;
  }

  const tipAmount = billAmount * (tipPercentage / 100);
  const totalAmount = billAmount + tipAmount;
  const perPersonAmount = totalAmount / peopleCount;

  displayResults(tipAmount, totalAmount, perPersonAmount);
}

// Select a preset tip button and clear the custom tip field.
function selectPresetTip(event) {
  const button = event.currentTarget;
  const percentage = Number(button.dataset.tip);

  selectedTipPercentage = percentage;
  clearActiveTipButtons();
  button.classList.add('is-active');

  customTipInput.value = '';
  setFieldError(customTipInput, customTipError, '');
  setTipSelectionError('');
}

// If the user types a custom tip, clear the selected preset button.
function handleCustomTipInput() {
  if (customTipInput.value.trim() !== '') {
    selectedTipPercentage = null;
    clearActiveTipButtons();
    setTipSelectionError('');
  }

  getCustomTip();
}

// Validate the bill as the user types.
function handleBillInput() {
  getBillAmount();
}

// Validate the people count as the user types.
function handlePeopleInput() {
  getPeopleCount();
}

// Validate the custom tip as the user types.
function handleCustomTipBlur() {
  getCustomTip();
}

// Clear the selected tip button and all form values.
function resetCalculator() {
  tipForm.reset();
  peopleInput.value = '1';
  selectedTipPercentage = null;

  clearActiveTipButtons();
  setFieldError(billInput, billError, '');
  setFieldError(customTipInput, customTipError, '');
  setFieldError(peopleInput, peopleError, '');
  setTipSelectionError('');

  tipAmountOutput.textContent = '₦0.00';
  totalAmountOutput.textContent = '₦0.00';
  currentTotalAmountOutput.textContent = '₦0.00';
  perPersonOutput.textContent = '₦0.00';
  tipSummaryOutput.textContent = '₦0.00';

  resultsPanel.classList.add('is-empty');
  resultsGrid.classList.remove('is-updated');
}

// Wire up every preset tip button.
tipButtons.forEach((button) => {
  button.addEventListener('click', selectPresetTip);
});

// Calculate when the form is submitted.
tipForm.addEventListener('submit', (event) => {
  event.preventDefault();
  calculateTip();
});

// Allow the Enter key to calculate from any input inside the form.
tipForm.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    calculateTip();
  }
});

// Live validation listeners.
billInput.addEventListener('input', handleBillInput);
customTipInput.addEventListener('input', handleCustomTipInput);
customTipInput.addEventListener('blur', handleCustomTipBlur);
peopleInput.addEventListener('input', handlePeopleInput);

// Reset everything when the reset button is clicked.
resetButton.addEventListener('click', resetCalculator);

// Let the step buttons adjust the people count without using the keyboard.
increasePeopleButton.addEventListener('click', () => {
  const currentPeople = Number(peopleInput.value) || 1;
  peopleInput.value = String(currentPeople + 1);
  handlePeopleInput();
});

decreasePeopleButton.addEventListener('click', () => {
  const currentPeople = Number(peopleInput.value) || 1;
  peopleInput.value = String(Math.max(1, currentPeople - 1));
  handlePeopleInput();
});

// Start with a clean empty state.
resetCalculator();