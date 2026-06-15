// 🌾 Graphs.js — safe reusable chart variables
window.expensesTimeChart = window.expensesTimeChart || null;
window.categoryChart = window.categoryChart || null;
window.cropComparisonChart = window.cropComparisonChart || null;

// ✅ Utility: getExpensesByCategory
window.getExpensesByCategory = function () {
  const cat = {};
  (window.expenses || []).forEach(e => {
    cat[e.category] = (cat[e.category] || 0) + e.amount;
  });
  return cat;
};

// ✅ Utility: getExpensesOverTime
window.getExpensesOverTime = function () {
  const time = {};
  (window.expenses || []).forEach(e => {
    const month = e.date?.substring(0, 7);
    if (month) time[month] = (time[month] || 0) + e.amount;
  });
  return time;
};

// ✅ Unified chart renderer
window.renderCharts = function () {
  renderExpensesTimeChart();
  renderCategoryChart();
  renderCropComparisonChart();
};

// -------------------------------
// EXPENSES OVER TIME
// -------------------------------
function renderExpensesTimeChart() {
  const ctx = document.getElementById("expensesTimeChart");
  if (!ctx) return;

  const timeData = getExpensesOverTime();

  // ✅ Only destroy if it's an actual Chart instance
  if (window.expensesTimeChart instanceof Chart) {
    window.expensesTimeChart.destroy();
  }

  window.expensesTimeChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: Object.keys(timeData).sort(),
      datasets: [{
        label: "Expenses",
        data: Object.keys(timeData).sort().map(m => timeData[m]),
        borderColor: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        fill: true,
        tension: 0.4
      }]
    },
    options: { responsive: true, maintainAspectRatio: true }
  });
}

// -------------------------------
// CATEGORY CHART
// -------------------------------
function renderCategoryChart() {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  const data = getExpensesByCategory();

  if (window.categoryChart instanceof Chart) {
    window.categoryChart.destroy();
  }

  window.categoryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: "Expenses by Category",
        data: Object.values(data),
        backgroundColor: "#43a047"
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

// -------------------------------
// CROP COMPARISON CHART
// -------------------------------
function renderCropComparisonChart() {
  const ctx = document.getElementById("cropComparisonChart");
  if (!ctx) return;

  // ✅ Check shared function exists
  if (typeof window.SharedStorage?.getCropAnalysis !== "function") {
    console.error("❌ getCropAnalysis() not found. Make sure shared.js is loaded before graphs.js.");
    return;
  }

  const cropData = window.SharedStorage.getCropAnalysis(window.expenses, window.yields);

  if (window.cropComparisonChart instanceof Chart) {
    window.cropComparisonChart.destroy();
  }

  // ✅ Dynamic profit colors: green for profit, red for loss
  const profitColors = cropData.map(c => c.profit >= 0 ? "#22C55E" : "#EF4444");

  window.cropComparisonChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: cropData.map(c => c.crop),
      datasets: [
        {
          label: "Expenses",
          data: cropData.map(c => c.expenses),
          backgroundColor: "#703bf6"
        },
        {
          label: "Revenue",
          data: cropData.map(c => c.revenue),
          backgroundColor: "#42a5f5"
        },
        {
          label: "Profit",
          data: cropData.map(c => c.profit),
          backgroundColor: profitColors
        }
      ]
    },
    options: { responsive: true, maintainAspectRatio: true }
  });
}
