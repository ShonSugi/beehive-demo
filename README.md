# 📈 Stock Market Prediction Game

A fun and interactive web game where you predict whether stock prices will go up or down! Test your market intuition and see how well you can predict short-term stock movements.

## 🎮 How to Play

1. **Enter a Stock Ticker**: Input any valid stock ticker symbol (e.g., MSFT, AAPL, GOOGL)
2. **View Historical Data**: The game shows you 7 days of historical price data on an interactive chart
3. **Make Predictions**: Predict whether the stock price will go up or down the next day
4. **Track Your Score**: Earn points for correct predictions and see how well you perform over time
5. **Continue Playing**: Keep making predictions day by day to improve your score

## 🌟 Features

- **Real Stock Data**: Uses the Alpha Vantage API to fetch actual market data
- **Interactive Charts**: Beautiful line charts powered by Chart.js
- **Smart Date Selection**: Automatically selects random weekday start dates (avoiding holidays)
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Error Handling**: Validates stock tickers and provides helpful error messages
- **Modern UI**: Clean, gradient-based design with smooth animations

## 🚀 Live Demo

The game is deployed on GitHub Pages. Simply visit the deployed URL to start playing!

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for interactive data visualization
- **API**: Alpha Vantage for real-time stock market data
- **Deployment**: GitHub Pages with automated CI/CD

### Key Features
- **API Integration**: Fetches real-time stock data from Alpha Vantage
- **Date Logic**: Intelligent selection of trading days (weekdays, non-holidays)
- **Game Logic**: Tracks predictions, scores, and game state
- **Responsive Design**: Mobile-first CSS with flexbox and grid layouts
- **Error Handling**: Comprehensive validation and user feedback

### Game Logic
1. Random start date generation (1-100 days ago, weekdays only)
2. Fetches 7 days of historical data plus prediction days
3. Players make up/down predictions
4. Validates predictions against actual next-day prices
5. Updates score and continues to next trading day

## 🔧 Setup for Development

1. Clone the repository
2. No build process required - it's a static website!
3. Open `index.html` in your browser or serve with a local server
4. The game uses the included Alpha Vantage API key

## 📊 API Information

This game uses the Alpha Vantage API for stock market data:
- **Provider**: Alpha Vantage
- **Endpoint**: TIME_SERIES_DAILY
- **Data**: Daily open, high, low, close, and volume
- **Rate Limit**: 5 API requests per minute, 500 per day (free tier)

## 🎯 Game Rules

- Predictions are binary: UP or DOWN
- Score increases by 1 for each correct prediction
- Current date always reflects the latest day shown to the user
- Game continues until no more data is available
- Players can start a new game with different stocks anytime

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the MIT License.

---

**Have fun predicting the markets! 📈📉**