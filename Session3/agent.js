/**
 * StockAnalysisAgent Class
 * Provides comprehensive stock analysis using Gemini AI and market data
 * @class
 */
class StockAnalysisAgent {
    // Class Constants
    static RUPEE = '₹';
    static API_ENDPOINTS = {
        GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        ALPHA_VANTAGE: 'https://www.alphavantage.co/query'
    };

    static ANALYSIS_STAGES = {
        INITIAL: 'initial',
        TECHNICAL: 'technical',
        FINAL: 'final'
    };

    /**
     * Creates a new StockAnalysisAgent instance
     * @param {string} geminiKey - The Gemini API key
     * @param {string} alphaVantageKey - The Alpha Vantage API key
     */
    constructor(geminiKey, alphaVantageKey) {
        this.validateApiKeys(geminiKey);
        this.geminiKey = geminiKey;
        this.alphaVantageKey = alphaVantageKey;
        this.conversationHistory = [];
        this.analysisStage = StockAnalysisAgent.ANALYSIS_STAGES.INITIAL;
        this.logs = [];  // Add logs array
    }

    /**
     * Validates the provided API keys
     * @private
     * @param {string} geminiKey - The Gemini API key to validate
     */
    validateApiKeys(geminiKey) {
        if (!geminiKey || typeof geminiKey !== 'string' || geminiKey.trim().length === 0) {
            throw new Error('Please provide a valid Gemini API key');
        }
    }

    /**
     * Main analysis method following the conversation pattern
     * @param {string} symbol - The stock symbol to analyze
     */
    async analyzeStock(symbol) {
        try {
            // First Turn
            const marketData = await this.executeToolCall('getMarketData', symbol);
            this.addToHistory('tool', 'Market Data Retrieved', marketData);
            
            const initialQuery = this.generateInitialQuery(symbol, marketData);
            this.addToHistory('user', initialQuery);
            
            const initialResponse = await this.getGeminiResponse(initialQuery);
            this.addToHistory('assistant', initialResponse);

            // Second Turn
            const technicalData = await this.executeToolCall('getTechnicalIndicators', symbol);
            this.addToHistory('tool', 'Technical Indicators Retrieved', technicalData);
            
            const technicalQuery = this.generateTechnicalQuery(symbol, technicalData);
            this.addToHistory('user', technicalQuery);
            
            const technicalResponse = await this.getGeminiResponse(technicalQuery);
            this.addToHistory('assistant', technicalResponse);

            // Third Turn
            const fundamentalData = await this.executeToolCall('getFundamentalData', symbol);
            this.addToHistory('tool', 'Fundamental Data Retrieved', fundamentalData);
            
            const finalQuery = this.generateFinalQuery(symbol);
            this.addToHistory('user', finalQuery);
            
            const finalResponse = await this.getGeminiResponse(finalQuery);
            this.addToHistory('assistant', finalResponse);

            // Generate final result with charts
            const charts = this.generateCharts(symbol);
            return this.formatSuccessResponse(symbol, {
                marketData,
                technicalData,
                fundamentalData
            }, finalResponse, charts);

        } catch (error) {
            console.error('Analysis error:', error);
            return this.formatErrorResponse(symbol, error);
        }
    }

