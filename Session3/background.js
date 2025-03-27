// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Stock Analysis Agent Extension installed');
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_STOCK_DATA') {
        // Handle stock data requests
        // This is where you would make actual API calls to stock data providers
        sendResponse({ success: true });
    }
    return true; // Will respond asynchronously
}); 