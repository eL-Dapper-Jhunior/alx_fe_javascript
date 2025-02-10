// Initialize quotes array with some default quotes
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspiration" },
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Life is what happens while you're busy making other plans.", category: "Life" }
];

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');

    // Create and append the form for adding new quotes
    createAddQuoteForm();

    // Initialize quote display
    showRandomQuote();

    // Add event listener for new quote button
    newQuoteButton.addEventListener('click', showRandomQuote);
});

function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Clear existing content
    quoteDisplay.innerHTML = '';
    
    // Get random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    // Create quote elements
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${quote.text}"`;
    quoteText.classList.add('quote-text');
    
    const quoteCategory = document.createElement('p');
    quoteCategory.textContent = `Category: ${quote.category}`;
    quoteCategory.classList.add('quote-category');
    
    // Create container for quote
    const quoteContainer = document.createElement('div');
    quoteContainer.classList.add('quote-container');
    
    // Append elements
    quoteContainer.appendChild(quoteText);
    quoteContainer.appendChild(quoteCategory);
    quoteDisplay.appendChild(quoteContainer);
}

function createAddQuoteForm() {
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');
    
    // Create input for quote text
    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter a new quote';
    
    // Create input for category
    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category';
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Add Quote';
    submitButton.addEventListener('click', addQuote);
    
    // Create category display section
    const categoryDisplay = document.createElement('div');
    categoryDisplay.id = 'categoryDisplay';
    updateCategoryDisplay(categoryDisplay);
    
    // Append elements to form container
    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(submitButton);
    formContainer.appendChild(categoryDisplay);
    
    // Add form to document
    document.body.insertBefore(formContainer, document.getElementById('quoteDisplay'));
}

function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    // Validate inputs
    if (!quoteText || !quoteCategory) {
        alert('Please enter both a quote and a category');
        return;
    }
    
    // Add new quote to array
    quotes.push({
        text: quoteText,
        category: quoteCategory
    });
    
    // Clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Update category display
    updateCategoryDisplay(document.getElementById('categoryDisplay'));
    
    // Show the newly added quote
    showRandomQuote();
}

function updateCategoryDisplay(categoryDisplay) {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing content
    categoryDisplay.innerHTML = '';
    
    // Create category list
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