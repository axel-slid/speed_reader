
/* Speed Reader – constant line flow */
const WORDS_PER_LINE = 10;

let words = [];
let current = 0;
let isPlaying = false;
let timerId = null;
let bookmarks = [];
let lastLineIdx = -1;

const flashEl = () => document.getElementById('flashWord');
const previewEl = () => document.getElementById('preview');
const progressBar = () => document.getElementById('progressBar');
const statsEl = () => document.getElementById('stats');

/* ---------- PREP ---------- */
function prepareText(){
  const raw = document.getElementById('textArea').value.trim();
  if(!raw){ alert('Paste some text first!'); return; }

  // Title detection (first line <=20 words)
  const firstLine = raw.split(/\r?\n/)[0].trim();
  document.getElementById('title').textContent =
      firstLine && firstLine.split(' ').length <= 20 ? firstLine : '';

  words = raw.replace(/\s+/g, ' ').split(' ');
  current = 0;

  // Initial render
  renderPreview(true);
  updateStats();
  updateProgress();

  switchTab('reader');
}

/* ---------- PLAYBACK ---------- */
function togglePlayPause(){
  if(isPlaying){ pauseReading(); return; }
  if(current >= words.length) current = 0;
  isPlaying = true;
  document.getElementById('playPauseBtn').textContent = 'Pause';
  scheduleNextWord(0);
}
function pauseReading(){
  if(timerId) clearTimeout(timerId);
  timerId = null;
  isPlaying = false;
  document.getElementById('playPauseBtn').textContent = 'Play';
}
function resetReading(){
  pauseReading();
  current = 0;
  renderPreview(true);
  updateProgress();
}

/* ---------- WORD TIMING ---------- */
function scheduleNextWord(delay){
  timerId = setTimeout(()=>{
     if(!isPlaying || current >= words.length){
       pauseReading();
       return;
     }
     current++;
     renderPreview();
     updateProgress();
     updateStats();
     const wpm = parseInt(document.getElementById('speedSelect').value);
     const base = 60000 / wpm;
     const factor = 0.65 + (words[current] ? words[current].length / 10 : 0);
     scheduleNextWord(base * factor);
  }, delay);
}

/* ---------- RENDER ---------- */


function renderPreview(force=false){
  flashEl().textContent = words[current] || '';

  const lineIdx = Math.floor(current / WORDS_PER_LINE);

  // If we have changed line (or force), rebuild preview with 5-line window
  if(force || lineIdx !== lastLineIdx){
     const linesHtml = [];
     const startIdx = Math.max(0, lineIdx - 3);     // show up to 3 lines above
     const endIdx   = lineIdx + 1;                  // current + incoming (total 5 max)
     for(let li = startIdx; li <= endIdx; li++){
        if(li * WORDS_PER_LINE >= words.length) continue;
        const startWord = li * WORDS_PER_LINE;
        const slice = words.slice(startWord, startWord + WORDS_PER_LINE);
        const lineWords = slice.map((w, wIdx)=>{
           const gIdx = startWord + wIdx;
           const cls = (li === lineIdx && gIdx === current) ? 'word highlight' : 'word';
           return `<span class="${cls}" data-idx="${gIdx}">${w}</span>`;
        }).join(' ');
        const lineClass = (li === endIdx) ? 'line new' : 'line';
        linesHtml.push(`<div class="${lineClass}" data-line="${li}">${lineWords}</div>`);
     }
     previewEl().innerHTML = linesHtml.join('');
     lastLineIdx = lineIdx;
  } else {
     // Same line: just move highlight
     const prev = previewEl().querySelector('.word.highlight');
     if(prev) prev.classList.remove('highlight');
     const newSpan = previewEl().querySelector(`span[data-idx='${current}']`);
     if(newSpan) newSpan.classList.add('highlight');
  }
}



/* ---------- STATS & PROGRESS ---------- */
function updateStats(){
  if(!words.length){ statsEl().textContent=''; return; }
  const wpm = parseInt(document.getElementById('speedSelect').value);
  const totalSec = words.length / wpm * 60;
  const elapsedSec = current / wpm * 60;
  const remain = Math.max(0, totalSec - elapsedSec);
  const fmt = s => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m || h) parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return parts.join(' ');
};
  statsEl().textContent = `${current}/${words.length} • est. ${fmt(remain)} left`;
}

function updateProgress(){
  if(!words.length){ progressBar().style.width='0%'; return; }
  progressBar().style.width = (current / words.length * 100) + '%';
}

/* ---------- PROGRESS BAR CLICK ---------- */
document.getElementById('progressContainer').addEventListener('click', e=>{
  if(!words.length) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  current = Math.min(words.length-1, Math.floor(words.length * pct));
  renderPreview(true);
  updateProgress();
  updateStats();
  pauseReading();
});

