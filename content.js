const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Master map of discovered teams: name -> { name, role }
const discoveredTeams = new Map();

const strictBlocklist = new Set([
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

const validSecondLineRoles = new Set([
  'free', 'pro', 'team', 'teams', 'canva pro', 'canva teams', 'canva for teams',
  'education', 'canva for education', 'nonprofits', 'enterprise',
  'owner', 'admin', 'member', 'teacher', 'student', 'brand designer', 'personal'
]);

function isValidTeamName(str) {
  if (!str || typeof str !== 'string') return false;
  const clean = str.trim();
  if (clean.length < 2 || clean.length > 55) return false;
  const lower = clean.toLowerCase();

  if (strictBlocklist.has(lower)) return false;
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

const designBlocklist = new Set([
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

function isValidDesignTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const clean = title.trim();
  if (clean.length < 2 || clean.length > 120) return false;
  const lower = clean.toLowerCase();

  if (designBlocklist.has(lower)) return false;
  if (/^(create|create a|create blank|new|start|blank)\s+(presentation|doc|whiteboard|video|post|flyer|poster|resume|logo|design|folder)/i.test(clean)) return false;
  if (/^(presentation|doc|whiteboard|video|instagram|facebook|flyer|poster|resume|logo|banner)\s*\([0-9]+(:|x|\*|\s*px)[0-9]*\)/i.test(clean)) return false;
  if (/^(content|projects|templates|brand|apps|trash|settings|home|starred|recent|recents)$/i.test(lower)) return false;
  if (/^(untitled\s+folder|new\s+folder)$/i.test(lower)) return false;

  return true;
}

function addDiscoveredTeam(rawName, role = '') {
  if (!rawName || typeof rawName !== 'string') return;
  const clean = rawName.trim();

  if (!isValidTeamName(clean)) {
    return;
  }

  const existing = discoveredTeams.get(clean);
  if (!existing || (!existing.role && role)) {
    discoveredTeams.set(clean, { name: clean, role: role || existing?.role || '' });
    saveTeamsToStorage();
  }
}

function saveTeamsToStorage() {
  const list = Array.from(discoveredTeams.values()).filter((t) => isValidTeamName(t.name));
  if (list.length > 0) {
    chrome.storage.local.set({ cachedTeamsV3: list });
    chrome.runtime.sendMessage({ type: 'TEAMS_LIVE_UPDATE', teams: list }).catch(() => {});
  }
}

// Listen for teams found by injected.js in the MAIN world
window.addEventListener('CANVA_PORTAL_TEAMS_UPDATED', (e) => {
  if (Array.isArray(e.detail)) {
    e.detail.forEach((t) => {
      if (t && t.name && isValidTeamName(t.name)) {
        addDiscoveredTeam(t.name, t.role || '');
      }
    });
  }
});

// Scan any open menu/popover or "/settings/your-teams" table on the page
function scanDOMForTeams() {
  // 1. If user is on canva.com/settings/your-teams
  if (location.pathname.includes('/your-teams') || location.pathname.includes('/settings')) {
    document.querySelectorAll('table tr, [role="row"], main li').forEach((row) => {
      const lines = (row.innerText || '').split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const possibleRole = lines.find((l) => validSecondLineRoles.has(l.toLowerCase()));
        if (possibleRole && lines[0] !== possibleRole && isValidTeamName(lines[0])) {
          addDiscoveredTeam(lines[0], possibleRole);
        }
      }
    });
  }

  // 2. Scan currently open menus / popovers for Canva's Team Switcher items
  const menus = document.querySelectorAll('[role="menu"], [role="listbox"]');
  menus.forEach((menu) => {
    const fullMenuText = (menu.innerText || '').toLowerCase();
    // Never scan "Create a design" or presentation pickers
    if (
      fullMenuText.includes('for you') ||
      fullMenuText.includes('presentations') ||
      fullMenuText.includes('custom size') ||
      fullMenuText.includes('what will you design')
    ) {
      return;
    }

    const isTeamMenu =
      fullMenuText.includes('switch team') ||
      fullMenuText.includes('manage teams') ||
      fullMenuText.includes('create a team') ||
      fullMenuText.includes('account settings') ||
      fullMenuText.includes('log out') ||
      fullMenuText.includes('copy to another team');

    const items = menu.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="option"], li, button, a');
    items.forEach((el) => {
      const lines = (el.innerText || '').split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 2) {
        // Classic Canva team row: Line 1 = Team Name, Line 2 = "Free" / "Pro" / "Team" / "Owner" / "Member"
        const line2Lower = lines[1].toLowerCase();
        if (
          validSecondLineRoles.has(line2Lower) ||
          line2Lower.includes('member') ||
          line2Lower.includes('team') ||
          line2Lower.includes('free') ||
          line2Lower.includes('pro') ||
          line2Lower.includes('edu')
        ) {
          if (isValidTeamName(lines[0])) {
            addDiscoveredTeam(lines[0], lines[1]);
          }
        }
      } else if (lines.length === 1 && isTeamMenu && !fullMenuText.includes('log out')) {
        const isRadio = el.getAttribute('role') === 'menuitemradio' || el.getAttribute('role') === 'option';
        const inRadioList = el.closest('[role="menuitemradio"], [role="radiogroup"], [role="listbox"]');
        if ((isRadio || inRadioList || fullMenuText.includes('copy to another team')) && isValidTeamName(lines[0])) {
          addDiscoveredTeam(lines[0]);
        }
      }
    });
  });

  // 3. Also check the active Team Header in Canva's left sidebar
  const sidebarHeader = document.querySelector('aside, nav');
  if (sidebarHeader) {
    sidebarHeader.querySelectorAll('button, a, div[role="button"]').forEach((btn) => {
      const lines = (btn.innerText || '').split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 2 && validSecondLineRoles.has(lines[1].toLowerCase())) {
        if (isValidTeamName(lines[0])) {
          addDiscoveredTeam(lines[0], `${lines[1]} • Current`);
        }
      }
    });
  }
}

