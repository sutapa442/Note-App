// =====================================================================
// renderer.js  -->  THE RENDERER PROCESS (frontend logic)
// =====================================================================
// it only talks to the backend through window.noteAPI, which was
// exposed by preload.js and travels over IPC to main.js.
// =====================================================================

const titleInput = document.getElementById('titleInput');
const contentArea = document.getElementById('contentArea');
const saveBtn = document.getElementById('saveBtn');
const newBtn = document.getElementById('newBtn');
const notesBtn = document.getElementById('notesBtn');
const closePanelBtn = document.getElementById('closePanelBtn');
const notesPanel = document.getElementById('notesPanel');
const notesList = document.getElementById('notesList');
const status = document.getElementById('status');

// Tracks which note is currently open in the editor.
// null  = a brand new, unsaved note
let currentNoteId = null;

// ---------------------------------------------------------------
// New Note: clear the editor so the user can start a fresh note.
// ---------------------------------------------------------------
newBtn.addEventListener('click', () => {
  currentNoteId = null;
  titleInput.value = '';
  contentArea.value = '';
  titleInput.focus();
  showStatus('New note — start typing.');
});

// ---------------------------------------------------------------
// Save Note: create a new note, or update the one being edited.
// ---------------------------------------------------------------
saveBtn.addEventListener('click', async () => {
  const title = titleInput.value.trim() || 'Untitled Note';
  const content = contentArea.value;

  const result = await window.noteAPI.saveNote({
    id: currentNoteId,
    title,
    content
  });

  if (result.success) {
    currentNoteId = result.note.id; 
    showStatus('Saved ✔');
  } else {
    showStatus('Failed to save: ' + result.error);
  }
});

// ---------------------------------------------------------------
// Notes button: open the panel and load the list of saved notes.
// ---------------------------------------------------------------
notesBtn.addEventListener('click', async () => {
  await refreshNotesList();
  notesPanel.classList.remove('hidden');
});

closePanelBtn.addEventListener('click', () => {
  notesPanel.classList.add('hidden');
});

// Fetches all notes from the backend and renders them as a list.
async function refreshNotesList() {
  const result = await window.noteAPI.getNotes();
  notesList.innerHTML = '';

  if (!result.success || result.notes.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-message';
    empty.textContent = 'No notes yet. Create one!';
    notesList.appendChild(empty);
    return;
  }

  result.notes.forEach((note) => {
    const li = document.createElement('li');
    li.className = 'note-item';

    const info = document.createElement('div');
    info.className = 'note-item-info';

    const titleEl = document.createElement('h3');
    titleEl.textContent = note.title;

    const dateEl = document.createElement('p');
    dateEl.textContent = 'Last edited: ' + new Date(note.updatedAt).toLocaleString();

    info.appendChild(titleEl);
    info.appendChild(dateEl);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-note-btn';
    deleteBtn.textContent = 'Delete';

    // Clicking the note itself opens it for viewing/editing.
    info.addEventListener('click', () => openNote(note));

    // Clicking Delete removes it (and stops the click from also opening it).
    deleteBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      await window.noteAPI.deleteNote(note.id);

      // If the note being deleted is the one currently open, clear the editor.
      if (note.id === currentNoteId) {
        currentNoteId = null;
        titleInput.value = '';
        contentArea.value = '';
      }

      await refreshNotesList();
    });

    li.appendChild(info);
    li.appendChild(deleteBtn);
    notesList.appendChild(li);
  });
}

// Loads a note into the editor and closes the list panel.
function openNote(note) {
  currentNoteId = note.id;
  titleInput.value = note.title;
  contentArea.value = note.content;
  notesPanel.classList.add('hidden');
  showStatus('Opened "' + note.title + '"');
}

function showStatus(message) {
  status.textContent = message;
  setTimeout(() => {
    if (status.textContent === message) status.textContent = '';
  }, 3000);
}