/* ---------- BOOKMARKS ---------- */
function addBookmark(){
  if(!words.length) return;
  bookmarks.push(current);
  renderBookmarks();
}
function renderBookmarks(){
  const list = document.getElementById('bookmarkList');
  list.innerHTML='';
  bookmarks.forEach((idx,i)=>{
     const btn=document.createElement('button');
     btn.className='bookmark';
     btn.textContent='🔖 '+(i+1);
     btn.onclick=()=>{ current = idx; renderPreview(true); updateProgress(); updateStats(); pauseReading(); };
     list.appendChild(btn);
  });
}

/* ---------- TAB NAV ---------- */
function switchTab(t){
  ['loader','reader','library'].forEach(id=>{
    document.getElementById(id).classList.toggle('active', id===t);
  });
  document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
  if(t==='loader') document.getElementById('uploadTabBtn').classList.add('active');
  if(t==='reader') document.getElementById('readerTabBtn').classList.add('active');
}


/* ---------- PDF PARSING ---------- */
/**
 * Extracts all visible text from an OCR'd PDF using pdf.js
 * @param {File} file - The PDF file chosen or pasted by the user
 * @returns {Promise<string>} - Resolves with concatenated text of the PDF
 */
async function parsePDF(file){
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({data:arrayBuffer}).promise;
  let fullText = '';
  for(let pageNum=1; pageNum<=pdf.numPages; pageNum++){
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(it=>it.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}

/* ---------- CLIPBOARD SUPPORT ---------- */
// Allow users to simply paste a PDF file (e.g. Cmd/Ctrl+V from Finder/Explorer)
document.addEventListener('paste', async e=>{
  for(const item of e.clipboardData.files){
     if(item.type==='application/pdf'){
       try{
         const txt = await parsePDF(item);
         document.getElementById('textArea').value = txt;
         alert('PDF pasted and parsed! Click "Start" to begin.');
       }catch(err){
         console.error(err);
         alert('Failed to parse PDF. Make sure it is text‑based / OCR‑ed.');
       }
       return;
     }
  }
});


/* ---------- FILE INPUT ---------- */
document.getElementById('fileInput').addEventListener('change', e=>{
  const file=e.target.files[0];
  if(!file) return;
  const fr=new FileReader();
  fr.onload = evt => { document.getElementById('textArea').value = evt.target.result; };
  fr.readAsText(file);
});


/* ---------- LIBRARY ---------- */
const LIB_KEY = 'speedReaderLibrary';

function getLibrary(){
  try{
    return JSON.parse(localStorage.getItem(LIB_KEY)) || [];
  }catch(e){ return []; }
}

function saveLibrary(arr){
  localStorage.setItem(LIB_KEY, JSON.stringify(arr));
}

// Render library grid

function renderLibrary(){
  const grid = document.getElementById('libraryGrid');
  grid.innerHTML = '';
  const lib = getLibrary();
  lib.forEach((book, idx)=>{
     const card = document.createElement('div');
     card.className = 'book-card';

     const img = document.createElement('img');
     img.src = book.cover || 'https://dummyimage.com/400x600/4b4d5c/ffffff&text=No+Cover';
     card.appendChild(img);

     const title = document.createElement('h3');
     title.textContent = book.title || ('Book '+(idx+1));
     card.appendChild(title);

     const actions = document.createElement('div');
     actions.className = 'book-actions';

     const loadBtn = document.createElement('button');
     loadBtn.textContent = 'Load';
     loadBtn.onclick = () => { loadBook(idx); };
     actions.appendChild(loadBtn);

     const delBtn = document.createElement('button');
     delBtn.textContent = '🗑️';
     delBtn.title = 'Delete';
     delBtn.onclick = () => {
         if(confirm('Delete this book?')){
            deleteBook(idx);
         }
     };
     actions.appendChild(delBtn);

     card.appendChild(actions);
     grid.appendChild(card);
  });
}


// Save current book
function saveCurrentToLibrary(){
  if(!words.length){ alert('Load text first!'); return; }
  const title = prompt('Book title?') || 'Untitled';
  const cover = prompt('Cover image URL (optional):');
  const lib = getLibrary();
  lib.push({ title, cover, content: words.join(' ') });
  saveLibrary(lib);
  alert('Saved to library!');
  renderLibrary();
}

// Load book by index
function loadBook(idx){
  const lib = getLibrary();
  if(idx<0 || idx>=lib.length){ return; }
  const book = lib[idx];
  document.getElementById('textArea').value = book.content;
  switchTab('loader');
  alert('Book loaded! Click "Start" to begin.');
}


/* Remove a book from the saved library by its index */
function deleteBook(idx){
  const lib = getLibrary();
  if(idx < 0 || idx >= lib.length) return;
  lib.splice(idx, 1);
  saveLibrary(lib);
  renderLibrary();
}


/* ---------- UPLOAD BUTTONS ---------- */
document.getElementById('uploadPdfBtn').addEventListener('click', ()=>{
  const fi = document.getElementById('fileInput');
  fi.accept = '.pdf';
  fi.value = '';
  fi.click();
});
document.getElementById('uploadTxtBtn').addEventListener('click', ()=>{
  const fi = document.getElementById('fileInput');
  fi.accept = '.txt,.text';
  fi.value = '';
  fi.click();
});
