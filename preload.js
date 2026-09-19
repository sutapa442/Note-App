// =====================================================================
// preload.js  -->  THE BRIDGE (runs before the web page loads)
// =====================================================================
// Uses contextBridge to expose a small, controlled API (window.noteAPI)
// to renderer.js. The renderer NEVER gets direct access to Node.js or
// Electron internals — only the specific functions we choose to
// expose here.
// =====================================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('noteAPI', {
  // Get the full list of saved notes.
  getNotes: () => ipcRenderer.invoke('get-notes'),

  // Save a note. Pass { id, title, content }.
  saveNote: (noteData) => ipcRenderer.invoke('save-note', noteData),

  // Delete a note by id.
  deleteNote: (noteId) => ipcRenderer.invoke('delete-note', noteId)
});