// Continuous 24/7 MutationObserver: whenever ANY menu opens on Canva, instantly grab the teams!
const observer = new MutationObserver(() => {
  scanDOMForTeams();
});
observer.observe(document.documentElement, { childList: true, subtree: true });

function sendProgress(text, level = '') {
  chrome.runtime.sendMessage({ type: 'PROGRESS_LOG', text, level }).catch(() => {});
}

function realClick(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const clientX = rect.left + rect.width / 2;
  const clientY = rect.top + rect.height / 2;
  const opts = { bubbles: true, cancelable: true, view: window, clientX, clientY, button: 0, buttons: 1 };

  el.dispatchEvent(new PointerEvent('pointerover', opts));
  el.dispatchEvent(new MouseEvent('mouseover', opts));
  el.dispatchEvent(new PointerEvent('pointerdown', opts));
  el.dispatchEvent(new MouseEvent('mousedown', opts));
  el.focus?.();
  el.dispatchEvent(new PointerEvent('pointerup', opts));
  el.dispatchEvent(new MouseEvent('mouseup', opts));
  el.dispatchEvent(new MouseEvent('click', opts));
}

function realHover(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const opts = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2
  };
  el.dispatchEvent(new PointerEvent('pointerover', opts));
  el.dispatchEvent(new PointerEvent('pointerenter', opts));
  el.dispatchEvent(new MouseEvent('mouseover', opts));
  el.dispatchEvent(new MouseEvent('mouseenter', opts));
  el.dispatchEvent(new MouseEvent('mousemove', opts));
}

function findElementByText(selector, text) {
  const elements = Array.from(document.querySelectorAll(selector));
  const lower = text.toLowerCase();
  return elements.find(
    (el) => el.innerText && el.innerText.trim().toLowerCase().includes(lower)
  );
}

