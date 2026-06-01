const splitTableLayout = [
  { id: "D2", x: 116, y: 128, w: 157, h: 79 },
  { id: "D1", x: 346, y: 128, w: 157, h: 79 },
  { id: "B3", x: 916, y: 104, w: 81, h: 79 },
  { id: "B4", x: 996, y: 104, w: 81, h: 79 },
  { id: "B2", x: 880, y: 248, w: 79, h: 79 },
  { id: "B1", x: 880, y: 327, w: 79, h: 79 },
  { id: "C3", x: 144, y: 510, w: 79, h: 79 },
  { id: "C4", x: 346, y: 510, w: 79, h: 79 },
  { id: "C2", x: 144, y: 634, w: 79, h: 79 },
  { id: "C1", x: 346, y: 634, w: 79, h: 79 },
  { id: "A4", x: 774, y: 646, w: 81, h: 79 },
  { id: "A3", x: 854, y: 646, w: 81, h: 79 },
  { id: "A2", x: 980, y: 646, w: 81, h: 79 },
  { id: "A1", x: 1060, y: 646, w: 81, h: 79 },
];

const mergedTableLayout = [
  { id: "D2", x: 116, y: 128, w: 157, h: 79 },
  { id: "D1", x: 346, y: 128, w: 157, h: 79 },
  { id: "B3,4", x: 916, y: 104, w: 161, h: 79 },
  { id: "B1,2", x: 880, y: 248, w: 79, h: 158 },
  { id: "C3", x: 144, y: 510, w: 79, h: 79 },
  { id: "C4", x: 346, y: 510, w: 79, h: 79 },
  { id: "C2", x: 144, y: 634, w: 79, h: 79 },
  { id: "C1", x: 346, y: 634, w: 79, h: 79 },
  { id: "A3,4", x: 774, y: 646, w: 161, h: 79 },
  { id: "A1,2", x: 980, y: 646, w: 161, h: 79 },
];

const splitTimelineOrder = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4", "D1", "D2"];
const mergedTimelineOrder = ["A1,2", "A3,4", "B1,2", "B3,4", "C1", "C2", "C3", "C4", "D1", "D2"];
const inputTableOrder = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4", "D1", "D2"];
const timelineRowHeight = 52;
const timelineHeaderHeight = 52;
const timelineFirstColumnWidth = 76;

const tableIdMap = {
  1: "D2",
  2: "D2",
  3: "D1",
  4: "D1",
  5: "B3",
  6: "B4",
  7: "B2",
  8: "B1",
  9: "C3",
  10: "C4",
  11: "C2",
  12: "C1",
  13: "A4",
  14: "A3",
  15: "A2",
  16: "A1",
};

const fixtures = [
  { type: "lounge", x: 0, y: 0, w: 520, h: 86 },
  { type: "chair", x: 0, y: 86, w: 82, h: 264 },
  { type: "chair", x: 82, y: 274, w: 260, h: 76 },
  { type: "lounge", x: 0, y: 372, w: 520, h: 90 },
  { type: "chair", x: 0, y: 462, w: 82, h: 286 },
  { type: "lounge", x: 0, y: 748, w: 520, h: 84 },
  { type: "lounge", x: 740, y: 0, w: 280, h: 86 },
  { type: "lounge", x: 740, y: 86, w: 80, h: 346 },
  { type: "lounge", x: 760, y: 748, w: 360, h: 84 },
  { type: "room", x: 82, y: 84, w: 442, h: 190 },
  { type: "room", x: 82, y: 456, w: 442, h: 294 },
  { type: "divider horizontal", x: 0, y: 350, w: 522, h: 34 },
  { type: "divider vertical", x: 506, y: 350, w: 34, h: 158 },
  { type: "divider vertical", x: 740, y: 0, w: 34, h: 458 },
  { type: "divider vertical", x: 508, y: 666, w: 34, h: 166 },
  { type: "void top", x: 520, y: 0, w: 220, h: 120 },
  { type: "void bottom", x: 542, y: 715, w: 218, h: 117 },
  { type: "wall", x: 0, y: 0, w: 1160, h: 832 },
];

const defaultSessions = [];

const storageKey = "night-table-management-v1";
const settingsKey = "night-table-management-settings-v1";
let appSettings = loadSettings();
let tableLayout = getTableLayout();
let sessions = loadSessions();
let draggedSessionId = null;
let mapPreviewAt = null;

