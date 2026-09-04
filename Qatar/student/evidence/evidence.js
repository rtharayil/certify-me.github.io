
/* Reflection character counter */
const reflection = document.getElementById('reflection');
const charCount = document.getElementById('charCount');
reflection.addEventListener('input', () => {
  charCount.textContent = reflection.value.length;
});

/* Upload files */
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadCount = document.getElementById('uploadCount');

uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const existing = fileList.querySelectorAll('.file-row').length;
  const selected = Array.from(fileInput.files).slice(0, Math.max(0, 10 - existing));

  selected.forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    let cls = 'docx';
    if (ext === 'pdf') cls = 'pdf';
    else if (ext === 'ppt' || ext === 'pptx') cls = 'ppt';
    else if (['mp4','mov','avi','webm'].includes(ext)) cls = 'mp4';

    const row = document.createElement('div');
    row.className = 'file-row';
    row.dataset.name = file.name;

    const size = file.size < 1024*1024
      ? (file.size/1024).toFixed(1) + ' KB'
      : (file.size/(1024*1024)).toFixed(1) + ' MB';

    row.innerHTML = `
      <div class="file-icon ${cls}">
        <svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/></svg>
      </div>
      <div class="file-info">
        <div class="file-name">${escapeHtml(file.name)}</div>
        <div class="file-size">${size} • ${ext.toUpperCase()}</div>
      </div>
      <div class="file-date">Uploaded on<br>${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</div>
      <div class="file-actions">
        <button class="preview" title="Preview"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/></svg></button>
        <button class="delete" title="Delete"><svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M8 10v8M12 10v8M16 10v8M6 7l1 14h10l1-14"/></svg></button>
      </div>`;
    fileList.appendChild(row);
  });

  bindFileButtons();
  updateCount();
  fileInput.value = '';
});

function bindFileButtons(){
  document.querySelectorAll('.delete').forEach(btn => {
    btn.onclick = () => {
      btn.closest('.file-row').remove();
      updateCount();
    };
  });
  document.querySelectorAll('.preview').forEach(btn => {
    btn.onclick = () => alert('Preview opened for: ' + btn.closest('.file-row').dataset.name);
  });
}
function updateCount(){
  uploadCount.textContent = fileList.querySelectorAll('.file-row').length + ' / 10 files uploaded';
}
function escapeHtml(s){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
bindFileButtons();

/* Submit */
document.getElementById('submitBtn').addEventListener('click', () => {
  const count = fileList.querySelectorAll('.file-row').length;
  if (!count) {
    alert('Please upload at least one evidence file.');
    return;
  }
  alert('Evidence submitted for review.');
});
