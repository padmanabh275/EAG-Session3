document.addEventListener('DOMContentLoaded', function() {
    // Get the result div element
    const resultDiv = document.getElementById('result');
    
    // Make sure the element exists before proceeding
    if (!resultDiv) {
        console.error('Result div not found! Check your HTML.');
        return;
    }

    try {
        // Initialize the agent with your API keys
        const agent = new StockAnalysisAgent(
            'AIzaSyD5-pnWcuac8gRUeOnMiXleStD5DKTEgkw',  // Replace with your actual Gemini API key
            'TZG8A32K00JY1NZJ' // Replace with your actual Alpha Vantage key
        );

        // Get the analyze button
        const analyzeButton = document.getElementById('analyzeButton');
        
        if (!analyzeButton) {
            throw new Error('Analyze button not found! Check your HTML.');
        }

        analyzeButton.addEventListener('click', async () => {
            const symbolInput = document.getElementById('stockSymbol');
            
            if (!symbolInput) {
                throw new Error('Stock symbol input not found! Check your HTML.');
            }

            const symbol = symbolInput.value.toUpperCase();
            
            // Show loading state
            resultDiv.innerHTML = '<p>Analyzing stock...</p>';
            
            try {
                const result = await agent.analyzeStock(symbol);
                
                if (result.status === 'error') {
                    resultDiv.innerHTML = `
                        <div class="error">
                            <h3>Error</h3>
                            <p>${result.data.error}</p>
                            <p>Time: ${result.data.timestamp}</p>
                        </div>`;
                    return;
                }

                // Display results including logs
                resultDiv.innerHTML = `
                    <div class="analysis-header">
                        <h2>${symbol} Analysis</h2>
                        <p class="timestamp">Generated: ${result.data.timestamp}</p>
                    </div>
                    <div class="charts-container">
                        ${result.data.charts}
                    </div>
                    <div class="analysis-content">
                        ${result.data.analysis.join('\n')}
                    </div>
                    <div class="logs-section">
                        <h3>Analysis Logs</h3>
                        <div class="logs-summary">
                            <p>Total Interactions: ${result.data.logs.summary.totalInteractions}</p>
                            <p>Requests: ${result.data.logs.summary.requests}</p>
                            <p>Responses: ${result.data.logs.summary.responses}</p>
                            <p>Errors: ${result.data.logs.summary.errors}</p>
                            <p>Tool Calls: ${result.data.logs.summary.toolCalls}</p>
                            <p>Average Response Time: ${result.data.logs.summary.averageResponseTime}ms</p>
                        </div>
                        <details>
                            <summary>Detailed Logs</summary>
                            <pre>${JSON.stringify(result.data.logs.logs, null, 2)}</pre>
                        </details>
                    </div>`;

            } catch (error) {
                resultDiv.innerHTML = `
                    <div class="error">
                        <h3>Error</h3>
                        <p>Analysis failed: ${error.message}</p>
                        <p>Time: ${new Date().toLocaleString()}</p>
                    </div>`;
            }
        });

    } catch (error) {
        // Handle initialization errors
        resultDiv.innerHTML = `
            <div class="error">
                <h3>Initialization Error</h3>
                <p>${error.message}</p>
                <p>Please check your API keys and try again.</p>
            </div>`;
    }
}); 