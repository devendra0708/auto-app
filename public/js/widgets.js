(function (global) {
  function showTooltip(anchor, text, testId) {
    hideTooltip();
    const tip = document.createElement("div");
    tip.className = "tooltip-bubble";
    tip.setAttribute("role", "tooltip");
    tip.setAttribute("data-testid", testId || "tooltip");
    tip.id = "meridian-tooltip";
    tip.textContent = text;
    document.body.appendChild(tip);

    const rect = anchor.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    let top = rect.top - tipRect.height - 8 + window.scrollY;
    left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
    if (rect.top < tipRect.height + 12) {
      top = rect.bottom + 8 + window.scrollY;
      tip.classList.add("tooltip-below");
    }
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.classList.add("visible");
  }

  function hideTooltip() {
    document.getElementById("meridian-tooltip")?.remove();
  }

  function initTooltips(root = document) {
    root.querySelectorAll("[data-tooltip]").forEach((el) => {
      if (el.dataset.tooltipBound === "1") return;
      el.dataset.tooltipBound = "1";
      const text = el.getAttribute("data-tooltip");
      const testId = el.getAttribute("data-tooltip-testid") || "tooltip";
      const describedById = `tip-${Math.random().toString(36).slice(2, 9)}`;

      el.setAttribute("tabindex", el.getAttribute("tabindex") || "0");
      el.setAttribute("aria-describedby", describedById);

      const show = () => showTooltip(el, text, testId);
      el.addEventListener("mouseenter", show);
      el.addEventListener("focus", show);
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("blur", hideTooltip);
      el.addEventListener("keydown", (event) => {
        if (event.key === "Escape") hideTooltip();
      });
    });
  }

  function renderBarChart(container, { title, items, testId }) {
    if (!container) return;
    const max = Math.max(1, ...items.map((i) => i.value));
    const bars = items
      .map(
        (item, index) => {
          const height = Math.round((item.value / max) * 100);
          return `
            <div class="bar-item" data-testid="${testId}-bar-${item.key || index}">
              <div class="bar-track">
                <div class="bar-fill" style="height:${height}%" data-value="${item.value}" data-testid="${testId}-fill-${item.key || index}"></div>
              </div>
              <div class="bar-label" data-testid="${testId}-label-${item.key || index}">${item.label}</div>
              <div class="bar-value" data-testid="${testId}-value-${item.key || index}">${item.value}</div>
            </div>`;
        }
      )
      .join("");

    const legend = items
      .map(
        (item, index) =>
          `<span class="chart-legend-item" data-testid="${testId}-legend-${item.key || index}">
            <i style="background:${item.color || "var(--accent)"}"></i>${item.label}
          </span>`
      )
      .join("");

    container.innerHTML = `
      <div class="chart" data-testid="${testId}">
        <div class="chart-title">${title}</div>
        <div class="bar-chart" data-testid="${testId}-bars">${bars}</div>
        <div class="chart-legend" data-testid="${testId}-legend">${legend}</div>
      </div>`;
  }

  function renderDonutChart(container, { title, items, testId }) {
    if (!container) return;
    const total = items.reduce((sum, i) => sum + i.value, 0) || 1;
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const colors = ["#0d7a5f", "#2a6fdb", "#b7791f", "#c23b3b", "#5b6b7c", "#7c5cbf"];

    const segments = items
      .map((item, index) => {
        const frac = item.value / total;
        const length = frac * circumference;
        const color = item.color || colors[index % colors.length];
        const circle = `
          <circle
            class="donut-segment"
            cx="70" cy="70" r="${radius}"
            fill="transparent"
            stroke="${color}"
            stroke-width="16"
            stroke-dasharray="${length} ${circumference - length}"
            stroke-dashoffset="${-offset}"
            transform="rotate(-90 70 70)"
            data-testid="${testId}-segment-${item.key || index}"
            data-label="${item.label}"
            data-value="${item.value}"
          ></circle>`;
        offset += length;
        return circle;
      })
      .join("");

    const legend = items
      .map((item, index) => {
        const color = item.color || colors[index % colors.length];
        return `<span class="chart-legend-item" data-testid="${testId}-legend-${item.key || index}">
          <i style="background:${color}"></i>${item.label} (${item.value})
        </span>`;
      })
      .join("");

    container.innerHTML = `
      <div class="chart" data-testid="${testId}">
        <div class="chart-title">${title}</div>
        <div class="donut-wrap">
          <svg viewBox="0 0 140 140" class="donut-svg" data-testid="${testId}-svg" aria-label="${title}">
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#e8edf2" stroke-width="16"></circle>
            ${segments}
            <text x="70" y="68" text-anchor="middle" class="donut-center-value" data-testid="${testId}-total">${total}</text>
            <text x="70" y="86" text-anchor="middle" class="donut-center-label">total</text>
          </svg>
          <div class="chart-legend chart-legend-col" data-testid="${testId}-legend">${legend}</div>
        </div>
      </div>`;
  }

  function initCombobox({
    root,
    input,
    listbox,
    options,
    onSelect,
    onFilter,
    emptyText = "No matches",
  }) {
    let activeIndex = -1;
    let filtered = options.slice();

    function renderList() {
      if (!listbox) return;
      if (filtered.length === 0) {
        listbox.innerHTML = `<div class="combobox-empty" data-testid="combobox-empty">${emptyText}</div>`;
        listbox.classList.add("open");
        input.setAttribute("aria-expanded", "true");
        return;
      }
      listbox.innerHTML = filtered
        .map(
          (opt, index) => `
          <div
            class="combobox-option ${index === activeIndex ? "active" : ""}"
            role="option"
            id="combo-opt-${opt.id}"
            data-id="${opt.id}"
            data-testid="combobox-option-${opt.id}"
            aria-selected="${index === activeIndex}"
          >
            <strong>${opt.label}</strong>
            <span>${opt.meta || ""}</span>
          </div>`
        )
        .join("");
      listbox.classList.add("open");
      input.setAttribute("aria-expanded", "true");

      listbox.querySelectorAll(".combobox-option").forEach((el) => {
        el.addEventListener("mousedown", (event) => {
          event.preventDefault();
          const id = el.dataset.id;
          const opt = filtered.find((o) => String(o.id) === String(id));
          if (opt) select(opt);
        });
      });
    }

    function close() {
      listbox?.classList.remove("open");
      input.setAttribute("aria-expanded", "false");
      activeIndex = -1;
    }

    function select(opt) {
      input.value = opt.label;
      input.dataset.selectedId = opt.id;
      close();
      onSelect?.(opt);
    }

    function filter(query) {
      const q = query.trim().toLowerCase();
      filtered = options.filter(
        (opt) =>
          !q ||
          opt.label.toLowerCase().includes(q) ||
          String(opt.meta || "")
            .toLowerCase()
            .includes(q)
      );
      activeIndex = filtered.length ? 0 : -1;
      renderList();
      onFilter?.(query, filtered);
    }

    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", listbox.id);
    listbox.setAttribute("role", "listbox");

    input.addEventListener("input", () => {
      delete input.dataset.selectedId;
      filter(input.value);
    });
    input.addEventListener("focus", () => filter(input.value));
    input.addEventListener("keydown", (event) => {
      if (!listbox.classList.contains("open") && ["ArrowDown", "Enter"].includes(event.key)) {
        filter(input.value);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = Math.min(filtered.length - 1, activeIndex + 1);
        renderList();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = Math.max(0, activeIndex - 1);
        renderList();
      } else if (event.key === "Enter") {
        if (activeIndex >= 0 && filtered[activeIndex]) {
          event.preventDefault();
          select(filtered[activeIndex]);
        }
      } else if (event.key === "Escape") {
        close();
      }
    });

    document.addEventListener("click", (event) => {
      if (!root.contains(event.target)) close();
    });

    return { filter, close, select };
  }

  /* ——— Toast queue + undo ——— */
  const toastQueue = [];
  let toastSeq = 0;

  function ensureToastHost() {
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      host.className = "toast-host";
      host.setAttribute("data-testid", "toast-host");
      document.body.appendChild(host);
    }
    return host;
  }

  function showToast(message, options = {}) {
    const host = ensureToastHost();
    const id = `toast-${++toastSeq}`;
    const el = document.createElement("div");
    el.className = "toast-item";
    el.setAttribute("data-testid", "toast");
    el.dataset.toastId = id;
    el.innerHTML = `
      <span class="toast-message" data-testid="toast-message">${message}</span>
      <div class="toast-actions">
        ${options.undo ? `<button type="button" class="ghost toast-undo" data-testid="toast-undo">Undo</button>` : ""}
        <button type="button" class="ghost toast-dismiss" data-testid="toast-dismiss" aria-label="Dismiss">×</button>
      </div>`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("visible"));

    const entry = { id, el, undo: options.undo || null, timer: null };
    toastQueue.push(entry);

    const dismiss = () => {
      el.classList.remove("visible");
      setTimeout(() => el.remove(), 200);
      const idx = toastQueue.findIndex((t) => t.id === id);
      if (idx >= 0) toastQueue.splice(idx, 1);
      if (entry.timer) clearTimeout(entry.timer);
    };

    el.querySelector(".toast-dismiss")?.addEventListener("click", dismiss);
    el.querySelector(".toast-undo")?.addEventListener("click", () => {
      entry.undo?.();
      dismiss();
    });

    entry.timer = setTimeout(dismiss, options.duration || 4500);
    return { id, dismiss };
  }

  /* ——— Context menu ——— */
  function showContextMenu(x, y, items, testId = "context-menu") {
    hideContextMenu();
    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.id = "meridian-context-menu";
    menu.setAttribute("data-testid", testId);
    menu.setAttribute("role", "menu");
    menu.innerHTML = items
      .map(
        (item, i) =>
          `<button type="button" role="menuitem" class="context-menu-item ${item.danger ? "danger" : ""}" data-index="${i}" data-testid="context-item-${item.id || i}">${item.label}</button>`
      )
      .join("");
    document.body.appendChild(menu);

    const rect = menu.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
    if (top + rect.height > window.innerHeight - 8) top = window.innerHeight - rect.height - 8;
    menu.style.left = `${Math.max(8, left)}px`;
    menu.style.top = `${Math.max(8, top)}px`;

    menu.querySelectorAll(".context-menu-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = items[Number(btn.dataset.index)];
        hideContextMenu();
        item?.action?.();
      });
    });

    setTimeout(() => {
      document.addEventListener("click", hideContextMenu, { once: true });
      document.addEventListener("contextmenu", hideContextMenu, { once: true });
    }, 0);
  }

  function hideContextMenu() {
    document.getElementById("meridian-context-menu")?.remove();
  }

  /* ——— Chips ——— */
  function initChipSelect(root, { options, name = "tags" }) {
    const selected = new Set();
    const list = root.querySelector("[data-chip-list]");
    const hidden = root.querySelector(`input[name="${name}"]`) || null;

    function sync() {
      if (hidden) hidden.value = Array.from(selected).join(",");
      root.setAttribute("data-selected", Array.from(selected).join(","));
    }

    list.innerHTML = options
      .map(
        (opt) => `
        <button type="button" class="chip" data-value="${opt}" data-testid="chip-${opt.toLowerCase().replace(/\s+/g, "-")}" aria-pressed="false">
          ${opt}
        </button>`
      )
      .join("");

    list.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.dataset.value;
        if (selected.has(value)) {
          selected.delete(value);
          btn.classList.remove("selected");
          btn.setAttribute("aria-pressed", "false");
        } else {
          selected.add(value);
          btn.classList.add("selected");
          btn.setAttribute("aria-pressed", "true");
        }
        sync();
      });
    });

    return {
      getSelected: () => Array.from(selected),
      clear: () => {
        selected.clear();
        list.querySelectorAll(".chip").forEach((btn) => {
          btn.classList.remove("selected");
          btn.setAttribute("aria-pressed", "false");
        });
        sync();
      },
    };
  }

  /* ——— Skeleton ——— */
  function showSkeleton(container, variant = "chart") {
    if (!container) return;
    container.innerHTML =
      variant === "kanban"
        ? `<div class="skeleton-kanban" data-testid="skeleton-kanban">${[1, 2, 3, 4, 5]
            .map(
              () => `<div class="skeleton-col"><div class="skeleton-line"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>`
            )
            .join("")}</div>`
        : `<div class="skeleton-chart" data-testid="skeleton-chart">
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-bars">${[1, 2, 3, 4, 5].map(() => `<div class="skeleton-bar"></div>`).join("")}</div>
          </div>`;
  }

  /* ——— Shadow DOM status badge ——— */
  class MeridianStatusBadge extends HTMLElement {
    static get observedAttributes() {
      return ["status", "label"];
    }

    constructor() {
      super();
      this._root = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      const status = this.getAttribute("status") || "unknown";
      const label = this.getAttribute("label") || status;
      const colors = {
        active: { bg: "rgba(13,122,95,.12)", fg: "#0d7a5f" },
        approved: { bg: "rgba(13,122,95,.12)", fg: "#0d7a5f" },
        pending: { bg: "rgba(183,121,31,.14)", fg: "#b7791f" },
        submitted: { bg: "rgba(183,121,31,.14)", fg: "#b7791f" },
        inactive: { bg: "#edf0f3", fg: "#8493a3" },
        rejected: { bg: "rgba(194,59,59,.12)", fg: "#c23b3b" },
        cancelled: { bg: "#edf0f3", fg: "#8493a3" },
      };
      const c = colors[status] || colors.inactive;
      this._root.innerHTML = `
        <style>
          :host { display: inline-flex; }
          .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.18rem 0.55rem;
            border-radius: 999px;
            font: 700 0.74rem/1.2 Manrope, sans-serif;
            text-transform: capitalize;
            background: ${c.bg};
            color: ${c.fg};
          }
        </style>
        <span class="badge" part="badge" data-testid="shadow-badge" data-status="${status}">${label}</span>
      `;
    }
  }

  if (!customElements.get("meridian-status-badge")) {
    customElements.define("meridian-status-badge", MeridianStatusBadge);
  }

  /* ——— Calendar helpers ——— */
  function renderMonthCalendar(container, { year, month, events, testId = "calendar" }) {
    if (!container) return;
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = first.toLocaleString("en", { month: "long", year: "numeric" });

    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(`<div class="cal-cell empty"></div>`);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEvents = events.filter((e) => e.date === dateStr || (e.start && e.end && dateStr >= e.start && dateStr <= e.end));
      cells.push(`
        <div class="cal-cell ${dayEvents.length ? "has-event" : ""}" data-date="${dateStr}" data-testid="${testId}-day-${day}">
          <div class="cal-day">${day}</div>
          ${dayEvents
            .map(
              (e) =>
                `<button type="button" class="cal-event" data-id="${e.id}" data-testid="${testId}-event-${e.id}">${e.title}</button>`
            )
            .join("")}
        </div>`);
    }

    container.innerHTML = `
      <div class="calendar" data-testid="${testId}">
        <div class="calendar-header">
          <button type="button" class="secondary" data-cal-nav="prev" data-testid="${testId}-prev">←</button>
          <strong data-testid="${testId}-label">${monthName}</strong>
          <button type="button" class="secondary" data-cal-nav="next" data-testid="${testId}-next">→</button>
        </div>
        <div class="cal-weekdays">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => `<div>${d}</div>`).join("")}</div>
        <div class="cal-grid">${cells.join("")}</div>
      </div>`;
  }

  global.MeridianWidgets = {
    initTooltips,
    showTooltip,
    hideTooltip,
    renderBarChart,
    renderDonutChart,
    initCombobox,
    showToast,
    showContextMenu,
    hideContextMenu,
    initChipSelect,
    showSkeleton,
    renderMonthCalendar,
  };

  // Prefer queue toast globally
  if (global.MeridianUI) global.MeridianUI.showToast = showToast;
  else global.MeridianUI = { showToast, $: (s, r = document) => r.querySelector(s) };
})(window);
