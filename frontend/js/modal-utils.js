// Modal Utilities - Replace alert, confirm, and prompt with styled modals

// Simple alert modal
function showAlert(message) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width:400px; text-align:center;">
      <p style="margin:1rem 0; line-height:1.6;">${escapeModalHtml(message)}</p>
      <button class="innerbtn" onclick="this.closest('.custom-modal').remove()">OK</button>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Confirm modal with yes/no
function showConfirm(message, onConfirm, onCancel) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width:400px; text-align:center;">
      <p style="margin:1rem 0 1.5rem 0; line-height:1.6;">${escapeModalHtml(message)}</p>
      <div style="display:flex; gap:1rem; justify-content:center;">
        <button class="innerbtn cancel-btn" style="background:rgba(255,255,255,0.1);">Cancel</button>
        <button class="innerbtn confirm-btn">Confirm</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.querySelector('.confirm-btn').onclick = () => {
    modal.remove();
    if (onConfirm) onConfirm();
  };
  
  modal.querySelector('.cancel-btn').onclick = () => {
    modal.remove();
    if (onCancel) onCancel();
  };
  
  // Close on background click (counts as cancel)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      if (onCancel) onCancel();
    }
  });
}

// Prompt modal with text input
function showPrompt(message, defaultValue = '', onSubmit, onCancel) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width:450px;">
      <p style="margin:0 0 1rem 0; line-height:1.6;">${escapeModalHtml(message)}</p>
      <input type="text" class="prompt-input" value="${escapeModalHtml(defaultValue)}" 
        style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--accent); background:rgba(0,0,0,0.2); color:var(--text-color); margin-bottom:1rem;">
      <div style="display:flex; gap:1rem; justify-content:flex-end;">
        <button class="innerbtn cancel-btn" style="background:rgba(255,255,255,0.1);">Cancel</button>
        <button class="innerbtn submit-btn">Submit</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const input = modal.querySelector('.prompt-input');
  input.focus();
  input.select();
  
  const submit = () => {
    const value = input.value.trim();
    modal.remove();
    if (onSubmit) onSubmit(value);
  };
  
  modal.querySelector('.submit-btn').onclick = submit;
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submit();
  });
  
  modal.querySelector('.cancel-btn').onclick = () => {
    modal.remove();
    if (onCancel) onCancel();
  };
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      if (onCancel) onCancel();
    }
  });
}

// Helper to escape HTML in modal content
function escapeModalHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export to global scope
window.showAlert = showAlert;
window.showConfirm = showConfirm;
window.showPrompt = showPrompt;