// Find Canva's Profile / Team Switcher trigger button (Avatar button in bottom-left rail, top-left sidebar, or top-right header)
function findProfileOrTeamTriggerButtons() {
  const candidates = [];

  // 1. Any button in sidebar/header whose text has 2 lines where line 2 is Free/Team/Pro/Education
  document.querySelectorAll('aside button, nav button, header button').forEach((btn) => {
    const txt = (btn.innerText || '').trim();
    const label = (btn.getAttribute('aria-label') || '').toLowerCase();
    if (label.includes('create') || txt.toLowerCase().includes('create')) return;

    const lines = txt.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 2 && validSecondLineRoles.has(lines[1].toLowerCase())) {
      candidates.unshift(btn); // Highest priority!
    } else if (
      label.includes('account') ||
      label.includes('profile') ||
      label.includes('switch team') ||
      label.includes('team')
    ) {
      candidates.push(btn);
    }
  });

  // 2. Avatar buttons (buttons containing a profile image or avatar initials in the left rail or top-right header)
  document.querySelectorAll('aside button, nav button, header button').forEach((btn) => {
    const label = ((btn.innerText || '') + ' ' + (btn.getAttribute('aria-label') || '')).toLowerCase();
    if (label.includes('create') || label.includes('notification') || label.includes('help')) return;
    const hasAvatarImg = btn.querySelector('img[src*=" avatar" i], img[src*="profile" i], img[src*="user" i], img[alt]');
    if (hasAvatarImg && !candidates.includes(btn)) {
      candidates.push(btn);
    }
  });

  return candidates;
}

// Actively open Canva's Team Switcher and extract the full team list
async function forceDetectAllTeams() {
  window.dispatchEvent(new CustomEvent('CANVA_PORTAL_REQUEST_TEAMS'));
  scanDOMForTeams();

  const triggers = findProfileOrTeamTriggerButtons();

  for (let i = 0; i < Math.min(triggers.length, 4); i++) {
    realClick(triggers[i]);
    await sleep(650);
    scanDOMForTeams();

    // If an Account menu opened that has a "Switch team" item, hover/click it to expand the full team list
    const switchTeamRow = findElementByText('[role="menuitem"], [role="button"], button, a, span', 'switch team');
    if (switchTeamRow) {
      realHover(switchTeamRow);
      realClick(switchTeamRow);
      await sleep(650);
      scanDOMForTeams();
    }

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(250);

    if (discoveredTeams.size > 1) break;
  }

  // Also check first design card's "Copy to another team" submenu if on Projects page
  const cards = getDesignCards();
  if (cards.length > 0) {
    const firstCard = cards[0];
    firstCard.cardEl.scrollIntoView({ block: 'center', behavior: 'instant' });
    realHover(firstCard.cardEl);
    realHover(firstCard.linkEl);
    await sleep(300);

    const moreBtn =
      firstCard.cardEl.querySelector('button[aria-label*="More" i]') ||
      firstCard.cardEl.querySelector('button[aria-haspopup="menu"]');

    if (moreBtn) {
      realClick(moreBtn);
      await sleep(550);

      const copyToTeamOption = findElementByText(
        '[role="menuitem"], [role="option"], button, span',
        'copy to another team'
      );

      if (copyToTeamOption) {
        realHover(copyToTeamOption);
        realClick(copyToTeamOption);
        await sleep(600);
        scanDOMForTeams();
      }
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }
  }

  return Array.from(discoveredTeams.values());
}

// Automatically switch Canva into a specific team when user clicks "Switch ↗"
async function switchCanvaTeam(targetTeamName) {
  const triggers = findProfileOrTeamTriggerButtons();
  for (const btn of triggers) {
    realClick(btn);
    await sleep(650);

    let teamEl = findElementByText('[role="menuitem"], [role="menuitemradio"], [role="option"], button, a', targetTeamName);
    if (!teamEl) {
      const switchTeamRow = findElementByText('[role="menuitem"], button, span', 'switch team');
      if (switchTeamRow) {
        realHover(switchTeamRow);
        realClick(switchTeamRow);
        await sleep(600);
        teamEl = findElementByText('[role="menuitem"], [role="menuitemradio"], [role="option"], button, a', targetTeamName);
      }
    }

    if (teamEl) {
      realClick(teamEl);
      return { success: true };
    }

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(200);
  }
  return { success: false, error: `Open your Canva Profile menu once to switch to "${targetTeamName}".` };
}