const floorMap = document.querySelector("#floorMap");
const timelineGrid = document.querySelector("#timelineGrid");
const tableDialog = document.querySelector("#tableDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogBody = document.querySelector("#dialogBody");
const settingsDialog = document.querySelector("#settingsDialog");

init();

function init() {
  safely(renderStartOptions);
  safely(renderSelectors);
  safely(renderSettings);
  safely(renderGuestFields);
  safely(setDefaultTime);
  safely(bindTabs);
  safely(bindForms);
  safely(bindSettings);
  safely(renderAll);
  window.setInterval(renderAll, 30_000);
}

function safely(fn) {
  try {
    fn();
  } catch (error) {
    console.error(error);
  }
}

function loadSettings() {
  const raw = readStorage(settingsKey);
  if (!raw) return { splitAB: false, casts: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      splitAB: parsed.splitAB === true,
      casts: normalizeCasts(parsed.casts),
    };
  } catch {
    return { splitAB: false, casts: [] };
  }
}

function normalizeCasts(casts) {
  if (!Array.isArray(casts)) return [];
  return casts
    .map((cast) => {
      if (typeof cast === "string") return { name: cast, active: true };
      return { name: String(cast.name || "").trim(), active: cast.active === true };
    })
    .filter((cast) => cast.name);
}

function saveSettings() {
  appSettings.casts = normalizeCasts(appSettings.casts);
  writeStorage(settingsKey, JSON.stringify(appSettings));
}

function getTableLayout() {
  return appSettings.splitAB ? splitTableLayout : mergedTableLayout;
}

function getTimelineLayout() {
  const order = appSettings.splitAB ? splitTimelineOrder : mergedTimelineOrder;
  return order
    .map((id) => tableLayout.find((layout) => layout.id === id))
    .filter(Boolean);
}

function loadSessions() {
  const raw = readStorage(storageKey);
  if (!raw) return defaultSessions;
  try {
    return migrateSessions(JSON.parse(raw));
  } catch {
    return defaultSessions;
  }
}

function migrateSessions(items) {
  return items
    .map((session) => ({
      ...session,
      tableId: tableIdMap[session.tableId] || session.tableId,
    }))
    .map((session) => ({
      ...session,
      tableId: normalizeTableId(session.tableId, appSettings.splitAB),
    }))
    .filter((session) => session.pending || tableLayout.some((layout) => layout.id === session.tableId))
    .filter((session) => !isSampleSession(session));
}

function normalizeTableId(tableId, splitOn) {
  const toMerged = {
    A1: "A1,2",
    A2: "A1,2",
    A3: "A3,4",
    A4: "A3,4",
    B1: "B1,2",
    B2: "B1,2",
    B3: "B3,4",
    B4: "B3,4",
  };
  const toSplit = {
    "A1,2": "A1",
    "A3,4": "A3",
    "B1,2": "B1",
    "B3,4": "B3",
  };
  if (splitOn) return toSplit[tableId] || tableId;
  return toMerged[tableId] || tableId;
}

function applyTableMode(splitOn) {
  appSettings.splitAB = splitOn;
  tableLayout = getTableLayout();
  sessions = sessions
    .map((session) => ({ ...session, tableId: normalizeTableId(session.tableId, splitOn) }))
    .filter((session) => tableLayout.some((layout) => layout.id === session.tableId));
  saveSettings();
  save();
  renderSelectors();
  renderSettings();
  renderAll();
}

function save() {
  writeStorage(storageKey, JSON.stringify(sessions));
}

function autoExtendOverdueSessions() {
  const now = new Date();
  const businessStart = getBusinessStart(now);
  const businessEnd = addMinutes(businessStart, 9 * 60);
  if (now < businessStart || now > businessEnd) return;

  let changed = false;
  for (const session of sessions) {
    if (session.pending || session.checkedOut || !session.start) continue;
    const start = new Date(session.start);
    if (start < businessStart || start >= businessEnd) continue;
    let guard = 0;
    while (now >= endTime(session) && guard < 12) {
      session.duration = Number(session.duration || 60) + 60;
      changed = true;
      guard += 1;
    }
  }
  if (changed) save();
}

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(error);
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error(error);
  }
}

function renderAll() {
  autoExtendOverdueSessions();
  safely(renderStats);
  safely(renderMap);
  safely(renderTimeline);
  safely(renderActionSessionOptions);
  safely(renderCheckoutOptions);
  safely(renderPendingList);
}

function renderStats() {
  const active = sessionsAt(new Date());
  document.querySelector("#activeCount").textContent = active.length;
  document.querySelector("#activeCastCount").textContent = getActiveCasts().length;
}

