// Example Application
// Main entry point

const CONFIG = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  debug: false,
};

// Utility functions
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Example class
class ExampleManager {
  constructor(options = {}) {
    this.options = { ...CONFIG, ...options };
    this.data = [];
    this.listeners = [];
  }

  init() {
    console.log("Initializing ExampleManager...");
    this.setupEventListeners();
    this.loadData();
  }

  setupEventListeners() {
    // Example event listener setup
    if (typeof window !== "undefined") {
      window.addEventListener(
        "resize",
        debounce(this.handleResize.bind(this), 250)
      );
    }
  }

  handleResize() {
    console.log("Window resized");
  }

  async loadData() {
    try {
      const response = await fetch(this.options.apiUrl);
      this.data = await response.json();
      this.notifyListeners("dataLoaded", this.data);
    } catch (error) {
      console.error("Error loading data:", error);
      this.notifyListeners("error", error);
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        console.error("Error in listener:", error);
      }
    });
  }

  getData() {
    return this.data;
  }
}

// Main application initialization
function init() {
  const manager = new ExampleManager({
    debug: true,
  });

  manager.addListener((event, data) => {
    console.log(`Event: ${event}`, data);
  });

  manager.init();
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ExampleManager, formatDate, debounce, throttle };
}

// Auto-init if running in browser
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}
