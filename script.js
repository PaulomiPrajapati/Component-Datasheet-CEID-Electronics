let sheets = {}, data = [], headers = {};
const files = {
  "Spare Components": "Spare%20Components%20list%202025.csv",
  "SMD Components": "SMD%20Components.csv",
  "Box in Cupboard": "Box%20in%20Cupboard.csv",
  "Book1": "Book1.csv"
};

const searchEl = document.getElementById('search'),
      resultsEl = document.getElementById('results'),
      addBtn = document.getElementById('add-trigger'),
      modal = document.getElementById('add-modal'),
      sheetList = document.getElementById('sheet-list'),
      cancelAdd = document.getElementById('cancel-add');

// Load CSVs
const promises = Object.entries(files).map(([name, path]) =>
  new Promise(resolve =>
    Papa.parse(path, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: res => {
        sheets[name] = res.data;
        headers[name] = res.meta.fields;
        resolve();
      }
    })
  )
);

Promise.all(promises).then(() => {
  data = Object.entries(sheets).flatMap(([name, rows]) =>
    rows.map(r => ({ ...r, __sheet: name }))
  );
});

searchEl.addEventListener('input', () => {
  const query = searchEl.value.toLowerCase().trim();
  const results = data.filter(row =>
    Object.values(row).some(val =>
      val?.toLowerCase().includes(query)
    )
  );
  render(results);
});

function render(rows) {
  resultsEl.innerHTML = '';
  rows.forEach(row => {
    const card = document.createElement('div');
    card.className = 'card';
    const legend = document.createElement('legend');
    legend.textContent = `${row[headers[row.__sheet][0]]} (${row.__sheet})`;
    card.appendChild(legend);

    headers[row.__sheet].forEach((key, idx) => {
      const val = row[key] || '';
      const p = document.createElement('p');
      p.innerHTML = `<span class="key">${key}:</span> ${
        (val.startsWith('http') && idx === headers[row.__sheet].length - 1)
          ? `<a href="${val}" target="_blank">${val}</a>`
          : val
      }`;
      card.appendChild(p);
    });

    resultsEl.appendChild(card);
  });
}

// Add functionality
addBtn.onclick = () => {
  sheetList.innerHTML = '';
  Object.keys(sheets).forEach(sheet => {
    const li = document.createElement('li');
    li.textContent = sheet;
    li.onclick = () => openAddForm(sheet);
    sheetList.appendChild(li);
  });
  modal.style.display = 'flex';
};

cancelAdd.onclick = () => modal.style.display = 'none';

function openAddForm(sheetName) {
  modal.style.display = 'none';
  const hdrs = headers[sheetName];
  const newObj = { __sheet: sheetName };

  const card = document.createElement('div');
  card.className = 'card';
  const legend = document.createElement('legend');
  legend.textContent = `Add to ${sheetName}`;
  card.appendChild(legend);

  hdrs.forEach(key => {
    const p = document.createElement('p');
    p.innerHTML = `<span class="key">${key}:</span> <span contenteditable data-key="${key}" style="margin-left: 8px; background: #eee; padding: 2px 5px;"></span>`;
    card.appendChild(p);
  });

  const save = document.createElement('button');
  save.textContent = 'Save';
  save.onclick = () => {
    card.querySelectorAll('[contenteditable]').forEach(span => {
      newObj[span.dataset.key] = span.innerText.trim();
    });
    sheets[sheetName].push(newObj);
    data.push(newObj);
    render([newObj]);
  };

  card.appendChild(save);
  resultsEl.innerHTML = '';
  resultsEl.appendChild(card);
}
