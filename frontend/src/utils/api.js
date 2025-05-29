// API client for making HTTP requests to the backend

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

console.log('API URL:', API_URL);

/**
 * Fetch polls from the backend
 * @returns {Promise<Array>} List of polls
 */
export const fetchPolls = async () => {
  try {
    const response = await fetch(`${API_URL}/api/polls`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching polls:', error);
    throw error;
  }
};

/**
 * Fetch active poll from the backend
 * @returns {Promise<Object>} Active poll object
 */
export const fetchActivePoll = async () => {
  try {
    const response = await fetch(`${API_URL}/api/polls/active`);
    if (response.status === 404) {
      return null; // No active poll
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching active poll:', error);
    throw error;
  }
};

/**
 * Fetch students from the backend
 * @returns {Promise<Array>} List of students
 */
export const fetchStudents = async () => {
  try {
    const response = await fetch(`${API_URL}/api/students`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

/**
 * Check server health
 * @returns {Promise<boolean>} True if server is healthy
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}; 