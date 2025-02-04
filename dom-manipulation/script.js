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
    newQuoteButton.addEventListener('click', showRandomQuote);
    addQuoteButton.addEventListener('click', addQuote);
    exportButton.addEventListener('click', exportToJsonFile);
    importFile.addEventListener('change', importFromJsonFile);
    categoryFilter.addEventListener('change', filterQuotes);
    
    // Initialize UI
    populateCategories();
    filterQuotes();
    updateLastSaved();
});

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes if none in storage
        quotes = [
            { text: "Be the change you wish to see in the world.", category: "Inspiration" },
            { text: "The only way to do great work is to love what you do.", category: "Work" },
            { text: "Life is what happens while you're busy making other plans.", category: "Life" }
        ];
        saveQuotes();
    }
}

function loadLastFilter() {
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter) {
        currentFilter = lastFilter;
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.value = currentFilter;
    }
}

function saveLastFilter(filter) {
    currentFilter = filter;
    localStorage.setItem('lastFilter', filter);
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
        categoryFilter.appendChild(option);
    });
    
    // Set to last selected category if it exists
    if (currentFilter && currentFilter !== 'all') {
        categoryFilter.value = currentFilter;
    }
}

function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    
    // Save filter preference
    saveLastFilter(selectedCategory);
    
    // Filter quotes
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Update display
    displayFilteredQuotes(filteredQuotes);
}

function displayFilteredQuotes(filteredQuotes) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';
    
    if (filteredQuotes.length === 0) {
        const noQuotes = document.createElement('p');
        noQuotes.textContent = 'No quotes found for this category.';
        noQuotes.classList.add('no-quotes');
        quoteDisplay.appendChild(noQuotes);
        return;
    }
    
    filteredQuotes.forEach(quote => {
        const quoteContainer = createQuoteElement(quote);
        quoteDisplay.appendChild(quoteContainer);
    });
}

function createQuoteElement(quote) {
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
    
    return quoteContainer;
}

// Modified addQuote function to handle categories
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
    
    // Save to storage and update UI
    saveQuotes();
    populateCategories();
    filterQuotes();
    
    // Clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

// Modified importFromJsonFile to handle categories
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedQuotes) || !importedQuotes.every(isValidQuote)) {
                throw new Error('Invalid quote format');
            }
            
            const newQuotes = importedQuotes.filter(newQuote => 
                !quotes.some(existingQuote => 
                    existingQuote.text === newQuote.text && 
                    existingQuote.category === newQuote.category
                )
            );
            
            quotes.push(...newQuotes);
            saveQuotes();
            populateCategories();
            filterQuotes();
            
            alert(`Successfully imported ${newQuotes.length} new quotes!`);
        } catch (error) {
            alert('Error importing quotes. Please check the file format.');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}