function renderMap() {
  floorMap.innerHTML = "";
  addMapLabels();
  const previewTime = getMapPreviewTime();
  const activeByTable = new Map(sessionsAt(previewTime).map((session) => [session.tableId, session]));

  for (const layout of tableLayout) {
    const session = activeByTable.get(layout.id);
    const status = session ? getStatus(session, previewTime) : "empty";
    const button = document.createElement("button");
    button.type = "button";
    button.className = `table-card ${status === "empty" ? "empty-state" : `status-${status}`}`;
    button.style.left = `${layout.x}px`;
    button.style.top = `${layout.y}px`;
    button.style.width = `${layout.w}px`;
    button.style.height = `${layout.h}px`;
    button.innerHTML = `
      <strong>${layout.id}</strong>
      <span>${session ? session.guestName : "空卓"}</span>
      <span>${session ? session.castNames || "担当未設定" : "登録なし"}</span>
      <span class="remaining">${session ? remainingLabel(session, previewTime) : "--:--"}</span>
    `;
    button.addEventListener("click", () => showTableDetail(layout.id));
    floorMap.appendChild(button);
  }
}

function addMapLabels() {
  for (const fixture of fixtures) {
    const el = document.createElement("div");
    el.className = `fixture ${fixture.type}`;
    el.style.left = `${fixture.x}px`;
    el.style.top = `${fixture.y}px`;
    el.style.width = `${fixture.w}px`;
    el.style.height = `${fixture.h}px`;
    floorMap.appendChild(el);
  }
}

function renderTimeline() {
  timelineGrid.innerHTML = "";
  const timelineLayout = getTimelineLayout();
  timelineGrid.style.gridTemplateColumns = `${timelineFirstColumnWidth}px repeat(${timelineLayout.length}, minmax(0, 1fr))`;
  const times = getTimelineTimes();

  appendTimelineCell("時間", "table-head corner");
  for (const layout of timelineLayout) {
    appendTimelineCell(layout.id, "table-head");
  }

  for (const time of times) {
    appendTimelineCell(formatTime(time), "time-cell");
    for (const layout of timelineLayout) {
      const session = sessions.find((item) => item.tableId === layout.id && startsInSlot(item, time));
      const cell = appendTimelineCell("", "slot-cell");
      cell.dataset.tableId = layout.id;
      cell.dataset.time = time.toISOString();
      cell.addEventListener("click", () => {
        mapPreviewAt = new Date(cell.dataset.time);
        renderStats();
        renderMap();
      });
      bindTimelineDrop(cell);
      if (session) {
        cell.appendChild(createTimelineBlock(session, time));
      }
    }
  }
  renderCurrentTimeLine();
}

function renderCurrentTimeLine() {
  const now = roundDownToFiveMinutes(new Date());
  const businessStart = getBusinessStart(now);
  const businessEnd = addMinutes(businessStart, 9 * 60);
  if (now < businessStart || now > businessEnd) return;

  const minutesFromStart = (now - businessStart) / 60000;
  const line = document.createElement("div");
  line.className = "current-time-line";
  line.style.top = `${timelineHeaderHeight + (minutesFromStart / 15) * timelineRowHeight}px`;
  timelineGrid.appendChild(line);
}

function createTimelineBlock(session, time) {
  const item = document.createElement("button");
  item.type = "button";
  item.draggable = true;
  item.className = `slot-item session-block status-${getStatus(session, time)}`;
  const minuteOffset = Math.max(0, (new Date(session.start) - time) / 60000);
  item.style.top = `${6 + (minuteOffset / 15) * timelineRowHeight}px`;
  item.style.height = `${Math.max(1, Number(session.duration || 60) / 15) * timelineRowHeight - 12}px`;
  item.innerHTML = `
    <strong>${escapeHtml(session.guestName)}</strong>
    <span>${escapeHtml(session.castNames || "担当未設定")}</span>
    <small>${formatTime(new Date(session.start))} - ${formatTime(endTime(session))}</small>
  `;
  item.addEventListener("click", () => showTimelineDetail(session.id));
  item.addEventListener("dragstart", (event) => {
    draggedSessionId = session.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", session.id);
  });
  item.addEventListener("dragend", () => {
    draggedSessionId = null;
    document.querySelectorAll(".drop-target").forEach((cell) => cell.classList.remove("drop-target"));
  });
  return item;
}

