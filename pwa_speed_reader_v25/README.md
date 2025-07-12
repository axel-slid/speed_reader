
## 🚀 Speed-Reader PWA

A zero‑install progressive‑web‑app for rapid serial visual presentation (RSVP) reading.  
Open **index.html** in any modern browser (or install it as an app) and you’re ready to go.

### Features

| Area | What you get |
|------|--------------|
| **Upload** | • Drag‑and‑drop or file‑picker to load plain‑text.<br/>• **Start** clears previous state & bookmarks automatically. |
| **Reader** | • Variable speed (WPM) with ↑ / ↓ arrows ±10 WPM.<br/>• Current WPM, position, and remaining time shown live.<br/>• Click word to pause / resume. |
| **Bookmarks** | • Press **B** to add a bookmark at the current word.<br/>• Bookmarks are marked with **🔖** in the preview *and* small dots on the progress bar—click a dot to jump.<br/>• All bookmarks reset whenever you load new text or hit **Start** again. |
| **Library** | • Save any upload to the local‑storage library.<br/>• A confirmation dialog prevents accidental saves; cancelling shows “Save canceled”. |
| **PWA goodies** | • Works offline thanks to the service‑worker.<br/>• Installable on mobile / desktop. |

### Development

1. Clone the repo  
2. `npm i http-server -g` (or use any static server)  
3. `http-server` and browse to `http://localhost:8080`

All core logic lives in **script.js** and styles in **style.css**.  
Feel free to submit PRs for additional shortcuts, themes, or bug‑fixes!

Happy speed‑reading! 📚⚡


### New in v16‑patched4
* **Theme tab** &mdash; set background, text, and accent colors (saved to browser).
* **Right‑click bookmark deletion** &mdash; context‑menu a dot on the timeline to remove it.
* Highlighted word now sits in a smooth rounded rectangle for better focus.


### New in v16-patched5
* **Theme tab button now works** — click to open theme customization.
* **Moving highlight rectangle** — current word framed by an accent-colored rounded box both in reader and preview.
* **Original color scheme restored**; customize anytime via the Theme tab.


## v19
- Background color updated to #323437.
