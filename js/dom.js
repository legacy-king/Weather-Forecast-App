// ================================================================
// DOM.JS - Handles all DOM manipulation and UI updates
// ================================================================

// ================================
// DOM ELEMENT REFERENCES
// ================================

const elements = {
  // Form elements
  weatherForm: document.getElementById('weatherForm'),
  locationInput: document.getElementById('locationInput'),
  unitToggle: document.getElementById('unitToggle'),
  
  // Display sections
  loadingIndicator: document.getElementById('loadingIndicator'),
  errorMessage: document.getElementById('errorMessage'),
  errorText: document.getElementById('errorText'),
  weatherDisplay: document.getElementById('weatherDisplay'),
  
  // Current weather elements
  locationName: document.querySelector('#locationName span'),
  currentDate: document.getElementById('currentDate'),
  currentTemp: document.getElementById('currentTemp'),
  tempUnit: document.getElementById('tempUnit'),
  weatherIcon: document.getElementById('weatherIcon'),
  weatherCondition: document.getElementById('weatherCondition'),
  feelsLike: document.getElementById('feelsLike'),
  humidity: document.getElementById('humidity'),
  windSpeed: document.getElementById('windSpeed'),
  visibility: document.getElementById('visibility'),
  pressure: document.getElementById('pressure'),
  uvIndex: document.getElementById('uvIndex'),
  
  // GIF elements
  weatherGif: document.getElementById('weatherGif'),
  gifImage: document.getElementById('gifImage'),
  gifCondition: document.getElementById('gifCondition'),
  
  // Forecast container
  forecastContainer: document.getElementById('forecastContainer')
};

// ================================
// UI STATE MANAGEMENT
// ================================

/**
 * Shows the loading indicator and hides other sections
 */
function showLoading() {
  console.log('⏳ Showing loading indicator');
  
  elements.loadingIndicator.classList.remove('hidden');
  elements.errorMessage.classList.add('hidden');
  elements.weatherDisplay.classList.add('hidden');
}

/**
 * Hides the loading indicator
 */
function hideLoading() {
  console.log('✅ Hiding loading indicator');
  elements.loadingIndicator.classList.add('hidden');
}

/**
 * Displays an error message to the user
 * @param {string} message - Error message to display
 */
function showError(message) {
  console.log('❌ Showing error:', message);
  
  elements.errorText.textContent = message;
  elements.errorMessage.classList.remove('hidden');
  elements.weatherDisplay.classList.add('hidden');
  hideLoading();
}

/**
 * Hides the error message
 */
function hideError() {
  elements.errorMessage.classList.add('hidden');
}

/**
 * Shows the weather display section
 */
function showWeatherDisplay() {
  console.log('🌤️ Showing weather display');
  
  elements.weatherDisplay.classList.remove('hidden');
  hideError();
  hideLoading();
}

// ================================
// WEATHER DISPLAY FUNCTIONS
// ================================

/**
 * Updates all weather information on the page
 * @param {Object} weatherData - Processed weather data
 * @param {string} currentUnit - Current temperature unit ('C' or 'F')
 */
function displayWeather(weatherData, currentUnit = 'C') {
  console.log('🎨 Updating weather display');
  
  // Update location and date
  elements.locationName.textContent = weatherData.location.name;
  elements.currentDate.textContent = formatDate(weatherData.current.datetime);
  
  // Update temperature display
  elements.currentTemp.textContent = weatherData.current.temp;
  elements.tempUnit.textContent = `°${currentUnit}`;
  
  // Update weather icon and condition
  elements.weatherIcon.src = getWeatherIconUrl(weatherData.current.icon);
  elements.weatherIcon.alt = weatherData.current.conditions;
  elements.weatherCondition.textContent = weatherData.current.conditions;
  
  // Update weather details
  elements.feelsLike.textContent = `${weatherData.current.feelsLike}°${currentUnit}`;
  elements.humidity.textContent = `${weatherData.current.humidity}%`;
  elements.windSpeed.textContent = `${weatherData.current.windSpeed} ${currentUnit === 'C' ? 'km/h' : 'mph'}`;
  elements.visibility.textContent = `${weatherData.current.visibility} ${currentUnit === 'C' ? 'km' : 'mi'}`;
  elements.pressure.textContent = `${weatherData.current.pressure} mb`;
  elements.uvIndex.textContent = weatherData.current.uvIndex;
  
  // Update 7-day forecast
  displayForecast(weatherData.forecast, currentUnit);
  
  // Change page background based on weather
  updatePageBackground(weatherData.current.icon);
  
  // Show the weather display
  showWeatherDisplay();
  
  console.log('✅ Weather display updated');
}

