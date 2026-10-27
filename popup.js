const scanBtn = document.getElementById('scanBtn');
const detectTeamsBtn = document.getElementById('detectTeamsBtn');
const startCopyBtn = document.getElementById('startCopyBtn');
const openProjectsBtn = document.getElementById('openProjectsBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const teamListContainer = document.getElementById('teamListContainer');
const teamCountSpan = document.getElementById('teamCountSpan');
const targetTeamInput = document.getElementById('targetTeamInput');
const projectNameInput = document.getElementById('projectNameInput');
const copyModeSelect = document.getElementById('copyModeSelect');
const designListEl = document.getElementById('designList');
const countBadge = document.getElementById('countBadge');
const selectedCount = document.getElementById('selectedCount');
const masterCheck = document.getElementById('masterCheck');
const logBox = document.getElementById('logBox');

// Interface Elements
const workspaceSelectorBtn = document.getElementById('workspaceSelectorBtn');
const workspaceDropdownPanel = document.getElementById('workspaceDropdownPanel');
const currentTeamDisplay = document.getElementById('currentTeamDisplay');
const currentRoleDisplay = document.getElementById('currentRoleDisplay');
const teamBadgeIcon = document.getElementById('teamBadgeIcon');
const chevronIcon = document.getElementById('chevronIcon');
const progressOverlay = document.getElementById('progressOverlay');
const progressStatusText = document.getElementById('progressStatusText');
const progressPercentText = document.getElementById('progressPercentText');
const progressFill = document.getElementById('progressFill');
const settingsBtn = document.getElementById('settingsBtn');
const drawerModal = document.getElementById('drawerModal');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');

let scannedDesigns = [];
let detectedTeams = [];

// Strict team and design blocklists
const TEAM_BLOCKLIST = new Set([
  'for you', 'presentations', 'presentation', 'new presentation', 'social media',
  'photo editor', 'videos', 'video', 'landscape video', 'docs', 'doc', 'document',
  'documents', 'whiteboards', 'whiteboard', 'sheets', 'code', 'websites', 'website',
  'emails', 'email', 'custom size', 'upload', 'uploads', 'more', 'magic layers',
  'screen recorder', 'canva code', 'magic write', 'remove video bg', 'instagram post',
  'facebook post', 'resume', 'flyer', 'flyers', 'poster', 'posters', 'logo', 'logos',
  'infographic', 'infographics', 'your story', 'story', 'banner', 'banners', 'content',
  'content planner', 'brand kit', 'brand templates', 'mockups', 'mockup', 'settings',
  'account settings', 'log out', 'sign out', 'login', 'sign in', 'get canva pro',
  'try canva pro', 'trash', 'home', 'projects', 'all projects', 'your projects',
  'templates', 'brand', 'apps', 'discover apps', 'create a design', 'create design',
  'create a team', 'create new', 'create blank', 'create', 'magic studio', 'make a copy',
  'move to folder', 'download', 'download app', 'share', 'get view-only link',
  'copy to another team', 'move to trash', 'open in a new tab', 'select', 'manage teams',
  'switch team', 'switch teams', 'notifications', 'help', 'get help', 'refer friends',
  'billing', 'people', 'groups', 'shared with you', 'recent', 'recents', 'recent designs',
  'folders', 'folder', 'designs', 'design', 'images', 'image', 'owner', 'member',
  'admin', 'teacher', 'student', 'brand designer', 'personal', 'team', 'teams',
  'free', 'pro', 'canva', 'canva pro', 'canva for teams', 'canva teams', 'canva for education',
  'education', 'nonprofits', 'enterprise', 'upgrade', 'privacy policy', 'terms of use',
  'dark', 'light', 'sync with system', 'theme', 'ai', 'yourstarred', 'starred',
  'stemmed', 'close', 'cancel', 'continue', 'copy', 'back', 'next', 'save', 'edit',
  'print', 'print products', 'marketing', 'business', 'cards', 'invitations'
]);

function isValidTeamName(str) {
  if (!str || typeof str !== 'string') return false;
  const clean = str.trim();
  if (clean.length < 2 || clean.length > 55) return false;
  const lower = clean.toLowerCase();

  if (TEAM_BLOCKLIST.has(lower)) return false;
  if (/^(create|new|start|blank|open|make|get|try|view|select|copy|manage|switch)\s+/i.test(clean)) return false;
  if (/^(presentation|doc|whiteboard|video|instagram|facebook|flyer|poster|resume|logo|banner)\s*\([0-9]+(:|x|\*)[0-9]+\)/i.test(clean)) return false;
  if (/^(content|projects|templates|brand|apps|trash|settings|home|starred|recent|recents)$/i.test(lower)) return false;
  if (/^https?:\/\//i.test(clean)) return false;
  if (/^(DA|BA|FA|MA|UA)[A-Za-z0-9_-]{7,}$/.test(clean)) return false;
  if (/^[0-9a-f-]{16,}$/i.test(clean)) return false;
  if (/^\d+$/.test(clean)) return false;
  if (/\d+\s*(px|x|×|\*)\s*\d+/i.test(clean)) return false;
  if (clean.includes('@') || clean.includes('{') || clean.includes('}') || clean.includes('[') || clean.includes(']')) return false;
  if (clean.includes('<') || clean.includes('>')) return false;

  return true;
}

const DESIGN_BLOCKLIST = new Set([
  'content', 'content planner', 'new presentation', 'presentation', 'presentations',
  'presentation (16:9)', 'presentation (4:3)', 'talking presentation', 'mobile presentation',
  'doc', 'docs', 'document', 'documents', 'canva doc', 'canva docs',
  'whiteboard', 'whiteboards', 'brainstorm whiteboard',
  'social media', 'video', 'videos', 'landscape video', 'mobile video', 'tiktok video',
  'instagram post', 'instagram post (square)', 'instagram post (portrait)', 'instagram story',
  'facebook post', 'facebook post (landscape)', 'facebook cover',
  'flyer', 'flyers', 'flyer (portrait)', 'poster', 'posters', 'poster (portrait)',
  'resume', 'resumes', 'logo', 'logos', 'animated logo',
  'infographic', 'infographics', 'your story', 'story', 'banner', 'banners',
  'custom size', 'upload', 'uploads', 'magic studio', 'magic write',
  'create a design', 'create design', 'create new', 'create blank', 'create',
  'templates', 'brand kit', 'brand templates', 'projects', 'all projects', 'your projects',
  'shared with you', 'trash', 'folders', 'folder', 'designs', 'images', 'recent', 'recent designs',
  'starred', 'for you', 'photo editor', 'sheets', 'code', 'websites', 'emails',
  'manage teams', 'switch team', 'settings', 'account settings', 'log out', 'sign out'
]);

function isValidDesign(d) {
  if (!d || typeof d !== 'object') return false;
  if (!d.id || typeof d.id !== 'string') return false;
  if (!/^DA[A-Za-z0-9_-]{8,}$/.test(d.id)) return false;
  if (!d.title || typeof d.title !== 'string') return false;

  const clean = d.title.trim();
  if (clean.length < 2 || clean.length > 120) return false;
  const lower = clean.toLowerCase();

  if (DESIGN_BLOCKLIST.has(lower)) return false;
  if (/^(create|create a|create blank|new|start|blank)\s+(presentation|doc|whiteboard|video|post|flyer|poster|resume|logo|design|folder)/i.test(clean)) return false;
  if (/^(presentation|doc|whiteboard|video|instagram|facebook|flyer|poster|resume|logo|banner)\s*\([0-9]+(:|x|\*|\s*px)[0-9]*\)/i.test(clean)) return false;
  if (/^(content|projects|templates|brand|apps|trash|settings|home|starred|recent|recents)$/i.test(lower)) return false;
  if (/^(untitled\s+folder|new\s+folder)$/i.test(lower)) return false;

  return true;
}

function addLog(msg, type = '') {
  const div = document.createElement('div');
  div.className = `log-line ${type ? 'log-' + type : ''}`;
  div.textContent = `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`;
  logBox.appendChild(div);
  logBox.scrollTop = logBox.scrollHeight;
}

clearLogBtn.addEventListener('click', () => {
  logBox.innerHTML = '';
});

// Settings Drawer
settingsBtn.addEventListener('click', () => {
  drawerModal.classList.add('open');
});
closeDrawerBtn.addEventListener('click', () => {
  drawerModal.classList.remove('open');
});

// Workspace Dropdown
workspaceSelectorBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = workspaceDropdownPanel.classList.toggle('open');
  chevronIcon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
});