function getDesignCards() {
  const allLinks = Array.from(document.querySelectorAll('a[href*="/design/"]'));
  const validLinks = allLinks.filter((link) => {
    // 1. Exclude navigation, sidebar, header, dialogs, quick actions, template banners
    if (
      link.closest(
        'header, nav, aside, [role="navigation"], [role="banner"], [role="dialog"], ' +
        '[data-testid*="sidebar"], [data-testid*="header"], [data-testid*="quick-create"], ' +
        '[data-testid*="create-bar"], [data-testid*="template-carousel"], ' +
        '[aria-label*="What will you design" i], section[aria-label*="create" i]'
      )
    ) {
      return false;
    }

    // 2. Exclude creation/template URLs
    const href = link.getAttribute('href') || link.href || '';
    if (
      href.includes('/play') ||
      href.includes('/templates/') ||
      href.includes('template=') ||
      href.includes('category=') ||
      href.includes('/design/new') ||
      href.includes('/design/create')
    ) {
      return false;
    }

    // 3. Must match a valid Canva Design ID (starts with DA)
    const match = href.match(/\/design\/(DA[A-Za-z0-9_-]{8,})/);
    return !!match;
  });

  const uniqueCards = new Map();

  validLinks.forEach((link) => {
    const href = link.getAttribute('href') || link.href || '';
    const match = href.match(/\/design\/(DA[A-Za-z0-9_-]{8,})/);
    if (!match) return;
    const id = match[1];
    if (uniqueCards.has(id)) return;

    const card =
      link.closest('[role="group"], [data-testid*="item"], [data-testid*="card"], [data-testid*="design"], li, .item') ||
      link.parentElement?.parentElement;
    if (!card) return;

    // Extract title accurately
    let rawTitle = '';

    // Check inner element with title attribute
    const titleEl = card.querySelector('span[title], p[title], div[title], h3, h4, [data-testid*="title"]');
    if (titleEl && titleEl.getAttribute('title')) {
      rawTitle = titleEl.getAttribute('title');
    } else if (titleEl && titleEl.innerText) {
      rawTitle = titleEl.innerText;
    }

    if (!rawTitle) {
      const ariaLabel = link.getAttribute('aria-label') || card.getAttribute('aria-label') || '';
      rawTitle = ariaLabel
        .replace(/^(open\s+design:?|edit\s+design:?|design:?|open:?)\s*/i, '')
        .trim();
    }

    if (!rawTitle && card.innerText) {
      const lines = card.innerText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !/^edited\s+/i.test(l) && !/^(design|folder|presentation)$/i.test(l));
      if (lines.length > 0) {
        rawTitle = lines[0];
      }
    }

    if (!rawTitle) {
      rawTitle = `Design ${id.slice(0, 8)}`;
    }

    const title = rawTitle.trim();

    // Validate title: discard if it matches generic presets ("Content", "New presentation", etc.)
    if (!isValidDesignTitle(title)) {
      return;
    }

    const imgEl = card.querySelector('img[src]:not([src*="avatar"]):not([src*="user"])');
    const thumb = imgEl ? imgEl.src : '';

    uniqueCards.set(id, { id, title, thumb, linkEl: link, cardEl: card });
  });

  return Array.from(uniqueCards.values());
}

