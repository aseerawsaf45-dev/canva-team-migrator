(function () {
  if (window.__CANVA_PORTAL_MAIN_HOOKED__) return;
  window.__CANVA_PORTAL_MAIN_HOOKED__ = true;

  // Map of teamName -> { name, id, role, plan }
  const teamsMap = new Map();

  const blockWords = new Set([
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
    'dark', 'light', 'system', 'sync with system', 'theme', 'ai', 'yourstarred', 'starred',
    'stemmed', 'close', 'cancel', 'continue', 'copy', 'back', 'next', 'save', 'edit',
    'print', 'print products', 'marketing', 'business', 'cards', 'invitations'
  ]);

  function isValidTeamName(str) {
    if (typeof str !== 'string') return false;
    const s = str.trim();
    if (s.length < 2 || s.length > 55) return false;
    const lower = s.toLowerCase();
    if (blockWords.has(lower)) return false;
    if (/^(create|new|start|blank|open|make|get|try|view|select|copy|manage|switch)\s+/i.test(s)) return false;
    if (/^(presentation|doc|whiteboard|video|instagram|facebook|flyer|poster|resume|logo|banner)\s*\([0-9]+(:|x|\*)[0-9]+\)/i.test(s)) return false;
    if (/^(content|projects|templates|brand|apps|trash|settings|home|starred|recent|recents)$/i.test(lower)) return false;
    if (/^https?:\/\//i.test(s)) return false;
    if (/^(DA|BA|FA|MA|UA)[A-Za-z0-9_-]{7,}$/.test(s)) return false;
    if (/^[0-9a-f-]{16,}$/i.test(s)) return false;
    if (/^\d+$/.test(s)) return false;
    if (/\d+\s*(px|x|×|\*)\s*\d+/i.test(s)) return false;
    if (s.includes('@') || s.includes('{') || s.includes('}') || s.includes('[') || s.includes(']')) return false;
    if (s.includes('<') || s.includes('>')) return false;
    return true;
  }

  function recordTeam(name, id = '') {
    if (!isValidTeamName(name)) return;
    const clean = name.trim();
    if (!teamsMap.has(clean)) {
      teamsMap.set(clean, { name: clean, id: id || '' });
      broadcastTeams();
    } else if (id && !teamsMap.get(clean).id) {
      teamsMap.set(clean, { name: clean, id });
      broadcastTeams();
    }
  }

  function broadcastTeams() {
    window.dispatchEvent(
      new CustomEvent('CANVA_PORTAL_TEAMS_UPDATED', {
        detail: Array.from(teamsMap.values())
      })
    );
  }

  // Deep-inspect any parsed JSON or state object for Canva Brand/Team entities
  // In Canva's backend, Teams are called "Brands" and always have IDs starting with "BA" (e.g. "BA...")
  function inspectObject(obj, depth = 0, seen = new WeakSet()) {
    if (!obj || typeof obj !== 'object' || depth > 8 || seen.has(obj)) return;
    seen.add(obj);

    if (Array.isArray(obj)) {
      for (let i = 0; i < Math.min(obj.length, 150); i++) {
        inspectObject(obj[i], depth + 1, seen);
      }
      return;
    }

    // Never inspect designs, templates, folders, documents, or element objects for team names
    const objType = (obj.type || obj.resourceType || obj.__typename || '').toString().toUpperCase();
    if (
      objType === 'DESIGN' ||
      objType === 'TEMPLATE' ||
      objType === 'FOLDER' ||
      objType === 'DOCUMENT' ||
      objType === 'PAGE' ||
      objType === 'ELEMENT' ||
      obj.pageCount !== undefined
    ) {
      return;
    }

    // Pattern 1: Object has a Canva Brand ID ("BA...") and a valid brand name (never use design title!)
    const idVal = obj.id || obj.brandId || obj.teamId || obj.organizationId;
    const nameVal = obj.brandName || obj.teamName || obj.displayName || obj.name;

    if (typeof idVal === 'string' && /^BA[A-Za-z0-9_-]{7,18}$/.test(idVal) && typeof nameVal === 'string') {
      recordTeam(nameVal, idVal);
    }

    // Pattern 2: Explicit brandName / teamName property
    if (typeof obj.brandName === 'string') recordTeam(obj.brandName, obj.brandId || '');
    if (typeof obj.teamName === 'string') recordTeam(obj.teamName, obj.teamId || '');

    // Pattern 3: Array/Map under keys like "brands", "teams", "userBrands", "memberships"
    for (const k of Object.keys(obj)) {
      const val = obj[k];
      const lk = k.toLowerCase();
      if (
        (lk === 'brands' || lk === 'teams' || lk === 'userbrands' || lk === 'brandmemberships' || lk === 'organizations') &&
        val &&
        typeof val === 'object'
      ) {
        const arr = Array.isArray(val) ? val : Object.values(val);
        arr.forEach((item) => {
          if (item && typeof item === 'object') {
            const n = item.brandName || item.teamName || item.displayName || item.name || item.brand?.name || item.brand?.displayName;
            const bId = item.id || item.brandId || item.teamId || item.brand?.id || '';
            if (n && typeof n === 'string') recordTeam(n, bId);
          }
        });
      }

      if (val && typeof val === 'object') {
        inspectObject(val, depth + 1, seen);
      }
    }
  }

  // 1. Hook JSON.parse at document_start so EVERY Canva API response & bootstrap payload is scanned automatically
  const origParse = JSON.parse;
  JSON.parse = function (...args) {
    const result = origParse.apply(this, args);
    try {
      if (result && typeof result === 'object' && typeof args[0] === 'string') {
        if (
          args[0].includes('"BA') ||
          args[0].includes('brand') ||
          args[0].includes('team') ||
          args[0].includes('Brand')
        ) {
          inspectObject(result);
        }
      }
    } catch (_) {}
    return result;
  };

  // 2. Scan inline <script> tags once DOM loads
  function scanScripts() {
    try {
      const scripts = document.querySelectorAll('script:not([src])');
      scripts.forEach((s) => {
        const txt = s.textContent || '';
        if (!txt.includes('BA') && !txt.includes('brand') && !txt.includes('team')) return;

        const rxList = [
          /"(?:brandName|teamName)"\s*:\s*"([^"]{2,50})"/g,
          /"id"\s*:\s*"(BA[A-Za-z0-9_-]{7,18})"[^}]{0,160}?"(?:brandName|teamName|displayName)"\s*:\s*"([^"]{2,50})"/g,
          /"(?:brandName|teamName|displayName)"\s*:\s*"([^"]{2,50})"[^}]{0,160}?"id"\s*:\s*"(BA[A-Za-z0-9_-]{7,18})"/g
        ];

        let m;
        while ((m = rxList[0].exec(txt)) !== null) recordTeam(m[1]);
        while ((m = rxList[1].exec(txt)) !== null) recordTeam(m[2], m[1]);
        while ((m = rxList[2].exec(txt)) !== null) recordTeam(m[1], m[2]);
      });

      // Also scan window state objects
      for (const key of Object.keys(window)) {
        if (key.startsWith('__') || key.toLowerCase().includes('canva') || key.toLowerCase().includes('state')) {
          try {
            if (window[key] && typeof window[key] === 'object') {
              inspectObject(window[key]);
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  window.addEventListener('DOMContentLoaded', () => {
    scanScripts();
    setTimeout(scanScripts, 2000);
  });

  window.addEventListener('CANVA_PORTAL_REQUEST_TEAMS', () => {
    scanScripts();
    broadcastTeams();
  });
})();
