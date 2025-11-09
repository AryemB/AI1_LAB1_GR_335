const map = L.map('map').setView([51.505, -0.09], 17);

L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 19, attribution: 'Tiles © Esri — Source: Esri, Earthstar Geographics' }
).addTo(map);

const locBtn = document.getElementById('locBtn');
const snapshotBtn = document.getElementById('snapshotBtn');
const notifyReq = document.getElementById('notifyReq');
const snapshotDiv = document.getElementById('snapshot');
const piecesDiv = document.getElementById('pieces');
const slotsDiv = document.getElementById('slots');

let piecesData = [];

locBtn.addEventListener('click', () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      map.setView([lat, lon], 17);
      L.marker([lat, lon]).addTo(map)
        .bindPopup(`Moja lokalizacja<br>${lat.toFixed(5)}, ${lon.toFixed(5)}`).openPopup();
    },
    () => alert('Brak zgody na geolokalizację')
  );
});

notifyReq.addEventListener('change', async () => {
  if (notifyReq.checked && Notification.permission !== 'granted')
    await Notification.requestPermission();
});

snapshotBtn.addEventListener('click', async () => {
  snapshotBtn.disabled = true;
  await captureAndMakePieces();
  snapshotBtn.disabled = false;
});


async function captureAndMakePieces() {
  const mapEl = document.getElementById('map');
  const controls = mapEl.querySelector('.leaflet-control-container'); 

  if (controls) controls.style.display = 'none';

  const canvas = await html2canvas(mapEl, { useCORS: true, scale: 1 });

  if (controls) controls.style.display = '';

  const rows = 4, cols = 4;
  const pw = Math.floor(canvas.width / cols);
  const ph = Math.floor(canvas.height / rows);
  piecesData = [];

  snapshotDiv.innerHTML = '';
  const imgShot = document.createElement('img');
  imgShot.src = canvas.toDataURL();
  imgShot.style.width = '100%';
  imgShot.style.height = '100%';
  imgShot.style.objectFit = 'cover';
  snapshotDiv.appendChild(imgShot);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tmp = document.createElement('canvas');
      tmp.width = pw; tmp.height = ph;
      const ctx = tmp.getContext('2d');
      ctx.drawImage(canvas, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
      piecesData.push({ r, c, data: tmp.toDataURL(), index: r * cols + c });
    }
  }

  shuffleArray(piecesData);
  renderPieces();
  renderSlots();
}

function makePiece(index, src) {
  const d = document.createElement('div');
  d.className = 'piece';
  d.draggable = true;
  d.dataset.index = index;
  const img = document.createElement('img');
  img.src = src;
  d.appendChild(img);
  d.addEventListener('dragstart', ev => {
    ev.dataTransfer.setData('text/plain', index);
    ev.dataTransfer.effectAllowed = 'move';
  });
  return d;
}

function renderPieces() {
  piecesDiv.innerHTML = '';
  piecesData.forEach(p => piecesDiv.appendChild(makePiece(p.index, p.data)));
}

function renderSlots() {
  slotsDiv.innerHTML = '';
  const rows = 4, cols = 4;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const s = document.createElement('div');
      s.className = 'slot';
      s.dataset.expected = r * cols + c;

      s.addEventListener('dragover', ev => ev.preventDefault());

      s.addEventListener('drop', ev => {
        ev.preventDefault();
        const idx = ev.dataTransfer.getData('text/plain');
        const pieceObj = piecesData.find(x => x.index == idx);
        if (!pieceObj) return;

        if (s.dataset.currentIndex && !s.classList.contains('correct')) {
          const oldIdx = s.dataset.currentIndex;
          const oldImg = s.querySelector('img').src;
          piecesDiv.appendChild(makePiece(oldIdx, oldImg));
        }

        if (s.classList.contains('correct')) return;

        s.innerHTML = '';
        const img = document.createElement('img');
        img.src = pieceObj.data;
        s.appendChild(img);
        s.dataset.currentIndex = pieceObj.index;

        if (s.dataset.expected == pieceObj.index) {
          s.classList.add('correct');
          img.draggable = false; 
        } else {
          s.classList.remove('correct');

          img.draggable = true;
          img.addEventListener('dragstart', ev => {
            ev.dataTransfer.setData('text/plain', pieceObj.index);
            ev.dataTransfer.effectAllowed = 'move';
            piecesDiv.appendChild(makePiece(pieceObj.index, pieceObj.data));
            s.innerHTML = '';
            s.dataset.currentIndex = '';
          });
        }

        const el = piecesDiv.querySelector(`[data-index="${idx}"]`);
        if (el) el.remove();

        checkWin();
      });

      slotsDiv.appendChild(s);
    }
  }
}

function checkWin() {
  const total = 16;
  const correct = document.querySelectorAll('.slot.correct').length;
  if (correct === total) {
    console.log("Wszystkie puzzle ułożone poprawnie!");
    if (Notification.permission === 'granted')
      new Notification('Gratulacje!', { body: 'Wszystkie puzzle ułożone.' });
    else alert('Gratulacje! Wszystkie puzzle ułożone.');
  }
}

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}