/**
 * Displays the 7-day forecast
 * @param {Array} forecastData - Array of forecast day objects
 * @param {string} unit - Temperature unit ('C' or 'F')
 */
function displayForecast(forecastData, unit = 'C') {
  console.log('📅 Updating forecast display');
  
  // Clear existing forecast cards
  elements.forecastContainer.innerHTML = '';
  
  // Create a card for each forecast day
  forecastData.forEach(day => {
    const card = createForecastCard(day, unit);
    elements.forecastContainer.appendChild(card);
  });
}

/**
 * Creates a forecast card element
 * @param {Object} dayData - Single day forecast data
 * @param {string} unit - Temperature unit
 * @returns {HTMLElement} - Forecast card element
 */
function createForecastCard(dayData, unit) {
  // Create the card container
  const card = document.createElement('div');
  card.className = 'forecast-card';
  
  // Get day of week
  const dayName = getDayOfWeek(dayData.date);
  
  // Build the card HTML
  card.innerHTML = `
    <div class="forecast-day">${dayName}</div>
    <img 
      src="${getWeatherIconUrl(dayData.icon)}" 
      alt="${dayData.conditions}"
      class="forecast-icon"
    >
    <div class="forecast-condition">${dayData.conditions}</div>
    <div class="forecast-temps">
      <span class="temp-high">${dayData.tempMax}°</span>
      <span class="temp-low">${dayData.tempMin}°</span>
    </div>
  `;
  
  // Add click event for more details (optional enhancement)
  card.addEventListener('click', () => {
    console.log('📊 Forecast day clicked:', dayName);
    // You could show more details in a modal or expanded view
  });
  
  return card;
}

/**
 * Displays a weather GIF
 * @param {Object} gifData - GIF data from Giphy API
 */
function displayWeatherGif(gifData) {
  if (!gifData) {
    // Hide GIF section if no GIF available
    elements.weatherGif.classList.add('hidden');
    return;
  }
  
  console.log('🎬 Displaying weather GIF');
  
  elements.gifImage.src = gifData.url;
  elements.gifImage.alt = gifData.title;
  elements.gifCondition.textContent = gifData.condition;
  
  elements.weatherGif.classList.remove('hidden');
}

// ================================
// PAGE STYLING FUNCTIONS
// ================================

/**
 * Updates the page background based on weather conditions
 * @param {string} iconCode - Weather icon code from API
 */
function updatePageBackground(iconCode) {
  console.log('🎨 Updating page background for:', iconCode);
  
  // Get weather category
  const category = getWeatherCategory(iconCode);
  
  // Remove all weather classes
  document.body.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'clear-night');
  
  // Add the appropriate class
  document.body.classList.add(category);
  
  console.log('✅ Applied background class:', category);
}

// ================================
// TEMPERATURE UNIT TOGGLE
// ================================

/**
 * Updates the temperature unit display throughout the page
 * @param {Object} weatherData - Current weather data
 * @param {string} newUnit - New temperature unit ('C' or 'F')
 */
