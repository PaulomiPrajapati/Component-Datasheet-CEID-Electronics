let data = [];

// Load your CSV (with URL encoding for spaces)
fetch('Spare%20Components%20list%202025.csv')
  .then(r => r.text())
  .then(csv => data = Papa.parse(csv.trim(), { header: true }).data);

// Handle search input
document.getElementById('search').addEventListener('input', () => {
  const q = document.getElementById('search').value.toLowerCase().trim();
  const filtered = data.filter(r =>
    Object.values(r).some(v => v && v.toLowerCase().includes(q))
  );
  renderTable(filtered);
});

// Clear search button
document.querySelector('.clear-btn').addEventListener('click', () => {
  document.getElementById('search').value = '';
  document.getElementById('search').dispatchEvent(new Event('input'));
});

// Render table rows
function renderTable(rows) {
  const tbl = document.getElementById('results');
  const thead = document.getElementById('header-row');
  const tbody = document.getElementById('body-rows');
  tbody.innerHTML = '';

  if (rows.length === 0) {
    tbl.style.display = 'none';
    return;
  }
  tbl.style.display = 'table';

  // Header row, once only
  if (!thead.hasChildNodes()) {
    Object.keys(rows[0]).forEach(h => {
      const th = document.createElement('th');
      th.innerText = h;
      thead.appendChild(th);
    });
  }

  // Rows and editable cells
  rows.forEach(r => {
    const tr = document.createElement('tr');
    Object.entries(r).forEach(([key, val]) => {
      const td = document.createElement('td');
      td.innerText = val || '';
      td.contentEditable = true;
      td.addEventListener('blur', () => {
        r[key] = td.innerText;
      });
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

// "+ Add" new row
document.getElementById('add-row').addEventListener('click', () => {
  if (!data.length) return alert('Data is still loading—please wait...');
  const blank = Object.fromEntries(Object.keys(data[0]).map(k => [k, '']));
  data.push(blank);
  renderTable([blank]);
});
