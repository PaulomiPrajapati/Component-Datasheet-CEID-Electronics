let sheets = {}, data = [], headers = {};
const files = {
  "Spare Components": 'Spare%20Components%20list%202025.csv',
  "SMD Components": 'SMD%20Components.csv',
  "Box in Cupboard": 'Box%20in%20Cupboard.csv',
  "Book1": 'Book1.csv'
};

// Load all sheets
const promises = Object.entries(files).map(([name, path]) =>
  Papa.parse(path, {
    download: true, header: true, skipEmptyLines: true,
    complete: res => { sheets[name] = res.data; headers[name] = res.meta.fields; }
  })
);
Promise.all(promises).then(() => {
  data = Object.entries(sheets).flatMap(([name, arr]) =>
    arr.map(r => ({...r, __sheet: name}))
  );
});

const searchEl = document.getElementById('search'),
      resultsEl = document.getElementById('results'),
      addBtn = document.getElementById('add-trigger'),
      modal = document.getElementById('add-modal'),
      sheetList = document.getElementById('sheet-list'),
      cancelAdd = document.getElementById('cancel-add');

searchEl.addEventListener('input', () => {
  const q = searchEl.value.toLowerCase().trim();
  if (!q) return resultsEl.innerHTML = '';
  const matches = data.filter(r =>
    Object.entries(r).some(([k,v])=>k!=='__sheet' && v && v.toLowerCase().includes(q))
  );
  render(matches);
});

function render(arr) {
  resultsEl.innerHTML = '';
  arr.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card';
    const legend = document.createElement('legend');
    legend.textContent = r[headers[r.__sheet][0]]+` (${r.__sheet})`;
    card.appendChild(legend);
    headers[r.__sheet].forEach(k => {
      if (k === headers[r.__sheet][0]) return;
      const p = document.createElement('p');
      const val = r[k] || '';
      if (k.toLowerCase().includes('datasheet') && val.startsWith('http')) {
        p.innerHTML = `<span class="key">${k}:</span> <a href="${val}" target="_blank">${val}</a>`;
      } else {
        p.innerHTML = `<span class="key">${k}:</span> <span contenteditable>${val}</span>`;
      }
      card.appendChild(p);
    });
    resultsEl.appendChild(card);
  });
}

// Add-new flow
addBtn.addEventListener('click', () => {
  sheetList.innerHTML = '';
  Object.keys(sheets).forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    li.onclick = () => openAddForm(name);
    sheetList.appendChild(li);
  });
  modal.style.display = 'block';
});

cancelAdd.onclick = ()=>modal.style.display='none';

function openAddForm(sheetName) {
  modal.style.display = 'none';
  resultsEl.innerHTML = '';
  const hdr = headers[sheetName];
  const card = document.createElement('div');
  card.className = 'card';
  const legend = document.createElement('legend');
  legend.textContent = `New in ${sheetName}`;
  card.appendChild(legend);
  const newObj = {__sheet: sheetName};
  hdr.forEach(k => {
    const p = document.createElement('p');
    const span = document.createElement('span');
    span.className = 'key';
    span.textContent = k + ':';
    const inp = document.createElement('span');
    inp.setAttribute('contenteditable','true');
    inp.style.marginLeft = '8px';
    p.appendChild(span);
    p.appendChild(inp);
    inp.onblur = () => newObj[k] = inp.innerText;
    card.appendChild(p);
  });
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.onclick = () => {
    sheets[sheetName].push(newObj);
    data.unshift(newObj);
    render([newObj]);
  };
  card.appendChild(saveBtn);
  resultsEl.appendChild(card);
}
