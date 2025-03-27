# Stock Analysis Agent Chrome Extension

A Chrome extension that provides AI-powered stock analysis for Indian stock exchanges (NSE and BSE).

## Features

- Real-time stock price analysis
- Historical data visualization
- Company information and fundamentals
- AI-powered insights and projections
- Support for both NSE and BSE exchanges

## Setup Instructions

1. Clone this repository or download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. Replace `YOUR_API_KEY` in `popup.js` with your actual API key for the LLM service

## Usage

1. Click the extension icon in your Chrome toolbar
2. Enter a stock symbol (e.g., "RELIANCE" for Reliance Industries)
3. Select the exchange (NSE or BSE)
4. Click "Analyze Stock" to get AI-powered analysis

## Technical Details

The extension uses an LLM-based agent system that:
1. Takes user queries about stocks
2. Makes multiple API calls to gather data
3. Processes the data through the LLM
4. Provides comprehensive analysis and insights

## Dependencies

- Chrome browser
- API key for LLM service
- Internet connection for real-time data

## Note

This is a demo version with placeholder data. For production use, you'll need to:
1. Implement real stock API endpoints
2. Add proper error handling
3. Implement rate limiting
4. Add user authentication
5. Add proper data caching

## License

MIT License 