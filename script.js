let data = [];

// Load CSV (URL-encoded spaces)
fetch('Spare%20Components%20list%202025.csv')
  .then(r => r.text())
  .then(csv => {
    data = Papa.parse(csv.trim(), { header: true }).data;
  });

const searchEl = document.getElementById('search');
const resultsEl = document.getElementById('results');

searchEl.addEventListener('input', () => {
  const q = searchEl.value.toLowerCase().trim();
  const matches = q
    ? data.filter(r => Object.values(r).some(v => v && v.toLowerCase().includes(q)))
    : [];
  renderCards(matches);
});

document.querySelector('.clear-btn').addEventListener('click', () => {
  searchEl.value = '';
  renderCards([]);
});

function renderCards(list) {
  resultsEl.innerHTML = '';
  list.forEach(obj => {
    const card = document.createElement('div');
    card.className = 'card';

    const keys = Object.keys(obj);
    if (keys.length) {
      const legend = document.createElement('legend');
      legend.textContent = obj[keys[0]] || '—';
      card.appendChild(legend);
    }

    keys.forEach(k => {
      if (k === keys[0]) return;
      const p = document.createElement('p');
      p.innerHTML = `<span class="key">${k}:</span> <span class="value" contenteditable>${obj[k] || ''}</span>`;
      p.querySelector('.value').addEventListener('blur', e => {
        obj[k] = e.target.innerText;
      });
      card.appendChild(p);
    });
    resultsEl.appendChild(card);
  });
}

document.getElementById('add-row').addEventListener('click', () => {
  if (!data.length) return alert('Please wait—data is loading');
  const blank = Object.fromEntries(Object.keys(data[0]).map(k => [k, '']));
  data.unshift(blank);
  renderCards([blank]);
  searchEl.value = '';
});