    /**
     * Execute tool calls and handle results
     * @private
     */
    async executeToolCall(toolName, symbol) {
        this.logLLMInteraction('TOOL_CALL', {
            tool: toolName,
            symbol: symbol,
            timestamp: new Date().toLocaleString()
        });

        switch (toolName) {
            case 'getMarketData':
                return await this.getMarketData(symbol);
            
            case 'getTechnicalIndicators':
                return await this.getTechnicalIndicators(symbol);
            
            case 'getFundamentalData':
                return await this.getFundamentalData(symbol);
            
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }

    /**
     * Get technical indicators data
     * @private
     */
    async getTechnicalIndicators(symbol) {
        try {
            const response = await fetch(
                `${StockAnalysisAgent.API_ENDPOINTS.ALPHA_VANTAGE}?function=TECHNICAL_INDICATORS&symbol=${symbol}.BSE&apikey=${this.alphaVantageKey}`
            );

            if (!response.ok) {
                throw new Error(`Technical indicators API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                rsi: data.rsi || 'N/A',
                macd: data.macd || 'N/A',
                sma: data.sma || 'N/A',
                timestamp: new Date().toLocaleString()
            };
        } catch (error) {
            console.error('Technical indicators error:', error);
            return this.getDefaultTechnicalData();
        }
    }

    /**
     * Get fundamental data
     * @private
     */
    async getFundamentalData(symbol) {
        try {
            const response = await fetch(
                `${StockAnalysisAgent.API_ENDPOINTS.ALPHA_VANTAGE}?function=OVERVIEW&symbol=${symbol}.BSE&apikey=${this.alphaVantageKey}`
            );

            if (!response.ok) {
                throw new Error(`Fundamental data API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                pe: data.PERatio || 'N/A',
                eps: data.EPS || 'N/A',
                marketCap: data.MarketCapitalization || 'N/A',
                timestamp: new Date().toLocaleString()
            };
        } catch (error) {
            console.error('Fundamental data error:', error);
            return this.getDefaultFundamentalData();
        }
    }

    /**
     * Generate query with full conversation context
     * @private
     */
    generateInitialQuery(symbol, marketData) {
        return `Initial Analysis Request for ${symbol}

Market Data:
${JSON.stringify(marketData, null, 2)}

Provide initial market assessment focusing on current price action and trends.`;
    }

    generateTechnicalQuery(symbol, technicalData) {
        return `Technical Analysis for ${symbol}

Previous Conversation:
${this.formatConversationHistory()}

Technical Indicators:
${JSON.stringify(technicalData, null, 2)}

Analyze these technical indicators and provide insights.`;
    }

    generateFinalQuery(symbol) {
        return `Final Analysis for ${symbol}

Complete Conversation History:
${this.formatConversationHistory()}

Synthesize all previous analyses and provide a comprehensive final assessment.`;
    }

    /**
     * Format conversation history with tool results
     * @private
     */
    formatConversationHistory() {
        return this.conversationHistory
            .map(interaction => {
                if (interaction.role === 'tool') {
                    return `TOOL (${interaction.toolName}): ${JSON.stringify(interaction.result, null, 2)}`;
                }
                return `${interaction.role.toUpperCase()}: ${interaction.content}`;
            })
            .join('\n\n');
    }

    /**
     * Add to conversation history with tool support
     * @private
     */
    addToHistory(role, content, toolResult = null) {
        const entry = {
            role,
            timestamp: new Date().toLocaleString()
        };

        if (role === 'tool') {
            entry.toolName = content;
            entry.result = toolResult;
        } else {
            entry.content = content.trim();
        }

        this.conversationHistory.push(entry);
    }

    /**
     * Log LLM interactions and responses
     * @private
     */
    logLLMInteraction(type, data) {
        const logEntry = {
            timestamp: new Date().toLocaleString(),
            type,
            data,
        };
        this.logs.push(logEntry);
        console.log(`[${type}]`, data);  // Also log to console
    }

    /**
     * Get LLM response with logging
     * @private
     */
    async getGeminiResponse(query) {
        const requestBody = {
            contents: [{
                role: "user",
                parts: [{
                    text: query
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
            }
        };

        try {
            // Log the request
            this.logLLMInteraction('REQUEST', {
                endpoint: StockAnalysisAgent.API_ENDPOINTS.GEMINI,
                body: requestBody
            });

            const response = await fetch(
                `${StockAnalysisAgent.API_ENDPOINTS.GEMINI}?key=${this.geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                this.logLLMInteraction('ERROR', {
                    status: response.status,
                    error: errorText
                });
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            // Log the response
            this.logLLMInteraction('RESPONSE', {
                data: data
            });

            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response format from Gemini API');
            }

            const responseText = data.candidates[0].content.parts[0].text;
            
            // Log the processed response
            this.logLLMInteraction('PROCESSED_RESPONSE', {
                text: responseText
            });

            return responseText;
        } catch (error) {
            this.logLLMInteraction('ERROR', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async getMarketData(symbol) {
        try {
            const response = await fetch(
                `${StockAnalysisAgent.API_ENDPOINTS.ALPHA_VANTAGE}?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${this.alphaVantageKey}`
            );

            if (!response.ok) {
                throw new Error(`Alpha Vantage API error: ${response.status}`);
            }

            const data = await response.json();
            return this.parseMarketData(data);
        } catch (error) {
            console.error('Market data error:', error);
            return this.getDefaultMarketData();
        }
    }

    parseMarketData(data) {
        const quote = data['Global Quote'];
        return {
            price: quote?.['05. price'] || 'N/A',
            change: quote?.['09. change'] || 'N/A',
            changePercent: quote?.['10. change percent'] || 'N/A',
            volume: quote?.['06. volume'] || 'N/A',
            timestamp: new Date().toLocaleString()
        };
    }

    getDefaultMarketData() {
        return {
            price: 'N/A',
            change: 'N/A',
            changePercent: 'N/A',
            volume: 'N/A',
            timestamp: new Date().toLocaleString()
        };
    }

    generateCharts(symbol) {
        return `
            <div class="tradingview-widget-container">
                <div id="tradingview_${symbol}"></div>
                <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
                <script type="text/javascript">
                    new TradingView.widget({
                        "width": "100%",
                        "height": 500,
                        "symbol": "BSE:${symbol}",
                        "interval": "D",
                        "timezone": "Asia/Kolkata",
                        "theme": "light",
                        "style": "1",
                        "locale": "in",
                        "toolbar_bg": "#f1f3f6",
                        "enable_publishing": false,
                        "allow_symbol_change": true,
                        "container_id": "tradingview_${symbol}",
                        "studies": [
                            "MASimple@tv-basicstudies",
                            "RSI@tv-basicstudies",
                            "MACD@tv-basicstudies"
                        ]
                    });
                </script>
            </div>
        `;
    }

    formatAnalysis(text) {
        // Split the analysis into sections
        const sections = text.split('\n\n').map(section => {
            // Format headers
            if (section.match(/^\d+\./)) {
                return `<h3>${section}</h3>`;
            }
            
            // Format bullet points
            if (section.includes('* ')) {
                const lines = section.split('\n');
                return `<ul>${lines.map(line => 
                    line.trim().startsWith('* ') ? 
                        `<li>${line.substring(2)}</li>` : 
                        `<p>${line}</p>`
                ).join('')}</ul>`;
            }
            
            // Regular paragraphs
            return `<p>${section}</p>`;
        });

        return sections;
    }

    /**
     * Formats the success response
     * @private
     * @param {string} symbol - The stock symbol
     * @param {Object} marketData - Current market data
     * @param {string} analysis - The analysis text
     * @param {string} charts - The charts HTML
     * @returns {Object} Formatted response
     */
    formatSuccessResponse(symbol, marketData, analysis, charts) {
        return {
            status: 'success',
            data: {
                symbol,
                timestamp: new Date().toLocaleString(),
                marketData: this.formatMarketData(marketData),
                analysis: this.formatAnalysis(analysis),
                charts,
                conversationHistory: this.conversationHistory,
                logs: this.getLogs()  // Include logs in response
            }
        };
    }

    /**
     * Formats market data for display
     * @private
     * @param {Object} marketData - The market data to format
     * @returns {Object} Formatted market data
     */
    formatMarketData(marketData) {
        return {
            price: `${StockAnalysisAgent.RUPEE}${marketData.price}`,
            change: marketData.change,
            changePercent: marketData.changePercent,
            volume: this.formatVolume(marketData.volume),
            timestamp: marketData.timestamp
        };
    }

    /**
     * Formats volume numbers
     * @private
     * @param {string|number} volume - The volume to format
     * @returns {string} Formatted volume
     */
    formatVolume(volume) {
        if (volume === 'N/A') return volume;
        const num = parseInt(volume);
        if (isNaN(num)) return volume;
        
        if (num >= 10000000) return `${(num / 10000000).toFixed(2)}Cr`;
        if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
        return num.toLocaleString();
    }

    formatErrorResponse(symbol, error) {
        return {
            status: 'error',
            data: {
                symbol,
                timestamp: new Date().toLocaleString(),
                error: error.message
            }
        };
    }

    /**
     * Get all logs
     * @public
     */
    getLogs() {
        return {
            logs: this.logs,
            summary: this.getLogsSummary()
        };
    }

    /**
     * Get logs summary
     * @private
     */
    getLogsSummary() {
        const summary = {
            totalInteractions: this.logs.length,
            requests: 0,
            responses: 0,
            errors: 0,
            toolCalls: 0,
            averageResponseTime: 0
        };

        let totalResponseTime = 0;
        let lastRequestTime = null;

        this.logs.forEach(log => {
            switch (log.type) {
                case 'REQUEST':
                    summary.requests++;
                    lastRequestTime = new Date(log.timestamp);
                    break;
                case 'RESPONSE':
                    summary.responses++;
                    if (lastRequestTime) {
                        const responseTime = new Date(log.timestamp) - lastRequestTime;
                        totalResponseTime += responseTime;
                    }
                    break;
                case 'ERROR':
                    summary.errors++;
                    break;
                case 'TOOL_CALL':
                    summary.toolCalls++;
                    break;
            }
        });

        if (summary.responses > 0) {
            summary.averageResponseTime = totalResponseTime / summary.responses;
        }

        return summary;
    }
}

// Export the class
window.StockAnalysisAgent = StockAnalysisAgent; 