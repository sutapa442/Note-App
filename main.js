// =====================================================================
// main.js  -  THE MAIN PROCESS
// =====================================================================

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// All notes are stored together as a JSON array in this one file.
// Example content: [ { id, title, content, updatedAt }, ... ]
const NOTES_FILE_PATH = path.join(app.getPath('userData'), 'notes.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // isolates renderer JS from Node/Electron internals
      nodeIntegration: false  // renderer.js cannot use require('fs') directly
    }
  });

  mainWindow.loadFile('index.html');
  
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// =====================================================================
// Small helper functions for reading/writing the notes file
// =====================================================================

// Reads all notes from disk. Returns [] if the file doesn't exist yet.
function readAllNotes() {
  if (!fs.existsSync(NOTES_FILE_PATH)) return [];
  const raw = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return []; // if the file is empty/corrupt, just start fresh
  }
}

// Overwrites the notes file with the given array.
function writeAllNotes(notes) {
  fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(notes, null, 2), 'utf-8');
}

// =====================================================================
// IPC HANDLERS  -->  the "backend API" of our app
// =====================================================================

// 1) Get every saved note (used to build the "Notes" list panel).
ipcMain.handle('get-notes', async () => {
  const notes = readAllNotes();
  // Show most recently updated notes first.
  notes.sort((a, b) => b.updatedAt - a.updatedAt);
  return { success: true, notes };
});

// 2) Save a note. If it has an id already, we UPDATE that note.
//    If it has no id, we CREATE a new one.
ipcMain.handle('save-note', async (event, noteData) => {
  try {
    const notes = readAllNotes();
    const now = Date.now();

    if (noteData.id) {
      // Update existing note
      const index = notes.findIndex((n) => n.id === noteData.id);
      if (index !== -1) {
        notes[index].title = noteData.title;
        notes[index].content = noteData.content;
        notes[index].updatedAt = now;
        writeAllNotes(notes);
        return { success: true, note: notes[index] };
      }
    }

    // Create new note
    const newNote = {
      id: now.toString(), // simple unique id based on timestamp
      title: noteData.title,
      content: noteData.content,
      updatedAt: now
    };
    notes.push(newNote);
    writeAllNotes(notes);
    return { success: true, note: newNote };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 3) Delete a note by id.
ipcMain.handle('delete-note', async (event, noteId) => {
  try {
    const notes = readAllNotes();
    const remaining = notes.filter((n) => n.id !== noteId);
    writeAllNotes(remaining);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