function bindTimelineDrop(cell) {
  cell.addEventListener("dragover", (event) => {
    event.preventDefault();
    cell.classList.add("drop-target");
  });
  cell.addEventListener("dragleave", () => cell.classList.remove("drop-target"));
  cell.addEventListener("drop", (event) => {
    event.preventDefault();
    cell.classList.remove("drop-target");
    const sessionId = event.dataTransfer.getData("text/plain") || draggedSessionId;
    const session = sessions.find((item) => item.id === sessionId);
    if (!session) return;
    const snappedTime = getSnappedDropTime(cell, event);
    mapPreviewAt = snappedTime;
    session.tableId = cell.dataset.tableId;
    session.start = snappedTime.toISOString();
    save();
    renderAll();
  });
}

function getSnappedDropTime(cell, event) {
  const base = new Date(cell.dataset.time);
  const rect = cell.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  const offset = Math.min(15, Math.max(0, Math.round((ratio * 15) / 5) * 5));
  return addMinutes(base, offset);
}

function appendTimelineCell(text, className) {
  const cell = document.createElement("div");
  cell.className = className;
  cell.textContent = text;
  timelineGrid.appendChild(cell);
  return cell;
}

function renderSelectors() {
  const tableOptions = appSettings.splitAB ? splitTimelineOrder : mergedTimelineOrder;
  const options = [`<option value="未定">未定</option>`, ...tableOptions.map((id) => `<option value="${id}">${id}</option>`)].join("");
  const tableSelect = document.querySelector("#tableSelect");
  if (tableSelect) tableSelect.innerHTML = options;
  renderCastOptions();
}

function renderCastOptions() {
  renderGuestFields();
}

function renderActionSessionOptions() {
  const select = document.querySelector("#actionSessionSelect");
  if (!select) return;
  const normalSessions = sessions.filter((session) => !session.pending && !session.checkedOut);
  if (!normalSessions.length) {
    select.innerHTML = `<option value="">予定なし</option>`;
    return;
  }
  select.innerHTML = normalSessions
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .map((session) => {
      const label = `${session.tableId} ${formatTime(new Date(session.start))} ${session.guestName || "無名"}`;
      return `<option value="${session.id}">${escapeHtml(label)}</option>`;
    })
    .join("");
}

function renderCheckoutOptions() {
  const select = document.querySelector("#checkoutTime");
  const button = document.querySelector("#checkoutButton");
  if (!select || !button) return;
  const currentValue = select.value;
  select.innerHTML = [
    `<option value="">退店時間を選択</option>`,
    ...getFiveMinuteTimes().map((time) => `<option value="${time.toISOString()}">${formatTime(time)}</option>`),
  ].join("");
  select.value = currentValue;
  button.disabled = !select.value;
}

function getCastOptionsHtml(selected = "") {
  const selectedValue = Array.isArray(selected) ? selected[0] || "" : String(selected || "");
  return [
    `<option value="">キャストを選択</option>`,
    ...getActiveCasts().map((cast) => {
      const safeName = escapeHtml(cast.name);
      return `<option value="${safeName}" ${selectedValue === cast.name ? "selected" : ""}>${safeName}</option>`;
    }),
  ].join("");
}

function getTimelineCastOptionsHtml(selected = "") {
  const selectedValue = String(selected || "");
  const options = ["新規", "担当なし", ...getActiveCasts().map((cast) => cast.name)];
  const hasCurrent = selectedValue && !options.includes(selectedValue);
  return ["", ...(hasCurrent ? [selectedValue] : []), ...options]
    .map((name) => {
      if (!name) return `<option value="">未設定</option>`;
      const safeName = escapeHtml(name);
      return `<option value="${safeName}" ${selectedValue === name ? "selected" : ""}>${safeName}</option>`;
    })
    .join("");
}

function getActiveCasts() {
  return normalizeCasts(appSettings.casts).filter((cast) => cast.active);
}

function renderStartOptions() {
  const select = document.querySelector("#startTime");
  if (!select) return;
  select.innerHTML = getFiveMinuteTimes()
    .map((time) => `<option value="${formatInputTime(time)}">${formatTime(time)}</option>`)
    .join("");
}

