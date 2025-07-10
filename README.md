## Speed-Reader PWA

A zero-install progressive-web-app for rapid serial visual presentation (RSVP) reading.
Open **index.html** in any modern browser (or install it as an app) and you’re ready to go.

### Features

| Area | What you get |
|------|--------------|
| **Upload** | • Drag-and-drop or file-picker to load plain-text.<br>• **Start** clears previous state & bookmarks automatically. |
| **Reader** | • Variable speed (WPM) with ↑ / ↓ arrows ±10 WPM.<br>• Current WPM, position, and remaining time shown live.<br>• Click to pause / resume. |
| **Bookmarks** | • Press **B** to toggle a bookmark at the current word.<br>• Bookmarks have **🔖** flags in the preview window **and** little dots on the progress bar—click a dot to jump.<br>• All bookmarks reset whenever you load a new file. |
| **Library** | • Save any upload to the local-storage library.<br>• A confirmation dialog prevents accidental saves; cancelling shows “Save canceled”. |
| **PWA goodies** | • Works offline (service-worker).<br>• Installable on mobile / desktop. |

### Development

1. Clone the repo  
2. `npm i http-server -g` (or use any static server)  
3. `http-server` and browse to `http://localhost:8080`

All core logic lives in **script.js** and styles in **style.css**.  
Feel free to submit PRs for additional shortcuts, themes, or bug-fixes!

---

Happy speed-reading! 📚⚡
