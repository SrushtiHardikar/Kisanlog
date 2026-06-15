function renderAnalysisTable() {
  const tbody = document.getElementById("analysisTableBody");
  // Pass window.expenses and window.yields explicitly to getCropAnalysis
  const cropData = window.SharedStorage ? window.SharedStorage.getCropAnalysis(window.expenses, window.yields) : [];

  if (!cropData || cropData.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999; padding:40px;">No data available for analysis</td></tr>`;
    return;
  }

  if (tbody) {
    tbody.innerHTML = cropData
      .map(crop => {
        const margin = crop.revenue > 0 ? ((crop.profit / crop.revenue) * 100).toFixed(1) : 0;
        const profitColor = crop.profit >= 0 ? "#2e7d32" : "#d32f2f"; // Green or Red
        const marginColor = margin >= 0 ? "#2e7d32" : "#d32f2f";

        return `
          <tr>
            <td><strong>${crop.crop}</strong></td>
            <td style="text-align:right; color:#d32f2f;">₹${crop.expenses.toFixed(2)}</td>
            <td style="text-align:right; color:#1976d2;">₹${crop.revenue.toFixed(2)}</td>
            <td style="text-align:right; font-weight:600; color:${profitColor};">₹${crop.profit.toFixed(2)}</td>
            <td style="text-align:right; font-weight:600; color:${marginColor};">${margin}%</td>
          </tr>`;
      })
      .join("");
  }
}

// ---------------------------------------------
// 🖨️ PDF EXPORT FUNCTION
// ---------------------------------------------
window.exportToPDF = function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // 1. Add Title
  doc.setFontSize(18);
  doc.setTextColor(46, 125, 50); // Green
  doc.text("KisanLog - Profitability Report", 14, 20);

  // 2. Add Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

  // 3. Generate Table
  const cropData = window.SharedStorage.getCropAnalysis(window.expenses, window.yields);

  const tableRows = cropData.map(c => [
    c.crop,
    `Rs. ${c.expenses.toFixed(2)}`,
    `Rs. ${c.revenue.toFixed(2)}`,
    `Rs. ${c.profit.toFixed(2)}`,
    `${c.revenue > 0 ? ((c.profit / c.revenue) * 100).toFixed(1) : 0}%`
  ]);

  doc.autoTable({
    head: [['Crop', 'Expenses', 'Revenue', 'Profit', 'Margin']],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [46, 125, 50] }, // Green Header
    styles: { fontSize: 10 },
  });

  // 4. Save
  doc.save("Farm_Analysis_Report.pdf");
}

// Attach to window so main.js can call it
window.renderAnalysisTable = renderAnalysisTable;

// Initial Render
renderAnalysisTable();