function renderPendingList() {
  const list = document.querySelector("#pendingList");
  if (!list) return;
  const pendingSessions = sessions.filter((session) => session.pending);
  if (!pendingSessions.length) {
    list.innerHTML = `<p class="empty-note">時間未定の予定はありません。</p>`;
    return;
  }
  const tableOptions = appSettings.splitAB ? splitTimelineOrder : mergedTimelineOrder;
  list.innerHTML = pendingSessions
    .map((session) => `
      <div class="pending-item" data-pending-id="${session.id}">
        <div>
          <strong>${escapeHtml(session.guestName || "無名")}</strong>
          <span>${escapeHtml(session.castNames || "担当未設定")}</span>
        </div>
        <select class="pending-table">
          ${tableOptions.map((id) => `<option value="${id}" ${id === session.tableId ? "selected" : ""}>${id}</option>`).join("")}
        </select>
        <select class="pending-time">
          ${getFiveMinuteTimes().map((time) => `<option value="${time.toISOString()}">${formatTime(time)}</option>`).join("")}
        </select>
        <button class="ghost-button confirm-pending" type="button">確定</button>
      </div>
    `)
    .join("");
  list.querySelectorAll(".confirm-pending").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".pending-item");
      const session = sessions.find((entry) => entry.id === item.dataset.pendingId);
      if (!session) return;
      session.pending = false;
      session.tableId = normalizeTableId(item.querySelector(".pending-table").value, appSettings.splitAB);
      session.start = item.querySelector(".pending-time").value;
      save();
      renderAll();
    });
  });
}

function renderGuestFields() {
  const container = document.querySelector("#guestFields");
  const guestCountInput = document.querySelector("#guestCount");
  if (!container || !guestCountInput) return;

  const existing = getGuestEntries();
  const count = Math.max(1, Number(guestCountInput.value || 1));
  container.innerHTML = Array.from({ length: count }, (_, index) => {
    const entry = existing[index] || { name: "", cast: "" };
    const isNew = entry.cast === "新規";
    const isNoAssign = entry.cast === "担当なし";
    return `
      <div class="guest-row">
        <label>
          お客様名 ${index + 1}
          <input class="guest-name-input" type="text" value="${escapeHtml(entry.name)}" placeholder="お客様名" required />
        </label>
        <div class="cast-choice-field">
          <label>
            キャスト
            <select class="guest-cast-select" ${isNew || isNoAssign ? "disabled" : ""}>
              ${getCastOptionsHtml(isNew || isNoAssign ? "" : entry.cast)}
            </select>
          </label>
          <div class="cast-special-options">
            <label>
              <input class="guest-special-cast" type="checkbox" value="新規" ${isNew ? "checked" : ""} />
              新規
            </label>
            <label>
              <input class="guest-special-cast" type="checkbox" value="担当なし" ${isNoAssign ? "checked" : ""} />
              担当なし
            </label>
          </div>
        </div>
      </div>
    `;
  }).join("");
  container.querySelectorAll(".guest-row").forEach((row) => {
    const castSelect = row.querySelector(".guest-cast-select");
    row.querySelectorAll(".guest-special-cast").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          row.querySelectorAll(".guest-special-cast").forEach((item) => {
            if (item !== checkbox) item.checked = false;
          });
        }
        const hasSpecial = Boolean(row.querySelector(".guest-special-cast:checked"));
        castSelect.disabled = hasSpecial;
        if (hasSpecial) castSelect.value = "";
      });
    });
  });
}

function getGuestEntries() {
  const names = [...document.querySelectorAll(".guest-name-input")];
  const rows = [...document.querySelectorAll(".guest-row")];
  return names.map((input, index) => ({
    name: input.value.trim(),
    cast: rows[index]?.querySelector(".guest-special-cast:checked")?.value || rows[index]?.querySelector(".guest-cast-select")?.value || "",
  }));
}

function renderSettings() {
  const splitToggle = document.querySelector("#splitToggle");
  const castList = document.querySelector("#castList");
  if (!splitToggle || !castList) return;
  splitToggle.checked = appSettings.splitAB;
  appSettings.casts = normalizeCasts(appSettings.casts);
  castList.innerHTML = appSettings.casts
    .map(
      (cast, index) => `
        <li>
          <span>${escapeHtml(cast.name)}</span>
          <label class="cast-active-label">
            <input type="checkbox" data-cast-active-index="${index}" ${cast.active ? "checked" : ""} />
            出勤
          </label>
          <button class="text-button" type="button" data-cast-index="${index}">削除</button>
        </li>
      `,
    )
    .join("");
  castList.querySelectorAll("[data-cast-index]").forEach((button) => {
    button.addEventListener("click", () => {
      appSettings.casts.splice(Number(button.dataset.castIndex), 1);
      saveSettings();
      renderSettings();
      renderCastOptions();
    });
  });
  castList.querySelectorAll("[data-cast-active-index]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      appSettings.casts[Number(checkbox.dataset.castActiveIndex)].active = checkbox.checked;
      saveSettings();
      renderStats();
      renderCastOptions();
    });
  });
}

function bindTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`#${button.dataset.view}`).classList.add("active");
      if (button.dataset.view === "mapView") {
        mapPreviewAt = null;
        renderStats();
        renderMap();
      }
    });
  });
}

function bindForms() {
  document.querySelector("#guestCount").addEventListener("input", renderGuestFields);

  document.querySelector("#entryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const rawTableId = document.querySelector("#tableSelect").value;
    const tableId = rawTableId === "未定" ? "未定" : normalizeTableId(rawTableId, appSettings.splitAB);
    const start = timeInputToDate(document.querySelector("#startTime").value);
    const pending = rawTableId === "未定" || document.querySelector("#timePending").checked;
    const guests = getGuestEntries();
    const guestNames = guests.map((guest) => guest.name).filter(Boolean);
    const castNames = guests.map((guest) => guest.cast).filter(Boolean);
    sessions.push({
      id: crypto.randomUUID(),
      tableId,
      guestName: guestNames.join("、"),
      guestNames,
      guestCount: guests.length,
      castNames: castNames.join("、"),
      castAssignments: guests.map((guest) => guest.cast),
      casts: countAssignedCasts(castNames),
      start: pending ? null : start.toISOString(),
      pending,
      duration: 60,
      amount: 0,
      memo: document.querySelector("#memo").value.trim(),
    });
    pushLog(`${tableId}に${guestNames.join("、")}を登録`);
    event.target.reset();
    document.querySelector("#guestCount").value = 1;
    document.querySelector("#timePending").checked = false;
    renderGuestFields();
    setDefaultTime();
    save();
    renderAll();
    announceComplete();
  });

  document.querySelectorAll(".quick-grid button").forEach((button) => {
    button.addEventListener("click", () => runQuickAction(button.dataset.action, Number(button.dataset.minutes || 0)));
  });
  document.querySelector("#checkoutTime").addEventListener("change", (event) => {
    document.querySelector("#checkoutButton").disabled = !event.target.value;
  });

  document.querySelector("#closeDialog").addEventListener("click", () => tableDialog.close());
}

function bindSettings() {
  document.querySelector("#settingsButton").addEventListener("click", () => settingsDialog.showModal());
  document.querySelector("#closeSettings").addEventListener("click", () => settingsDialog.close());
  document.querySelector("#splitToggle").addEventListener("change", (event) => {
    applyTableMode(event.target.checked);
  });
  document.querySelector("#addCast").addEventListener("click", () => {
    const input = document.querySelector("#castNameInput");
    const name = input.value.trim();
    if (!name) return;
    appSettings.casts.push({ name, active: true });
    input.value = "";
    saveSettings();
    renderSettings();
    renderCastOptions();
  });
  document.querySelector("#resetBusinessData").addEventListener("click", () => {
    sessions = [];
    mapPreviewAt = null;
    appSettings = { splitAB: false, casts: normalizeCasts(appSettings.casts) };
    tableLayout = getTableLayout();
    save();
    saveSettings();
    renderSelectors();
    renderSettings();
    renderAll();
  });
}

function bindTimelineControls() {
}

function runQuickAction(action, minutes) {
  const sessionId = document.querySelector("#actionSessionSelect").value;
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) {
    pushLog(`対象予定がありません`);
    save();
    renderAll();
    return;
  }

  if (action === "checkout") {
    const checkoutValue = document.querySelector("#checkoutTime").value;
    if (!checkoutValue) return;
    const now = new Date(checkoutValue);
    const start = new Date(session.start);
    session.duration = Math.max(0, Math.ceil((now - start) / 60000));
    session.checkedOut = true;
    document.querySelector("#checkoutTime").value = "";
    document.querySelector("#checkoutButton").disabled = true;
    pushLog(`${session.tableId} ${session.guestName}を退店`);
    announceComplete();
  }

  save();
  renderAll();
}

