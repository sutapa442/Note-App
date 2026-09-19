# My Notes (ElectronJS Demo — Multiple Notes)

A simple Electron app for creating, saving, viewing, and editing
multiple titled notes.

## Files
- `main.js` — Main process (Node.js). Stores all notes as a JSON array
  in one file and handles get/save/delete.
- `preload.js` — Bridge exposing a safe API (`window.noteAPI`) to the renderer.
- `index.html` — UI: editor (title + content) and a "Notes" list panel.
- `style.css` — Styling.
- `renderer.js` — Frontend logic: New Note, Save, open the Notes list,
  click a note to view/edit it, delete a note.

## How It Works
- Click New Note to clear the editor and start fresh.
- Type a title and content, then click Save Note.
  - If you're editing an existing note, Save updates it.
  - If it's a new note, Save creates it.
- Click Notes to open the list of all saved notes (title + last-edited time).
- Click any note in the list to load it into the editor for viewing/editing.
- Click Delete next to a note to remove it permanently.

All notes are stored together as a JSON array in one file:
`notes.json`, inside your OS's app-data folder
(`app.getPath('userData')` in `main.js`) — not in this project folder.

## How to Run

1. Install [Node.js](https://nodejs.org) (includes npm) if you don't have it.
2. Open a terminal in this folder.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the app:
   ```
   npm start
   ```
