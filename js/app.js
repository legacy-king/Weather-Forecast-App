// ================================================================
// APP.JS - Main application logic and event handling
// ================================================================

console.log('%c🚀 Weather App Starting...', 'color: blue; font-weight: bold; font-size: 16px');

// ================================
// APPLICATION STATE
// ================================

/**
 * Stores the current weather data
 * This allows us to convert units without re-fetching
 */
let currentWeatherData = null;

/**
 * Stores the current temperature unit
 * 'C' for Celsius, 'F' for Fahrenheit
 */
let currentUnit = 'C'; // Default to Celsius

/**
 * Stores the API unit group for fetching
 * 'metric' for Celsius, 'us' for Fahrenheit
 */
let apiUnitGroup = 'metric';

// ================================
// MAIN WEATHER FETCH FUNCTION
// ================================

/**
 * Main function to fetch and display weather data
 * This is called when the user submits the search form
 * @param {string} location - Location to search for
 */
async function fetchAndDisplayWeather(location) {
  console.log(`%c🔍 Searching for weather in: ${location}`, 'color: green; font-weight: bold');
  
  // Step 1: Validate input
  if (!location) {
    showError('Please enter a location');
    return;
  }
  
  // Step 2: Show loading state
  showLoading();
  
  try {
    // Step 3: Fetch weather data from API
    console.log('📡 Fetching weather data...');
    const weatherData = await getWeatherData(location, apiUnitGroup);
    
    // Step 4: Store the data for unit conversion
    currentWeatherData = weatherData;
    
    console.log('✅ Weather data received:', weatherData);
    
    // Step 5: Display the weather information
    displayWeather(weatherData, currentUnit);
    
    // Step 6: Fetch and display weather GIF (optional, non-blocking)
    fetchAndDisplayGif(weatherData.current.conditions);
    
    console.log('✅ Weather display complete!');
    
  } catch (error) {
    // Step 7: Handle any errors gracefully
    console.error('❌ Error in fetchAndDisplayWeather:', error);
    showError(error.message || 'Failed to fetch weather data. Please try again.');
  }
}

/**
 * Fetches and displays a weather-related GIF
 * This runs asynchronously and doesn't block the weather display
 * @param {string} condition - Weather condition (e.g., "rainy", "sunny")
 */
async function fetchAndDisplayGif(condition) {
  // Skip if no Giphy API key is configured
  if (GIPHY_API_KEY === 'YOUR_GIPHY_API_KEY_HERE') {
    console.log('ℹ️ Giphy API key not configured, skipping GIF');
    return;
  }
  
  try {
    console.log('🎬 Fetching weather GIF...');
    const gifData = await getWeatherGif(condition);
    
    if (gifData) {
      displayWeatherGif(gifData);
      console.log('✅ GIF displayed');
    }
  } catch (error) {
    // GIF fetch failure is not critical, just log it
    console.log('ℹ️ Could not fetch GIF, continuing without it');
  }
}

// ================================
// EVENT HANDLERS
// ================================

/**
 * Handles the weather search form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
  // Prevent the default form submission (which would reload the page)
  event.preventDefault();
  
  console.log('📝 Form submitted');
  
  // Get the location from the input field
  const location = getLocationInput();
  
  // Fetch and display weather for this location
  fetchAndDisplayWeather(location);
}

/**
 * Handles the temperature unit toggle button click
 */
function handleUnitToggle() {
  console.log('🔄 Unit toggle clicked');
  
  // Check if we have weather data to convert
  if (!currentWeatherData) {
    console.log('ℹ️ No weather data to convert yet');
    return;
  }
  
  // Toggle between Celsius and Fahrenheit
  if (currentUnit === 'C') {
    currentUnit = 'F';
    apiUnitGroup = 'us';
  } else {
    currentUnit = 'C';
    apiUnitGroup = 'metric';
  }
  
  console.log(`🌡️ Switching to: ${currentUnit}`);
  
  // Store the preference
  setCurrentUnit(currentUnit);
  
  // Update the display with converted temperatures
  updateTemperatureUnit(currentWeatherData, currentUnit);
}

/**
 * Handles Enter key press in location input
 * @param {Event} event - Keypress event
 */
function handleInputKeypress(event) {
  // Submit form when Enter is pressed
  if (event.key === 'Enter') {
    event.preventDefault();
    handleFormSubmit(event);
  }
}

// ================================
// EVENT LISTENERS SETUP
// ================================

/**
 * Sets up all event listeners for the application
 */
function setupEventListeners() {
  console.log('🎯 Setting up event listeners...');
  
  // Form submission
  elements.weatherForm.addEventListener('submit', handleFormSubmit);
  
  // Unit toggle button
  elements.unitToggle.addEventListener('click', handleUnitToggle);
  
  // Enter key in input field (backup, form submit should handle this)
  elements.locationInput.addEventListener('keypress', handleInputKeypress);
  
  console.log('✅ Event listeners ready');
}

// ================================
// INITIALIZATION
// ================================

/**
 * Initializes the application
 * This runs when the page loads
 */
