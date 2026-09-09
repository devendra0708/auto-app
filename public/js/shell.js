(function () {
  const M = window.Meridian;
  if (!M) return;

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function showToast(message, options) {
    if (window.MeridianWidgets?.showToast) {
      return window.MeridianWidgets.showToast(message, options);
    }
    let toast = $("#toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("data-testid", "toast");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove("visible"), 2600);
  }

  window.MeridianUI = { showToast, $ };

  function shellHtml(activePage) {
    const notifs = M.getNotifications()
      .map(
        (n) => `
        <a class="notif-item" href="${n.href}" data-testid="notif-item-${n.id}">
          <strong>${n.title}</strong>
          <span>${n.body} · ${n.time}</span>
        </a>`
      )
      .join("");

    const nav = [
      { id: "home", href: "/home.html", label: "Home", icon: "⌂", testid: "nav-home" },
      { id: "people", href: "/people.html", label: "People", icon: "◉", testid: "nav-people" },
      { id: "requests", href: "/requests.html", label: "Requests", icon: "▣", testid: "nav-requests" },
      { id: "files", href: "/files.html", label: "Files", icon: "▤", testid: "nav-files" },
      { id: "reports", href: "/reports.html", label: "Reports", icon: "▦", testid: "nav-reports" },
      { id: "settings", href: "/settings.html", label: "Settings", icon: "⚙", testid: "nav-settings" },
    ]
      .map((item) => {
        const active =
          item.id === activePage ||
          (activePage === "person" && item.id === "people") ||
          (activePage === "request" && item.id === "requests");
        return `<a href="${item.href}" data-nav="${item.id}" data-testid="${item.testid}" class="${active ? "active" : ""}"><span class="nav-icon">${item.icon}</span> ${item.label}</a>`;
      })
      .join("");

    const session = M.getSessionUser();
    const settings = M.getSettings();
    const displayName = session.name || settings.fullName || M.USER.name;
    const roleLabel = `${M.getAccessRole()} · ${session.role || settings.department || ""}`;
    const initials = (session.initials || displayName)
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return `
      <aside class="sidebar">
        <a class="sidebar-brand" href="/home.html" data-testid="brand">
          <div class="logo-mark">M</div>
          <div class="logo-text">Meridian</div>
        </a>
        <div class="workspace-chip">
          <div class="label">Workspace</div>
          <div class="value">Northline Co.</div>
        </div>
        <nav class="side-nav" data-testid="main-nav">${nav}</nav>
        <div class="sidebar-footer hint">Signed in as ${displayName}</div>
      </aside>
      <div class="content-area">
        <header class="topbar">
          <div class="topbar-search">
            <input id="global-search" type="search" placeholder="Search people, requests…" data-testid="global-search" />
          </div>
          <div class="topbar-actions">
            <div class="relative">
              <button id="notif-btn" class="icon-btn" type="button" aria-label="Notifications" data-testid="notif-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                </svg>
                <span id="notif-dot" class="badge-dot ${M.areNotifsRead() ? "hidden" : ""}" data-testid="notif-dot"></span>
              </button>
              <div id="notif-popover" class="popover" data-testid="notif-popover">
                <div class="popover-header">
                  <h3>Notifications</h3>
                  <button id="mark-notifs-read" class="ghost" type="button" data-testid="mark-notifs-read">Mark read</button>
                </div>
                ${notifs}
              </div>
            </div>
            <div class="relative">
              <button id="user-menu-btn" class="user-menu" type="button" data-testid="user-menu">
                <span class="avatar">${initials}</span>
                <span class="user-meta"><strong>${displayName}</strong><span data-testid="access-role-label">${roleLabel}</span></span>
              </button>
              <div id="user-popover" class="popover menu-popover" data-testid="user-popover">
                <button type="button" data-action="go-settings" data-testid="menu-settings">Account settings</button>
                <button id="logout-btn" type="button" data-testid="logout-button">Sign out</button>
              </div>
            </div>
          </div>
        </header>
        <div id="shell-main"></div>
      </div>
    `;
  }

  function bindChrome() {
    const notifBtn = $("#notif-btn");
    const notifPop = $("#notif-popover");
    const userBtn = $("#user-menu-btn");
    const userPop = $("#user-popover");

    function closePopovers(except) {
      [notifPop, userPop].forEach((el) => {
        if (el && el !== except) el.classList.remove("open");
      });
    }

    notifBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      const opening = !notifPop.classList.contains("open");
      closePopovers(notifPop);
      notifPop.classList.toggle("open", opening);
    });

    userBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      const opening = !userPop.classList.contains("open");
      closePopovers(userPop);
      userPop.classList.toggle("open", opening);
    });

    document.addEventListener("click", () => closePopovers());
    notifPop?.addEventListener("click", (event) => event.stopPropagation());
    userPop?.addEventListener("click", (event) => event.stopPropagation());

    $("#logout-btn")?.addEventListener("click", () => {
      M.logout();
      window.location.href = "/index.html";
    });

    $('[data-action="go-settings"]')?.addEventListener("click", () => {
      window.location.href = "/settings.html";
    });

    $("#mark-notifs-read")?.addEventListener("click", () => {
      M.markNotifsRead();
      $("#notif-dot")?.classList.add("hidden");
      showToast("Notifications marked as read");
    });

    $("#global-search")?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const q = $("#global-search").value.trim();
      if (!q) return;
      window.location.href = `/people.html?q=${encodeURIComponent(q)}`;
    });
  }

  function applyAccessRole() {
    const role = M.isAuthed() ? M.getAccessRole() : "";
    document.body.dataset.accessRole = role;
    document.documentElement.dataset.accessRole = role;
  }

  function mountShell() {
    const mount = document.getElementById("app-shell");
    if (!mount) return;

    const page = document.body.dataset.page || "home";
    const mainContent = mount.querySelector("[data-shell-main]");
    const mainHtml = mainContent ? mainContent.innerHTML : mount.innerHTML;

    mount.className = "app-shell";
    mount.innerHTML = shellHtml(page);
    const shellMain = document.getElementById("shell-main");
    if (shellMain) shellMain.innerHTML = mainHtml;
    bindChrome();
    applyAccessRole();
  }

  function requireAuth() {
    const page = document.body.dataset.page;
    if (page === "login") {
      if (M.isAuthed()) window.location.href = "/home.html";
      return;
    }
    if (!M.isAuthed()) {
      window.location.href = "/index.html";
    }
  }

  function initDevPanel() {
    if (!M.isDevMode()) return;
    if (document.getElementById("dev-panel")) return;

    const panel = document.createElement("div");
    panel.id = "dev-panel";
    panel.className = "dev-panel";
    panel.setAttribute("data-testid", "dev-panel");
    panel.innerHTML = `
      <button type="button" class="dev-panel-toggle" data-testid="dev-panel-toggle" aria-expanded="false">Dev</button>
      <div class="dev-panel-body hidden" data-testid="dev-panel-body">
        <div class="dev-panel-header">
          <strong>Seed presets</strong>
          <button type="button" class="ghost" data-testid="dev-panel-close" aria-label="Close">×</button>
        </div>
        <p class="hint">For WDIO setup. Also: <code>?dev=1</code>, <code>?preset=clean</code></p>
        <div class="dev-preset-list" data-testid="dev-preset-list"></div>
        <div class="dev-panel-actions">
          <button type="button" class="secondary" data-testid="dev-logout">Logout</button>
          <button type="button" class="secondary" data-testid="dev-disable">Hide panel</button>
        </div>
      </div>`;
    document.body.appendChild(panel);

    const body = panel.querySelector(".dev-panel-body");
    const list = panel.querySelector(".dev-preset-list");
    list.innerHTML = Object.entries(M.PRESETS)
      .map(
        ([key, preset]) => `
        <button type="button" class="dev-preset" data-preset="${key}" data-testid="dev-preset-${key}">
          <strong>${preset.label}</strong>
          <span>${preset.description}</span>
        </button>`
      )
      .join("");

    const toggle = () => {
      const open = body.classList.toggle("hidden") === false;
      panel.querySelector(".dev-panel-toggle").setAttribute("aria-expanded", String(open));
    };

    panel.querySelector(".dev-panel-toggle").addEventListener("click", toggle);
    panel.querySelector("[data-testid='dev-panel-close']").addEventListener("click", () => {
      body.classList.add("hidden");
      panel.querySelector(".dev-panel-toggle").setAttribute("aria-expanded", "false");
    });

    list.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        M.applyPreset(btn.dataset.preset);
        showToast(`Preset: ${btn.dataset.preset}`);
        setTimeout(() => window.location.reload(), 350);
      });
    });

    panel.querySelector("[data-testid='dev-logout']").addEventListener("click", () => {
      M.logout();
      window.location.href = "/index.html";
    });

    panel.querySelector("[data-testid='dev-disable']").addEventListener("click", () => {
      M.enableDevMode(false);
      panel.remove();
      showToast("Dev panel disabled");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    M.handleResetQuery();
    M.applyTheme(M.getSettings().theme);
    requireAuth();
    applyAccessRole();
    if (document.body.dataset.page !== "login") {
      mountShell();
    }
    initDevPanel();

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if ((M.getSettings().theme || "system") === "system") M.applyTheme("system");
    });
  });
})();
