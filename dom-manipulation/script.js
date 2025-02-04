const API_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts'; // Mock API
let quotes = [];
let currentFilter = 'all';

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    await fetchQuotesFromServer();
    loadQuotesFromLocalStorage();
    setupUI();
    setInterval(checkForNewQuotes, 30000); // Sync every 30 seconds
});

function setupUI() {
    const syncButton = document.getElementById('syncButton');
    syncButton.addEventListener('click', async () => {
        await syncQuotes();
    });

    const addQuoteButton = document.getElementById('addQuoteButton');
    addQuoteButton.addEventListener('click', async () => {
        await addQuote();
    });
}

async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_ENDPOINT);
        const serverQuotes = await response.json();
        const formattedQuotes = serverQuotes.map(quote => ({
            text: quote.body,
            category: extractCategory(quote.title),
            serverId: quote.id,
            lastModified: new Date().toISOString()
        }));
        quotes = formattedQuotes; // Assume we replace local quotes
        saveQuotesToLocalStorage();
        updateUI();
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
        showNotification('Failed to fetch quotes from the server.');
    }
}

async function syncQuotes() {
    try {
        const localQuotes = getLocalQuotes();
        const response = await fetch(API_ENDPOINT);
        const serverQuotes = await response.json();

        await resolveConflicts(localQuotes, serverQuotes);
        saveQuotesToLocalStorage();
        updateUI();

        showNotification('Sync successful.');
    } catch (error) {
        console.error('Error during syncing:', error);
        showNotification('Sync failed. Please try again later.');
    }
}

async function resolveConflicts(localQuotes, serverQuotes) {
    const conflicts = [];

    serverQuotes.forEach(serverQuote => {
        const localQuote = localQuotes.find(q => q.serverId === serverQuote.id);

        if (localQuote) {
            // Check for conflicts
            if (localQuote.text !== serverQuote.body || localQuote.category !== extractCategory(serverQuote.title)) {
                conflicts.push({ local: localQuote, server: serverQuote });
            }
        } else {
            // If not found, push to local
            quotes.push({
                text: serverQuote.body,
                category: extractCategory(serverQuote.title),
                serverId: serverQuote.id,
                lastModified: new Date().toISOString()
            });
        }
    });

    // Handle conflicts
    if (conflicts.length > 0) {
        await handleConflictResolution(conflicts);
    }
}

async function handleConflictResolution(conflicts) {
    for (const conflict of conflicts) {
        const resolutionChoice = await showConflictDialog(conflict);
        if (resolutionChoice === 'local') {
            // Keep local version
        } else {
            // Update local with server version
            const index = quotes.findIndex(q => q.serverId === conflict.local.serverId);
            quotes[index] = {
                text: conflict.server.body,
                category: extractCategory(conflict.server.title),
                serverId: conflict.server.id,
                lastModified: new Date().toISOString()
            };
        }
    }
}

function showConflictDialog(conflict) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.classList.add('dialog');
        dialog.innerHTML = `
            <p>Conflict detected!</p>
            <p><strong>Local:</strong> ${conflict.local.text} (${conflict.local.category})</p>
            <p><strong>Server:</strong> ${conflict.server.body} (${extractCategory(conflict.server.title)})</p>
            <button id="keepLocal">Keep Local</button>
            <button id="keepServer">Keep Server</button>
        `;

        document.body.appendChild(dialog);
        
        dialog.querySelector('#keepLocal').onclick = () => {
            dialog.remove();
            resolve('local');
        };
        dialog.querySelector('#keepServer').onclick = () => {
            dialog.remove();
            resolve('server');
        };
    });
}

async function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (!quoteText || !quoteCategory) {
        alert('Please enter both a quote and a category');
        return;
    }

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify({
                title: quoteCategory,
                body: quoteText
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const newQuote = await response.json();
        quotes.push({
            text: newQuote.body,
            category: quoteCategory,
            serverId: newQuote.id,
            lastModified: new Date().toISOString()
        });
        
        saveQuotesToLocalStorage();
        updateUI();
        showNotification('Quote added successfully!');
    } catch (error) {
        console.error('Error adding quote:', error);
        showNotification('Failed to add quote. Please try again.');
    }
}

async function checkForNewQuotes() {
    await fetchQuotesFromServer();
}

function loadQuotesFromLocalStorage() {
    const storedQuotes = JSON.parse(localStorage.getItem('quotes'));
    if (storedQuotes) {
        quotes = storedQuotes;
    }
}

function saveQuotesToLocalStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function extractCategory(title) {
    // A simple implementation, adjust based on your category rules
    return title.split(' ')[0];
}

function updateUI() {
    // Update UI to reflect the current quotes
    const quotesContainer = document.getElementById('quotesContainer');
    quotesContainer.innerHTML = '';
    
    quotes.forEach((quote) => {
        const quoteElement = document.createElement('div');
        quoteElement.classList.add('quote');
        quoteElement.innerHTML = `<p>${quote.text}</p><p>Category: ${quote.category}</p>`;
        quotesContainer.appendChild(quoteElement);
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}