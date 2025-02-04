let quotes = [
    { text: "Believe you can and you're halfway there.", category: "Inspirational" },
    { text: "The only way to do great work is to love what you do.", category: "Motivational" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Inspirational" },
];

// Function to display a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    const quoteDisplay = document.getElementById("quoteDisplay");

    quoteDisplay.innerHTML = `
        <p>${randomQuote.text}</p>
        <p>Category: ${randomQuote.category}</p>
    `;
}

// Function to create the add quote form
function createAddQuoteForm() {
    const addQuoteForm = document.getElementById("addQuoteForm");

    addQuoteForm.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button onclick="addQuote()">Add Quote</button>
    `;
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value;
    const newQuoteCategory = document.getElementById("newQuoteCategory").value;

    quotes.push({ text: newQuoteText, category: newQuoteCategory });

    showRandomQuote();
}

// Initialize the application
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
createAddQuoteForm();
showRandomQuote();
