// Stock Market Prediction Game
const API_KEY = '412ABI8A8XAN7GBU';
const ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query';

// Game state
let gameState = {
    stockData: null,
    currentTicker: '',
    startDate: null,
    currentDate: null,
    currentIndex: 0,
    score: 0,
    chart: null,
    gameStarted: false,
    prediction: null
};

// DOM elements
const elements = {
    tickerInput: document.getElementById('tickerInput'),
    messages: document.getElementById('messages'),
    gameContent: document.getElementById('gameContent'),
    currentStock: document.getElementById('currentStock'),
    currentDate: document.getElementById('currentDate'),
    score: document.getElementById('score'),
    currentPrice: document.getElementById('currentPrice'),
    predictionSection: document.getElementById('predictionSection'),
    resultSection: document.getElementById('resultSection'),
    predictionResult: document.getElementById('predictionResult'),
    nextDayBtn: document.getElementById('nextDayBtn')
};

// Utility functions
function showMessage(message, type = 'info') {
    elements.messages.innerHTML = `<div class="message ${type}">${message}</div>`;
}

function showLoading() {
    elements.messages.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading stock data...</p>
        </div>
    `;
}

function clearMessages() {
    elements.messages.innerHTML = '';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
}

// Date utility functions
function isWeekday(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
}

function isHoliday(date) {
    // Simple holiday check for major US holidays
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // New Year's Day
    if (month === 0 && day === 1) return true;
    
    // Independence Day
    if (month === 6 && day === 4) return true;
    
    // Christmas
    if (month === 11 && day === 25) return true;
    
    // Thanksgiving (4th Thursday of November)
    if (month === 10) {
        const firstThursday = new Date(year, 10, 1);
        while (firstThursday.getDay() !== 4) {
            firstThursday.setDate(firstThursday.getDate() + 1);
        }
        const thanksgiving = new Date(firstThursday);
        thanksgiving.setDate(thanksgiving.getDate() + 21); // 4th Thursday
        if (day === thanksgiving.getDate()) return true;
    }
    
    return false;
}

function getRandomStartDate() {
    const today = new Date();
    const minDaysAgo = 7;
    const maxDaysAgo = 100;
    
    let attempts = 0;
    let startDate;
    
    do {
        const daysAgo = Math.floor(Math.random() * (maxDaysAgo - minDaysAgo + 1)) + minDaysAgo;
        startDate = new Date(today);
        startDate.setDate(today.getDate() - daysAgo);
        attempts++;
    } while ((!isWeekday(startDate) || isHoliday(startDate)) && attempts < 100);
    
    return startDate;
}

// API functions
async function fetchStockData(ticker) {
    try {
        const url = `${ALPHA_VANTAGE_URL}?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${API_KEY}&outputsize=full`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data['Error Message']) {
            throw new Error('Invalid stock ticker symbol');
        }
        
        if (data['Note']) {
            throw new Error('API call frequency limit reached. Please try again later.');
        }
        
        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) {
            throw new Error('No data available for this stock ticker');
        }
        
        return timeSeries;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
}

function processStockData(timeSeries, startDate) {
    const dataPoints = [];
    const sortedDates = Object.keys(timeSeries).sort();
    
    // Find the start date index
    const startDateStr = startDate.toISOString().split('T')[0];
    let startIndex = sortedDates.findIndex(date => date >= startDateStr);
    
    // If exact date not found, find the next available date
    if (startIndex === -1) {
        startIndex = sortedDates.length - 1;
    }
    
    // Get 7 days before start date + start date + several days after for prediction
    const requiredDates = sortedDates.slice(Math.max(0, startIndex - 7), startIndex + 30);
    
    requiredDates.forEach(date => {
        const dayData = timeSeries[date];
        dataPoints.push({
            date: date,
            open: parseFloat(dayData['1. open']),
            high: parseFloat(dayData['2. high']),
            low: parseFloat(dayData['3. low']),
            close: parseFloat(dayData['4. close']),
            volume: parseInt(dayData['5. volume'])
        });
    });
    
    return dataPoints;
}

// Chart functions
function createChart(data) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    if (gameState.chart) {
        gameState.chart.destroy();
    }
    
    const chartData = {
        labels: data.map(point => point.date),
        datasets: [{
            label: `${gameState.currentTicker} Stock Price`,
            data: data.map(point => point.close),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };
    
    gameState.chart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Price ($)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `Price: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function updateChart() {
    if (!gameState.chart || !gameState.stockData) return;
    
    const visibleData = gameState.stockData.slice(0, gameState.currentIndex + 1);
    gameState.chart.data.labels = visibleData.map(point => point.date);
    gameState.chart.data.datasets[0].data = visibleData.map(point => point.close);
    gameState.chart.update('none');
}

// Game functions
async function startGame() {
    const ticker = elements.tickerInput.value.trim().toUpperCase();
    
    if (!ticker) {
        showMessage('Please enter a stock ticker symbol', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Fetch stock data
        const timeSeries = await fetchStockData(ticker);
        
        // Generate random start date
        const startDate = getRandomStartDate();
        
        // Process data
        const processedData = processStockData(timeSeries, startDate);
        
        if (processedData.length < 8) {
            throw new Error('Not enough historical data available for this stock');
        }
        
        // Initialize game state
        gameState.stockData = processedData;
        gameState.currentTicker = ticker;
        gameState.startDate = startDate;
        gameState.currentIndex = 7; // Start showing 7 days of history
        gameState.currentDate = processedData[gameState.currentIndex].date;
        gameState.score = 0;
        gameState.gameStarted = true;
        gameState.prediction = null;
        
        // Update UI
        clearMessages();
        elements.gameContent.classList.remove('hidden');
        elements.currentStock.textContent = ticker;
        elements.currentDate.textContent = formatDate(gameState.currentDate);
        elements.score.textContent = gameState.score;
        elements.currentPrice.textContent = formatPrice(gameState.stockData[gameState.currentIndex].close);
        
        // Create chart with initial data
        const initialData = gameState.stockData.slice(0, gameState.currentIndex + 1);
        createChart(initialData);
        
        // Show prediction section
        elements.predictionSection.classList.remove('hidden');
        elements.resultSection.classList.add('hidden');
        
        showMessage(`Game started! Predict whether ${ticker} will go up or down tomorrow.`, 'success');
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function makePrediction(direction) {
    if (!gameState.gameStarted || gameState.prediction !== null) return;
    
    gameState.prediction = direction;
    
    // Check if we have next day data
    if (gameState.currentIndex + 1 >= gameState.stockData.length) {
        showMessage('No more data available for prediction. Game over!', 'info');
        return;
    }
    
    const currentPrice = gameState.stockData[gameState.currentIndex].close;
    const nextPrice = gameState.stockData[gameState.currentIndex + 1].close;
    const actualDirection = nextPrice > currentPrice ? 'up' : 'down';
    
    const isCorrect = gameState.prediction === actualDirection;
    if (isCorrect) {
        gameState.score++;
    }
    
    // Update UI
    elements.score.textContent = gameState.score;
    
    const resultMessage = isCorrect 
        ? `🎉 Correct! The price went ${actualDirection.toUpperCase()}.`
        : `❌ Wrong! The price went ${actualDirection.toUpperCase()}.`;
    
    const priceChange = nextPrice - currentPrice;
    const percentChange = ((priceChange / currentPrice) * 100).toFixed(2);
    const changeText = priceChange >= 0 ? `+$${priceChange.toFixed(2)}` : `-$${Math.abs(priceChange).toFixed(2)}`;
    
    elements.predictionResult.innerHTML = `
        <div class="message ${isCorrect ? 'success' : 'error'}">
            ${resultMessage}<br>
            Price changed from ${formatPrice(currentPrice)} to ${formatPrice(nextPrice)} (${changeText}, ${percentChange}%)
        </div>
    `;
    
    // Hide prediction section, show result section
    elements.predictionSection.classList.add('hidden');
    elements.resultSection.classList.remove('hidden');
}

function nextDay() {
    if (!gameState.gameStarted) return;
    
    // Move to next day
    gameState.currentIndex++;
    
    // Check if we have more data
    if (gameState.currentIndex >= gameState.stockData.length) {
        showMessage('No more data available. Game over!', 'info');
        return;
    }
    
    // Update current date and price
    gameState.currentDate = gameState.stockData[gameState.currentIndex].date;
    elements.currentDate.textContent = formatDate(gameState.currentDate);
    elements.currentPrice.textContent = formatPrice(gameState.stockData[gameState.currentIndex].close);
    
    // Update chart
    updateChart();
    
    // Reset prediction
    gameState.prediction = null;
    
    // Show prediction section again
    elements.predictionSection.classList.remove('hidden');
    elements.resultSection.classList.add('hidden');
    
    // Check if we can make another prediction
    if (gameState.currentIndex + 1 >= gameState.stockData.length) {
        elements.predictionSection.innerHTML = `
            <h3>Game Over!</h3>
            <p>Final Score: ${gameState.score} correct predictions</p>
            <button class="btn btn-primary" onclick="resetGame()">Play Again</button>
        `;
    }
}

function resetGame() {
    // Reset game state
    gameState = {
        stockData: null,
        currentTicker: '',
        startDate: null,
        currentDate: null,
        currentIndex: 0,
        score: 0,
        chart: null,
        gameStarted: false,
        prediction: null
    };
    
    // Reset UI
    elements.gameContent.classList.add('hidden');
    elements.tickerInput.value = '';
    clearMessages();
    
    // Destroy chart
    if (gameState.chart) {
        gameState.chart.destroy();
        gameState.chart = null;
    }
}

// Event listeners
elements.tickerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        startGame();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Stock Market Prediction Game loaded');
});