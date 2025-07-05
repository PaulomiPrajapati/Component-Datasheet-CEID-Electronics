let data = [];
fetch('Spare%20Components%20list%202025.csv')
  .then(r => r.text())
  .then(csv => data = Papa.parse(csv.trim(), {header:true}).data);

document.getElementById('search').addEventListener('input', () => {
  const q = document.getElementById('search').value.toLowerCase();
  const filtered = data.filter(r =>
    Object.values(r).some(v => v && v.toLowerCase().includes(q))
  );
  renderTable(filtered);
});

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
  if (!thead.hasChildNodes()) {
    Object.keys(rows[0]).forEach(h => {
      const th = document.createElement('th');
      th.innerText = h;
      thead.appendChild(th);
    });
  }

  rows.forEach(r => {
    const tr = document.createElement('tr');
    Object.values(r).forEach(v => {
      const td = document.createElement('td');
      td.innerText = v || '';
      td.contentEditable = true;
      td.addEventListener('blur', () => {
        const col = thead.children[Array.prototype.indexOf.call(tr.children, td)].innerText;
        r[col] = td.innerText;
      });
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

document.getElementById('add-row').addEventListener('click', () => {
  if (data.length === 0) return alert('Data is still loading, please wait...');
  const blank = Object.fromEntries(Object.keys(data[0]).map(k => [k, '']));
  data.push(blank);
  renderTable([blank]);
});