function showTableDetail(tableId) {
  const previewTime = getMapPreviewTime();
  const session = sessionsAt(previewTime).find((item) => item.tableId === tableId);
  dialogTitle.textContent = `${tableId} 詳細`;
  if (!session) {
    dialogBody.innerHTML = `<p>現在この卓は空いています。</p>`;
    tableDialog.showModal();
    return;
  }

  dialogBody.innerHTML = `
    <dl class="detail-list">
      <div><dt>お客様</dt><dd>${escapeHtml(session.guestName)}</dd></div>
      <div><dt>人数</dt><dd>${session.guestCount}名</dd></div>
      <div><dt>キャスト</dt><dd>${escapeHtml(getCastDisplay(session))}</dd></div>
      <div><dt>開始</dt><dd>${formatTime(new Date(session.start))}</dd></div>
      <div><dt>終了予定</dt><dd>${formatTime(endTime(session))}</dd></div>
      <div><dt>残り時間</dt><dd>${remainingLabel(session, previewTime)}</dd></div>
      <div><dt>メモ</dt><dd>${escapeHtml(session.memo || "なし")}</dd></div>
    </dl>
  `;
  tableDialog.showModal();
}

function showTimelineDetail(sessionId) {
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) return;

  dialogTitle.textContent = `${session.tableId} 予定`;
  const guestNames = getSessionGuestNames(session);
  const castAssignments = getSessionCastAssignments(session, guestNames.length);
  const timeOptions = getFiveMinuteTimes()
    .map((time) => `<option value="${time.toISOString()}" ${formatInputTime(time) === formatInputTime(new Date(session.start)) ? "selected" : ""}>${formatTime(time)}</option>`)
    .join("");
  const tableOptions = (appSettings.splitAB ? splitTimelineOrder : mergedTimelineOrder)
    .map((id) => `<option value="${id}" ${id === session.tableId ? "selected" : ""}>${id}</option>`)
    .join("");
  const castEditRows = guestNames
    .map((guestName, index) => `
      <label>
        ${escapeHtml(guestName || `お客様${index + 1}`)}
        <select class="timeline-cast-edit">
          ${getTimelineCastOptionsHtml(castAssignments[index] || "")}
        </select>
      </label>
    `)
    .join("");
  dialogBody.innerHTML = `
    <dl class="detail-list">
      <div><dt>お客様</dt><dd>${escapeHtml(session.guestName)}</dd></div>
      <div><dt>人数</dt><dd>${session.guestCount}名</dd></div>
      <div><dt>キャスト</dt><dd>${escapeHtml(getCastDisplay(session))}</dd></div>
      <div><dt>開始</dt><dd>${formatTime(new Date(session.start))}</dd></div>
      <div><dt>終了予定</dt><dd>${formatTime(endTime(session))}</dd></div>
      <div><dt>メモ</dt><dd>${escapeHtml(session.memo || "なし")}</dd></div>
    </dl>
    <label class="dialog-control">
      開始時間
      <select id="timelineStartEdit">${timeOptions}</select>
    </label>
    <label class="dialog-control">
      卓番号
      <select id="timelineTableEdit">${tableOptions}</select>
    </label>
    <label class="dialog-control">
      お客様名
      <input id="timelineGuestEdit" type="text" value="${escapeHtml(session.guestName)}" />
    </label>
    <div class="dialog-control timeline-cast-fields">
      <span>キャスト</span>
      ${castEditRows}
    </div>
    <button class="primary-button" type="button" id="saveTimelineEdit">変更を保存</button>
    <button class="danger-button" type="button" id="deleteSession">削除</button>
  `;
  tableDialog.showModal();
  document.querySelector("#saveTimelineEdit").addEventListener("click", () => {
    const guestName = document.querySelector("#timelineGuestEdit").value.trim();
    const editedGuestNames = splitEntryNames(guestName);
    const castValues = [...document.querySelectorAll(".timeline-cast-edit")].map((select) => select.value);
    const castNames = castValues.filter(Boolean);
    session.start = document.querySelector("#timelineStartEdit").value;
    session.tableId = normalizeTableId(document.querySelector("#timelineTableEdit").value, appSettings.splitAB);
    session.guestName = guestName;
    session.guestNames = editedGuestNames;
    session.guestCount = session.guestNames.length || session.guestCount || 1;
    session.castNames = castNames.join("、");
    session.castAssignments = castValues;
    session.casts = countAssignedCasts(castNames);
    save();
    renderAll();
    tableDialog.close();
    announceComplete();
  });
  document.querySelector("#deleteSession").addEventListener("click", () => {
    sessions = sessions.filter((item) => item.id !== sessionId);
    save();
    renderAll();
    tableDialog.close();
  });
}

function activeSessions() {
  return sessions.filter((session) => !session.pending).filter(isActive);
}

function sessionsAt(at) {
  return sessions.filter((session) => !session.pending).filter((session) => isActive(session, at));
}

