(async function () {
  // Load data using SharedStorage for user-specific access
  let allData = await window.SharedStorage.loadAll();
  window.yields = allData.yields;
  window.expenses = allData.expenses;

  // 🔹 Toggle Yield Form
  function toggleYieldForm() {
    const form = document.getElementById("yieldForm");
    const toggle = document.getElementById("yieldFormToggle");
    const text = document.getElementById("yieldFormText");

    if (form.style.display === "none" || form.style.display === "") {
      form.style.display = "block";
      toggle.textContent = "✖";
      text.textContent = "Cancel";
    } else {
      form.style.display = "none";
      toggle.textContent = "➕";
      text.textContent = "Add Yield";
    }
  }

  async function handleAddYield() {
    const date = document.getElementById("yieldDate").value;
    const crop = document.getElementById("yieldCrop").value.trim();
    const quantity = parseFloat(document.getElementById("yieldQuantity").value);
    const unit = document.getElementById("yieldUnit").value;
    const season = document.getElementById("yieldSeason").value;
    const pricePerUnit = parseFloat(document.getElementById("yieldPrice").value);

    if (!crop || isNaN(quantity) || isNaN(pricePerUnit)) {
      alert("⚠️ Please fill in all required fields properly.");
      return;
    }

    const yieldData = {
      date: date || new Date().toISOString().split("T")[0],
      crop,
      quantity,
      unit,
      season: season || undefined,
      pricePerUnit
    };

    try {
      const response = await window.SharedStorage.apiCall('/api/yields', {
        method: 'POST',
        body: JSON.stringify(yieldData)
      });
      // Backend returns {success: true, data: yield}, extract data
      window.yields.push(response.data);
      renderYieldsTable();
      updateDashboard();
      toggleYieldForm();
    } catch (error) {
      console.error('Error adding yield:', error);
      alert("Error adding yield: " + (error.message || 'Unknown error'));
    }
  }

  // 🔹 Delete Yield
  async function deleteYield(id) {
    if (!confirm("Are you sure you want to delete this yield record?")) return;
    try {
      await window.SharedStorage.apiCall(`/api/yields/${id}`, {
        method: 'DELETE'
      });
      window.yields = window.yields.filter(y => y._id !== id);
      renderYieldsTable();
      updateDashboard();
    } catch (error) {
      console.error('Error deleting yield:', error);
      alert("Error deleting yield: " + (error.message || 'Unknown error'));
    }
  }

  // Helper for season options
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

  // 🔹 Edit Yield
  function editYield(id) {
    const tbody = document.getElementById("yieldsTableBody");
    const y = window.yields.find((yld) => yld._id === id);
    if (!y || !tbody) return;

    tbody.innerHTML = window.yields
      .map((yld) => {
        if (yld._id === id) {
          return `
          <tr>
            <td><input type="date" id="editDate" value="${yld.date}" /></td>
            <td><input type="text" id="editCrop" value="${yld.crop}" /></td>
            <td>
              <select id="editSeason">
                ${getSeasonOptions(yld.season || '')}
              </select>
            </td>
            <td><input type="number" id="editQuantity" value="${yld.quantity}" min="0" oninput="updateEditRevenue()" /></td>
            <td>
              <select id="editUnit">
                <option value="kg" ${yld.unit === "kg" ? "selected" : ""}>kg</option>
                <option value="tons" ${yld.unit === "tons" ? "selected" : ""}>tons</option>
                <option value="bags" ${yld.unit === "bags" ? "selected" : ""}>bags</option>
                <option value="liters" ${yld.unit === "liters" ? "selected" : ""}>liters</option>
                <option value="units" ${yld.unit === "units" ? "selected" : ""}>units</option>
              </select>
            </td>
            <td><input type="number" id="editPrice" value="${yld.pricePerUnit}" min="0" step="0.01" oninput="updateEditRevenue()" /></td>
            <td id="editTotal" style="text-align:right; color:#2e7d32;">₹${yld.totalRevenue.toFixed(2)}</td>
            <td style="text-align:center;">
              <button class="save-btn" onclick="saveEditedYield('${yld._id}')"> 💾</button>
              <button class="cancel-btn" onclick="renderYieldsTable()">❌</button>
            </td>
          </tr>`;
        } else {
          const seasonEmoji = yld.season === 'Kharif' ? '🌧️' : yld.season === 'Rabi' ? '❄️' : yld.season === 'Zaid' ? '☀️' : '-';
          const seasonText = yld.season || '-';
          return `
          <tr>
            <td>${yld.date}</td>
            <td><strong>${yld.crop}</strong></td>
            <td>${seasonEmoji} ${seasonText}</td>
            <td style="text-align:right;">${yld.quantity} ${yld.unit}</td>
            <td style="text-align:right;">₹${yld.pricePerUnit.toFixed(2)}</td>
            <td style="text-align:right; color:#2e7d32;">₹${yld.totalRevenue.toFixed(2)}</td>
            <td style="text-align:center;">
              <button class="edit-btn" onclick="editYield('${yld._id}')">✏️</button>
              <button class="delete-btn" onclick="deleteYield('${yld._id}')">🗑️</button>
            </td>
          </tr>`;
        }
      })
      .join("");
  }

  // 🔹 Auto-update Total Revenue while Editing
  function updateEditRevenue() {
    const qty = parseFloat(document.getElementById("editQuantity")?.value || 0);
    const price = parseFloat(document.getElementById("editPrice")?.value || 0);
    const total = qty * price;
    const totalCell = document.getElementById("editTotal");
    if (totalCell) totalCell.textContent = `₹${total.toFixed(2)}`;
  }

  // 🔹 Save Edited Yield
  async function saveEditedYield(id) {
    const crop = document.getElementById("editCrop").value.trim();
    const season = document.getElementById("editSeason").value;
    const quantity = parseFloat(document.getElementById("editQuantity").value);
    const unit = document.getElementById("editUnit").value;
    const pricePerUnit = parseFloat(document.getElementById("editPrice").value);
    const date = document.getElementById("editDate").value;

    if (!crop || isNaN(quantity) || isNaN(pricePerUnit)) {
      alert("⚠️ Please fill in all fields correctly.");
      return;
    }

    const totalRevenue = quantity * pricePerUnit;
    const updatedYield = { date, crop, season: season || undefined, quantity, unit, pricePerUnit, totalRevenue };

    try {
      const response = await window.SharedStorage.apiCall(`/api/yields/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedYield)
      });
      const index = window.yields.findIndex((y) => y._id === id);
      if (index !== -1) {
        // Backend returns {success: true, data: yield}, extract data
        window.yields[index] = response.data;
      }
      renderYieldsTable();
      updateDashboard();
    } catch (error) {
      console.error('Error updating yield:', error);
      alert("Error updating yield: " + (error.message || 'Unknown error'));
    }
  }

  // 🔹 Render Yield Table
  function renderYieldsTable() {
    const tbody = document.getElementById("yieldsTableBody");
    if (!tbody) return;

    if (window.yields.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#999; padding:40px;">No yield records yet</td></tr>`;
      return;
    }

    tbody.innerHTML = window.yields
      .map(
        (yld) => {
          const seasonEmoji = yld.season === 'Kharif' ? '🌧️' : yld.season === 'Rabi' ? '❄️' : yld.season === 'Zaid' ? '☀️' : '-';
          const seasonText = yld.season || '-';
          return `
        <tr>
          <td>${yld.date}</td>
          <td><strong>${yld.crop}</strong></td>
          <td>${seasonEmoji} ${seasonText}</td>
          <td style="text-align:right;">${yld.quantity} ${yld.unit}</td>
          <td style="text-align:right;">₹${yld.pricePerUnit.toFixed(2)}</td>
          <td style="text-align:right; color:#2e7d32;">₹${yld.totalRevenue.toFixed(2)}</td>
          <td style="text-align:center;">
            <button class="edit-btn" onclick="editYield('${yld._id}')">✏️</button>
            <button class="delete-btn" onclick="deleteYield('${yld._id}')">🗑️</button>
          </td>
        </tr>`;
        }
      )
      .join("");
  }

  // 🔹 Update Dashboard Summary
  function updateDashboard() {
    if (!document.getElementById("totalRevenue")) return;

    const totalExpenses = window.expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalRevenue = window.yields.reduce((sum, y) => sum + (parseFloat(y.totalRevenue) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    // Update card values with proper formatting
    document.getElementById("totalExpenses").textContent = `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("totalRevenue").textContent = `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  // 🔹 Expose Functions Globally
  window.toggleYieldForm = toggleYieldForm;
  window.handleAddYield = handleAddYield;
  window.deleteYield = deleteYield;
  window.editYield = editYield;
  window.saveEditedYield = saveEditedYield;
  window.updateEditRevenue = updateEditRevenue;
  window.renderYieldsTable = renderYieldsTable;

  // 🔹 Initialize on Load
  document.addEventListener("DOMContentLoaded", renderYieldsTable);
})();