// Initialize quotes array
let quotes = [];

document.addEventListener('DOMContentLoaded', () => {
    // Load quotes from local storage
    loadQuotes();
    
    // Get DOM elements
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');
    
    // Create UI elements
    createAddQuoteForm();
    createStorageControls();
    
    // Initialize quote display
    showRandomQuote();
    
    // Add event listener for new quote button
    newQuoteButton.addEventListener('click', showRandomQuote);
});

// Storage Functions
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes if none in storage
        quotes = [
            { text: "Be the change you wish to see in the world.", category: "Inspiration" },
            { text: "The only way to do great work is to love what you do.", category: "Work" }
        ];
        saveQuotes();
    }
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    // Also save last update time
    localStorage.setItem('lastUpdate', new Date().toISOString());
    updateLastSaved();
}

function createStorageControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('storage-controls');
    
    // Export Button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Quotes';
    exportBtn.addEventListener('click', exportToJson);
    
    // Import Controls
    const importLabel = document.createElement('label');
    importLabel.classList.add('import-label');
    importLabel.textContent = 'Import Quotes';
    
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'importFile';
    importInput.accept = '.json';
    importInput.addEventListener('change', importFromJsonFile);
    
    // Last Saved Info
    const lastSavedDisplay = document.createElement('div');
    lastSavedDisplay.id = 'lastSaved';
    
    // Append controls
    controlsContainer.appendChild(exportBtn);
    controlsContainer.appendChild(importLabel);
    controlsContainer.appendChild(importInput);
    controlsContainer.appendChild(lastSavedDisplay);
    
    document.body.insertBefore(controlsContainer, document.getElementById('quoteDisplay'));
    updateLastSaved();
}

function updateLastSaved() {
    const lastSaved = document.getElementById('lastSaved');
    const lastUpdate = localStorage.getItem('lastUpdate');
    if (lastSaved && lastUpdate) {
        const date = new Date(lastUpdate);
        lastSaved.textContent = `Last saved: ${date.toLocaleString()}`;
    }
}

// JSON Export Function
function exportToJson() {
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'quotes.json';
    
    // Append, click, and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    URL.revokeObjectURL(url);
}

// JSON Import Function
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            // Validate imported data
            if (!Array.isArray(importedQuotes) || !importedQuotes.every(isValidQuote)) {
                throw new Error('Invalid quote format');
            }
            
            // Add new quotes and remove duplicates
            const newQuotes = importedQuotes.filter(newQuote => 
                !quotes.some(existingQuote => 
                    existingQuote.text === newQuote.text && 
                    existingQuote.category === newQuote.category
                )
            );
            
            quotes.push(...newQuotes);
            saveQuotes();
            showRandomQuote();
            updateCategoryDisplay(document.getElementById('categoryDisplay'));
            
            alert(`Successfully imported ${newQuotes.length} new quotes!`);
        } catch (error) {
            alert('Error importing quotes. Please check the file format.');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

// Validation helper
function isValidQuote(quote) {
    return quote && 
           typeof quote === 'object' && 
           typeof quote.text === 'string' && 
           typeof quote.category === 'string';
}

// Session Storage for Last Viewed Quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Clear existing content
    quoteDisplay.innerHTML = '';
    
    // Get random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    // Save to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
    
    // Create and display quote elements
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
}

// Modified addQuote function to include storage
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
    
    // Save to local storage
    saveQuotes();
    
    // Clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    updateCategoryDisplay(document.getElementById('categoryDisplay'));
    showRandomQuote();
}