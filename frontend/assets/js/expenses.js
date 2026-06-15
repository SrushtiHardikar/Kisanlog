// ✅ Load data using SharedStorage for user-specific access
(async function () {
  let allData = await window.SharedStorage.loadAll();
  window.expenses = allData.expenses;
  window.yields = allData.yields;

  // 🔹 Toggle Expense Form
  function toggleExpenseForm() {
    const form = document.getElementById("expenseForm");
    const toggle = document.getElementById("expenseFormToggle");
    const text = document.getElementById("expenseFormText");

    if (form.style.display === "none" || form.style.display === "") {
      form.style.display = "block";
      toggle.textContent = "✖";
      text.textContent = "Cancel";
    } else {
      form.style.display = "none";
      toggle.textContent = "➕";
      text.textContent = "Add Expense";
    }
  }

  // 🔹 Add Expense
  async function handleAddExpense() {
    const date = document.getElementById("expenseDate").value;
    const crop = document.getElementById("expenseCrop").value.trim();
    const category = document.getElementById("expenseCategory").value;
    const season = document.getElementById("expenseSeason").value;
    const description = document.getElementById("expenseDescription").value.trim();
    const amount = parseFloat(document.getElementById("expenseAmount").value);

    if (!crop || isNaN(amount)) {
      alert("⚠️ Please fill in crop name and amount correctly.");
      return;
    }

    const expense = {
      date: date || new Date().toISOString().split("T")[0],
      crop,
      category,
      season: season || undefined,
      description,
      amount
    };

    try {
      const response = await window.SharedStorage.apiCall('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(expense)
      });
      // Backend returns {success: true, data: expense}, extract data
      window.expenses.push(response.data);
      renderExpensesTable();
      updateDashboard();
      toggleExpenseForm();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert("Error adding expense: " + (error.message || 'Unknown error'));
    }
  }

  // 🔹 Delete Expense
  async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await window.SharedStorage.apiCall(`/api/expenses/${id}`, {
        method: 'DELETE'
      });
      window.expenses = window.expenses.filter(e => e._id !== id);
      renderExpensesTable();
      updateDashboard();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert("Error deleting expense: " + (error.message || 'Unknown error'));
    }
  }

  // 🔹 Edit Expense
  // Helper to generate the dropdown options with the correct one selected
  function getCategoryOptions(selectedCategory) {
    const categories = ['Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Machinery', 'Fuel', 'Irrigation', 'Other'];
    return categories.map(cat =>
      `<option value="${cat}" ${cat === selectedCategory ? "selected" : ""}>${cat}</option>`
    ).join('');
  }

  function getSeasonOptions(selectedSeason) {
    const seasons = [
      { value: '', label: 'None' },
      { value: 'Kharif', label: '🌧️ Kharif' },
      { value: 'Rabi', label: '❄️ Rabi' },
      { value: 'Zaid', label: '☀️ Zaid' }
    ];
    return seasons.map(s =>
      `<option value="${s.value}" ${s.value === selectedSeason ? "selected" : ""}>${s.label}</option>`
    ).join('');
  }

  // 🔹 Edit Expense (Updated for Dropdown)
  function editExpense(id) {
    const tbody = document.getElementById("expensesTableBody");
    const expense = window.expenses.find(e => e._id === id);
    if (!expense || !tbody) return;

    // Replace row with editable inputs
    tbody.innerHTML = window.expenses
      .map(e => {
        if (e._id === id) {
          return `
        <tr class="editing-row">
          <td><input type="date" id="editDate" value="${e.date ? e.date.split('T')[0] : ''}" /></td>
          <td><input type="text" id="editCrop" value="${e.crop}" /></td>
          
          <td>
            <select id="editCategory">
               ${getCategoryOptions(e.category)}
            </select>
          </td>

          <td>
            <select id="editSeason">
               ${getSeasonOptions(e.season || '')}
            </select>
          </td>
          
          <td><input type="text" id="editDescription" value="${e.description || ""}" /></td>
          <td><input type="number" id="editAmount" value="${e.amount}" /></td>
          <td style="text-align:center;">
            <button class="save-btn" onclick="saveEditedExpense('${e._id}')">💾</button>
            <button class="cancel-btn" onclick="renderExpensesTable()">❌</button>
          </td>
        </tr>`;
        } else {
          const seasonEmoji = e.season === 'Kharif' ? '🌧️' : e.season === 'Rabi' ? '❄️' : e.season === 'Zaid' ? '☀️' : '-';
          const seasonText = e.season || '-';
          return `
        <tr>
          <td>${e.date ? new Date(e.date).toLocaleDateString() : '-'}</td>
          <td><strong>${e.crop}</strong></td>
          <td><span class="category-badge ${e.category.toLowerCase()}">${e.category}</span></td>
          <td>${seasonEmoji} ${seasonText}</td>
          <td>${e.description || "-"}</td>
          <td style="text-align:right;">₹${e.amount.toFixed(2)}</td>
          <td style="text-align:center;">
            <button class="edit-btn" onclick="editExpense('${e._id}')">✏️</button>
            <button class="delete-btn" onclick="deleteExpense('${e._id}')">🗑️</button>
          </td>
        </tr>`;
        }
      })
      .join("");
  }

  // Ensure the helper is available globally
  window.editExpense = editExpense;

  // 🔹 Save Edited Expense
  // 🔹 Save Edited Expense
  async function saveEditedExpense(id) {
    const crop = document.getElementById("editCrop").value.trim();
    const category = document.getElementById("editCategory").value.trim();
    const season = document.getElementById("editSeason").value;
    const description = document.getElementById("editDescription").value.trim();
    const amount = parseFloat(document.getElementById("editAmount").value);
    const date = document.getElementById("editDate").value;

    if (!crop || isNaN(amount)) {
      alert("⚠️ Please fill all fields correctly.");
      return;
    }

    const updatedExpense = { crop, category, season: season || undefined, description, amount, date };

    try {
      const response = await window.SharedStorage.apiCall(`/api/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedExpense)
      });
      const index = window.expenses.findIndex(e => e._id === id);
      if (index !== -1) {
        // Backend returns {success: true, data: expense}, extract data
        window.expenses[index] = response.data;
      }
      renderExpensesTable();
      updateDashboard();
    } catch (error) {
      console.error('Error updating expense:', error);
      alert("Error updating expense: " + (error.message || 'Unknown error'));
    }
  }

  // 🔹 Render Table
  function renderExpensesTable() {
    const tbody = document.getElementById("expensesTableBody");
    if (!tbody) return;

    if (window.expenses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#999; padding:40px;">No expenses recorded yet</td></tr>`;
      return;
    }

    tbody.innerHTML = window.expenses
      .map(
        exp => {
          const seasonEmoji = exp.season === 'Kharif' ? '🌧️' : exp.season === 'Rabi' ? '❄️' : exp.season === 'Zaid' ? '☀️' : '-';
          const seasonText = exp.season || '-';
          return `
        <tr>
          <td>${exp.date}</td>
          <td><strong>${exp.crop}</strong></td>
          <td><span class="category-badge">${exp.category}</span></td>
          <td>${seasonEmoji} ${seasonText}</td>
          <td>${exp.description || "-"}</td>
          <td style="text-align:right;">₹${exp.amount.toFixed(2)}</td>
          <td style="text-align:center;">
            <button class="edit-btn" onclick="editExpense('${exp._id}')">✏️</button>
            <button class="delete-btn" onclick="deleteExpense('${exp._id}')">🗑️</button>
          </td>
        </tr>`;
        })
      .join("");
  }

  // 🔹 Update Dashboard
  function updateDashboard() {
    const totalExpenses = window.expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalRevenue = window.yields.reduce((sum, y) => sum + (parseFloat(y.totalRevenue) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    // Update card values with proper formatting
    if (document.getElementById("totalExpenses"))
      document.getElementById("totalExpenses").textContent = `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (document.getElementById("totalRevenue"))
      document.getElementById("totalRevenue").textContent = `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (document.getElementById("netProfit"))
      document.getElementById("netProfit").textContent = `₹${netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Update profit card color and label
    const profitCard = document.getElementById("profitCard");
    const profitLabel = document.getElementById("profitLabel");
    if (profitCard && profitLabel) {
      if (netProfit >= 0) {
        profitCard.style.backgroundColor = "#c8e6c9";
        profitLabel.textContent = "📈 Net Profit";
        profitLabel.style.color = "#2e7d32";
      } else {
        profitCard.style.backgroundColor = "#ffcdd2";
        profitLabel.textContent = "📉 Net Loss";
        profitLabel.style.color = "#c62828";
      }
    }
  }

  // 🔹 Expose to global
  window.toggleExpenseForm = toggleExpenseForm;
  window.handleAddExpense = handleAddExpense;
  window.deleteExpense = deleteExpense;
  window.renderExpensesTable = renderExpensesTable;
  window.editExpense = editExpense;
  window.saveEditedExpense = saveEditedExpense;

  // 🔹 Initialize
  document.addEventListener("DOMContentLoaded", renderExpensesTable);
})();
