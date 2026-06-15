(function () {
  // 🧩 CONFIGURATION
  // Frontend and backend are on the same origin (port 5000), so use relative URLs
  const API_BASE = '';

  // 🧩 Helper for API calls (Automatically handles URL & Cookies)
  async function apiCall(endpoint, options = {}) {
    try {
      // ✅ FIX: Construct the full URL
      const fullUrl = `${API_BASE}${endpoint}`;

      const res = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include' // ✅ FIX: Essential for cookies/session to work!
      });

      // Handle Unauthorized (401)
      if (res.status === 401) {
        console.warn("⛔ Session expired or invalid.");
        return null;
      }

      if (res.ok) {
        // Safe JSON parsing
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await res.json();
        }
        return null; // Success but no content
      }

      // Handle other errors
      const text = await res.text();
      throw new Error(text || `Error ${res.status}`);

    } catch (error) {
      console.error("API Error at " + endpoint + ":", error);
      return null;
    }
  }

  // 🧩 Check Session (Call on Dashboard Load)
  async function checkSession() {
    // ✅ FIX: Use apiCall so it gets the correct URL and error handling
    const data = await apiCall('/api/auth/me', { method: 'GET' });
    return data ? data.user : null;
  }

  // 🧩 Logout
  async function logout() {
    await apiCall('/api/auth/logout', { method: 'GET' });
    window.location.href = '../login.html';
  }

  // ------------------ EXPENSES ------------------
  async function loadExpenses() {
    const response = await apiCall('/api/expenses');
    // Backend returns { success: true, data: [...] }, extract the data array
    return response?.data || null;
  }

  // ------------------ YIELDS ------------------
  async function loadYields() {
    const response = await apiCall('/api/yields');
    // Backend returns { success: true, data: [...] }, extract the data array
    return response?.data || null;
  }

  // ------------------ UTILITIES ------------------
  async function loadAll() {
    // Parallel fetch for speed
    const [expenses, yields] = await Promise.all([
      loadExpenses(),
      loadYields()
    ]);
    return { expenses, yields };
  }

  // ------------------ CROP ANALYSIS ------------------
  // ✅ FIX: Accept data as arguments to avoid reliance on global window variables
  function getCropAnalysis(expenses, yields) {
    // Use provided arrays if they have data, otherwise fall back to window variables
    // Check array length explicitly - empty arrays are truthy but have length 0
    const expenseData = (expenses && expenses.length > 0) ? expenses : (window.expenses || []);
    const yieldData = (yields && yields.length > 0) ? yields : (window.yields || []);

    const analysis = {};

    if (Array.isArray(expenseData)) {
      expenseData.forEach(e => {
        const crop = e.crop?.trim().toLowerCase() || "unknown";
        if (!analysis[crop]) analysis[crop] = { crop: e.crop, expenses: 0, revenue: 0, profit: 0 };
        analysis[crop].expenses += Number(e.amount) || 0;
      });
    }

    if (Array.isArray(yieldData)) {
      yieldData.forEach(y => {
        const crop = y.crop?.trim().toLowerCase() || "unknown";
        if (!analysis[crop]) analysis[crop] = { crop: y.crop, expenses: 0, revenue: 0, profit: 0 };
        analysis[crop].revenue += Number(y.totalRevenue) || 0;
      });
    }

    Object.values(analysis).forEach(c => c.profit = c.revenue - c.expenses);
    return Object.values(analysis);
  }

  // ✅ Expose Global API
  window.SharedStorage = {
    apiCall,
    checkSession,
    logout,
    loadExpenses,
    loadYields,
    loadAll,
    getCropAnalysis
  };
})();