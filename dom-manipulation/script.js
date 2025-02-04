// Initialize state
let quotes = [];
let currentFilter = 'all';
let lastSyncTimestamp = null;

// Simulate server endpoint (using JSONPlaceholder as example)
const API_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

document.addEventListener('DOMContentLoaded', async () => {
    // Load local data first
    loadQuotes();
    loadLastFilter();
    
    // Setup UI elements
    setupUI();
    
    // Initial sync with server
    await syncWithServer();
    
    // Start periodic sync
    setInterval(syncWithServer, 30000); // Sync every 30 seconds
});

function setupUI() {
    // Create sync status indicator
    const syncStatus = document.createElement('div');
    syncStatus.id = 'syncStatus';
    syncStatus.classList.add('sync-status');
    document.querySelector('.storage-controls').appendChild(syncStatus);
    
    // Add manual sync button
    const syncButton = document.createElement('button');
    syncButton.textContent = 'Sync Now';
    syncButton.addEventListener('click', () => syncWithServer());
    document.querySelector('.storage-controls').appendChild(syncButton);
    
    // Setup other UI event listeners
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('newQuote').addEventListener('click', () => {
        const filteredQuotes = getFilteredQuotes();
        showRandomQuote(filteredQuotes);
    });
    
    document.getElementById('addQuote').addEventListener('click', async () => {
        await addQuote();
    });
    
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        filterQuotes(selectedCategory);
    });
}

async function syncWithServer() {
    try {
        updateSyncStatus('Syncing...');
        
        // Fetch server data
        const response = await fetch(`${API_ENDPOINT}?_start=0&_limit=5`);
        const serverQuotes = await response.json();
        
        // Transform server data to match our format
        const transformedQuotes = serverQuotes.map(sq => ({
            text: sq.body.split('\n')[0], // Use first line of body as quote
            category: sq.title.split(' ')[0], // Use first word of title as category
            serverId: sq.id,
            lastModified: new Date().toISOString()
        }));
        
        // Merge server and local quotes
        await mergeQuotes(transformedQuotes);
        
        lastSyncTimestamp = new Date().toISOString();
        localStorage.setItem('lastSync', lastSyncTimestamp);
        
        updateSyncStatus('Last synced: ' + new Date().toLocaleTimeString());
    } catch (error) {
        console.error('Sync error:', error);
        updateSyncStatus('Sync failed', true);
        showNotification('Sync failed. Please try again later.');
    }
}

async function mergeQuotes(serverQuotes) {
    const conflicts = [];
    
    // Find conflicts and new quotes
    serverQuotes.forEach(serverQuote => {
        const localQuote = quotes.find(q => q.serverId === serverQuote.serverId);
        
        if (localQuote) {
            // Check for conflicts
            if (localQuote.text !== serverQuote.text || localQuote.category !== serverQuote.category) {
                conflicts.push({ local: localQuote, server: serverQuote });
            }
        } else {
            // New quote from server
            quotes.push(serverQuote);
        }
    });
    
    // Handle conflicts
    if (conflicts.length > 0) {
        await handleConflicts(conflicts);
    }
    
    // Save merged quotes
    saveQuotes();
    
    // Update UI
    populateCategories();
    const filteredQuotes = getFilteredQuotes();
    showRandomQuote(filteredQuotes);
}

async function handleConflicts(conflicts) {
    // Create conflict resolution dialog
    const dialog = document.createElement('div');
    dialog.classList.add('conflict-dialog');
    
    conflicts.forEach(conflict => {
        const conflictItem = document.createElement('div');
        conflictItem.classList.add('conflict-item');
        
        conflictItem.innerHTML = `
            <h3>Quote Conflict</h3>
            <div class="conflict-versions">
                <div class="local-version">
                    <h4>Local Version</h4>
                    <p>${conflict.local.text}</p>
                    <p>Category: ${conflict.local.category}</p>
                </div>
                <div class="server-version">
                    <h4>Server Version</h4>
                    <p>${conflict.server.text}</p>
                    <p>Category: ${conflict.server.category}</p>
                </div>
            </div>
            <div class="conflict-actions">
                <button onclick="resolveConflict(${conflict.server.serverId}, 'local')">Keep Local</button>
                <button onclick="resolveConflict(${conflict.server.serverId}, 'server')">Keep Server</button>
            </div>
        `;
        
        dialog.appendChild(conflictItem);
    });
    
    // Show dialog
    document.body.appendChild(dialog);
}

function resolveConflict(serverId, choice) {
    const conflictIndex = quotes.findIndex(q => q.serverId === serverId);
    
    if (choice === 'server') {
        const serverQuote = quotes.find(q => q.serverId === serverId);
        quotes[conflictIndex] = serverQuote;
    }
    
    // Remove conflict dialog
    const dialog = document.querySelector('.conflict-dialog');
    if (dialog) {
        dialog.remove();
    }
    
    // Save and update UI
    saveQuotes();
    populateCategories();
    const filteredQuotes = getFilteredQuotes();
    showRandomQuote(filteredQuotes);
}

function updateSyncStatus(message, isError = false) {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        syncStatus.textContent = message;
        syncStatus.className = 'sync-status' + (isError ? ' error' : '');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Modified addQuote function to handle server sync
async function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (!quoteText || !quoteCategory) {
        alert('Please enter both a quote and a category');
        return;
    }
    
    try {
        // Simulate server post
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify({
                title: quoteCategory,
                body: quoteText,
            }),
            headers: {
                'Content-type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        // Add new quote with server ID
        quotes.push({
            text: quoteText,
            category: quoteCategory,
            serverId: result.id,
            lastModified: new Date().toISOString()
        });
        
        // Save and update UI
        saveQuotes();
        populateCategories();
        const filteredQuotes = getFilteredQuotes();
        showRandomQuote(filteredQuotes);
        
        // Clear inputs
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        
        showNotification('Quote added successfully');
    } catch (error) {
        console.error('Error adding quote:', error);
        showNotification('Failed to add quote. Please try again.');
    }
}