(function () {
  const M = window.Meridian;
  const UI = window.MeridianUI || {};

  function $(selector, root = document) {
    return (UI.$ || document.querySelector.bind(document))(selector, root);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function showToast(message) {
    if (UI.showToast) UI.showToast(message);
  }

  function initials(name) {
    return String(name || "")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function clearFieldErrors(form) {
    $all("[data-field-error]", form).forEach((el) => {
      el.textContent = "";
      el.classList.remove("visible");
    });
    $all(".field-invalid", form).forEach((el) => el.classList.remove("field-invalid"));
  }

  function setFieldError(form, name, message) {
    const input = form.querySelector(`[name="${name}"], #${name}`);
    const error = form.querySelector(`[data-field-error="${name}"]`);
    if (input) input.classList.add("field-invalid");
    if (error) {
      error.textContent = message;
      error.classList.add("visible");
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function initLogin() {
    const form = $("#login-form");
    if (!form) return;

    const remembered = M.getRememberedEmail();
    if (remembered) {
      $("#email").value = remembered;
      if ($("#remember")) $("#remember").checked = true;
    }

    $("#toggle-password")?.addEventListener("click", () => {
      const input = $("#password");
      const next = input.type === "password" ? "text" : "password";
      input.type = next;
      $("#toggle-password").textContent = next === "password" ? "Show" : "Hide";
      $("#toggle-password").setAttribute("aria-pressed", String(next === "text"));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFieldErrors(form);
      const email = $("#email").value.trim().toLowerCase();
      const password = $("#password").value;
      const remember = $("#remember")?.checked;
      const banner = $("#login-error");
      banner.classList.remove("visible");

      let valid = true;
      if (!email) {
        setFieldError(form, "email", "Email is required");
        valid = false;
      } else if (!isValidEmail(email)) {
        setFieldError(form, "email", "Enter a valid work email");
        valid = false;
      }
      if (!password) {
        setFieldError(form, "password", "Password is required");
        valid = false;
      }
      if (!valid) return;

      if (email === M.USER.email && password === M.USER.password) {
        M.login(Boolean(remember));
        if (remember) M.setRememberedEmail(email);
        else M.setRememberedEmail("");
        window.location.href = "/home.html";
        return;
      }

      banner.textContent = "That email or password doesn’t match our records.";
      banner.classList.add("visible");
    });
  }

  function initHome() {
    if (document.body.dataset.page !== "home") return;

    const requests = M.getRequests();
    const people = M.getPeople();
    const pending = requests.filter((r) => r.status === "pending" || r.status === "submitted").length;
    $("#stat-people").textContent = String(people.filter((p) => p.status === "active").length);
    $("#stat-requests").textContent = String(pending);
    $("#stat-files").textContent = String(M.getFiles().length);

    const settings = M.getSettings();
    const first = (settings.fullName || M.USER.name).split(" ")[0];
    if ($("#home-title")) $("#home-title").textContent = `Welcome back, ${first}`;

    const feed = $("#activity-feed");
    if (!feed) return;

    const items = [
      ...requests.slice(0, 3).map((r) => ({
        title: r.title,
        body: `${r.type} · ${r.status}`,
        time: r.createdAt,
        icon: "R",
        href: `/request.html?id=${encodeURIComponent(r.id)}`,
        testid: `feed-request-${r.id}`,
      })),
      {
        title: "Directory synced",
        body: "People roster updated from HRIS",
        time: "Today",
        icon: "P",
        href: "/people.html",
        testid: "feed-directory",
      },
    ];

    feed.innerHTML = items
      .map(
        (item) => `
        <a class="feed-item feed-link" href="${item.href}" data-testid="${item.testid}">
          <div class="avatar">${item.icon}</div>
          <div>
            <h3>${item.title}</h3>
            <p>${item.body}</p>
          </div>
          <time>${item.time}</time>
        </a>`
      )
      .join("");
  }

  function initPeople() {
    const tableBody = $("#people-tbody");
    if (!tableBody) return;

    const state = {
      query: new URLSearchParams(window.location.search).get("q") || "",
      status: "all",
      dept: "all",
      sortKey: "name",
      sortDir: "asc",
      page: 1,
      pageSize: 5,
      selected: new Set(),
    };

    const search = $("#people-search");
    const statusFilter = $("#status-filter");
    const deptFilter = $("#dept-filter");
    const loading = $("#people-loading");
    if (search && state.query) search.value = state.query;

    function filtered() {
      let rows = M.getPeople().filter((p) => {
        const q = state.query.toLowerCase();
        const matchesQuery =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.dept.toLowerCase().includes(q);
        const matchesStatus = state.status === "all" || p.status === state.status;
        const matchesDept = state.dept === "all" || p.dept === state.dept;
        return matchesQuery && matchesStatus && matchesDept;
      });

      rows.sort((a, b) => {
        const left = String(a[state.sortKey]).toLowerCase();
        const right = String(b[state.sortKey]).toLowerCase();
        if (left < right) return state.sortDir === "asc" ? -1 : 1;
        if (left > right) return state.sortDir === "asc" ? 1 : -1;
        return 0;
      });
      return rows;
    }

    function render() {
      const rows = filtered();
      const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
      if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * state.pageSize;
      const pageRows = rows.slice(start, start + state.pageSize);

      if (rows.length === 0) {
        tableBody.innerHTML = "";
        $("#people-empty")?.classList.remove("hidden");
      } else {
        $("#people-empty")?.classList.add("hidden");
        tableBody.innerHTML = pageRows
          .map(
            (p) => `
            <tr data-testid="person-row-${p.id}" class="clickable-row" data-href="/person.html?id=${p.id}">
              <td>
                <input type="checkbox" data-testid="select-person-${p.id}" data-id="${p.id}" ${
                  state.selected.has(p.id) ? "checked" : ""
                } />
              </td>
              <td>
                <div class="person-cell">
                  <div class="avatar">${initials(p.name)}</div>
                  <div>
                    <strong data-testid="person-name-${p.id}">${p.name}</strong>
                    <span data-testid="person-email-${p.id}">${p.email}</span>
                  </div>
                </div>
              </td>
              <td data-testid="person-dept-${p.id}">${p.dept}</td>
              <td data-testid="person-role-${p.id}">${p.role}</td>
              <td data-testid="person-location-${p.id}">${p.location}</td>
              <td><span class="badge ${p.status}" data-testid="person-status-${p.id}">${p.status}</span></td>
              <td>
                <a class="btn secondary" href="/person.html?id=${p.id}" data-testid="view-person-${p.id}">View</a>
              </td>
            </tr>`
          )
          .join("");
      }

      $("#page-info").textContent = `Page ${state.page} of ${totalPages} · ${rows.length} people`;
      $("#selected-count").textContent = `${state.selected.size} selected`;
      $("#prev-page").disabled = state.page <= 1 || rows.length === 0;
      $("#next-page").disabled = state.page >= totalPages || rows.length === 0;

      $all('input[type="checkbox"][data-id]', tableBody).forEach((box) => {
        box.addEventListener("click", (event) => event.stopPropagation());
        box.addEventListener("change", () => {
          const id = Number(box.dataset.id);
          if (box.checked) state.selected.add(id);
          else state.selected.delete(id);
          $("#selected-count").textContent = `${state.selected.size} selected`;
        });
      });

      $all("a", tableBody).forEach((link) => {
        link.addEventListener("click", (event) => event.stopPropagation());
      });

      $all("tr[data-href]", tableBody).forEach((row) => {
        row.addEventListener("click", () => {
          window.location.href = row.dataset.href;
        });
      });
    }

    function scheduleRender() {
      loading?.classList.remove("hidden");
      tableBody.innerHTML = "";
      setTimeout(() => {
        loading?.classList.add("hidden");
        render();
      }, 350);
    }

    search?.addEventListener("input", () => {
      state.query = search.value.trim();
      state.page = 1;
      scheduleRender();
    });
    statusFilter?.addEventListener("change", () => {
      state.status = statusFilter.value;
      state.page = 1;
      scheduleRender();
    });
    deptFilter?.addEventListener("change", () => {
      state.dept = deptFilter.value;
      state.page = 1;
      scheduleRender();
    });
    $all("th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        else {
          state.sortKey = key;
          state.sortDir = "asc";
        }
        scheduleRender();
      });
    });
    $("#prev-page")?.addEventListener("click", () => {
      state.page -= 1;
      scheduleRender();
    });
    $("#next-page")?.addEventListener("click", () => {
      state.page += 1;
      scheduleRender();
    });
    $("#select-all")?.addEventListener("change", (event) => {
      const rows = filtered().slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
      rows.forEach((p) => {
        if (event.target.checked) state.selected.add(p.id);
        else state.selected.delete(p.id);
      });
      render();
    });
    $("#export-selected")?.addEventListener("click", () => {
      if (state.selected.size === 0) {
        showToast("Select at least one person");
        return;
      }
      showToast(`Exported ${state.selected.size} profile(s)`);
    });

    const backdrop = $("#invite-backdrop");
    $("#open-invite")?.addEventListener("click", () => backdrop?.classList.add("open"));
    $("#close-invite")?.addEventListener("click", () => backdrop?.classList.remove("open"));
    $("#send-invite")?.addEventListener("click", () => {
      const inviteForm = $("#invite-form") || backdrop;
      clearFieldErrors(inviteForm);
      const email = $("#invite-email")?.value.trim();
      if (!email) {
        setFieldError(inviteForm, "invite-email", "Email is required");
        return;
      }
      if (!isValidEmail(email)) {
        setFieldError(inviteForm, "invite-email", "Enter a valid email");
        return;
      }
      backdrop?.classList.remove("open");
      showToast(`Invite sent to ${email}`);
      $("#invite-email").value = "";
    });
    backdrop?.addEventListener("click", (event) => {
      if (event.target === backdrop) backdrop.classList.remove("open");
    });

    scheduleRender();
  }

  function renderRequestList() {
    const list = $("#request-list");
    if (!list) return;
    const rows = M.getRequests();
    if (rows.length === 0) {
      list.innerHTML = `<div class="empty-state" data-testid="requests-empty">No requests yet</div>`;
      return;
    }
    list.innerHTML = rows
      .map(
        (r) => `
        <a class="file-row file-link" href="/request.html?id=${encodeURIComponent(r.id)}" data-testid="request-row-${r.id}">
          <div class="file-meta">
            <div class="file-icon">${r.type.slice(0, 3).toUpperCase()}</div>
            <div>
              <strong data-testid="request-title-${r.id}">${r.title}</strong>
              <div class="hint">${r.id} · ${r.requester} · ${r.createdAt}</div>
            </div>
          </div>
          <span class="badge ${r.status}" data-testid="request-status-${r.id}">${r.status}</span>
        </a>`
      )
      .join("");
  }

  function initRequests() {
    if (document.body.dataset.page !== "requests") return;
    renderRequestList();

    $all(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $all(".tab-btn").forEach((b) => b.classList.remove("active"));
        $all(".tab-panel").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        $(`#${btn.dataset.tab}`)?.classList.add("active");
      });
    });

    const form = $("#request-form");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFieldErrors(form);
      const data = new FormData(form);
      const title = String(data.get("title") || "").trim();
      const type = String(data.get("type") || "");
      const priority = String(data.get("priority") || "normal");
      const details = String(data.get("details") || "").trim();
      const startDate = String(data.get("startDate") || "");
      const terms = data.get("terms") === "on";

      let valid = true;
      if (!title) {
        setFieldError(form, "title", "Title is required");
        valid = false;
      }
      if (!type) {
        setFieldError(form, "type", "Select a request type");
        valid = false;
      }
      if (!terms) {
        setFieldError(form, "terms", "You must confirm policy compliance");
        valid = false;
      }
      if (!valid) return;

      const submitBtn = $("#submit-request");
      const loader = $("#request-loader");
      submitBtn.disabled = true;
      loader?.classList.remove("hidden");

      setTimeout(() => {
        const id = M.nextRequestId();
        M.addRequest({
          id,
          type,
          title,
          requester: M.getSettings().fullName || M.USER.name,
          status: "submitted",
          createdAt: new Date().toISOString().slice(0, 10),
          priority,
          details,
          startDate,
          history: [{ at: new Date().toISOString().slice(0, 10), action: "submitted" }],
        });
        form.reset();
        clearFieldErrors(form);
        submitBtn.disabled = false;
        loader?.classList.add("hidden");
        renderRequestList();
        $("#request-success").textContent = `${id} submitted successfully.`;
        $("#request-success").classList.add("visible");
        showToast("Request submitted");
        $all(".tab-btn").forEach((b) => b.classList.remove("active"));
        $all(".tab-panel").forEach((p) => p.classList.remove("active"));
        $('[data-tab="tab-list"]')?.classList.add("active");
        $("#tab-list")?.classList.add("active");
      }, 1200);
    });

    $("#reset-request")?.addEventListener("click", () => {
      form?.reset();
      clearFieldErrors(form);
      $("#request-success")?.classList.remove("visible");
    });
  }

  function initRequestDetail() {
    if (document.body.dataset.page !== "request") return;
    const id = new URLSearchParams(window.location.search).get("id");
    const request = id ? M.getRequest(id) : null;
    const missing = $("#request-missing");
    const detail = $("#request-detail");

    if (!request) {
      detail?.classList.add("hidden");
      missing?.classList.remove("hidden");
      return;
    }

    missing?.classList.add("hidden");
    detail?.classList.remove("hidden");

    $("#crumb-id").textContent = request.id;
    $("#detail-id").textContent = request.id;
    $("#detail-title").textContent = request.title;
    $("#detail-type").textContent = request.type;
    $("#detail-requester").textContent = request.requester;
    $("#detail-date").textContent = request.startDate || "—";
    $("#detail-created").textContent = request.createdAt;
    $("#detail-priority").textContent = request.priority || "normal";
    $("#detail-details").textContent = request.details || "No details provided.";
    $("#detail-status").textContent = request.status;
    $("#detail-status").className = `badge ${request.status}`;

    const history = $("#detail-history");
    history.innerHTML = (request.history || [])
      .map((h) => `<li data-testid="history-item"><strong>${h.action}</strong> · ${h.at}</li>`)
      .join("");

    const actionable = ["pending", "submitted"].includes(request.status);
    const canCancel = actionable || request.status === "approved";
    $("#approve-request").disabled = !actionable;
    $("#reject-request").disabled = !actionable;
    $("#cancel-request").disabled = !canCancel;

    function applyStatus(status, message) {
      M.updateRequest(request.id, { status });
      showToast(message);
      window.location.reload();
    }

    $("#approve-request")?.addEventListener("click", () => applyStatus("approved", "Request approved"));
    $("#reject-request")?.addEventListener("click", () => applyStatus("rejected", "Request rejected"));
    $("#cancel-request")?.addEventListener("click", () => applyStatus("cancelled", "Request cancelled"));
  }

  function initPersonDetail() {
    if (document.body.dataset.page !== "person") return;
    const id = new URLSearchParams(window.location.search).get("id");
    const person = id ? M.getPerson(id) : null;
    const missing = $("#person-missing");
    const detail = $("#person-detail");

    if (!person) {
      detail?.classList.add("hidden");
      missing?.classList.remove("hidden");
      return;
    }

    missing?.classList.add("hidden");
    detail?.classList.remove("hidden");

    $("#crumb-name").textContent = person.name;
    $("#person-avatar").textContent = initials(person.name);
    $("#person-name").textContent = person.name;
    $("#person-email").textContent = person.email;
    $("#person-dept").textContent = person.dept;
    $("#person-role").textContent = person.role;
    $("#person-location").textContent = person.location;
    $("#person-phone").textContent = person.phone || "—";
    $("#person-joined").textContent = person.joined || "—";
    $("#person-about").textContent = person.about || "";
    $("#person-status").textContent = person.status;
    $("#person-status").className = `badge ${person.status}`;

    function renderMessages() {
      const list = $("#message-list");
      const messages = M.getMessages(person.id);
      if (messages.length === 0) {
        list.innerHTML = `<div class="empty-state" data-testid="messages-empty">No messages yet</div>`;
        return;
      }
      list.innerHTML = messages
        .map(
          (m) => `
          <div class="message-item" data-testid="message-item-${m.id}">
            <strong>${m.from}</strong>
            <span class="hint">${new Date(m.at).toLocaleString()}</span>
            <p>${m.body}</p>
          </div>`
        )
        .join("");
    }

    renderMessages();

    const form = $("#message-form");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFieldErrors(form);
      const body = $("#message-body").value.trim();
      if (!body) {
        setFieldError(form, "message-body", "Message cannot be empty");
        return;
      }
      M.addMessage(person.id, body);
      $("#message-body").value = "";
      renderMessages();
      showToast(`Message sent to ${person.name}`);
    });
  }

  function renderFiles(typeFilter = "all") {
    const list = $("#file-list");
    if (!list) return;
    let files = M.getFiles();
    if (typeFilter !== "all") {
      files = files.filter((f) => f.type === typeFilter);
    }
    if (files.length === 0) {
      list.innerHTML = `<div class="empty-state" data-testid="files-empty">No files match this filter</div>`;
      return;
    }
    list.innerHTML = files
      .map(
        (f) => `
        <div class="file-row" data-testid="file-row-${f.id}">
          <div class="file-meta">
            <div class="file-icon">${f.type}</div>
            <div>
              <strong data-testid="file-name-${f.id}">${f.name}</strong>
              <div class="hint">${f.size} · Updated ${f.updated}</div>
            </div>
          </div>
          <button class="secondary" type="button" data-action="delete-file" data-id="${f.id}" data-testid="delete-file-${f.id}">Remove</button>
        </div>`
      )
      .join("");

    $all('[data-action="delete-file"]', list).forEach((btn) => {
      btn.addEventListener("click", () => {
        const fileId = btn.dataset.id;
        const file = M.getFiles().find((f) => f.id === fileId);
        $("#confirm-file-name").textContent = file?.name || "this file";
        $("#confirm-delete-backdrop").dataset.fileId = fileId;
        $("#confirm-delete-backdrop").classList.add("open");
      });
    });
  }

  function initFiles() {
    if (document.body.dataset.page !== "files") return;
    let typeFilter = "all";
    renderFiles(typeFilter);

    $("#file-type-filter")?.addEventListener("change", (event) => {
      typeFilter = event.target.value;
      renderFiles(typeFilter);
    });

    const dropzone = $("#dropzone");
    const fileInput = $("#file-input");
    const progressWrap = $("#upload-progress-wrap");
    const progressBar = $("#upload-progress");
    const progressLabel = $("#upload-progress-label");

    function uploadFiles(fileList) {
      const items = Array.from(fileList || []);
      if (items.length === 0) return;

      progressWrap?.classList.remove("hidden");
      let value = 0;
      progressBar.style.width = "0%";
      progressLabel.textContent = "Uploading… 0%";

      const timer = setInterval(() => {
        value += 20;
        progressBar.style.width = `${value}%`;
        progressLabel.textContent = `Uploading… ${value}%`;
        if (value >= 100) {
          clearInterval(timer);
          const files = M.getFiles();
          items.forEach((file, index) => {
            files.unshift({
              id: `u${Date.now()}-${index}`,
              name: file.name,
              size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
              updated: "Just now",
              type: (file.name.split(".").pop() || "FILE").slice(0, 3).toUpperCase(),
            });
          });
          M.setFiles(files);
          renderFiles(typeFilter);
          progressLabel.textContent = "Upload complete";
          showToast(`${items.length} file(s) uploaded`);
          setTimeout(() => progressWrap?.classList.add("hidden"), 900);
        }
      }, 250);
    }

    fileInput?.addEventListener("change", () => uploadFiles(fileInput.files));
    dropzone?.addEventListener("click", () => fileInput?.click());
    dropzone?.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone?.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
    dropzone?.addEventListener("drop", (event) => {
      event.preventDefault();
      dropzone.classList.remove("dragover");
      uploadFiles(event.dataTransfer.files);
    });

    const backdrop = $("#confirm-delete-backdrop");
    $("#cancel-delete")?.addEventListener("click", () => backdrop?.classList.remove("open"));
    $("#confirm-delete")?.addEventListener("click", () => {
      const fileId = backdrop.dataset.fileId;
      M.setFiles(M.getFiles().filter((f) => f.id !== fileId));
      backdrop.classList.remove("open");
      renderFiles(typeFilter);
      showToast("File removed");
    });
    backdrop?.addEventListener("click", (event) => {
      if (event.target === backdrop) backdrop.classList.remove("open");
    });
  }

  function initSettings() {
    if (document.body.dataset.page !== "settings") return;
    const form = $("#settings-form");
    const settings = M.getSettings();
    $("#fullName").value = settings.fullName;
    $("#jobTitle").value = settings.jobTitle;
    $("#department").value = settings.department;
    $("#timezone").value = settings.timezone;
    $("#theme").value = settings.theme;
    $("#emailDigest").checked = settings.emailDigest;
    $("#pushAlerts").checked = settings.pushAlerts;
    $("#weeklySummary").checked = settings.weeklySummary;

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFieldErrors(form);
      const fullName = $("#fullName").value.trim();
      const jobTitle = $("#jobTitle").value.trim();
      let valid = true;
      if (!fullName) {
        setFieldError(form, "fullName", "Full name is required");
        valid = false;
      }
      if (!jobTitle) {
        setFieldError(form, "jobTitle", "Job title is required");
        valid = false;
      }
      if (!valid) return;

      M.setSettings({
        fullName,
        jobTitle,
        department: $("#department").value,
        timezone: $("#timezone").value,
        theme: $("#theme").value,
        emailDigest: $("#emailDigest").checked,
        pushAlerts: $("#pushAlerts").checked,
        weeklySummary: $("#weeklySummary").checked,
      });
      $("#settings-success").textContent = "Profile and preferences saved.";
      $("#settings-success").classList.add("visible");
      showToast("Settings saved");
    });

    $("#load-policy")?.addEventListener("click", () => {
      const loader = $("#policy-loader");
      const content = $("#policy-content");
      content?.classList.add("hidden");
      loader?.classList.remove("hidden");
      setTimeout(() => {
        loader?.classList.add("hidden");
        content?.classList.remove("hidden");
        showToast("Policy loaded");
      }, 1600);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Shell mounts first in shell.js on same event — run page inits after a tick
    // so #shell-main content is in place. Login has no shell.
    const start = () => {
      initLogin();
      initHome();
      initPeople();
      initRequests();
      initRequestDetail();
      initPersonDetail();
      initFiles();
      initSettings();
    };

    if (document.body.dataset.page === "login") start();
    else setTimeout(start, 0);
  });
})();
