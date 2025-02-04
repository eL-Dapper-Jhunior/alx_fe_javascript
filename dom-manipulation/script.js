// Initialize quotes array and track current filter
let quotes = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    // Load quotes and last filter from storage
    loadQuotes();
    loadLastFilter();
    
    // Get DOM elements
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');
    const addQuoteButton = document.getElementById('addQuote');
    const exportButton = document.getElementById('exportQuotes');
    const importFile = document.getElementById('importFile');
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Add event listeners
    newQuoteButton.addEventListener('click', () => {
        const filteredQuotes = getFilteredQuotes();
        showRandomQuote(filteredQuotes);
    });
    addQuoteButton.addEventListener('click', addQuote);
    exportButton.addEventListener('click', exportToJsonFile);
    importFile.addEventListener('change', importFromJsonFile);
    categoryFilter.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        filterQuotes(selectedCategory);
    });
    
    // Initialize UI
    populateCategories();
    const filteredQuotes = getFilteredQuotes();
    showRandomQuote(filteredQuotes);
});

function loadLastFilter() {
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter) {
        currentFilter = lastFilter;
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = currentFilter;
        }
    }
}

function saveLastFilter(category) {
    currentFilter = category;
    localStorage.setItem('lastFilter', category);
}

function getFilteredQuotes() {
    return currentFilter === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === currentFilter);
}

function filterQuotes(category) {
    // Save the selected category
    saveLastFilter(category);
    
    // Get filtered quotes
    const filteredQuotes = getFilteredQuotes();
    
    // Show a random quote from filtered set
    showRandomQuote(filteredQuotes);
}

function showRandomQuote(quotesToUse) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';
    
    if (!quotesToUse || quotesToUse.length === 0) {
        const noQuotes = document.createElement('p');
        noQuotes.textContent = currentFilter === 'all' 
            ? 'No quotes available.' 
            : `No quotes available in the "${currentFilter}" category.`;
        noQuotes.classList.add('no-quotes');
        quoteDisplay.appendChild(noQuotes);
        return;
    }
    
    // Get random quote from filtered quotes
    const randomIndex = Math.floor(Math.random() * quotesToUse.length);
    const quote = quotesToUse[randomIndex];
    
    // Save to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
    
    // Create and display quote
    const quoteContainer = document.createElement('div');
    quoteContainer.classList.add('quote-container');
    
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${quote.text}"`;
    quoteText.classList.add('quote-text');
    
    const quoteCategory = document.createElement('p');
    quoteCategory.textContent = `Category: ${quote.category}`;
    quoteCategory.classList.add('quote-category');
    
    quoteContainer.appendChild(quoteText);
    quoteContainer.appendChild(quoteCategory);
    quoteDisplay.appendChild(quoteContainer);
}

function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (!quoteText || !quoteCategory) {
        alert('Please enter both a quote and a category');
        return;
    }
    
    // Add new quote
    quotes.push({
        text: quoteText,
        category: quoteCategory
    });
    
    // Save quotes and update UI
    saveQuotes();
    populateCategories();
    
    // Show new quote if it matches current filter
    const filteredQuotes = getFilteredQuotes();
    showRandomQuote(filteredQuotes);
    
    // Clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(quote => quote.category))].sort();
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        
        // Select if it matches current filter
        if (category === currentFilter) {
            option.selected = true;
        }
        
        categoryFilter.appendChild(option);
    });
}

// Other functions (loadQuotes, saveQuotes, exportToJsonFile, importFromJsonFile) remain the same...