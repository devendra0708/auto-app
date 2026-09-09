(function (global) {
  const KEYS = {
    authSession: "meridian_auth",
    authLocal: "meridian_auth_local",
    remember: "meridian_remember",
    requests: "meridian_requests",
    files: "meridian_files",
    settings: "meridian_settings",
    notifsRead: "meridian_notifs_read",
    messages: "meridian_messages",
  };

  const USER = {
    name: "Alex Rivera",
    email: "alex@northline.co",
    role: "Operations",
    initials: "AR",
    password: "meridian123",
  };

  const PEOPLE = [
    {
      id: 1,
      name: "Ava Chen",
      email: "ava.chen@northline.co",
      dept: "Engineering",
      role: "Staff Engineer",
      status: "active",
      location: "Bengaluru",
      phone: "+91 80 5550 1201",
      joined: "2021-03-14",
      about: "Owns platform reliability and developer tooling.",
    },
    {
      id: 2,
      name: "Ben Ortiz",
      email: "ben.ortiz@northline.co",
      dept: "Quality",
      role: "QA Lead",
      status: "active",
      location: "Austin",
      phone: "+1 512 555 0142",
      joined: "2020-08-02",
      about: "Leads release quality and automation strategy.",
    },
    {
      id: 3,
      name: "Cara Singh",
      email: "cara.singh@northline.co",
      dept: "Product",
      role: "PM",
      status: "pending",
      location: "London",
      phone: "+44 20 7946 0991",
      joined: "2026-08-01",
      about: "Joining Product to own Meridian workflows.",
    },
    {
      id: 4,
      name: "Diego Ruiz",
      email: "diego.ruiz@northline.co",
      dept: "Quality",
      role: "SDET",
      status: "inactive",
      location: "Madrid",
      phone: "+34 91 555 8831",
      joined: "2019-11-18",
      about: "On leave; previously owned API contract tests.",
    },
    {
      id: 5,
      name: "Elena Park",
      email: "elena.park@northline.co",
      dept: "People",
      role: "HRBP",
      status: "active",
      location: "Seoul",
      phone: "+82 2 555 4410",
      joined: "2022-01-10",
      about: "Supports Engineering and Quality partners.",
    },
    {
      id: 6,
      name: "Farah Ali",
      email: "farah.ali@northline.co",
      dept: "Engineering",
      role: "Frontend",
      status: "active",
      location: "Dubai",
      phone: "+971 4 555 2208",
      joined: "2023-05-22",
      about: "Builds Meridian UI and design system.",
    },
    {
      id: 7,
      name: "Gabe Stone",
      email: "gabe.stone@northline.co",
      dept: "Support",
      role: "Success",
      status: "pending",
      location: "Denver",
      phone: "+1 303 555 0199",
      joined: "2026-07-20",
      about: "Customer onboarding for enterprise workspaces.",
    },
    {
      id: 8,
      name: "Hana Kim",
      email: "hana.kim@northline.co",
      dept: "Finance",
      role: "Controller",
      status: "inactive",
      location: "Tokyo",
      phone: "+81 3 5550 7788",
      joined: "2018-04-09",
      about: "Expense policy owner; currently inactive.",
    },
    {
      id: 9,
      name: "Ivan Petrov",
      email: "ivan.petrov@northline.co",
      dept: "Engineering",
      role: "Backend",
      status: "active",
      location: "Berlin",
      phone: "+49 30 555 6621",
      joined: "2021-09-30",
      about: "Services for requests and directory sync.",
    },
    {
      id: 10,
      name: "Jade Brooks",
      email: "jade.brooks@northline.co",
      dept: "Sales",
      role: "AE",
      status: "active",
      location: "Toronto",
      phone: "+1 416 555 3030",
      joined: "2022-06-15",
      about: "Enterprise accounts across Canada.",
    },
    {
      id: 11,
      name: "Kai Nakamura",
      email: "kai.nakamura@northline.co",
      dept: "Quality",
      role: "Automation",
      status: "pending",
      location: "Osaka",
      phone: "+81 6 5550 1190",
      joined: "2026-08-05",
      about: "Playwright and WDIO framework support.",
    },
    {
      id: 12,
      name: "Lina Gomez",
      email: "lina.gomez@northline.co",
      dept: "Design",
      role: "Product Designer",
      status: "inactive",
      location: "Mexico City",
      phone: "+52 55 5555 4412",
      joined: "2020-02-11",
      about: "Brand and product design systems.",
    },
  ];

  const DEFAULT_REQUESTS = [
    {
      id: "REQ-1042",
      type: "Access",
      title: "GitHub org access",
      requester: "Alex Rivera",
      status: "approved",
      createdAt: "2026-08-10",
      priority: "normal",
      details: "Need write access to northline/meridian.",
      startDate: "2026-08-11",
      history: [{ at: "2026-08-10", action: "submitted" }, { at: "2026-08-11", action: "approved" }],
    },
    {
      id: "REQ-1048",
      type: "Leave",
      title: "PTO · Aug 22–26",
      requester: "Alex Rivera",
      status: "pending",
      createdAt: "2026-08-12",
      priority: "normal",
      details: "Family travel; coverage arranged with Elena.",
      startDate: "2026-08-22",
      history: [{ at: "2026-08-12", action: "submitted" }],
    },
    {
      id: "REQ-1051",
      type: "Expense",
      title: "Conference ticket",
      requester: "Alex Rivera",
      status: "submitted",
      createdAt: "2026-08-14",
      priority: "high",
      details: "Automation Summit — early bird ticket.",
      startDate: "2026-09-01",
      history: [{ at: "2026-08-14", action: "submitted" }],
    },
  ];

  const DEFAULT_FILES = [
    { id: "f1", name: "Employee Handbook.pdf", size: "2.4 MB", updated: "Aug 2, 2026", type: "PDF" },
    { id: "f2", name: "Q3 OKR Brief.docx", size: "180 KB", updated: "Aug 8, 2026", type: "DOC" },
    { id: "f3", name: "Office Map.png", size: "1.1 MB", updated: "Jul 29, 2026", type: "PNG" },
  ];

  const DEFAULT_SETTINGS = {
    fullName: USER.name,
    jobTitle: "Operations Manager",
    department: "Operations",
    timezone: "IST",
    emailDigest: true,
    pushAlerts: true,
    weeklySummary: false,
    theme: "system",
  };

  const NOTIFICATIONS = [
    {
      id: "n1",
      title: "Leave request needs review",
      body: "PTO · Aug 22–26 is awaiting approval",
      time: "2h ago",
      href: "/request.html?id=REQ-1048",
    },
    {
      id: "n2",
      title: "New teammate joined",
      body: "Cara Singh was added to Product",
      time: "Yesterday",
      href: "/person.html?id=3",
    },
    {
      id: "n3",
      title: "Policy update",
      body: "Travel guidelines were revised",
      time: "2d ago",
      href: "/settings.html",
    },
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch {
      return clone(fallback);
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureSeeded() {
    if (!localStorage.getItem(KEYS.requests)) writeJson(KEYS.requests, DEFAULT_REQUESTS);
    if (!localStorage.getItem(KEYS.files)) writeJson(KEYS.files, DEFAULT_FILES);
    if (!localStorage.getItem(KEYS.settings)) writeJson(KEYS.settings, DEFAULT_SETTINGS);
    if (!localStorage.getItem(KEYS.messages)) writeJson(KEYS.messages, {});
  }

  function isAuthed() {
    return sessionStorage.getItem(KEYS.authSession) === "1" || localStorage.getItem(KEYS.authLocal) === "1";
  }

  function login(remember) {
    sessionStorage.setItem(KEYS.authSession, "1");
    if (remember) localStorage.setItem(KEYS.authLocal, "1");
    else localStorage.removeItem(KEYS.authLocal);
  }

  function logout() {
    sessionStorage.removeItem(KEYS.authSession);
    localStorage.removeItem(KEYS.authLocal);
  }

  function getRememberedEmail() {
    return localStorage.getItem(KEYS.remember) || "";
  }

  function setRememberedEmail(email) {
    if (email) localStorage.setItem(KEYS.remember, email);
    else localStorage.removeItem(KEYS.remember);
  }

  function getPeople() {
    return PEOPLE;
  }

  function getPerson(id) {
    return PEOPLE.find((p) => p.id === Number(id)) || null;
  }

  function getRequests() {
    ensureSeeded();
    return readJson(KEYS.requests, DEFAULT_REQUESTS);
  }

  function setRequests(rows) {
    writeJson(KEYS.requests, rows);
  }

  function getRequest(id) {
    return getRequests().find((r) => r.id === id) || null;
  }

  function updateRequest(id, patch) {
    const rows = getRequests();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const next = { ...rows[idx], ...patch };
    if (patch.status) {
      const history = Array.isArray(next.history) ? next.history.slice() : [];
      history.push({ at: new Date().toISOString().slice(0, 10), action: patch.status });
      next.history = history;
    }
    rows[idx] = next;
    setRequests(rows);
    return next;
  }

  function addRequest(request) {
    const rows = getRequests();
    rows.unshift(request);
    setRequests(rows);
    return request;
  }

  function nextRequestId() {
    const rows = getRequests();
    const nums = rows
      .map((r) => Number(String(r.id).replace(/\D/g, "")))
      .filter((n) => !Number.isNaN(n));
    const max = nums.length ? Math.max(...nums) : 1051;
    return `REQ-${max + 1}`;
  }

  function getFiles() {
    ensureSeeded();
    return readJson(KEYS.files, DEFAULT_FILES);
  }

  function setFiles(rows) {
    writeJson(KEYS.files, rows);
  }

  function getSettings() {
    ensureSeeded();
    return readJson(KEYS.settings, DEFAULT_SETTINGS);
  }

  function setSettings(value) {
    writeJson(KEYS.settings, value);
  }

  function getMessages(personId) {
    ensureSeeded();
    const all = readJson(KEYS.messages, {});
    return all[String(personId)] || [];
  }

  function addMessage(personId, body) {
    ensureSeeded();
    const all = readJson(KEYS.messages, {});
    const key = String(personId);
    const list = all[key] || [];
    const entry = {
      id: `m${Date.now()}`,
      body,
      at: new Date().toISOString(),
      from: USER.name,
    };
    list.push(entry);
    all[key] = list;
    writeJson(KEYS.messages, all);
    return entry;
  }

  function areNotifsRead() {
    return localStorage.getItem(KEYS.notifsRead) === "1";
  }

  function markNotifsRead() {
    localStorage.setItem(KEYS.notifsRead, "1");
  }

  function getNotifications() {
    return NOTIFICATIONS;
  }

  function getState() {
    return {
      authed: isAuthed(),
      user: { name: USER.name, email: USER.email, role: USER.role },
      requests: getRequests(),
      files: getFiles(),
      settings: getSettings(),
      notifsRead: areNotifsRead(),
      messages: readJson(KEYS.messages, {}),
    };
  }

  function seed(overrides = {}) {
    writeJson(KEYS.requests, overrides.requests || DEFAULT_REQUESTS);
    writeJson(KEYS.files, overrides.files || DEFAULT_FILES);
    writeJson(KEYS.settings, overrides.settings || DEFAULT_SETTINGS);
    writeJson(KEYS.messages, overrides.messages || {});
    if (overrides.notifsRead === true) localStorage.setItem(KEYS.notifsRead, "1");
    else if (overrides.notifsRead === false) localStorage.removeItem(KEYS.notifsRead);
    return getState();
  }

  function reset() {
    Object.values(KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    return seed();
  }

  function handleResetQuery() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== "1") return false;
    reset();
    params.delete("reset");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", next);
    return true;
  }

  ensureSeeded();

  const Meridian = {
    USER,
    KEYS,
    PEOPLE,
    DEFAULT_REQUESTS,
    DEFAULT_FILES,
    DEFAULT_SETTINGS,
    isAuthed,
    login,
    logout,
    getRememberedEmail,
    setRememberedEmail,
    getPeople,
    getPerson,
    getRequests,
    setRequests,
    getRequest,
    updateRequest,
    addRequest,
    nextRequestId,
    getFiles,
    setFiles,
    getSettings,
    setSettings,
    getMessages,
    addMessage,
    areNotifsRead,
    markNotifsRead,
    getNotifications,
    getState,
    seed,
    reset,
    handleResetQuery,
  };

  global.Meridian = Meridian;
})(window);