function getMapPreviewTime() {
  return mapPreviewAt || new Date();
}

function isActive(session, at = new Date()) {
  if (session.pending || !session.start) return false;
  const start = new Date(session.start);
  return at >= start && at < endTime(session);
}

function containsTime(session, at) {
  if (session.pending || !session.start) return false;
  const start = new Date(session.start);
  const end = endTime(session);
  return at >= start && at < end;
}

function startsInSlot(session, at) {
  if (session.pending || !session.start) return false;
  const start = new Date(session.start);
  return start >= at && start < addMinutes(at, 15);
}

function getStatus(session, at = new Date()) {
  const remaining = Math.ceil((endTime(session) - at) / 60000);
  if (remaining <= 0) return "danger";
  if (remaining <= 15) return "warn";
  return "ok";
}

function remainingLabel(session, at = new Date()) {
  const minutes = Math.ceil((endTime(session) - at) / 60000);
  if (minutes <= 0) return "時間切れ";
  return `残り${minutes}分`;
}

function endTime(session) {
  if (!session.start) return new Date();
  return addMinutes(new Date(session.start), Number(session.duration));
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function getTimelineTimes() {
  const start = getBusinessStart(new Date());
  return Array.from({ length: 37 }, (_, index) => addMinutes(start, index * 15));
}

function getFiveMinuteTimes() {
  const start = getBusinessStart(new Date());
  return Array.from({ length: 109 }, (_, index) => addMinutes(start, index * 5));
}

function getBusinessStart(now) {
  const start = new Date(now);
  if (start.getHours() < 7) {
    start.setDate(start.getDate() - 1);
  }
  start.setHours(22, 0, 0, 0);
  return start;
}

function floorToQuarterHour(date) {
  const copy = new Date(date);
  copy.setSeconds(0, 0);
  copy.setMinutes(Math.floor(copy.getMinutes() / 15) * 15);
  return copy;
}

function formatTime(date) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function yen(value) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function setDefaultTime() {
  document.querySelector("#startTime").value = formatInputTime(getDefaultStartTime());
}

function formatInputTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function roundToQuarterHour(date) {
  const rounded = new Date(date);
  const minutes = Math.round(rounded.getMinutes() / 15) * 15;
  rounded.setMinutes(minutes, 0, 0);
  return rounded;
}

function roundDownToFiveMinutes(date) {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  rounded.setMinutes(Math.floor(rounded.getMinutes() / 5) * 5);
  return rounded;
}

function getDefaultStartTime() {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 22 || hour < 7) return roundToQuarterHour(now);
  return getBusinessStart(now);
}

function timeInputToDate(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const businessStart = getBusinessStart(new Date());
  const date = new Date(businessStart);
  if (hours < 7) {
    date.setDate(date.getDate() + 1);
  }
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function pushLog(text) {
  console.info(`${formatTime(new Date())} ${text}`);
}

function announceComplete() {
  window.alert("完了");
}

function countCastNames(value) {
  return value
    .split(/[、,\s]+/)
    .map((name) => name.trim())
    .filter(Boolean).length;
}

function splitEntryNames(value) {
  return String(value || "")
    .split(/[、,\n]+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function isSpecialCastValue(value) {
  return ["新規", "担当なし"].includes(value);
}

function countAssignedCasts(values) {
  return values.filter((value) => value && !isSpecialCastValue(value)).length;
}

function getCastDisplay(session) {
  return session.castNames || "未設定";
}

function getSessionGuestNames(session) {
  const names = Array.isArray(session.guestNames) ? session.guestNames.filter(Boolean) : splitEntryNames(session.guestName);
  const count = Math.max(Number(session.guestCount || 1), names.length, 1);
  return Array.from({ length: count }, (_, index) => names[index] || `お客様${index + 1}`);
}

function getSessionCastAssignments(session, count) {
  const assignments = Array.isArray(session.castAssignments) ? session.castAssignments : [];
  const flatAssignments = assignments
    .map((entry) => (Array.isArray(entry) ? entry.filter(Boolean).join("、") : String(entry || "")))
    .filter((entry) => entry || assignments.length);
  const fallback = String(session.castNames || "")
    .split("、")
    .map((name) => name.trim());
  return Array.from({ length: count }, (_, index) => flatAssignments[index] || fallback[index] || "");
}

function isSampleSession(session) {
  return ["佐藤様", "山田様", "田中様", "鈴木様"].includes(session.guestName);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
