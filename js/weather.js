// ================================================================
// WEATHER.JS - Handles all API calls and data processing
// ================================================================

// ================================
// API CONFIGURATION
// ================================

/**
 * Your Visual Crossing API Key
 * Get yours at: https://www.visualcrossing.com/sign-up
 * This is okay to expose for free APIs, but in production apps,
 * you'd want to hide this on a backend server
 */
const WEATHER_API_KEY = 'M9FK5JF3VKFX3RRR2DT8VMV48';

/**
 * Visual Crossing API Base URL
 */
const WEATHER_BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

/**
 * Giphy API Key (optional - for weather GIFs)
 * Get yours at: https://developers.giphy.com/
 */
const GIPHY_API_KEY = 'DENP1Z3saQXX7pYIfUkH0zV1WCEkx4u6';
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';

// ================================
// WEATHER API FUNCTIONS
// ================================

/**
 * Fetches weather data for a specific location
 * @param {string} location - City name or coordinates
 * @param {string} unit - Temperature unit ('us' for Fahrenheit, 'metric' for Celsius)
 * @returns {Promise<Object>} - Processed weather data
 */
async function getWeatherData(location, unit = 'metric') {
  console.log(`%c🌤️ Fetching weather for: ${location}`, 'color: blue; font-weight: bold');
  
  try {
    // Step 1: Construct the API URL
    // We're requesting 7 days of data with hourly details
    const url = `${WEATHER_BASE_URL}/${encodeURIComponent(location)}?unitGroup=${unit}&key=${WEATHER_API_KEY}&contentType=json`;
    
    console.log('📡 API URL:', url);
    
    // Step 2: Make the fetch request
    const response = await fetch(url);
    
    console.log('📦 Response status:', response.status);
    
    // Step 3: Check if the response is OK
    if (!response.ok) {
      // Handle different error types
      if (response.status === 400) {
        throw new Error('Location not found. Please check the spelling and try again.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else {
        throw new Error(`Failed to fetch weather data (Status: ${response.status})`);
      }
    }
    
    // Step 4: Parse the JSON response
    const data = await response.json();
    
    console.log('✅ Raw weather data:', data);
    
    // Step 5: Process and return only the data we need
    return processWeatherData(data);
    
  } catch (error) {
    console.error('❌ Error fetching weather:', error);
    // Re-throw the error so it can be handled by the caller
    throw error;
  }
}

/**
 * Processes raw API data into a clean, usable format
 * @param {Object} rawData - Raw data from Visual Crossing API
 * @returns {Object} - Cleaned and organized weather data
 */
function processWeatherData(rawData) {
  console.log('🔄 Processing weather data...');
  
  // Extract current weather (today's data)
  const currentDay = rawData.days[0];
  
  // Create a clean data structure with only what we need
  const processedData = {
    // Location information
    location: {
      name: rawData.resolvedAddress, // Full address from API
      timezone: rawData.timezone,
      coordinates: {
        latitude: rawData.latitude,
        longitude: rawData.longitude
      }
    },
    
    // Current weather conditions
    current: {
      datetime: currentDay.datetime,
      temp: Math.round(currentDay.temp), // Round to whole number
      feelsLike: Math.round(currentDay.feelslike),
      tempMax: Math.round(currentDay.tempmax),
      tempMin: Math.round(currentDay.tempmin),
      humidity: Math.round(currentDay.humidity),
      windSpeed: Math.round(currentDay.windspeed),
      visibility: currentDay.visibility,
      pressure: currentDay.pressure,
      uvIndex: currentDay.uvindex,
      conditions: currentDay.conditions, // e.g., "Partially cloudy"
      description: currentDay.description,
      icon: currentDay.icon, // Weather icon name
      sunrise: currentDay.sunrise,
      sunset: currentDay.sunset,
      precipProb: currentDay.precipprob // Precipitation probability
    },
    
    // 7-day forecast (excluding today since we show it separately)
    forecast: rawData.days.slice(1, 8).map(day => ({
      date: day.datetime,
      tempMax: Math.round(day.tempmax),
      tempMin: Math.round(day.tempmin),
      conditions: day.conditions,
      icon: day.icon,
      precipProb: day.precipprob,
      humidity: Math.round(day.humidity)
    })),
    
    // Additional metadata
    description: rawData.description // Overall forecast description
  };
  
  console.log('✅ Processed data:', processedData);
  
  return processedData;
}

/**
 * Converts temperature between Celsius and Fahrenheit
 * @param {number} temp - Temperature value
 * @param {string} fromUnit - Current unit ('C' or 'F')
 * @param {string} toUnit - Target unit ('C' or 'F')
 * @returns {number} - Converted temperature
 */
function convertTemperature(temp, fromUnit, toUnit) {
  // If units are the same, no conversion needed
  if (fromUnit === toUnit) {
    return temp;
  }
  
  // Convert Celsius to Fahrenheit
  if (fromUnit === 'C' && toUnit === 'F') {
    return Math.round((temp * 9/5) + 32);
  }
  
  // Convert Fahrenheit to Celsius
  if (fromUnit === 'F' && toUnit === 'C') {
    return Math.round((temp - 32) * 5/9);
  }
  
  return temp;
}

// ================================
// GIPHY API FUNCTIONS (Optional)
// ================================

/**
 * Fetches a weather-related GIF from Giphy
 * @param {string} weatherCondition - Current weather condition (e.g., "rainy", "sunny")
 * @returns {Promise<Object>} - GIF data
 */
async function getWeatherGif(weatherCondition) {
  console.log(`🎬 Fetching GIF for: ${weatherCondition}`);
  
  try {
    // Create a search term based on weather condition
    const searchTerm = `${weatherCondition} weather`;
    
    // Use Giphy's translate endpoint for most relevant result
    const url = `${GIPHY_BASE_URL}/translate?api_key=${GIPHY_API_KEY}&s=${encodeURIComponent(searchTerm)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch GIF');
    }
    
    const data = await response.json();
    
    // Check if we got a valid GIF
    if (data.data && data.data.images) {
      console.log('✅ Got weather GIF');
      return {
        url: data.data.images.original.url,
        title: data.data.title,
        condition: weatherCondition
      };
    } else {
      throw new Error('No GIF found');
    }
    
  } catch (error) {
    console.error('❌ Error fetching GIF:', error);
    // Return null if GIF fetch fails - it's not critical
    return null;
  }
}

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Maps Visual Crossing icon codes to weather conditions
 * Used for changing page background and finding appropriate GIFs
 * @param {string} iconCode - Icon code from API (e.g., "rain", "clear-day")
 * @returns {string} - Weather category
 */
function getWeatherCategory(iconCode) {
  const categoryMap = {
    'clear-day': 'sunny',
    'clear-night': 'clear-night',
    'partly-cloudy-day': 'cloudy',
    'partly-cloudy-night': 'cloudy',
    'cloudy': 'cloudy',
    'rain': 'rainy',
    'snow': 'snowy',
    'wind': 'windy',
    'fog': 'foggy'
  };
  
  return categoryMap[iconCode] || 'cloudy';
}

/**
 * Formats date into readable format
 * @param {string} dateString - Date string from API (YYYY-MM-DD)
 * @returns {string} - Formatted date (e.g., "Monday, January 15")
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Gets day of week from date string
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} - Day name (e.g., "Monday")
 */
function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Gets a weather icon URL from Visual Crossing's icon set
 * You can replace this with your own icons if you prefer
 * @param {string} iconCode - Icon code from API
 * @returns {string} - Icon URL
 */
function getWeatherIconUrl(iconCode) {
  // Visual Crossing provides icons, or you can use your own
  // For this example, we'll construct URLs to Visual Crossing's icons
  return `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/SVG/2nd%20Set%20-%20Color/${iconCode}.svg`;
}

// ================================
// CONSOLE LOG HELPER
// ================================

console.log('%c🌤️ Weather API Module Loaded', 'color: green; font-weight: bold; font-size: 14px');
console.log('Available functions:', {
  getWeatherData: 'Fetch weather for a location',
  getWeatherGif: 'Get weather-related GIF',
  convertTemperature: 'Convert between C and F',
  getWeatherCategory: 'Get weather category from icon code',
  formatDate: 'Format date string',
  getDayOfWeek: 'Get day name from date'
});