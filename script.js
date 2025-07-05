let data = [];

// Function to fetch & parse a CSV; returns Promise of array of objects
function loadCSV(path) {
  return Papa.parse(path, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: res => {},
  }).then(res => res.data);
}

// List all your CSV filenames (URL‑encoded if spaces)
const files = [
  'Book1.csv',
  'Spare%20Components%20list%202025.csv',
  'SMD%20Components.csv',
  'Box%20in%20Cupboard.csv'
];

Promise.all(files.map(loadCSV))
  .then(results => {
    // Merge all parsed CSV data arrays into one
    data = results.flat();
  })
  .catch(err => console.error('Error loading CSVs:', err));

const searchEl = document.getElementById('search');
const resultsEl = document.getElementById('results');

searchEl.addEventListener('input', () => {
  const q = searchEl.value.toLowerCase().trim();
  const matches = q 
    ? data.filter(r =>
        Object.values(r).some(v => v && v.toLowerCase().includes(q))
      )
    : [];
  renderCards(matches);
});
