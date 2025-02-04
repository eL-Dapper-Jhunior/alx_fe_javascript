// Initialize quotes array
let quotes = [];

document.addEventListener('DOMContentLoaded', () => {
    // Load quotes from local storage
    loadQuotes();
    
    // Get DOM elements
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');
    const addQuoteButton = document.getElementById('addQuote');
    const exportButton = document.getElementById('exportQuotes');
    const importFile = document.getElementById('importFile');
    
    // Add event listeners
    newQuoteButton.addEventListener('click', showRandomQuote);
    addQuoteButton.addEventListener('click', addQuote);
    exportButton.addEventListener('click', exportToJsonFile);
    importFile.addEventListener('change', importFromJsonFile);
    
    // Initialize quote display
    showRandomQuote();
    updateCategoryDisplay();
});

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
    localStorage.setItem('lastUpdate', new Date().toISOString());
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

function exportToJsonFile() {
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'quotes.json';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(url);
}

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
            showRandomQuote();
            updateCategoryDisplay();
            
            alert(`Successfully imported ${newQuotes.length} new quotes!`);
        } catch (error) {
            alert('Error importing quotes. Please check the file format.');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

// Rest of the functions (showRandomQuote, addQuote, etc.) remain the same...

// Helper function to validate quote objects
function isValidQuote(quote) {
    return quote && 
           typeof quote === 'object' && 
           typeof quote.text === 'string' && 
           typeof quote.category === 'string';
}