// HTML 页面内容
export const HTML_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CCMail - Email Manager</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f0f;
      color: #e0e0e0;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #333;
      margin-bottom: 30px;
    }
    h1 {
      font-size: 24px;
      color: #fff;
    }
    .domain-badge {
      background: #1a1a2e;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      color: #7c7cff;
    }
    .card {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 18px;
      font-weight: 600;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #4a4aff;
      color: white;
    }
    .btn-primary:hover {
      background: #5a5aff;
    }
    .btn-danger {
      background: #ff4a4a;
      color: white;
    }
    .btn-danger:hover {
      background: #ff5a5a;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }
    .btn-secondary {
      background: #333;
      color: #fff;
    }
    .btn-secondary:hover {
      background: #444;
    }
    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    .input-with-btn {
      position: relative;
      flex: 1;
      display: flex;
      gap: 8px;
    }
    input[type="text"] {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #333;
      border-radius: 8px;
      background: #0f0f0f;
      color: #fff;
      font-size: 14px;
    }
    input[type="text"]:focus {
      outline: none;
      border-color: #4a4aff;
    }
    .alias-list {
      display: grid;
      gap: 12px;
    }
    .alias-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #0f0f0f;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .alias-item:hover {
      background: #1f1f1f;
    }
    .alias-item.active {
      border: 1px solid #4a4aff;
    }
    .alias-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .alias-address {
      font-weight: 500;
      color: #fff;
    }
    .alias-meta {
      font-size: 12px;
      color: #888;
    }
    .alias-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
    }
    .badge-count {
      background: #2a2a4a;
      color: #7c7cff;
    }
    .badge-inactive {
      background: #4a2a2a;
      color: #ff7c7c;
    }
    .email-panel {
      display: none;
    }
    .email-panel.show {
      display: block;
    }
    .email-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .email-item {
      padding: 16px;
      border-bottom: 1px solid #333;
      cursor: pointer;
    }
    .email-item:hover {
      background: #1f1f1f;
    }
    .email-subject {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .email-from {
      font-size: 13px;
      color: #888;
    }
    .email-time {
      font-size: 12px;
      color: #666;
    }
    .code-display {
      font-size: 32px;
      font-weight: bold;
      color: #4aff4a;
      text-align: center;
      padding: 30px;
      background: #0a1a0a;
      border-radius: 12px;
      letter-spacing: 8px;
      font-family: monospace;
    }
    .code-display.empty {
      color: #666;
      font-size: 16px;
      letter-spacing: normal;
    }
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal.show {
      display: flex;
    }
    .modal-content {
      background: #1a1a1a;
      padding: 30px;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .modal-close {
      background: none;
      border: none;
      color: #888;
      font-size: 24px;
      cursor: pointer;
    }
    .email-body {
      background: #0f0f0f;
      padding: 20px;
      border-radius: 8px;
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.6;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    .copy-btn {
      background: #333;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      color: #fff;
      cursor: pointer;
      margin-top: 10px;
    }
    .copy-btn:hover {
      background: #444;
    }
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4aff4a;
      color: #000;
      padding: 12px 24px;
      border-radius: 8px;
      display: none;
    }
    .toast.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>CCMail</h1>
      <span class="domain-badge">@truspaix.com</span>
    </header>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Create New Alias</span>
      </div>
      <div class="input-group">
        <div class="input-with-btn">
          <input type="text" id="newAlias" placeholder="Enter alias (e.g., test123)">
          <button class="btn btn-secondary btn-sm" onclick="generateRandomAlias()" title="Generate random alias">Random</button>
        </div>
        <input type="text" id="aliasDesc" placeholder="Description (optional)">
        <button class="btn btn-primary" onclick="createAlias()">Create</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Email Aliases</span>
        <button class="btn btn-sm" onclick="refreshAliases()">Refresh</button>
      </div>
      <div id="aliasList" class="alias-list">
        <div class="loading">Loading...</div>
      </div>
    </div>

    <div id="emailPanel" class="card email-panel">
      <div class="card-header">
        <span class="card-title" id="selectedAliasTitle">Emails</span>
        <button class="btn btn-sm" onclick="refreshEmails()">Refresh</button>
      </div>
      <div id="latestCode" class="code-display empty">No verification code</div>
      <div style="text-align: center; margin-bottom: 20px;">
        <button class="copy-btn" onclick="copyCode()">Copy Code</button>
      </div>
      <div id="emailList" class="email-list"></div>
    </div>
  </div>

  <div id="emailModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modalSubject">Email Subject</h3>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <p id="modalFrom" style="color: #888; margin-bottom: 10px;"></p>
      <p id="modalTime" style="color: #666; font-size: 12px; margin-bottom: 20px;"></p>
      <div id="modalCode" style="margin-bottom: 20px; display: none;">
        <strong>Verification Code:</strong>
        <span style="color: #4aff4a; font-size: 20px; font-family: monospace;"></span>
      </div>
      <div id="modalBody" class="email-body"></div>
    </div>
  </div>

  <div id="toast" class="toast">Copied!</div>

  <script>
    const API_BASE = '';

    let aliases = [];
    let selectedAlias = null;
    let currentEmails = [];
    let currentCode = null;

    document.addEventListener('DOMContentLoaded', () => {
      refreshAliases();
    });

    function generateRandomAlias() {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const prefixes = ['mail', 'user', 'acc', 'tmp', 'box', 'id', 'reg'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      let suffix = '';
      for (let i = 0; i < 6; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const alias = prefix + '_' + suffix;
      document.getElementById('newAlias').value = alias;
      document.getElementById('aliasDesc').value = 'Auto generated';
    }

    async function refreshAliases() {
      try {
        const res = await fetch(API_BASE + '/api/aliases');
        const data = await res.json();
        if (data.success) {
          aliases = data.data;
          renderAliases();
        }
      } catch (e) {
        console.error('Failed to fetch aliases:', e);
      }
    }

    function renderAliases() {
      const container = document.getElementById('aliasList');
      if (aliases.length === 0) {
        container.innerHTML = '<div class="empty-state">No aliases yet. Create one above!</div>';
        return;
      }

      container.innerHTML = aliases.map(alias =>
        '<div class="alias-item ' + (selectedAlias === alias.id ? 'active' : '') + '" onclick="selectAlias(' + alias.id + ', \\'' + alias.full_address + '\\')">' +
          '<div class="alias-info">' +
            '<span class="alias-address">' + alias.full_address + '</span>' +
            '<span class="alias-meta">' + (alias.description || 'No description') + ' | Created: ' + formatDate(alias.created_at) + '</span>' +
          '</div>' +
          '<div class="alias-actions">' +
            '<span class="badge badge-count">' + alias.email_count + ' emails</span>' +
            (!alias.is_active ? '<span class="badge badge-inactive">Inactive</span>' : '') +
            '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); copyEmail(\\'' + alias.full_address + '\\')" title="Copy email address">Copy</button>' +
            '<button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteAlias(' + alias.id + ')">Delete</button>' +
          '</div>' +
        '</div>'
      ).join('');
    }

    async function createAlias() {
      const aliasInput = document.getElementById('newAlias');
      const descInput = document.getElementById('aliasDesc');
      const alias = aliasInput.value.trim().toLowerCase();
      const description = descInput.value.trim();

      if (!alias) {
        alert('Please enter an alias');
        return;
      }

      try {
        const res = await fetch(API_BASE + '/api/aliases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alias, description })
        });
        const data = await res.json();
        if (data.success) {
          aliasInput.value = '';
          descInput.value = '';
          refreshAliases();
        } else {
          alert(data.error || 'Failed to create alias');
        }
      } catch (e) {
        console.error('Failed to create alias:', e);
        alert('Failed to create alias');
      }
    }

    async function selectAlias(id, address) {
      selectedAlias = id;
      document.getElementById('selectedAliasTitle').textContent = 'Emails for ' + address;
      document.getElementById('emailPanel').classList.add('show');
      renderAliases();
      refreshEmails();
    }

    async function refreshEmails() {
      if (!selectedAlias) return;

      try {
        const [emailsRes, codeRes] = await Promise.all([
          fetch(API_BASE + '/api/aliases/' + selectedAlias + '/emails'),
          fetch(API_BASE + '/api/aliases/' + selectedAlias + '/latest-code')
        ]);

        const emailsData = await emailsRes.json();
        const codeData = await codeRes.json();

        if (emailsData.success) {
          currentEmails = emailsData.data;
          renderEmails();
        }

        if (codeData.success) {
          currentCode = codeData.data.code;
          const codeDisplay = document.getElementById('latestCode');
          if (currentCode) {
            codeDisplay.textContent = currentCode;
            codeDisplay.classList.remove('empty');
          } else {
            codeDisplay.textContent = 'No verification code';
            codeDisplay.classList.add('empty');
          }
        }
      } catch (e) {
        console.error('Failed to fetch emails:', e);
      }
    }

    function renderEmails() {
      const container = document.getElementById('emailList');
      if (currentEmails.length === 0) {
        container.innerHTML = '<div class="empty-state">No emails received yet</div>';
        return;
      }

      container.innerHTML = currentEmails.map(email =>
        '<div class="email-item" onclick="viewEmail(' + email.id + ')">' +
          '<div class="email-subject">' + escapeHtml(email.subject || '(No subject)') + '</div>' +
          '<div class="email-from">From: ' + escapeHtml(email.from_address) + '</div>' +
          '<div class="email-time">' + formatDate(email.received_at) + '</div>' +
          (email.verification_code ? '<span class="badge badge-count" style="margin-top: 8px;">Code: ' + email.verification_code + '</span>' : '') +
        '</div>'
      ).join('');
    }

    async function viewEmail(id) {
      try {
        const res = await fetch(API_BASE + '/api/emails/' + id);
        const data = await res.json();
        if (data.success) {
          const email = data.data;
          document.getElementById('modalSubject').textContent = email.subject || '(No subject)';
          document.getElementById('modalFrom').textContent = 'From: ' + email.from_address;
          document.getElementById('modalTime').textContent = formatDate(email.received_at);

          const modalCode = document.getElementById('modalCode');
          if (email.verification_code) {
            modalCode.style.display = 'block';
            modalCode.querySelector('span').textContent = email.verification_code;
          } else {
            modalCode.style.display = 'none';
          }

          document.getElementById('modalBody').textContent = email.body_text || '(No content)';
          document.getElementById('emailModal').classList.add('show');
        }
      } catch (e) {
        console.error('Failed to fetch email:', e);
      }
    }

    function closeModal() {
      document.getElementById('emailModal').classList.remove('show');
    }

    async function deleteAlias(id) {
      if (!confirm('Are you sure you want to delete this alias and all its emails?')) {
        return;
      }

      try {
        const res = await fetch(API_BASE + '/api/aliases/' + id, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          if (selectedAlias === id) {
            selectedAlias = null;
            document.getElementById('emailPanel').classList.remove('show');
          }
          refreshAliases();
        }
      } catch (e) {
        console.error('Failed to delete alias:', e);
      }
    }

    function copyCode() {
      if (!currentCode) return;
      navigator.clipboard.writeText(currentCode).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      });
    }

    function copyEmail(email) {
      navigator.clipboard.writeText(email).then(() => {
        const toast = document.getElementById('toast');
        toast.textContent = 'Email copied!';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      }).catch(err => {
        console.error('Failed to copy email:', err);
        alert('Failed to copy email address');
      });
    }

    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN');
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    document.getElementById('emailModal').addEventListener('click', (e) => {
      if (e.target.id === 'emailModal') {
        closeModal();
      }
    });

    document.getElementById('newAlias').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') createAlias();
    });
  </script>
</body>
</html>`;
