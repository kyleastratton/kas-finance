// ========== GLOBAL STATE ==========
let appData = {
    expenses: [],
    savings: [],
    customTables: []
  };
  
  let expensesChart;
  
  // ========== INITIALIZATION ==========
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadData();
    initTable('expenses');
    initTable('savings');
    initCustomTables();
    document.getElementById('toggle-theme').addEventListener('click', toggleTheme);
    document.getElementById('export-json').addEventListener('click', exportJSON);
    document.getElementById('import-json').addEventListener('change', importJSON);
  });
  
  // ========== THEME ==========
  function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  }
  
  function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.body.classList.add('dark');
  }
  
  // ========== STORAGE ==========
  function saveData() {
    localStorage.setItem('financeAppData', JSON.stringify(appData));
  }
  
  function loadData() {
    const stored = localStorage.getItem('financeAppData');
    if (stored) {
      appData = JSON.parse(stored);
    } else {
      appData.expenses = [{ description: 'Rent', category: 'Housing', amount: -800 }];
      appData.savings = [{ name: 'Emergency Fund', institution: 'Bank A', amount: 1500 }];
    }
  }
  
  // ========== TABLE RENDERING ==========
  function initTable(type) {
    const tbody = document.querySelector(`#${type}-table tbody`);
    tbody.innerHTML = '';
    appData[type].forEach((row, index) => addRow(type, row, index));
    updateTotals(type);
    if (type === 'expenses') drawChart();
  }
  
  function addRow(type, data = {}, index = null) {
    const table = document.querySelector(`#${type}-table tbody`);
    const row = document.createElement('tr');
  
    const columns = type === 'expenses'
      ? ['description', 'category', 'amount']
      : ['name', 'institution', 'amount'];
  
    columns.forEach(key => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.value = data[key] ?? '';
      input.oninput = () => {
        appData[type][rowIndex][key] = key === 'amount' ? parseFloat(input.value) || 0 : input.value;
        saveData();
        updateTotals(type);
        if (type === 'expenses') drawChart();
      };
      td.appendChild(input);
      row.appendChild(td);
    });
  
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✖';
    removeBtn.onclick = () => {
      appData[type].splice(rowIndex, 1);
      saveData();
      initTable(type);
    };
    const td = document.createElement('td');
    td.appendChild(removeBtn);
    row.appendChild(td);
  
    const rowIndex = index !== null ? index : appData[type].push({}) - 1;
    if (index === null) saveData();
    table.appendChild(row);
  }
  
  function updateTotals(type) {
    const total = appData[type].reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    document.getElementById(`${type}-total`).textContent = total.toFixed(2);
  }
  
  // ========== CHART ==========
  function drawChart() {
    const ctx = document.getElementById('expenses-chart').getContext('2d');
    const filtered = appData.expenses.filter(e => parseFloat(e.amount) < 0);
    const grouped = {};
  
    filtered.forEach(e => {
      const cat = e.category || 'Uncategorized';
      grouped[cat] = (grouped[cat] || 0) + Math.abs(e.amount);
    });
  
    const labels = Object.keys(grouped);
    const data = Object.values(grouped);
  
    if (expensesChart) expensesChart.destroy();
    expensesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: generateColors(labels.length) }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
  
  function generateColors(n) {
    const base = ['#3d8bfd', '#6610f2', '#6f42c1', '#d63384', '#fd7e14', '#20c997'];
    const colors = [];
    for (let i = 0; i < n; i++) {
      colors.push(base[i % base.length]);
    }
    return colors;
  }
  
  // ========== CUSTOM TABLES ==========
  function initCustomTables() {
    const container = document.getElementById('custom-tables');
    container.innerHTML = '';
    appData.customTables.forEach((table, index) => addCustomTable(table, index));
  }
  
  function addCustomTable(data = null, index = null) {
    const container = document.getElementById('custom-tables');
    const div = document.createElement('div');
    div.className = 'custom-table';
  
    const table = document.createElement('table');
    table.className = 'data-table';
  
    const header = document.createElement('tr');
    if (!data) data = { columns: ['Column 1', 'Column 2'], rows: [['', '']] };
    data.columns.forEach((col, colIndex) => {
      const th = document.createElement('th');
      const input = document.createElement('input');
      input.value = col;
      input.oninput = () => {
        tableData.columns[colIndex] = input.value;
        saveData();
      };
      th.appendChild(input);
      header.appendChild(th);
    });
    const th = document.createElement('th');
    const addCol = document.createElement('button');
    addCol.textContent = '+ Column';
    addCol.onclick = () => {
      tableData.columns.push(`Column ${tableData.columns.length + 1}`);
      tableData.rows.forEach(r => r.push(''));
      saveData();
      initCustomTables();
    };
    th.appendChild(addCol);
    header.appendChild(th);
    const thead = document.createElement('thead');
    thead.appendChild(header);
    table.appendChild(thead);
  
    const tbody = document.createElement('tbody');
    data.rows.forEach((r, rIndex) => {
      const tr = document.createElement('tr');
      r.forEach((val, cIndex) => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.value = val;
        input.oninput = () => {
          tableData.rows[rIndex][cIndex] = input.value;
          saveData();
        };
        td.appendChild(input);
        tr.appendChild(td);
      });
      const td = document.createElement('td');
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '✖';
      removeBtn.onclick = () => {
        tableData.rows.splice(rIndex, 1);
        saveData();
        initCustomTables();
      };
      td.appendChild(removeBtn);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
  
    const addRow = document.createElement('button');
    addRow.textContent = '+ Row';
    addRow.onclick = () => {
      tableData.rows.push(new Array(tableData.columns.length).fill(''));
      saveData();
      initCustomTables();
    };
  
    const tableData = data;
    const tableIndex = index !== null ? index : appData.customTables.push(data) - 1;
    if (index === null) saveData();
  
    table.appendChild(tbody);
    div.appendChild(table);
    div.appendChild(addRow);
    container.appendChild(div);
  }
  
  // ========== JSON IMPORT/EXPORT ==========
  function exportJSON() {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'finance-app-data.json';
    a.click();
  }
  
  function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        appData = JSON.parse(e.target.result);
        saveData();
        initTable('expenses');
        initTable('savings');
        initCustomTables();
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }
  