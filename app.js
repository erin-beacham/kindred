(function () {
  const STORAGE_KEY = "kindred.v1";
  const cadenceOptions = [
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
    close: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    empty: '<svg viewBox="0 0 24 24"><path d="M20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5Z"/><path d="m8 10 3 3 5-5"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/></svg>'
  };

  const sampleState = {
    activeView: "today",
    selectedFriendId: null,
    friends: [
      {
        id: uid(),
        name: "Maya Chen",
        cadence: "2w",
        birthday: "1993-09-12",
        lastContact: daysAgo(16),
        contact: "maya@example.com",
        interests: ["ceramics", "urban gardens", "women's soccer"],
        notes: "Maya likes short voice notes. She is considering a balcony herb garden.",
        events: [{ id: uid(), title: "Portfolio review", date: addDays(3), repeat: "none" }],
        logs: [{ id: uid(), date: daysAgo(16), note: "Talked about her new ceramics class and a portfolio review coming up." }]
      },
      {
        id: uid(),
        name: "Jordan Patel",
        cadence: "1w",
        birthday: "1989-02-04",
        lastContact: daysAgo(8),
        contact: "555-0142",
        interests: ["climate tech", "running", "science fiction"],
        notes: "Training for a half marathon. Ask about knee recovery.",
        events: [{ id: uid(), title: "Half marathon", date: addDays(22), repeat: "none" }],
        logs: [{ id: uid(), date: daysAgo(8), note: "Jordan was nervous about increasing mileage after a sore knee." }]
      },
      {
        id: uid(),
        name: "Priya Rao",
        cadence: "4w",
        birthday: "1991-05-18",
        lastContact: daysAgo(21),
        contact: "",
        interests: ["indie movies", "baking", "public radio"],
        notes: "Prefers weekend catchups. Anniversary with Sam is in October.",
        events: [{ id: uid(), title: "Anniversary with Sam", date: "2026-10-03", repeat: "yearly" }],
        logs: [{ id: uid(), date: daysAgo(21), note: "She was testing sourdough recipes and looking for a quiet movie night pick." }]
      }
    ]
  };

  let state = loadState();
  let modalMode = null;

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

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.friends)) return saved;
    } catch (error) {
      console.warn(error);
    }
    return sampleState;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    if (event.repeat !== "yearly") return raw;
    return nextAnnualDate(event.date.slice(5));
  }

  function upcomingEvents(days = 30) {
    const now = today();
    const items = [];
    state.friends.forEach((friend) => {
      if (friend.birthday) {
        const date = nextAnnualDate(friend.birthday.slice(5));
        if (daysBetween(date, now) <= days) {
          items.push({ id: friend.id + "-birthday", friend, title: "Birthday", date, type: "birthday" });
        }
      }
      (friend.events || []).forEach((event) => {
        const date = eventDueDate(event);
        if (date && daysBetween(date, now) >= 0 && daysBetween(date, now) <= days) {
          items.push({ id: event.id, friend, title: event.title, date, type: "event" });
        }
      });
    });
    return items.sort((a, b) => a.date - b.date);
  }

  function reachOutTasks() {
    const now = today();
    return state.friends
      .map((friend) => ({ friend, date: dueDate(friend), days: daysBetween(dueDate(friend), now) }))
      .filter((task) => task.days <= 7)
      .sort((a, b) => a.date - b.date);
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
    const tasks = reachOutTasks();
    const dueNow = tasks.filter((task) => task.days <= 0).length;
    const events = upcomingEvents(7);
    return `
      <section class="view ${state.activeView === "today" ? "active" : ""}" data-view="today">
        <div class="today-strip">
          <div class="metric"><strong>${dueNow}</strong><span>due today</span></div>
          <div class="metric"><strong>${events.length}</strong><span>dates this week</span></div>
          <div class="metric"><strong>${state.friends.length}</strong><span>people remembered</span></div>
        </div>
        <div class="section-head">
          <h2>Today</h2>
          <span>${new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
        </div>
        ${renderReminderControl()}
        <div class="task-list">
          ${tasks.length ? tasks.map(renderTask).join("") : renderEmpty("No one is due right now.", "The quiet days count too.")}
        </div>
        <div class="section-head">
          <h2>Soon</h2>
          <span>next 7 days</span>
        </div>
        <div class="event-list">
          ${events.length ? events.map(renderEventCard).join("") : renderEmpty("No dates this week.", "Birthdays and special events will show up here.")}
        </div>
      </section>
    `;
  }

  function modalTitle(friend) {
    if (modalMode === "profile" && friend) return friend.name;
    if (modalMode === "friend" && friend) return "Edit Friend";
    if (modalMode === "friend") return "Add Friend";
    if (modalMode === "log") return "Log Contact";
    return "Kindred";
  }

  function renderReminderControl() {
    if (!("Notification" in window)) return "";
    if (Notification.permission === "granted") {
      return '<button class="secondary-action reminder-action" data-action="send-reminder-check" type="button">Check Reminders</button>';
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
          ${renderPills(friend.interests)}
        </div>
        <div class="task-actions">
          <button class="tool-button done" data-action="quick-log" data-id="${friend.id}" aria-label="Mark contacted">${icons.check}</button>
          <button class="tool-button" data-action="select-friend" data-id="${friend.id}" aria-label="Open profile">${icons.message}</button>
        </div>
      </article>
    `;
  }

  function renderPeople() {
    const sorted = [...state.friends].sort((a, b) => dueDate(a) - dueDate(b));
    return `
      <section class="view ${state.activeView === "people" ? "active" : ""}" data-view="people">
        <div class="search-row">
          <input id="people-search" type="search" placeholder="Search people, interests, notes" autocomplete="off" />
        </div>
        <div class="people-list" id="people-list">
          ${sorted.length ? sorted.map(renderPersonCard).join("") : renderEmpty("Add your first friend.", "Set a cadence and Kindred will keep watch.")}
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
          ${renderPills(friend.interests.slice(0, 3))}
        </div>
        <button class="tool-button" data-action="select-friend" data-id="${friend.id}" aria-label="Open profile">${icons.message}</button>
      </article>
    `;
  }

  function renderIdeas() {
    const ideas = state.friends.flatMap((friend) => buildIdeas(friend).slice(0, 2).map((idea) => ({ friend, idea })));
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
        </div>
      </article>
    `;
  }

  function renderDates() {
    const events = upcomingEvents(365);
    return `
      <section class="view ${state.activeView === "dates" ? "active" : ""}" data-view="dates">
        <div class="section-head">
          <h2>Important Dates</h2>
          <span>next 12 months</span>
        </div>
        <div class="event-list">
          ${events.length ? events.map(renderEventCard).join("") : renderEmpty("No dates yet.", "Birthdays, anniversaries, and big moments will live here.")}
        </div>
      </section>
    `;
  }

  function renderEventCard(item) {
    return `
      <article class="event-card">
        <h3>${escapeHtml(item.title)} - ${escapeHtml(item.friend.name)}</h3>
        <p>${formatDate(item.date)} - ${relativeDay(item.date)}</p>
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
          ${modalMode === "log" && friend ? renderLogForm(friend) : ""}
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
          ${renderPills(friend.interests)}
          <div class="section-head"><h2>Notes</h2></div>
          <p>${escapeHtml(friend.notes || "No notes yet.")}</p>
          <div class="section-head"><h2>Ideas</h2></div>
          <div class="idea-list">${buildIdeas(friend).map((idea) => `<div class="idea"><p>${escapeHtml(idea)}</p></div>`).join("")}</div>
          <div class="section-head"><h2>History</h2></div>
          <div class="log-list">${(friend.logs || []).length ? friend.logs.map(renderLog).join("") : renderEmpty("No contact logged.", "After you reach out, jot down what mattered.")}</div>
          <div class="pill-row">
            <button class="primary-action" data-action="open-log" data-id="${friend.id}">${icons.check}Log Contact</button>
            <button class="secondary-action" data-action="edit-friend" data-id="${friend.id}">Edit</button>
            <button class="tiny-action" data-action="delete-friend" data-id="${friend.id}">${icons.trash}</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderLog(log) {
    return `<article class="log-card"><h3>${formatDate(parseDate(log.date))}</h3><p>${escapeHtml(log.note)}</p></article>`;
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
        <div class="split">
          <div class="field"><label>Last Contact</label><input name="lastContact" type="date" value="${escapeHtml(friend?.lastContact || iso(today()))}" /></div>
          <div class="field"><label>Contact</label><input name="contact" value="${escapeHtml(friend?.contact || "")}" /></div>
        </div>
        <div class="field"><label>Interests</label><input name="interests" placeholder="gardening, jazz, Arsenal" value="${escapeHtml((friend?.interests || []).join(", "))}" /></div>
        <div class="field"><label>Notes</label><textarea name="notes" placeholder="What do they care about? What should future-you remember?">${escapeHtml(friend?.notes || "")}</textarea></div>
        <div class="split">
          <div class="field"><label>Special Event</label><input name="eventTitle" placeholder="Job interview" /></div>
          <div class="field"><label>Date</label><input name="eventDate" type="date" /></div>
        </div>
        <button class="primary-action" type="submit">${friend ? "Save Friend" : "Add Friend"}</button>
      </form>
    `;
  }

  function renderLogForm(friend) {
    return `
      <form class="form" id="log-form">
        <input type="hidden" name="id" value="${friend.id}" />
        <div class="field"><label>Date</label><input name="date" type="date" value="${iso(today())}" /></div>
        <div class="field"><label>What mattered?</label><textarea name="note" required placeholder="Talked about the interview, their mom's visit, a new book, or anything worth remembering."></textarea></div>
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
        <button class="primary-action" type="submit">Save Contact</button>
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
    return [friend.name, friend.notes, friend.contact, ...(friend.interests || [])].join(" ").toLowerCase();
  }

  function bestPrompt(friend) {
    const ideas = buildIdeas(friend);
    return ideas[0] || `Send ${friend.name.split(" ")[0]} a short note and ask what has been taking up their attention lately.`;
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
      modalMode = "log";
      render();
    }
    if (action === "quick-log") {
      quickLog(button.dataset.id);
    }
    if (action === "close-modal") closeModal();
    if (action === "copy-idea") copyIdea(button.dataset.text);
    if (action === "delete-friend") deleteFriend(button.dataset.id);
    if (action === "enable-reminders") enableReminders();
    if (action === "send-reminder-check") notifyDueItems();
  }

  function saveFriend(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const interests = data.interests.split(",").map((item) => item.trim()).filter(Boolean);
    const existing = state.friends.find((friend) => friend.id === data.id);
    const events = existing?.events ? [...existing.events] : [];
    if (data.eventTitle && data.eventDate) {
      events.push({ id: uid(), title: data.eventTitle, date: data.eventDate, repeat: "none" });
    }
    const friend = {
      id: existing?.id || uid(),
      name: data.name.trim(),
      cadence: data.cadence,
      birthday: data.birthday,
      lastContact: data.lastContact,
      contact: data.contact.trim(),
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
    friend.lastContact = data.date;
    friend.logs = [{ id: uid(), date: data.date, note: data.note.trim() }, ...(friend.logs || [])];
    if (data.eventTitle && data.followUpDelay) {
      friend.events = [
        ...(friend.events || []),
        { id: uid(), title: data.eventTitle.trim(), date: addRelativeDate(data.date, data.followUpDelay), repeat: "none" }
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
    state.selectedFriendId = null;
    closeModal();
    showToast("Friend deleted");
  }

  function filterPeople(event) {
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll(".person-card").forEach((card) => {
      card.style.display = card.dataset.search.includes(query) ? "grid" : "none";
    });
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
      notifyDueItems();
      showToast("Reminders enabled");
    }
  }

  function notifyDueItems() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const due = reachOutTasks().filter((task) => task.days <= 0);
    const events = upcomingEvents(1);
    if (!due.length && !events.length) {
      new Notification("Kindred", { body: "No friendship reminders due today." });
      return;
    }
    const dueNames = due.map((task) => task.friend.name).slice(0, 3).join(", ");
    const eventNames = events.map((event) => `${event.title} for ${event.friend.name}`).slice(0, 2).join(", ");
    const parts = [];
    if (dueNames) parts.push(`Reach out: ${dueNames}`);
    if (eventNames) parts.push(`Dates: ${eventNames}`);
    new Notification("Kindred", { body: parts.join(" - ") });
  }

  function closeModal() {
    modalMode = null;
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

  render();
})();
