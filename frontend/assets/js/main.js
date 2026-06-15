document.addEventListener("DOMContentLoaded", async () => {
  const tabs = document.querySelectorAll(".tab");
  const tabContent = document.getElementById("tabContent");

  // ------------------------------------------------------
  // 1. SESSION CHECK (DEBUG MODE)
  // ------------------------------------------------------
  console.log("🔍 DASHBOARD: Starting Session Check...");

  if (!window.SharedStorage || !window.SharedStorage.checkSession) {
    console.error("❌ CRITICAL: SharedStorage not loaded. Check script order in index.html.");
    alert("System Error: SharedStorage missing.");
    return;
  }

  const user = await window.SharedStorage.checkSession();
  console.log("👤 DASHBOARD: User received from backend:", user);

  if (!user) {
    console.error("⛔ ACCESS DENIED: Backend returned null user.");
    console.warn("⚠️ I am NOT redirecting you yet so you can see this error.");
    console.warn("⚠️ Normally, I would send you to ../login.html now.");

    // TEMPORARY: Show error on screen instead of redirecting
    document.body.innerHTML = `
        <div style="color: red; text-align: center; margin-top: 50px;">
            <h1>Access Denied</h1>
            <p>The Dashboard cannot read your login session.</p>
            <p><strong>Open Console (F12) to see details.</strong></p>
            <p><a href="../login.html">Click here to go back to Login manually</a></p>
        </div>
      `;
    return;
  }

  // ------------------------------------------------------
  // 2. INITIALIZE DASHBOARD UI
  // ------------------------------------------------------
  const welcomeText = document.getElementById("welcomeText");
  if (welcomeText) welcomeText.textContent = `Welcome, ${user.fullName}! 👋`;

  window.logoutUser = window.SharedStorage.logout;

  try {
    const allData = await window.SharedStorage.loadAll();
    window.expenses = allData.expenses;
    window.yields = allData.yields;
  } catch (err) {
    console.error("Failed to load data", err);
  }

  // ------------------------------------------------------
  // 3. SET DEFAULT TAB -> ANALYSIS
  // ------------------------------------------------------
  // Check if analysis.html actually exists in your folder!
  console.log("📂 Loading Analysis Tab...");
  loadTab("analysis.html", "../assets/js/analysis.js", "analysis");

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  const analysisTabBtn = document.querySelector('.tab[data-tab="analysis.html"]');
  if (analysisTabBtn) analysisTabBtn.classList.add("active");

  // ------------------------------------------------------
  // 4. TAB CLICK LOGIC
  // ------------------------------------------------------
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const tabName = tab.dataset.tab.replace(".html", "");
      const jsPath = `../assets/js/${tabName}.js`;
      loadTab(tab.dataset.tab, jsPath, tabName);
    });
  });

  // HELPER: TAB LOADER
  function loadTab(page, scriptPath, tabName) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', page, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          tabContent.innerHTML = xhr.responseText;
          const oldScript = document.getElementById("dynamicTabScript");
          if (oldScript) oldScript.remove();

          const script = document.createElement("script");
          script.src = scriptPath;
          script.id = "dynamicTabScript";
          script.onload = () => requestAnimationFrame(() => renderTab(tabName));
          document.body.appendChild(script);
        } else {
          console.error(`❌ Failed to load tab: ${page} (Status: ${xhr.status})`);
          tabContent.innerHTML = `<p style="color:red; text-align:center;">Error loading ${page}. Does the file exist?</p>`;
        }
      }
    };
    xhr.send();
  }

  // HELPER: RENDER CONTENT
  function renderTab(tabName) {
    if (tabName === "expenses" && window.renderExpensesTable) renderExpensesTable();
    else if (tabName === "yields" && window.renderYieldsTable) renderYieldsTable();
    else if (tabName === "analysis" && window.renderAnalysisTable) renderAnalysisTable();
    else if (tabName === "graphs" && window.renderCharts) renderCharts();
  }

  // ------------------------------------------------------
  // CSV EXPORT FUNCTION (CHANGED TO PDF)
  // ------------------------------------------------------
  window.exportToCSV = async function () {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Get current user
      const currentUser = await window.SharedStorage.checkSession();

      // Get current data
      const expenses = window.expenses || [];
      const yields = window.yields || [];
      const analysis = window.SharedStorage ? window.SharedStorage.getCropAnalysis(expenses, yields) : [];

      // Title with username
      const reportDate = new Date().toLocaleString();
      const userName = currentUser ? currentUser.fullName : 'User';
      doc.setFontSize(16);
      doc.text(`${userName}'s Farm Report`, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${reportDate}`, 14, 22);

      let yPosition = 30;

      // ===== EXPENSES TABLE =====
      doc.setFontSize(12);
      doc.text("EXPENSES", 14, yPosition);
      yPosition += 8;

      const expensesTableData = expenses.map(e => [
        e.date ? new Date(e.date).toLocaleDateString() : '-',
        e.crop || '-',
        e.category || '-',
        e.season || '-',
        e.description || '-',
        `₹${(e.amount || 0).toFixed(2)}`
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Date', 'Crop', 'Category', 'Season', 'Description', 'Amount']],
        body: expensesTableData,
        margin: 14,
        theme: 'grid',
        headStyles: { fillColor: [46, 125, 50], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 5: { halign: 'right' } }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Total Expenses
      const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      doc.setFontSize(10);
      doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, 14, yPosition);
      yPosition += 15;

      // ===== YIELDS TABLE =====
      doc.setFontSize(12);
      doc.text("YIELDS", 14, yPosition);
      yPosition += 8;

      const yieldsTableData = yields.map(y => [
        y.date ? new Date(y.date).toLocaleDateString() : '-',
        y.crop || '-',
        y.season || '-',
        `${y.quantity || 0} ${y.unit || ''}`,
        `₹${(y.pricePerUnit || 0).toFixed(2)}`,
        `₹${(y.totalRevenue || 0).toFixed(2)}`
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Date', 'Crop', 'Season', 'Quantity', 'Price/Unit', 'Total Revenue']],
        body: yieldsTableData,
        margin: 14,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Total Revenue
      const totalRevenue = yields.reduce((sum, y) => sum + (parseFloat(y.totalRevenue) || 0), 0);
      doc.setFontSize(10);
      doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 14, yPosition);
      yPosition += 15;

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 15;
      }

      // ===== ANALYSIS TABLE =====
      doc.setFontSize(12);
      doc.text("CROP PROFITABILITY ANALYSIS", 14, yPosition);
      yPosition += 8;

      const analysisTableData = analysis.map(c => {
        const margin = c.revenue > 0 ? ((c.profit / c.revenue) * 100).toFixed(1) : '0';
        return [
          c.crop || '-',
          `₹${(c.expenses || 0).toFixed(2)}`,
          `₹${(c.revenue || 0).toFixed(2)}`,
          `₹${(c.profit || 0).toFixed(2)}`,
          `${margin}%`
        ];
      });

      doc.autoTable({
        startY: yPosition,
        head: [['Crop', 'Total Expenses', 'Total Revenue', 'Net Profit', 'Profit Margin %']],
        body: analysisTableData,
        margin: 14,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 15;
      }

      // ===== SUMMARY =====
      const netProfit = totalRevenue - totalExpenses;
      doc.setFontSize(12);
      doc.text("SUMMARY", 14, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setTextColor(46, 125, 50);
      doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, 14, yPosition);
      yPosition += 8;

      doc.setTextColor(59, 130, 246);
      doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 14, yPosition);
      yPosition += 8;

      doc.setTextColor(...(netProfit >= 0 ? [34, 197, 94] : [239, 68, 68]));
      doc.text(`Net Profit: ₹${netProfit.toFixed(2)}`, 14, yPosition);
      doc.setTextColor(0, 0, 0);

      // Save PDF
      doc.save(`Farm_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('✅ PDF Report exported successfully');
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert('Error exporting report. Please try again.');
    }
  };
});