async function autoScrollAndScan() {
  sendProgress('Auto-scrolling to load all designs in team...');
  let lastCount = 0;
  let sameCountAttempts = 0;

  const scrollContainer =
    document.querySelector('main') ||
    document.querySelector('[role="main"]') ||
    document.scrollingElement;

  for (let i = 0; i < 20; i++) {
    scrollContainer.scrollBy({ top: 1400, behavior: 'smooth' });
    window.scrollBy({ top: 1400, behavior: 'smooth' });
    await sleep(750);

    const currentCards = getDesignCards();
    if (currentCards.length === lastCount) {
      sameCountAttempts++;
      if (sameCountAttempts >= 2) break;
    } else {
      sameCountAttempts = 0;
      lastCount = currentCards.length;
      sendProgress(`Loaded ${lastCount} designs...`);
    }
  }

  scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  await sleep(500);

  return getDesignCards().map(({ id, title, thumb }) => ({ id, title, thumb }));
}

async function selectAllDesignsInUI(targetIds = null) {
  const cards = getDesignCards();
  let selected = 0;

  for (const item of cards) {
    if (targetIds && targetIds.length > 0 && !targetIds.includes(item.id)) {
      continue;
    }

    item.cardEl.scrollIntoView({ block: 'center', behavior: 'instant' });
    realHover(item.cardEl);
    realHover(item.linkEl);
    await sleep(80);

    const checkbox =
      item.cardEl.querySelector('input[type="checkbox"]') ||
      item.cardEl.querySelector('[role="checkbox"]') ||
      item.cardEl.querySelector('button[aria-label*="Select" i]');

    if (checkbox) {
      const isChecked =
        checkbox.checked ||
        checkbox.getAttribute('aria-checked') === 'true' ||
        checkbox.getAttribute('aria-pressed') === 'true';

      if (!isChecked) {
        realClick(checkbox);
        selected++;
        await sleep(60);
      } else {
        selected++;
      }
    }
  }

  return selected;
}

async function copyCardOrFolderToTeam(cardEl, targetTeamName) {
  cardEl.scrollIntoView({ block: 'center', behavior: 'instant' });
  realHover(cardEl);
  await sleep(300);

  const moreBtn =
    cardEl.querySelector('button[aria-label*="More" i]') ||
    cardEl.querySelector('button[aria-haspopup="menu"]') ||
    Array.from(cardEl.querySelectorAll('button')).pop();

  if (!moreBtn) return false;

  realClick(moreBtn);
  await sleep(550);

  const copyToTeamOption = findElementByText(
    '[role="menuitem"], [role="option"], button, span',
    'copy to another team'
  );

  if (!copyToTeamOption) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return false;
  }

  realHover(copyToTeamOption);
  realClick(copyToTeamOption);
  await sleep(600);

  // Also grab all teams visible in this "Copy to another team" menu!
  scanDOMForTeams();

  const teamOption = findElementByText(
    '[role="menuitem"], [role="option"], [role="dialog"] button, [role="dialog"] li, span',
    targetTeamName
  );

  if (!teamOption) {
    sendProgress(`Team "${targetTeamName}" not found in menu.`, 'warn');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return false;
  }

  realClick(teamOption);
  await sleep(450);

  const confirmBtn = findElementByText('[role="dialog"] button, button', 'copy');
  if (confirmBtn) {
    realClick(confirmBtn);
    await sleep(650);
  }

  return true;
}

