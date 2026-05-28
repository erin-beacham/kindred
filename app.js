(function () {
  const LEGACY_STORAGE_KEY = "kindred.v1";
  const DB_NAME = "kindred";
  const DB_VERSION = 1;
  const STORE_NAME = "app-state";
  const STATE_KEY = "kindred.v1";
  const cadenceOptions = [
    ["1d", "Every day", 1],
    ["3d", "Every 3 days", 3],
    ["1w", "Every week", 7],
    ["2w", "Every 2 weeks", 14],
    ["4w", "Every 4 weeks", 28],
    ["3m", "Every 3 months", 91],
    ["6m", "Every 6 months", 182],
    ["1y", "Every year", 365]
  ];

  const icons = {
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>',
    people: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M13 2 3 14h8l-1 8 11-13h-8l1-7Z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m20 6-11 11-5-5"/></svg>',
    message: '<svg viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></svg>',
    profile: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    empty: '<svg viewBox="0 0 24 24"><path d="M20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5Z"/><path d="m8 10 3 3 5-5"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/></svg>'
  };

  const sampleState = {
    activeView: "today",
    activeTag: "",
    selectedFriendId: null,
    hiddenIdeas: [],
    completedItems: [],
    notificationTime: "09:00",
    friends: [
      {
        id: uid(),
        name: "Maya Chen",
        cadence: "2w",
        birthday: "1993-09-12",
        lastContact: daysAgo(16),
        contact: "maya@example.com",
        tags: ["business school"],
        associates: [{ id: uid(), type: "partner", name: "Sam" }],
        interests: ["ceramics", "urban gardens", "women's soccer"],
        notes: "Maya likes short voice notes. She is considering a balcony herb garden.",
        events: [{ id: uid(), title: "Portfolio review", date: addDays(3), repeat: "none", kind: "meaningful" }],
        logs: [{ id: uid(), date: daysAgo(16), note: "Talked about her new ceramics class and a portfolio review coming up." }]
      },
      {
        id: uid(),
        name: "Jordan Patel",
        cadence: "1w",
        birthday: "1989-02-04",
        lastContact: daysAgo(8),
        contact: "555-0142",
        tags: ["running friends"],
        associates: [],
        interests: ["climate tech", "running", "science fiction"],
        notes: "Training for a half marathon. Ask about knee recovery.",
        events: [{ id: uid(), title: "Half marathon", date: addDays(22), repeat: "none", kind: "meaningful" }],
        logs: [{ id: uid(), date: daysAgo(8), note: "Jordan was nervous about increasing mileage after a sore knee." }]
      },
      {
        id: uid(),
        name: "Priya Rao",
        cadence: "4w",
        birthday: "1991-05-18",
        lastContact: daysAgo(21),
        contact: "",
        tags: ["childhood friends"],
        associates: [{ id: uid(), type: "partner", name: "Sam" }],
        interests: ["indie movies", "baking", "public radio"],
        notes: "Prefers weekend catchups. Anniversary with Sam is in October.",
        events: [{ id: uid(), title: "Anniversary with Sam", date: "2026-10-03", repeat: "yearly", kind: "recurring" }],
        logs: [{ id: uid(), date: daysAgo(21), note: "She was testing sourdough recipes and looking for a quiet movie night pick." }]
      }
    ]
  };

  let state = null;
  let modalMode = null;
  let editingLogId = null;
  let notificationTimer = null;

  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function today() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function iso(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(days) {
    const date = today();
    date.setDate(date.getDate() + days);
    return iso(date);
  }

  function addRelativeDate(baseValue, relativeValue) {
    const date = parseDate(baseValue) || today();
    if (relativeValue === "tomorrow") date.setDate(date.getDate() + 1);
    if (relativeValue === "1w") date.setDate(date.getDate() + 7);
    if (relativeValue === "2w") date.setDate(date.getDate() + 14);
    if (relativeValue === "1m") date.setMonth(date.getMonth() + 1);
    return iso(date);
  }

  function daysAgo(days) {
    return addDays(-days);
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value + "T00:00:00");
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function daysBetween(a, b) {
    return Math.round((a.getTime() - b.getTime()) / 86400000);
  }

  function parseList(value) {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function cloneState(value) {
    if (window.structuredClone) return window.structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function isValidState(value) {
    return Boolean(value && Array.isArray(value.friends));
  }

  function normalizeState(value) {
    const normalized = cloneState(value);
    if (!Array.isArray(normalized.hiddenIdeas)) normalized.hiddenIdeas = [];
    if (!Array.isArray(normalized.completedItems)) normalized.completedItems = [];
    if (!normalized.notificationTime) normalized.notificationTime = "09:00";
    if (!normalized.activeTag) normalized.activeTag = "";
    normalized.friends = normalized.friends.map((friend) => ({
      ...friend,
      interests: Array.isArray(friend.interests) ? friend.interests : [],
      tags: Array.isArray(friend.tags) ? friend.tags : [],
      associates: Array.isArray(friend.associates) ? friend.associates : [],
      events: Array.isArray(friend.events)
        ? friend.events.map((event) => ({
            ...event,
            id: event.id || uid(),
            kind: event.kind || (event.repeat === "yearly" ? "recurring" : "meaningful"),
            repeat: event.repeat || "none"
          }))
        : [],
      logs: Array.isArray(friend.logs) ? friend.logs : []
    }));
    return normalized;
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB is not available."));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("IndexedDB upgrade was blocked."));
    });
  }

  function databaseRequest(mode, callback) {
    return openDatabase().then(
      (database) =>
        new Promise((resolve, reject) => {
          const transaction = database.transaction(STORE_NAME, mode);
          const store = transaction.objectStore(STORE_NAME);
          const request = callback(store);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
          transaction.oncomplete = () => database.close();
          transaction.onerror = () => {
            database.close();
            reject(transaction.error);
          };
          transaction.onabort = () => {
            database.close();
            reject(transaction.error);
          };
        })
    );
  }

  async function loadState() {
    try {
      const saved = await databaseRequest("readonly", (store) => store.get(STATE_KEY));
      if (isValidState(saved)) return normalizeState(saved);

      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
      if (isValidState(legacy)) {
        const migrated = normalizeState(legacy);
        await databaseRequest("readwrite", (store) => store.put(migrated, STATE_KEY));
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return migrated;
      }
    } catch (error) {
      console.warn(error);
    }
    return normalizeState(sampleState);
  }

  function saveState() {
    databaseRequest("readwrite", (store) => store.put(state, STATE_KEY)).catch((error) => console.warn(error));
  }

  function cadence(friend) {
    return cadenceOptions.find(([key]) => key === friend.cadence) || cadenceOptions[1];
  }

  function dueDate(friend) {
    const last = parseDate(friend.lastContact) || today();
    const date = new Date(last);
    date.setDate(date.getDate() + cadence(friend)[2]);
    return date;
  }

  function nextAnnualDate(monthDay) {
    if (!monthDay) return null;
    const [month, day] = monthDay.split("-").map(Number);
    const now = today();
    let date = new Date(now.getFullYear(), month - 1, day);
    if (date < now) date = new Date(now.getFullYear() + 1, month - 1, day);
    return date;
  }

  function eventDueDate(event) {
    const raw = parseDate(event.date);
    if (!raw) return null;
    if (event.repeat !== "yearly" && event.kind !== "recurring") return raw;
    return nextAnnualDate(event.date.slice(5));
  }

  function itemKey(type, friendId, id, date) {
    return `${type}:${friendId}:${id}:${iso(date)}`;
  }

  function isCompleted(type, friendId, id, date) {
    return state.completedItems.includes(itemKey(type, friendId, id, date));
  }

  function completeItem(type, friendId, id, date) {
    const key = itemKey(type, friendId, id, date);
    if (!state.completedItems.includes(key)) state.completedItems.push(key);
  }

  function upcomingEvents(days = 30) {
    const now = today();
    const items = [];
    state.friends.forEach((friend) => {
      if (friend.birthday) {
        const date = nextAnnualDate(friend.birthday.slice(5));
        if (daysBetween(date, now) <= days) {
          items.push({ id: friend.id + "-birthday", friend, title: "Birthday", date, type: "birthday", group: "recurring" });
        }
      }
      (friend.events || []).forEach((event) => {
        const date = eventDueDate(event);
        if (date && daysBetween(date, now) >= 0 && daysBetween(date, now) <= days) {
          items.push({ id: event.id, friend, title: event.title, date, type: "event", group: event.kind === "recurring" || event.repeat === "yearly" ? "recurring" : event.kind || "meaningful" });
        }
      });
    });
    return items.sort((a, b) => a.date - b.date);
  }

  function reachOutTasks(daysAhead = 0) {
    const now = today();
    return state.friends
      .map((friend) => ({ friend, date: dueDate(friend), days: daysBetween(dueDate(friend), now) }))
      .filter((task) => task.days <= daysAhead)
      .sort((a, b) => a.date - b.date);
  }

  function todayActions() {
    const now = today();
    const cadenceTasks = reachOutTasks(0).map((task) => ({
      id: task.friend.id,
      type: "cadence",
      friend: task.friend,
      date: task.date,
      days: task.days,
      title: `Reach out to ${task.friend.name}`,
      detail: bestPrompt(task.friend)
    }));
    const dateTasks = upcomingEvents(0)
      .filter((item) => !isCompleted(item.type, item.friend.id, item.id, item.date))
      .map((item) => ({
        ...item,
        title: `${item.title} for ${item.friend.name}`,
        detail: item.group === "recurring" ? "Recurring date to remember today." : "Meaningful date to follow up on today."
      }));
    return [...cadenceTasks, ...dateTasks].sort((a, b) => a.date - b.date || a.title.localeCompare(b.title));
  }

  function futureReachOutTasks(days = 30) {
    return reachOutTasks(days).filter((task) => task.days > 0);
  }

  function allTags() {
    return [...new Set(state.friends.flatMap((friend) => friend.tags || []))].sort((a, b) => a.localeCompare(b));
  }

  function activeTag() {
    const tags = allTags();
    return tags.includes(state.activeTag) ? state.activeTag : "";
  }

  function formatDate(date) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function relativeDay(date) {
    const diff = daysBetween(date, today());
    if (diff < 0) return `${Math.abs(diff)}d late`;
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff}d`;
  }

  function compactRelativeDay(date) {
    const diff = daysBetween(date, today());
    if (diff < 0) return `${Math.abs(diff)}d late`;
    if (diff === 0) return "Today";
    return `${diff}d`;
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function colorClass(name) {
    const classes = ["", "coral", "blue", "gold"];
    const sum = name.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
    return classes[sum % classes.length];
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function render() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <div class="brand">
            <h1>Kindred</h1>
            <p>${subtitle()}</p>
          </div>
          <button class="icon-button" type="button" data-action="open-friend" aria-label="Add friend">${icons.plus}</button>
        </header>
        <main class="main">
          ${renderToday()}
          ${renderPeople()}
          ${renderIdeas()}
          ${renderDates()}
        </main>
        ${renderTabs()}
        ${renderModal()}
        <div class="toast" id="toast"></div>
      </div>
    `;
    bindEvents();
  }

  function subtitle() {
    const due = reachOutTasks().filter((task) => task.days <= 0).length;
    const events = upcomingEvents(7).length;
    if (due && events) return `${due} reach-out${due > 1 ? "s" : ""} and ${events} date${events > 1 ? "s" : ""} this week`;
    if (due) return `${due} friend${due > 1 ? "s" : ""} due for a thoughtful note`;
    if (events) return `${events} important date${events > 1 ? "s" : ""} this week`;
    return "Stay close without carrying it all in your head";
  }

  function renderToday() {
    const actions = todayActions();
    const futureTasks = futureReachOutTasks(30);
    const weekEvents = upcomingEvents(7).filter((item) => !isCompleted(item.type, item.friend.id, item.id, item.date));
    return `
      <section class="view ${state.activeView === "today" ? "active" : ""}" data-view="today">
        <div class="today-strip">
          <div class="metric"><strong>${actions.length}</strong><span>actions today</span></div>
          <div class="metric"><strong>${weekEvents.length}</strong><span>dates this week</span></div>
          <div class="metric"><strong>${state.friends.length}</strong><span>people remembered</span></div>
        </div>
        <div class="section-head">
          <h2>Today</h2>
          <span>${new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
        </div>
        ${renderReminderControl()}
        <div class="task-list">
          ${actions.length ? actions.map(renderTodayAction).join("") : renderEmpty("Nothing due today.", "Future reach-outs and dates are still below.")}
        </div>
        <div class="section-head">
          <h2>Future Reach-Outs</h2>
          <span>next 30 days</span>
        </div>
        <div class="task-list">
          ${futureTasks.length ? futureTasks.map(renderFutureTask).join("") : renderEmpty("No upcoming cadence reminders.", "Daily and weekly rhythm will show up here.")}
        </div>
      </section>
    `;
  }

  function modalTitle(friend) {
    if (modalMode === "profile" && friend) return friend.name;
    if (modalMode === "friend" && friend) return "Edit Friend";
    if (modalMode === "friend") return "Add Friend";
    if (modalMode === "log-edit") return "Edit History";
    if (modalMode === "log") return "Log Contact";
    return "Kindred";
  }

  function renderReminderControl() {
    if (!("Notification" in window)) return "";
    if (Notification.permission === "granted") {
      return `
        <div class="reminder-panel">
          <div class="field"><label>Daily notification time</label><input id="notification-time" type="time" value="${escapeHtml(state.notificationTime)}" /></div>
          <button class="secondary-action reminder-action" data-action="send-reminder-check" type="button">Check Reminders</button>
        </div>
      `;
    }
    if (Notification.permission === "denied") return "";
    return '<button class="secondary-action reminder-action" data-action="enable-reminders" type="button">Enable Reminders</button>';
  }

  function renderTask(task) {
    const friend = task.friend;
    const prompt = bestPrompt(friend);
    return `
      <article class="task">
        <div class="task-date">${relativeDay(task.date)}</div>
        <div>
          <h3>${escapeHtml(friend.name)}</h3>
          <p>${escapeHtml(prompt)}</p>
          ${renderPills([...(friend.tags || []), ...(friend.interests || [])])}
        </div>
        <div class="task-actions">
          <button class="tool-button done" data-action="quick-log" data-id="${friend.id}" aria-label="Mark contacted">${icons.check}</button>
          <button class="tool-button" data-action="select-friend" data-id="${friend.id}" aria-label="Open profile">${icons.profile}</button>
        </div>
      </article>
    `;
  }

  function renderTodayAction(action) {
    if (action.type === "cadence") return renderTask({ friend: action.friend, date: action.date, days: action.days });
    return `
      <article class="task">
        <div class="task-date">${relativeDay(action.date)}</div>
        <div>
          <h3>${escapeHtml(action.title)}</h3>
          <p>${escapeHtml(action.detail)}</p>
          <div class="pill-row"><span class="pill">${action.group === "recurring" ? "Recurring" : action.group === "follow-up" ? "Follow-up" : "Meaningful"}</span></div>
        </div>
        <div class="task-actions">
          <button class="tool-button done" data-action="complete-date" data-id="${action.friend.id}" data-event-id="${action.id}" data-date-type="${action.type}" data-date="${iso(action.date)}" aria-label="Mark done">${icons.check}</button>
          <button class="tool-button" data-action="select-friend" data-id="${action.friend.id}" aria-label="Open profile">${icons.profile}</button>
        </div>
      </article>
    `;
  }

  function renderFutureTask(task) {
    const friend = task.friend;
    return `
      <article class="task">
        <div class="task-date">${compactRelativeDay(task.date)}</div>
        <div>
          <h3>${escapeHtml(friend.name)}</h3>
          <p>${escapeHtml(cadence(friend)[1])} - next reach-out ${formatDate(task.date)}</p>
          ${renderPills([...(friend.tags || []).slice(0, 2), ...(friend.interests || []).slice(0, 2)])}
        </div>
        <div class="task-actions">
          <button class="tool-button" data-action="select-friend" data-id="${friend.id}" aria-label="Open profile">${icons.profile}</button>
        </div>
      </article>
    `;
  }

  function renderPeople() {
    const tags = allTags();
    const selectedTag = activeTag();
    const sorted = [...state.friends]
      .filter((friend) => !selectedTag || (friend.tags || []).includes(selectedTag))
      .sort((a, b) => dueDate(a) - dueDate(b));
    return `
      <section class="view ${state.activeView === "people" ? "active" : ""}" data-view="people">
        <div class="search-row">
          <input id="people-search" type="search" placeholder="Search people, tags, notes" autocomplete="off" />
          ${tags.length ? `<select id="tag-filter" aria-label="Filter by tag"><option value="">All tags</option>${tags.map((tag) => `<option value="${escapeHtml(tag)}" ${selectedTag === tag ? "selected" : ""}>${escapeHtml(tag)}</option>`).join("")}</select>` : ""}
        </div>
        <div class="people-list" id="people-list">
          ${sorted.length ? sorted.map(renderPersonCard).join("") : renderEmpty("No people match this filter.", "Clear search or choose all tags.")}
        </div>
      </section>
    `;
  }

  function renderPersonCard(friend) {
    return `
      <article class="person-card" data-search="${escapeHtml(searchBlob(friend))}">
        <div class="avatar ${colorClass(friend.name)}">${escapeHtml(initials(friend.name))}</div>
        <div>
          <h3>${escapeHtml(friend.name)}</h3>
          <p>${cadence(friend)[1]} - next ${formatDate(dueDate(friend))}</p>
          ${renderPills([...(friend.tags || []).slice(0, 2), ...(friend.interests || []).slice(0, 2)])}
        </div>
        <div class="card-actions">
          <button class="tool-button" data-action="select-friend" data-id="${friend.id}" aria-label="Open profile">${icons.profile}</button>
          <button class="tool-button danger" data-action="delete-friend" data-id="${friend.id}" aria-label="Delete ${escapeHtml(friend.name)}">${icons.trash}</button>
        </div>
      </article>
    `;
  }

  function renderIdeas() {
    const ideas = state.friends.flatMap((friend) =>
      buildIdeas(friend)
        .filter((idea) => !state.hiddenIdeas.includes(ideaKey(friend, idea)))
        .slice(0, 2)
        .map((idea) => ({ friend, idea }))
    );
    return `
      <section class="view ${state.activeView === "ideas" ? "active" : ""}" data-view="ideas">
        <div class="section-head">
          <h2>Outreach Ideas</h2>
          <span>based on your notes</span>
        </div>
        <div class="idea-list">
          ${ideas.length ? ideas.map(({ friend, idea }) => renderIdea(friend, idea)).join("") : renderEmpty("Ideas will appear here.", "Add interests, notes, and upcoming moments.")}
        </div>
      </section>
    `;
  }

  function renderIdea(friend, idea) {
    return `
      <article class="idea">
        <h3>${escapeHtml(friend.name)}</h3>
        <p>${escapeHtml(idea)}</p>
        <div class="pill-row">
          <button class="tiny-action" data-action="copy-idea" data-text="${escapeHtml(idea)}">Copy</button>
          <button class="tiny-action" data-action="select-friend" data-id="${friend.id}">Profile</button>
          <button class="tiny-action danger" data-action="delete-idea" data-id="${friend.id}" data-idea="${escapeHtml(idea)}" aria-label="Delete idea for ${escapeHtml(friend.name)}">${icons.trash}</button>
        </div>
      </article>
    `;
  }

  function renderDates() {
    const events = upcomingEvents(365);
    const meaningful = events.filter((item) => item.group !== "recurring");
    const recurring = events.filter((item) => item.group === "recurring");
    return `
      <section class="view ${state.activeView === "dates" ? "active" : ""}" data-view="dates">
        <div class="section-head compact-head">
          <h2>Meaningful Dates</h2>
          <span>one-time moments</span>
        </div>
        <div class="event-list">
          ${meaningful.length ? meaningful.map(renderEventCard).join("") : renderEmpty("No meaningful dates yet.", "Job interviews, trips, and follow-ups will live here.")}
        </div>
        <div class="section-head compact-head">
          <h2>Recurring Dates</h2>
          <span>annual reminders</span>
        </div>
        <div class="event-list">
          ${recurring.length ? recurring.map(renderEventCard).join("") : renderEmpty("No recurring dates yet.", "Birthdays, anniversaries, and family milestones can go here.")}
        </div>
      </section>
    `;
  }

  function renderEventCard(item) {
    return `
      <article class="event-card">
        <div>
          <h3>${escapeHtml(item.title)} - ${escapeHtml(item.friend.name)}</h3>
          <p>${formatDate(item.date)} - ${relativeDay(item.date)}</p>
          <div class="pill-row"><span class="pill">${item.group === "recurring" ? "Recurring" : item.group === "follow-up" ? "Follow-up" : "Meaningful"}</span></div>
        </div>
        <button class="tool-button danger" data-action="delete-date" data-id="${item.friend.id}" data-event-id="${item.type === "event" ? item.id : ""}" data-date-type="${item.type}" aria-label="Delete ${escapeHtml(item.title)} for ${escapeHtml(item.friend.name)}">${icons.trash}</button>
      </article>
    `;
  }

  function renderTabs() {
    const tabs = [
      ["today", "Today", icons.home],
      ["people", "People", icons.people],
      ["ideas", "Ideas", icons.spark],
      ["dates", "Dates", icons.calendar]
    ];
    return `<nav class="tabbar">${tabs
      .map(([key, label, icon]) => `<button class="tab ${state.activeView === key ? "active" : ""}" data-action="view" data-view-name="${key}">${icon}<span>${label}</span></button>`)
      .join("")}</nav>`;
  }

  function renderModal() {
    if (!modalMode) return '<div class="modal-backdrop" id="modal"></div>';
    const friend = state.friends.find((item) => item.id === state.selectedFriendId);
    return `
      <div class="modal-backdrop open" id="modal">
        <div class="modal">
          <div class="modal-title">
            <h2>${escapeHtml(modalTitle(friend))}</h2>
            <button class="tool-button" data-action="close-modal" aria-label="Close">${icons.close}</button>
          </div>
          ${modalMode === "profile" && friend ? renderProfile(friend) : ""}
          ${modalMode === "friend" ? renderFriendForm(friend) : ""}
          ${(modalMode === "log" || modalMode === "log-edit") && friend ? renderLogForm(friend) : ""}
        </div>
      </div>
    `;
  }

  function renderProfile(friend) {
    return `
      <section class="profile-panel">
        <div class="profile-hero">
          <div class="avatar">${escapeHtml(initials(friend.name))}</div>
          <h2>${escapeHtml(friend.name)}</h2>
          <p>${cadence(friend)[1]} - next reach-out ${formatDate(dueDate(friend))}</p>
        </div>
        <div class="profile-body">
          <div class="profile-grid">
            <div class="fact"><span>Birthday</span><strong>${friend.birthday ? formatDate(nextAnnualDate(friend.birthday.slice(5))) : "Not set"}</strong></div>
            <div class="fact"><span>Last contact</span><strong>${friend.lastContact ? formatDate(parseDate(friend.lastContact)) : "Not logged"}</strong></div>
          </div>
          ${renderPills([...(friend.tags || []), ...(friend.interests || [])])}
          ${renderAssociates(friend)}
          <div class="section-head"><h2>Notes</h2></div>
          <p>${escapeHtml(friend.notes || "No notes yet.")}</p>
          <div class="section-head"><h2>Ideas</h2></div>
          <div class="idea-list">${buildIdeas(friend)
            .filter((idea) => !state.hiddenIdeas.includes(ideaKey(friend, idea)))
            .map(
              (idea) => `
                <div class="idea">
                  <p>${escapeHtml(idea)}</p>
                  <div class="pill-row">
                    <button class="tiny-action danger" data-action="delete-idea" data-id="${friend.id}" data-idea="${escapeHtml(idea)}" aria-label="Delete idea for ${escapeHtml(friend.name)}">${icons.trash}</button>
                  </div>
                </div>`
            )
            .join("")}</div>
          <div class="section-head"><h2>History</h2></div>
          <div class="log-list">${(friend.logs || []).length ? friend.logs.map(renderLog).join("") : renderEmpty("No contact logged.", "After you reach out, jot down what mattered.")}</div>
          <div class="pill-row">
            <button class="primary-action" data-action="open-log" data-id="${friend.id}">${icons.check}Log Contact</button>
            <button class="secondary-action" data-action="edit-friend" data-id="${friend.id}">Edit</button>
            <button class="tiny-action danger" data-action="delete-friend" data-id="${friend.id}" aria-label="Delete ${escapeHtml(friend.name)}">${icons.trash}</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderAssociates(friend) {
    const associates = friend.associates || [];
    if (!associates.length) return "";
    const labels = { partner: "Partner", family: "Family", pet: "Pets" };
    return `
      <div class="section-head"><h2>People & Pets</h2></div>
      <div class="fact-list">
        ${["partner", "family", "pet"]
          .map((type) => {
            const names = associates.filter((item) => item.type === type).map((item) => item.name);
            if (!names.length) return "";
            return `<div class="fact"><span>${labels[type]}</span><strong>${escapeHtml(names.join(", "))}</strong></div>`;
          })
          .join("")}
      </div>
    `;
  }

  function renderLog(log) {
    return `
      <article class="log-card">
        <div>
          <h3>${formatDate(parseDate(log.date))}</h3>
          <p>${escapeHtml(log.note)}</p>
        </div>
        <div class="card-actions horizontal">
          <button class="tool-button" data-action="edit-log" data-log-id="${log.id}" aria-label="Edit history item">${icons.edit}</button>
          <button class="tool-button danger" data-action="delete-log" data-log-id="${log.id}" aria-label="Delete history item">${icons.trash}</button>
        </div>
      </article>
    `;
  }

  function associateNames(friend, type) {
    return (friend?.associates || []).filter((item) => item.type === type).map((item) => item.name).join(", ");
  }

  function renderFriendForm(friend) {
    return `
      <form class="form" id="friend-form">
        <input type="hidden" name="id" value="${friend ? friend.id : ""}" />
        <div class="field"><label>Name</label><input name="name" required value="${escapeHtml(friend?.name || "")}" /></div>
        <div class="split">
          <div class="field"><label>Cadence</label><select name="cadence">${cadenceOptions.map(([key, label]) => `<option value="${key}" ${friend?.cadence === key ? "selected" : ""}>${label}</option>`).join("")}</select></div>
          <div class="field"><label>Birthday</label><input name="birthday" type="date" value="${escapeHtml(friend?.birthday || "")}" /></div>
        </div>
        <div class="field"><label>Last Contact</label><input name="lastContact" type="date" value="${escapeHtml(friend?.lastContact || iso(today()))}" /></div>
        <div class="field"><label>Tags</label><input name="tags" placeholder="business school, childhood friend" value="${escapeHtml((friend?.tags || []).join(", "))}" /></div>
        <div class="field"><label>Interests</label><input name="interests" placeholder="gardening, jazz, Arsenal" value="${escapeHtml((friend?.interests || []).join(", "))}" /></div>
        <div class="form-section">
          <div class="section-head compact-head"><h2>People & Pets</h2><span>optional</span></div>
          <div class="field"><label>Partner</label><input name="partnerNames" placeholder="Alex" value="${escapeHtml(associateNames(friend, "partner"))}" /></div>
          <div class="field"><label>Family</label><input name="familyNames" placeholder="Mom: Linda, kid: Theo" value="${escapeHtml(associateNames(friend, "family"))}" /></div>
          <div class="field"><label>Pets</label><input name="petNames" placeholder="Miso, Scout" value="${escapeHtml(associateNames(friend, "pet"))}" /></div>
        </div>
        <div class="field"><label>Notes</label><textarea name="notes" placeholder="What do they care about? What should future-you remember?">${escapeHtml(friend?.notes || "")}</textarea></div>
        <div class="form-section">
          <div class="section-head compact-head"><h2>Add Important Date</h2><span>optional</span></div>
          <div class="field"><label>Title</label><input name="eventTitle" placeholder="Job interview, anniversary, kid's birthday" /></div>
          <div class="field"><label>Type</label><select name="eventKind"><option value="meaningful">Meaningful date</option><option value="recurring">Recurring yearly date</option></select></div>
          <div class="field"><label>Date</label><input name="eventDate" type="date" /></div>
        </div>
        <button class="primary-action" type="submit">${friend ? "Save Friend" : "Add Friend"}</button>
      </form>
    `;
  }

  function renderLogForm(friend) {
    const editingLog = modalMode === "log-edit" ? (friend.logs || []).find((log) => log.id === editingLogId) : null;
    return `
      <form class="form" id="log-form">
        <input type="hidden" name="id" value="${friend.id}" />
        <input type="hidden" name="logId" value="${editingLog?.id || ""}" />
        <div class="field"><label>Date</label><input name="date" type="date" value="${escapeHtml(editingLog?.date || iso(today()))}" /></div>
        <div class="field"><label>What mattered?</label><textarea name="note" required placeholder="Talked about the interview, their mom's visit, a new book, or anything worth remembering.">${escapeHtml(editingLog?.note || "")}</textarea></div>
        ${editingLog ? "" : `
        <div class="split">
          <div class="field"><label>Follow-up</label><input name="eventTitle" placeholder="Ask how it went" /></div>
          <div class="field">
            <label>When</label>
            <select name="followUpDelay">
              <option value="">No follow-up</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="1w">1 week from now</option>
              <option value="2w">2 weeks from now</option>
              <option value="1m">1 month from now</option>
            </select>
          </div>
        </div>
        `}
        <button class="primary-action" type="submit">${editingLog ? "Save History" : "Save Contact"}</button>
      </form>
    `;
  }

  function renderPills(items) {
    if (!items || !items.length) return "";
    return `<div class="pill-row">${items.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  function renderEmpty(title, detail) {
    return `<div class="empty">${icons.empty}<div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></div></div>`;
  }

  function searchBlob(friend) {
    return [
      friend.name,
      friend.notes,
      friend.contact,
      ...(friend.tags || []),
      ...(friend.interests || []),
      ...(friend.associates || []).map((item) => item.name)
    ]
      .join(" ")
      .toLowerCase();
  }

  function bestPrompt(friend) {
    const ideas = buildIdeas(friend).filter((idea) => !state.hiddenIdeas.includes(ideaKey(friend, idea)));
    return ideas[0] || `Send ${friend.name.split(" ")[0]} a short note and ask what has been taking up their attention lately.`;
  }

  function ideaKey(friend, idea) {
    return `${friend.id}:${idea}`;
  }

  function buildIdeas(friend) {
    const first = friend.name.split(" ")[0];
    const ideas = [];
    const soon = (friend.events || [])
      .map((event) => ({ event, date: eventDueDate(event) }))
      .filter((item) => item.date)
      .sort((a, b) => Math.abs(daysBetween(a.date, today())) - Math.abs(daysBetween(b.date, today())))[0];
    if (soon) {
      const diff = daysBetween(soon.date, today());
      if (diff < 0) ideas.push(`Ask ${first} how ${soon.event.title.toLowerCase()} went, and leave room for the real answer.`);
      else if (diff <= 7) ideas.push(`Wish ${first} well for ${soon.event.title.toLowerCase()} coming up ${relativeDay(soon.date).toLowerCase()}.`);
    }
    if (friend.notes) {
      const sentence = friend.notes.split(/[.!?]/).find((part) => part.trim().length > 18);
      if (sentence) ideas.push(`Follow up on this: ${sentence.trim()}.`);
    }
    (friend.associates || []).slice(0, 2).forEach((associate) => {
      ideas.push(`Ask ${first} how ${associate.name} is doing.`);
    });
    (friend.interests || []).slice(0, 3).forEach((interest) => {
      ideas.push(`Send something small about ${interest} and ask what ${first} has been enjoying lately.`);
    });
    ideas.push(`Send a no-pressure note: "Thought of you today. How has your week been?"`);
    return [...new Set(ideas)].slice(0, 5);
  }

  function bindEvents() {
    document.querySelectorAll("[data-action]").forEach((element) => {
      element.addEventListener("click", handleAction);
    });
    document.querySelector("#friend-form")?.addEventListener("submit", saveFriend);
    document.querySelector("#log-form")?.addEventListener("submit", saveLog);
    document.querySelector("#people-search")?.addEventListener("input", filterPeople);
    document.querySelector("#tag-filter")?.addEventListener("change", filterByTag);
    document.querySelector("#notification-time")?.addEventListener("change", saveNotificationTime);
    document.querySelector("#modal")?.addEventListener("click", (event) => {
      if (event.target.id === "modal") closeModal();
    });
  }

  function handleAction(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    if (action === "view") {
      state.activeView = button.dataset.viewName;
      saveState();
      render();
    }
    if (action === "open-friend") {
      state.selectedFriendId = null;
      modalMode = "friend";
      render();
    }
    if (action === "select-friend") {
      state.selectedFriendId = button.dataset.id;
      modalMode = "profile";
      render();
    }
    if (action === "edit-friend") {
      state.selectedFriendId = button.dataset.id;
      modalMode = "friend";
      render();
    }
    if (action === "open-log") {
      state.selectedFriendId = button.dataset.id;
      editingLogId = null;
      modalMode = "log";
      render();
    }
    if (action === "quick-log") {
      quickLog(button.dataset.id);
    }
    if (action === "close-modal") closeModal();
    if (action === "copy-idea") copyIdea(button.dataset.text);
    if (action === "complete-date") completeDate(button.dataset.id, button.dataset.eventId, button.dataset.dateType, button.dataset.date);
    if (action === "delete-friend") deleteFriend(button.dataset.id);
    if (action === "delete-idea") deleteIdea(button.dataset.id, button.dataset.idea);
    if (action === "delete-date") deleteDate(button.dataset.id, button.dataset.eventId, button.dataset.dateType);
    if (action === "edit-log") editLog(button.dataset.logId);
    if (action === "delete-log") deleteLog(button.dataset.logId);
    if (action === "enable-reminders") enableReminders();
    if (action === "send-reminder-check") notifyDueItems();
  }

  function saveFriend(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const interests = parseList(data.interests);
    const tags = parseList(data.tags);
    const associates = [
      ...parseList(data.partnerNames).map((name) => ({ id: uid(), type: "partner", name })),
      ...parseList(data.familyNames).map((name) => ({ id: uid(), type: "family", name })),
      ...parseList(data.petNames).map((name) => ({ id: uid(), type: "pet", name }))
    ];
    const existing = state.friends.find((friend) => friend.id === data.id);
    const events = existing?.events ? [...existing.events] : [];
    if (data.eventTitle && data.eventDate) {
      events.push({
        id: uid(),
        title: data.eventTitle.trim(),
        date: data.eventDate,
        repeat: data.eventKind === "recurring" ? "yearly" : "none",
        kind: data.eventKind
      });
    }
    const friend = {
      id: existing?.id || uid(),
      name: data.name.trim(),
      cadence: data.cadence,
      birthday: data.birthday,
      lastContact: data.lastContact,
      contact: existing?.contact || "",
      tags,
      associates,
      interests,
      notes: data.notes.trim(),
      events,
      logs: existing?.logs || []
    };
    if (existing) state.friends = state.friends.map((item) => (item.id === existing.id ? friend : item));
    else state.friends.push(friend);
    state.selectedFriendId = friend.id;
    modalMode = "profile";
    saveState();
    render();
    showToast("Friend saved");
  }

  function saveLog(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const friend = state.friends.find((item) => item.id === data.id);
    if (!friend) return;
    if (data.logId) {
      friend.logs = (friend.logs || []).map((log) => (log.id === data.logId ? { ...log, date: data.date, note: data.note.trim() } : log));
      editingLogId = null;
      modalMode = "profile";
      saveState();
      render();
      showToast("History updated");
      return;
    }
    friend.lastContact = data.date;
    friend.logs = [{ id: uid(), date: data.date, note: data.note.trim() }, ...(friend.logs || [])];
    if (data.eventTitle && data.followUpDelay) {
      friend.events = [
        ...(friend.events || []),
        { id: uid(), title: data.eventTitle.trim(), date: addRelativeDate(data.date, data.followUpDelay), repeat: "none", kind: "follow-up" }
      ];
    }
    modalMode = "profile";
    saveState();
    render();
    showToast("Contact logged");
  }

  function quickLog(id) {
    const friend = state.friends.find((item) => item.id === id);
    if (!friend) return;
    friend.lastContact = iso(today());
    friend.logs = [{ id: uid(), date: iso(today()), note: "Reached out." }, ...(friend.logs || [])];
    saveState();
    render();
    showToast(`${friend.name} moved forward`);
  }

  function deleteFriend(id) {
    const friend = state.friends.find((item) => item.id === id);
    if (!friend || !confirm(`Delete ${friend.name}?`)) return;
    state.friends = state.friends.filter((item) => item.id !== id);
    state.hiddenIdeas = state.hiddenIdeas.filter((key) => !key.startsWith(`${id}:`));
    state.selectedFriendId = null;
    saveState();
    closeModal();
    showToast("Friend deleted");
  }

  function deleteIdea(id, idea) {
    const friend = state.friends.find((item) => item.id === id);
    if (!friend || !idea) return;
    const key = ideaKey(friend, idea);
    if (!state.hiddenIdeas.includes(key)) state.hiddenIdeas.push(key);
    saveState();
    render();
    showToast("Idea removed");
  }

  function deleteDate(id, eventId, type) {
    const friend = state.friends.find((item) => item.id === id);
    if (!friend) return;
    if (type === "birthday") {
      if (!confirm(`Delete ${friend.name}'s birthday?`)) return;
      friend.birthday = "";
    } else {
      const event = (friend.events || []).find((item) => item.id === eventId);
      if (!event || !confirm(`Delete ${event.title}?`)) return;
      friend.events = (friend.events || []).filter((item) => item.id !== eventId);
    }
    saveState();
    render();
    showToast("Date deleted");
  }

  function completeDate(id, eventId, type, dateValue) {
    const friend = state.friends.find((item) => item.id === id);
    const date = parseDate(dateValue);
    if (!friend || !date) return;
    completeItem(type, friend.id, eventId, date);
    saveState();
    render();
    showToast("Marked done");
  }

  function editLog(logId) {
    const friend = state.friends.find((item) => (item.logs || []).some((log) => log.id === logId));
    if (!friend) return;
    state.selectedFriendId = friend.id;
    editingLogId = logId;
    modalMode = "log-edit";
    render();
  }

  function deleteLog(logId) {
    const friend = state.friends.find((item) => (item.logs || []).some((log) => log.id === logId));
    if (!friend || !confirm("Delete this history item?")) return;
    friend.logs = (friend.logs || []).filter((log) => log.id !== logId);
    saveState();
    render();
    showToast("History deleted");
  }

  function filterPeople(event) {
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll(".person-card").forEach((card) => {
      card.style.display = card.dataset.search.includes(query) ? "grid" : "none";
    });
  }

  function filterByTag(event) {
    state.activeTag = event.target.value;
    saveState();
    render();
  }

  function saveNotificationTime(event) {
    state.notificationTime = event.target.value || "09:00";
    saveState();
    scheduleDailyNotification();
    showToast("Notification time saved");
  }

  async function copyIdea(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Idea copied");
    } catch (error) {
      showToast(text);
    }
  }

  async function enableReminders() {
    const permission = await Notification.requestPermission();
    render();
    if (permission === "granted") {
      scheduleDailyNotification();
      notifyDueItems();
      showToast("Reminders enabled");
    }
  }

  function notificationMessages() {
    const cadenceDue = reachOutTasks(0);
    const eventsDue = upcomingEvents(0).filter((item) => !isCompleted(item.type, item.friend.id, item.id, item.date));
    const followUps = eventsDue.filter((item) => item.group === "follow-up");
    const dates = eventsDue.filter((item) => item.group !== "follow-up");
    const messages = [];
    cadenceDue.forEach((task) => messages.push(`Reach out to ${task.friend.name}: cadence is due.`));
    followUps.forEach((item) => messages.push(`Follow up with ${item.friend.name}: ${item.title}.`));
    dates.forEach((item) => messages.push(`Remember ${item.title} for ${item.friend.name} today.`));
    return messages;
  }

  function notifyDueItems() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const messages = notificationMessages();
    if (!messages.length) {
      new Notification("Kindred", { body: "No friendship reminders due today." });
      return;
    }
    new Notification("Kindred", { body: messages.slice(0, 4).join(" ") });
  }

  function scheduleDailyNotification() {
    if (notificationTimer) window.clearTimeout(notificationTimer);
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const [hours, minutes] = (state.notificationTime || "09:00").split(":").map(Number);
    const next = new Date();
    next.setHours(hours || 9, minutes || 0, 0, 0);
    if (next <= new Date()) next.setDate(next.getDate() + 1);
    notificationTimer = window.setTimeout(() => {
      notifyDueItems();
      scheduleDailyNotification();
    }, next.getTime() - Date.now());
  }

  function closeModal() {
    modalMode = null;
    editingLogId = null;
    render();
  }

  function showToast(message) {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalMode) closeModal();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  loadState().then((savedState) => {
    state = savedState;
    scheduleDailyNotification();
    render();
  });
})();
