// Initialize quotes array with some default quotes
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspiration" },
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Life is what happens while you're busy making other plans.", category: "Life" }
];

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Function to save the last viewed quote to session storage
function saveLastViewedQuote(quote) {
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Function to load the last viewed quote from session storage
function loadLastViewedQuote() {
    const lastQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastQuote) {
        return JSON.parse(lastQuote);
    }
    return null;
}

// Function to export quotes as a JSON file
function exportQuotes() {
    const json = JSON.stringify(quotes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes(); // Save updated quotes to local storage
        alert('Quotes imported successfully!');
        populateCategories(); // Update the category dropdown
        filterQuotes(); // Apply the current filter
    };
    fileReader.readAsText(event.target.files[0]);
}

// Function to populate the category filter dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(quote => quote.category))];

    // Clear existing options (except the first "All Categories" option)
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    // Add categories to the dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes by category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    // Display filtered quotes
    displayQuotes(filteredQuotes);

    // Save the selected filter to local storage
    localStorage.setItem('lastSelectedFilter', selectedCategory);
}

// Function to display quotes
function displayQuotes(quotesToDisplay) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';

    quotesToDisplay.forEach(quote => {
        const quoteText = document.createElement('p');
        quoteText.textContent = `"${quote.text}"`;
        quoteText.classList.add('quote-text');

        const quoteCategory = document.createElement('p');
        quoteCategory.textContent = `Category: ${quote.category}`;
        quoteCategory.classList.add('quote-category');

        const quoteContainer = document.createElement('div');
        quoteContainer.classList.add('quote-container');
        quoteContainer.appendChild(quoteText);
        quoteContainer.appendChild(quoteCategory);
        quoteDisplay.appendChild(quoteContainer);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadQuotes(); // Load quotes from local storage
    populateCategories(); // Populate the category filter dropdown

    // Load the last selected filter from local storage
    const lastSelectedFilter = localStorage.getItem('lastSelectedFilter') || 'all';
    document.getElementById('categoryFilter').value = lastSelectedFilter;

    // Apply the filter
    filterQuotes();

    // Display the last viewed quote
    const lastQuote = loadLastViewedQuote();
    if (lastQuote) {
        displayQuotes([lastQuote]);
    }

    // Get DOM elements
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');

    // Create and append the form for adding new quotes
    createAddQuoteForm();

    // Add event listener for new quote button
    newQuoteButton.addEventListener('click', showRandomQuote);

    // Add export and import buttons
    createExportButton();
    createImportInput();
});

function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    displayQuotes([quote]); // Display a single random quote
    saveLastViewedQuote(quote);
}

function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category';

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Add Quote';
    submitButton.addEventListener('click', addQuote);

    const categoryDisplay = document.createElement('div');
    categoryDisplay.id = 'categoryDisplay';
    updateCategoryDisplay(categoryDisplay);

    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(submitButton);
    formContainer.appendChild(categoryDisplay);

    document.body.insertBefore(formContainer, document.getElementById('quoteDisplay'));
}

function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (!quoteText || !quoteCategory) {
        alert('Please enter both a quote and a category');
        return;
    }

    quotes.push({
        text: quoteText,
        category: quoteCategory
    });

    // Save quotes to local storage
    saveQuotes();

    // Update the category dropdown if the category is new
    const categories = [...new Set(quotes.map(quote => quote.category))];
    if (!categories.includes(quoteCategory)) {
        populateCategories();
    }

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    updateCategoryDisplay(document.getElementById('categoryDisplay'));
    filterQuotes(); // Apply the current filter
}

function updateCategoryDisplay(categoryDisplay) {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categoryDisplay.innerHTML = '';

    const categoryList = document.createElement('div');
    categoryList.innerHTML = '<h3>Available Categories:</h3>';

    categories.forEach(category => {
        const categoryElement = document.createElement('span');
        categoryElement.textContent = category;
        categoryElement.classList.add('category-tag');
        categoryList.appendChild(categoryElement);
    });

    categoryDisplay.appendChild(categoryList);
}

function createExportButton() {
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Quotes';
    exportButton.addEventListener('click', exportQuotes);
    document.body.appendChild(exportButton);
}

function createImportInput() {
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'importFile';
    importInput.accept = '.json';
    importInput.addEventListener('change', importFromJsonFile);
    document.body.appendChild(importInput);
}