const eventList = document.getElementById('eventList');
const eventSelect = document.getElementById('eventId');
const registrationList = document.getElementById('registrationList');
const form = document.getElementById('registrationForm');
const formMessage = document.getElementById('formMessage');
let eventsCache = [];

async function loadEvents() {
  try {
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error('Unable to load events.');
    eventsCache = await response.json();
    eventList.innerHTML = '';
    eventSelect.innerHTML = '<option value="">Choose an event</option>';

    eventsCache.forEach(event => {
      const remaining = Math.max(0, event.capacity - event.registeredCount);
      const card = document.createElement('article');
      card.className = 'event-card';
      card.innerHTML = `
        <span class="event-tag">${escapeHtml(event.category)}</span>
        <h3>${escapeHtml(event.name)}</h3>
        <p>${escapeHtml(event.description)}</p>
        <div class="event-meta">📅 ${escapeHtml(event.date)} · ${escapeHtml(event.time)}<br>📍 ${escapeHtml(event.venue)}<br>👥 ${remaining} seats remaining</div>
        <button type="button" data-event-id="${event.id}" ${remaining === 0 ? 'disabled' : ''}>${remaining === 0 ? 'Event Full' : 'Register Now'}</button>`;
      eventList.appendChild(card);

      const option = document.createElement('option');
      option.value = event.id;
      option.textContent = `${event.name} (${remaining} seats left)`;
      option.disabled = remaining === 0;
      eventSelect.appendChild(option);
    });
  } catch (error) {
    eventList.textContent = error.message;
  }
}

async function loadRegistrations() {
  try {
    const response = await fetch('/api/registrations');
    if (!response.ok) throw new Error('Unable to load registrations.');
    const registrations = await response.json();
    registrationList.innerHTML = '';
    if (registrations.length === 0) {
      registrationList.innerHTML = '<tr><td colspan="6">No registrations yet.</td></tr>';
      return;
    }
    registrations.slice().reverse().forEach(item => {
      const row = document.createElement('tr');
      [item.name, item.rollNumber, item.eventName, item.department, item.year, item.email].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });
      registrationList.appendChild(row);
    });
  } catch (error) {
    registrationList.innerHTML = `<tr><td colspan="6">${escapeHtml(error.message)}</td></tr>`;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

eventList.addEventListener('click', event => {
  const button = event.target.closest('button[data-event-id]');
  if (!button) return;
  eventSelect.value = button.dataset.eventId;
  document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  formMessage.textContent = '';
  formMessage.className = 'message full';
  const data = Object.fromEntries(new FormData(form).entries());
  data.eventId = Number(data.eventId);
  try {
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Registration failed.');
    formMessage.textContent = result.message;
    formMessage.classList.add('success');
    form.reset();
    await Promise.all([loadEvents(), loadRegistrations()]);
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.classList.add('error');
  }
});

document.getElementById('refreshButton').addEventListener('click', loadRegistrations);
loadEvents();
loadRegistrations();
