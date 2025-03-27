// Content script for the Stock Analysis Agent extension
console.log('Stock Analysis Agent content script loaded');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_STOCK_INFO') {
        // This function will extract stock information from the current webpage
        const stockInfo = extractStockInfo();
        sendResponse(stockInfo);
    }
    return true;
});

// Function to extract stock information from the webpage
function extractStockInfo() {
    // This is a basic implementation that looks for common stock information patterns
    const stockInfo = {
        symbol: null,
        price: null,
        change: null,
        volume: null
    };

    // Look for stock symbol in common patterns
    const symbolPatterns = [
        /NSE:\s*([A-Z0-9]+)/i,
        /BSE:\s*([A-Z0-9]+)/i,
        /Symbol:\s*([A-Z0-9]+)/i
    ];

    for (const pattern of symbolPatterns) {
        const match = document.body.innerText.match(pattern);
        if (match) {
            stockInfo.symbol = match[1];
            break;
        }
    }

    // Look for price information
    const pricePatterns = [
        /₹\s*([0-9,]+\.?\d*)/,
        /Price:\s*₹\s*([0-9,]+\.?\d*)/
    ];

    for (const pattern of pricePatterns) {
        const match = document.body.innerText.match(pattern);
        if (match) {
            stockInfo.price = parseFloat(match[1].replace(/,/g, ''));
            break;
        }
    }

    // Look for price change
    const changePatterns = [
        /([+-]?\d+\.?\d*%)\s*change/i,
        /Change:\s*([+-]?\d+\.?\d*%)/i
    ];

    for (const pattern of changePatterns) {
        const match = document.body.innerText.match(pattern);
        if (match) {
            stockInfo.change = match[1];
            break;
        }
    }

    // Look for volume
    const volumePatterns = [
        /Volume:\s*([0-9,]+)/i,
        /Traded Volume:\s*([0-9,]+)/i
    ];

    for (const pattern of volumePatterns) {
        const match = document.body.innerText.match(pattern);
        if (match) {
            stockInfo.volume = parseInt(match[1].replace(/,/g, ''));
            break;
        }
    }

    return stockInfo;
}

// Add a context menu item for stock analysis
chrome.runtime.sendMessage({
    type: 'CREATE_CONTEXT_MENU'
}); 