async function moveSelectedToFolderAndCopy(projectName, targetTeam, selectedIds) {
  const count = await selectAllDesignsInUI(selectedIds);
  sendProgress(`Selected ${count} designs. Opening "Move to folder"...`);
  await sleep(550);

  const moveBtn =
    document.querySelector('button[aria-label*="Move" i]') ||
    findElementByText('button', 'Move');

  if (moveBtn) {
    realClick(moveBtn);
    await sleep(650);

    const createNewBtn = findElementByText('button, [role="menuitem"], span', 'Create new');
    if (createNewBtn) {
      realClick(createNewBtn);
      await sleep(450);

      const folderInput = document.querySelector('input[type="text"], [role="dialog"] input');
      if (folderInput) {
        folderInput.focus();
        document.execCommand('insertText', false, projectName);
        await sleep(350);

        const moveHereBtn =
          findElementByText('button', 'Move to new folder') ||
          findElementByText('button', 'Continue') ||
          findElementByText('button', 'Create');
        if (moveHereBtn) {
          realClick(moveHereBtn);
          await sleep(1300);
          sendProgress(`Moved ${count} designs into folder "${projectName}".`, 'success');
        }
      }
    }
  }

  const folderLink = Array.from(document.querySelectorAll('a[href*="/folder/"]')).find(
    (a) =>
      a.innerText?.toLowerCase().includes(projectName.toLowerCase()) ||
      a.getAttribute('aria-label')?.toLowerCase().includes(projectName.toLowerCase())
  );

  if (folderLink) {
    const folderCard =
      folderLink.closest('[role="group"], li, .item') ||
      folderLink.parentElement?.parentElement;
    if (folderCard) {
      sendProgress(`Copying folder "${projectName}" to team "${targetTeam}"...`);
      const ok = await copyCardOrFolderToTeam(folderCard, targetTeam);
      if (ok) {
        return { success: true, copiedCount: count };
      }
    }
  }

  sendProgress('Falling back to individual design copy...', 'warn');
  return null;
}

async function executeMigration({ targetTeam, projectName, copyMode, selectedIds }) {
  const allCards = getDesignCards();
  const targetCards =
    selectedIds && selectedIds.length > 0
      ? allCards.filter((c) => selectedIds.includes(c.id))
      : allCards;

  if (targetCards.length === 0) {
    return { success: false, error: 'No designs found on this page. Click "Go to Projects ↗" first!' };
  }

  if (copyMode === 'folder') {
    const folderResult = await moveSelectedToFolderAndCopy(projectName, targetTeam, selectedIds);
    if (folderResult) return folderResult;
  }

  const clearBtn = document.querySelector('button[aria-label*="Clear selection" i]');
  if (clearBtn) realClick(clearBtn);
  await sleep(300);

  let copiedCount = 0;
  for (let i = 0; i < targetCards.length; i++) {
    const card = targetCards[i];
    sendProgress(`(${i + 1}/${targetCards.length}) Copying "${card.title}"...`);
    const ok = await copyCardOrFolderToTeam(card.cardEl, targetTeam);
    if (ok) {
      copiedCount++;
    } else {
      sendProgress(`Skipped "${card.title}"`, 'warn');
    }
    await sleep(800);
  }

  return { success: true, copiedCount };
}

// Initial scan
setTimeout(() => {
  window.dispatchEvent(new CustomEvent('CANVA_PORTAL_REQUEST_TEAMS'));
  scanDOMForTeams();
}, 1000);

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === 'GET_CACHED_OR_DETECT_TEAMS') {
    window.dispatchEvent(new CustomEvent('CANVA_PORTAL_REQUEST_TEAMS'));
    scanDOMForTeams();
    const list = Array.from(discoveredTeams.values());
    if (list.length > 0) {
      sendResponse({ teams: list });
    } else {
      forceDetectAllTeams().then((teams) => sendResponse({ teams }));
    }
    return true;
  }
  if (req.action === 'FORCE_DETECT_TEAMS') {
    forceDetectAllTeams().then((teams) => sendResponse({ teams }));
    return true;
  }
  if (req.action === 'SWITCH_TEAM') {
    switchCanvaTeam(req.teamName).then((res) => sendResponse(res));
    return true;
  }
  if (req.action === 'SCAN_DESIGNS') {
    autoScrollAndScan().then((designs) => sendResponse({ designs }));
    return true;
  }
  if (req.action === 'SELECT_ALL_UI') {
    selectAllDesignsInUI(req.selectedIds).then((selected) => sendResponse({ selected }));
    return true;
  }
  if (req.action === 'START_COPY') {
    executeMigration(req).then((res) => sendResponse(res));
    return true;
  }
});