function initializeApp() {
  console.log('%c🎬 Initializing Weather App...', 'color: blue; font-weight: bold');
  
  // Step 1: Setup event listeners
  setupEventListeners();
  
  // Step 2: Check if API keys are configured
  if (WEATHER_API_KEY === 'YOUR_VISUAL_CROSSING_API_KEY_HERE') {
    console.warn('⚠️ Weather API key not configured!');
    showError('Please configure your Visual Crossing API key in weather.js');
    return;
  }
  
  // Step 3: Load weather for a default location (optional)
  // You could uncomment this to load weather automatically on page load
  // fetchAndDisplayWeather('London');
  
  // Step 4: Focus on the input field for better UX
  elements.locationInput.focus();
  
  console.log('%c✅ Weather App Ready!', 'color: green; font-weight: bold; font-size: 16px');
  console.log('%cTry searching for a city!', 'color: blue');
}

// ================================
// ADDITIONAL FEATURES
// ================================

/**
 * Gets user's current location using Geolocation API (optional enhancement)
 */
function getUserLocation() {
  if ('geolocation' in navigator) {
    console.log('📍 Getting user location...');
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('✅ Got coordinates:', latitude, longitude);
        
        // Fetch weather using coordinates
        const location = `${latitude},${longitude}`;
        await fetchAndDisplayWeather(location);
      },
      // Error callback
      (error) => {
        console.error('❌ Geolocation error:', error);
        showError('Could not get your location. Please enter a city name.');
      }
    );
  } else {
    console.log('ℹ️ Geolocation not supported');
    showError('Geolocation not supported by your browser');
  }
}

/**
 * Simulates slow network for testing (DevTools alternative)
 * Call this function in console to test loading states
 */
function simulateSlowNetwork() {
  console.log('🐌 Simulating slow network...');
  
  // Override fetch to add delay
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
    return originalFetch(...args);
  };
  
  console.log('✅ Network slowdown active (3s delay on all requests)');
}

// ================================
// LOCAL STORAGE FOR PREFERENCES (Optional)
// ================================

/**
 * Saves user preferences to localStorage
 */
function savePreferences() {
  const preferences = {
    unit: currentUnit,
    lastLocation: getLocationInput()
  };
  
  localStorage.setItem('weatherAppPreferences', JSON.stringify(preferences));
  console.log('💾 Preferences saved:', preferences);
}

/**
 * Loads user preferences from localStorage
 */
function loadPreferences() {
  const saved = localStorage.getItem('weatherAppPreferences');
  
  if (saved) {
    const preferences = JSON.parse(saved);
    console.log('📂 Loaded preferences:', preferences);
    
    // Apply saved unit preference
    if (preferences.unit) {
      currentUnit = preferences.unit;
      apiUnitGroup = preferences.unit === 'C' ? 'metric' : 'us';
      setCurrentUnit(currentUnit);
      updateToggleButton(currentUnit);
    }
    
    // Optionally load last searched location
    // if (preferences.lastLocation) {
    //   elements.locationInput.value = preferences.lastLocation;
    // }
  }
}

// ================================
// KEYBOARD SHORTCUTS (Optional)
// ================================

/**
 * Sets up keyboard shortcuts for power users
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      elements.locationInput.focus();
      elements.locationInput.select();
      console.log('⌨️ Search focused (Ctrl/Cmd + K)');
    }
    
    // Ctrl/Cmd + U to toggle units
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
      event.preventDefault();
      handleUnitToggle();
      console.log('⌨️ Units toggled (Ctrl/Cmd + U)');
    }
  });
  
  console.log('⌨️ Keyboard shortcuts enabled');
  console.log('  • Ctrl/Cmd + K: Focus search');
  console.log('  • Ctrl/Cmd + U: Toggle units');
}

// ================================
// ERROR RECOVERY
// ================================

/**
 * Handles global errors gracefully
 */
window.addEventListener('error', (event) => {
  console.error('🚨 Global error caught:', event.error);
  
  // Don't show error if weather is already displayed
  if (!currentWeatherData) {
    showError('Something went wrong. Please refresh the page and try again.');
  }
});

/**
 * Handles unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  
  // Prevent the default browser behavior
  event.preventDefault();
  
  // Show error if appropriate
  if (!currentWeatherData) {
    showError('An unexpected error occurred. Please try again.');
  }
});

// ================================
// START THE APP
// ================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded
  initializeApp();
}

// Load user preferences
loadPreferences();

// Setup keyboard shortcuts
setupKeyboardShortcuts();

// ================================
// EXPOSE FUNCTIONS FOR CONSOLE TESTING
// ================================

// Make some functions available in console for testing
window.weatherApp = {
  search: fetchAndDisplayWeather,
  getUserLocation: getUserLocation,
  simulateSlowNetwork: simulateSlowNetwork,
  savePreferences: savePreferences,
  currentData: () => currentWeatherData
};

console.log('%cDeveloper Tools Available:', 'color: orange; font-weight: bold');
console.log('weatherApp.search("city name") - Search for a location');
console.log('weatherApp.getUserLocation() - Use geolocation');
console.log('weatherApp.simulateSlowNetwork() - Test loading states');
console.log('weatherApp.currentData() - View current weather data');