function updateTemperatureUnit(weatherData, newUnit) {
  console.log(`🌡️ Converting temperatures to ${newUnit}`);
  
  const oldUnit = newUnit === 'C' ? 'F' : 'C';
  
  // Convert and update current temperature
  const newTemp = convertTemperature(weatherData.current.temp, oldUnit, newUnit);
  const newFeelsLike = convertTemperature(weatherData.current.feelsLike, oldUnit, newUnit);
  
  elements.currentTemp.textContent = newTemp;
  elements.feelsLike.textContent = `${newFeelsLike}°${newUnit}`;
  elements.tempUnit.textContent = `°${newUnit}`;
  
  // Update wind speed and visibility units
  const speedUnit = newUnit === 'C' ? 'km/h' : 'mph';
  const distanceUnit = newUnit === 'C' ? 'km' : 'mi';
  
  elements.windSpeed.textContent = `${weatherData.current.windSpeed} ${speedUnit}`;
  elements.visibility.textContent = `${weatherData.current.visibility} ${distanceUnit}`;
  
  // Update forecast temperatures
  const forecastCards = elements.forecastContainer.querySelectorAll('.forecast-card');
  forecastCards.forEach((card, index) => {
    const dayData = weatherData.forecast[index];
    const highTemp = convertTemperature(dayData.tempMax, oldUnit, newUnit);
    const lowTemp = convertTemperature(dayData.tempMin, oldUnit, newUnit);
    
    card.querySelector('.temp-high').textContent = `${highTemp}°`;
    card.querySelector('.temp-low').textContent = `${lowTemp}°`;
  });
  
  // Update toggle button UI
  updateToggleButton(newUnit);
  
  console.log(`✅ Temperatures converted to ${newUnit}`);
}

/**
 * Updates the visual state of the unit toggle button
 * @param {string} activeUnit - Currently active unit ('C' or 'F')
 */
function updateToggleButton(activeUnit) {
  const toggleOptions = elements.unitToggle.querySelectorAll('.toggle-option');
  
  toggleOptions.forEach(option => {
    const optionText = option.textContent.trim();
    
    if ((activeUnit === 'C' && optionText === '°C') || 
        (activeUnit === 'F' && optionText === '°F')) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

// ================================
// INPUT HANDLING
// ================================

/**
 * Gets the current location input value
 * @returns {string} - Trimmed location input
 */
function getLocationInput() {
  return elements.locationInput.value.trim();
}

/**
 * Clears the location input
 */
function clearLocationInput() {
  elements.locationInput.value = '';
}

/**
 * Gets the current temperature unit preference
 * @returns {string} - Current unit ('C' or 'F')
 */
function getCurrentUnit() {
  const dataUnit = elements.unitToggle.dataset.unit;
  return dataUnit === 'celsius' ? 'C' : 'F';
}

/**
 * Sets the temperature unit preference
 * @param {string} unit - Unit to set ('C' or 'F')
 */
function setCurrentUnit(unit) {
  elements.unitToggle.dataset.unit = unit === 'C' ? 'celsius' : 'fahrenheit';
}

// ================================
// ANIMATION HELPERS
// ================================

/**
 * Adds a smooth fade-in animation to an element
 * @param {HTMLElement} element - Element to animate
 */
function fadeIn(element) {
  element.style.opacity = '0';
  element.classList.remove('hidden');
  
  setTimeout(() => {
    element.style.transition = 'opacity 0.5s ease';
    element.style.opacity = '1';
  }, 10);
}

// ================================
// CONSOLE LOG HELPER
// ================================

console.log('%c🎨 DOM Module Loaded', 'color: purple; font-weight: bold; font-size: 14px');
console.log('Available functions:', {
  showLoading: 'Show loading indicator',
  showError: 'Display error message',
  displayWeather: 'Update all weather information',
  displayWeatherGif: 'Show weather GIF',
  updateTemperatureUnit: 'Convert temperature units',
  getLocationInput: 'Get user input',
  getCurrentUnit: 'Get current unit preference'
});