document.addEventListener('click', (e) => {
  if (!workspaceSelectorBtn.contains(e.target) && !workspaceDropdownPanel.contains(e.target)) {
    workspaceDropdownPanel.classList.remove('open');
    chevronIcon.style.transform = 'rotate(0deg)';
  }
});

openProjectsBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.update(tab.id, { url: 'https://www.canva.com/projects' });
    addLog('Navigating to canva.com/projects...', 'success');
  }
});

async function sendToCanvaTab(payload) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url.includes('canva.com')) {
    addLog('Canva tab not detected. Open Canva first.', 'warn');
    return null;
  }
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, payload, (response) => {
      if (chrome.runtime.lastError) {
        addLog('Extension disconnected. Refresh Canva page.', 'warn');
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

function updateActiveWorkspaceUI(teamName, role = '') {
  if (!teamName) {
    currentTeamDisplay.textContent = 'Select Target Workspace';
    currentRoleDisplay.textContent = '';
    targetTeamInput.value = '';
    return;
  }

  currentTeamDisplay.textContent = teamName;
  currentRoleDisplay.textContent = role ? `(${role})` : '';
  targetTeamInput.value = teamName;
  chrome.storage.local.set({ targetTeam: teamName });
}

function renderTeamList(teams) {
  const rawList = teams || [];
  const seen = new Set();
  const validList = [];

  rawList.forEach((t) => {
    const name = typeof t === 'string' ? t : t?.name;
    if (isValidTeamName(name)) {
      const key = name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        validList.push(typeof t === 'string' ? { name } : t);
      }
    }
  });

  detectedTeams = validList;
  teamCountSpan.textContent = detectedTeams.length;
  teamListContainer.innerHTML = '';

  if (detectedTeams.length === 0) {
    teamListContainer.innerHTML = `
      <div style="color: var(--text-muted); text-align: center; padding: 12px 6px; font-size: 11.5px;">
        No active teams detected yet. Click "Refresh" above.
      </div>
    `;
    updateActiveWorkspaceUI('');
    return;
  }

  const currentDest = targetTeamInput.value.trim();

  // If no target team selected yet, select first detected team
  if (!currentDest && detectedTeams[0]) {
    const first = detectedTeams[0];
    updateActiveWorkspaceUI(first.name, first.role || '');
  }

  detectedTeams.forEach((teamObj) => {
    const tName = typeof teamObj === 'string' ? teamObj : teamObj.name;
    const tRole = typeof teamObj === 'object' && teamObj.role ? ` (${teamObj.role})` : '';
    const isSelected = targetTeamInput.value.trim().toLowerCase() === tName.toLowerCase();

    if (isSelected) {
      updateActiveWorkspaceUI(tName, teamObj.role || '');
    }

    const item = document.createElement('div');
    item.className = `team-item-row ${isSelected ? 'active' : ''}`;
    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;overflow:hidden;flex:1;">
        <span style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tName}</span>
        <span style="color:var(--text-muted);font-size:10px;">${tRole}</span>
      </div>
      <div>
        <button class="btn-switch-tab switch-team-btn" data-name="${tName}" title="Switch Canva workspace into this team">Switch</button>
      </div>
    `;

    // Click row to set target
    item.addEventListener('click', () => {
      updateActiveWorkspaceUI(tName, teamObj.role || '');
      workspaceDropdownPanel.classList.remove('open');
      chevronIcon.style.transform = 'rotate(0deg)';
      renderTeamList(detectedTeams);
      addLog(`Target workspace set: "${tName}"`, 'success');
    });

    // Click Switch to switch Canva
    item.querySelector('.switch-team-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      addLog(`Switching Canva workspace to "${tName}"...`);
      const res = await sendToCanvaTab({ action: 'SWITCH_TEAM', teamName: tName });
      if (res && res.success) {
        addLog(`Switched workspace to "${tName}" successfully.`, 'success');
        updateActiveWorkspaceUI(tName, teamObj.role || '');
      } else {
        addLog(res?.error || `Could not auto-switch to "${tName}".`, 'warn');
      }
    });

    teamListContainer.appendChild(item);
  });
}

// Initial settings load and team recovery
chrome.storage.local.get(['targetTeam', 'projectName', 'copyMode', 'cachedTeamsV3'], async (data) => {
  if (data.projectName) projectNameInput.value = data.projectName;
  if (data.copyMode) copyModeSelect.value = data.copyMode;

  let cleanedTeams = [];
  if (data.cachedTeamsV3 && Array.isArray(data.cachedTeamsV3)) {
    cleanedTeams = data.cachedTeamsV3.filter((t) => {
      const name = typeof t === 'string' ? t : t?.name;
      return isValidTeamName(name);
    });
    if (cleanedTeams.length !== data.cachedTeamsV3.length) {
      chrome.storage.local.set({ cachedTeamsV3: cleanedTeams });
    }
  }

  if (cleanedTeams.length > 0) {
    renderTeamList(cleanedTeams);
  }

  if (data.targetTeam && isValidTeamName(data.targetTeam)) {
    updateActiveWorkspaceUI(data.targetTeam);
  } else if (cleanedTeams.length > 0) {
    const firstName = typeof cleanedTeams[0] === 'string' ? cleanedTeams[0] : cleanedTeams[0].name;
    updateActiveWorkspaceUI(firstName);
  }

  const res = await sendToCanvaTab({ action: 'GET_CACHED_OR_DETECT_TEAMS' });
  if (res && res.teams && res.teams.length > 0) {
    const validTeams = res.teams.filter((t) => {
      const name = typeof t === 'string' ? t : t?.name;
      return isValidTeamName(name);
    });
    if (validTeams.length > 0) {
      chrome.storage.local.set({ cachedTeamsV3: validTeams });
      if (!targetTeamInput.value && validTeams[0]) {
        const firstName = typeof validTeams[0] === 'string' ? validTeams[0] : validTeams[0].name;
        updateActiveWorkspaceUI(firstName);
      }
      renderTeamList(validTeams);
      addLog(`Discovered ${validTeams.length} verified workspace teams.`, 'success');
    }
  }
});

projectNameInput.addEventListener('input', () => {
  chrome.storage.local.set({ projectName: projectNameInput.value.trim() });
});

copyModeSelect.addEventListener('change', () => {
  chrome.storage.local.set({ copyMode: copyModeSelect.value });
});

detectTeamsBtn.addEventListener('click', async () => {
  detectTeamsBtn.disabled = true;
  addLog('Scanning Canva accounts and switchers...');
  const res = await sendToCanvaTab({ action: 'FORCE_DETECT_TEAMS' });
  detectTeamsBtn.disabled = false;

  if (res && res.teams && res.teams.length > 0) {
    const validTeams = res.teams.filter((t) => {
      const name = typeof t === 'string' ? t : t?.name;
      return isValidTeamName(name);
    });
    chrome.storage.local.set({ cachedTeamsV3: validTeams });
    renderTeamList(validTeams);
    addLog(`Identified ${validTeams.length} teams.`, 'success');
  } else {
    addLog('Teams list not visible. Click Profile in Canva once to populate.', 'warn');
  }
});

function showProgress(text, percent = 50) {
  progressOverlay.classList.add('visible');
  progressStatusText.textContent = text;
  progressPercentText.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
}

function hideProgress(delay = 1200) {
  setTimeout(() => {
    progressOverlay.classList.remove('visible');
  }, delay);
}

scanBtn.addEventListener('click', async () => {
  scanBtn.disabled = true;
  showProgress('Scanning project designs...', 35);
  addLog('Scanning active Canva project viewport...');
  const res = await sendToCanvaTab({ action: 'SCAN_DESIGNS' });
  scanBtn.disabled = false;

  if (res && res.designs) {
    scannedDesigns = res.designs.filter(isValidDesign);
    renderDesignList();
    showProgress(`Loaded ${scannedDesigns.length} designs`, 100);
    hideProgress(1000);
    addLog(`Loaded ${scannedDesigns.length} verified designs.`, 'success');
  } else {
    hideProgress(500);
  }
});

async function copySingleDesign(designId, designTitle) {
  const targetTeam = targetTeamInput.value.trim();
  const projectName = projectNameInput.value.trim() || 'Migrated Project';

  if (!targetTeam || !isValidTeamName(targetTeam)) {
    addLog('Select a target workspace team first.', 'warn');
    workspaceDropdownPanel.classList.add('open');
    return;
  }

  showProgress(`Copying "${designTitle}"...`, 45);
  addLog(`Transferring "${designTitle}" to "${targetTeam}"...`);

  const res = await sendToCanvaTab({
    action: 'START_COPY',
    targetTeam,
    projectName,
    copyMode: 'individual',
    selectedIds: [designId]
  });

  if (res && res.success) {
    showProgress(`Transferred "${designTitle}"`, 100);
    hideProgress(1500);
    addLog(`Transferred "${designTitle}" successfully.`, 'success');
  } else {
    hideProgress(800);
    addLog(res?.error || `Failed to transfer "${designTitle}".`, 'warn');
  }
}

startCopyBtn.addEventListener('click', async () => {
  const targetTeam = targetTeamInput.value.trim();
  const projectName = projectNameInput.value.trim() || 'Migrated Project';
  const copyMode = copyModeSelect.value;

  if (!targetTeam || !isValidTeamName(targetTeam)) {
    addLog('Select target workspace team first.', 'warn');
    workspaceDropdownPanel.classList.add('open');
    return;
  }

  const selectedIds = Array.from(document.querySelectorAll('.design-check:checked')).map(
    (cb) => cb.dataset.id
  );

  if (selectedIds.length === 0) {
    addLog('No designs selected. Check at least one item.', 'warn');
    return;
  }

  startCopyBtn.disabled = true;
  showProgress(`Copying ${selectedIds.length} files...`, 20);
  addLog(`Initiating transfer of ${selectedIds.length} designs to "${targetTeam}"...`);

  const res = await sendToCanvaTab({
    action: 'START_COPY',
    targetTeam,
    projectName,
    copyMode,
    selectedIds
  });

  startCopyBtn.disabled = false;
  if (res && res.success) {
    showProgress(`Completed (${res.copiedCount} copied)`, 100);
    hideProgress(2000);
    addLog(`Transfer complete. (${res.copiedCount} designs processed)`, 'success');
  } else {
    hideProgress(1000);
    addLog(res?.error || 'Transfer finished with status alerts. Check Canva tab.', 'warn');
  }
});

function renderDesignList() {
  scannedDesigns = (scannedDesigns || []).filter(isValidDesign);
  countBadge.textContent = `${scannedDesigns.length} Designs`;
  designListEl.innerHTML = '';

  if (scannedDesigns.length === 0) {
    designListEl.innerHTML = `
      <div style="color: var(--text-muted); text-align: center; padding: 22px 10px; font-size: 11.5px;">
        No designs scanned yet.<br/>Click <strong>"Scan Designs"</strong> to load items.
      </div>
    `;
    updateSelectedCounter();
    return;
  }

  scannedDesigns.forEach((d) => {
    const card = document.createElement('div');
    card.className = 'design-item-card';

    const thumbHtml = d.thumb
      ? `<img src="${d.thumb}" class="thumbnail-box" alt="" />`
      : `<div class="thumbnail-box">
           <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
             <circle cx="8.5" cy="8.5" r="1.5"></circle>
             <polyline points="21 15 16 10 5 21"></polyline>
           </svg>
         </div>`;

    const subtitle = d.id ? `Social Template • DA${d.id.slice(2, 7)}` : 'Canva Workspace Design';

    card.innerHTML = `
      <div class="card-meta-wrap">
        <input type="checkbox" class="checkbox-modern design-check" data-id="${d.id}" checked />
        ${thumbHtml}
        <div class="design-title-col">
          <div class="design-h3" title="${d.title}">${d.title}</div>
          <div class="design-caption-sub">${subtitle}</div>
        </div>
      </div>
      <button class="btn-action-glow single-copy-btn" data-id="${d.id}" data-title="${d.title}">Copy to Team</button>
    `;

    card.querySelector('.single-copy-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      copySingleDesign(d.id, d.title);
    });

    designListEl.appendChild(card);
  });

  updateSelectedCounter();
  document.querySelectorAll('.design-check').forEach((cb) => {
    cb.addEventListener('change', updateSelectedCounter);
  });
}

masterCheck.addEventListener('change', () => {
  document.querySelectorAll('.design-check').forEach((cb) => {
    cb.checked = masterCheck.checked;
  });
  updateSelectedCounter();
});

function updateSelectedCounter() {
  const checked = document.querySelectorAll('.design-check:checked').length;
  selectedCount.textContent = `${checked} selected`;
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'PROGRESS_LOG') {
    addLog(msg.text, msg.level || '');
    if (msg.text.includes('Loading') || msg.text.includes('Loaded') || msg.text.includes('Copying')) {
      showProgress(msg.text, 65);
    }
  }
  if (msg.type === 'TEAMS_LIVE_UPDATE' && msg.teams) {
    const validTeams = msg.teams.filter((t) => {
      const name = typeof t === 'string' ? t : t?.name;
      return isValidTeamName(name);
    });
    chrome.storage.local.set({ cachedTeamsV3: validTeams });
    renderTeamList(validTeams);
  }
});
