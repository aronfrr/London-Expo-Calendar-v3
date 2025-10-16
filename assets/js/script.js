const SECTOR_DISPLAY_NAMES = {
  aerospace: 'Aerospace',
  automotive: 'Automotive',
  blockchain: 'Blockchain',
  construction: 'Construction',
  cyber: 'Cyber',
  defence: 'Defence',
  energy: 'Energy',
  engineering: 'Engineering',
  'life sciences': 'Life Sciences',
  finance: 'Finance',
  fintech: 'Fintech',
  infrastructure: 'Infrastructure',
  manufacturing: 'Manufacturing',
  'public sector': 'Public Sector',
  renewables: 'Renewables',
  security: 'Security',
  space: 'Space',
};

const FILTER_GROUPS = [
  {
    key: 'manufacturing',
    label: 'Manufacturing, Aerospace & Automotive',
    sectors: ['manufacturing', 'aerospace', 'space', 'automotive', 'engineering'],
  },
  {
    key: 'security',
    label: 'Security, Cyber & Defence',
    sectors: ['security', 'cyber', 'defence'],
  },
  {
    key: 'fintech',
    label: 'Fintech, Finance & Blockchain',
    sectors: ['fintech', 'finance', 'blockchain'],
  },
  {
    key: 'infrastructure',
    label: 'Infrastructure & Construction',
    sectors: ['infrastructure', 'construction'],
  },
  {
    key: 'energy',
    label: 'Energy & Renewables',
    sectors: ['energy', 'renewables'],
  },
  {
    key: 'public-sector',
    label: 'Public Sector',
    sectors: ['public sector'],
  },
  {
    key: 'life-sciences',
    label: 'Life Sciences',
    sectors: ['life sciences'],
  },
];

const calendarEl = document.getElementById('calendar');
const sectorFiltersEl = document.getElementById('sector-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const eventDetailsEl = document.getElementById('event-details');
const upcomingListEl = document.getElementById('upcoming-list');

const sectorToGroupMap = FILTER_GROUPS.reduce((map, group) => {
  group.sectors.forEach((sector) => {
    if (!map.has(sector)) {
      map.set(sector, new Set());
    }
    map.get(sector).add(group.key);
  });
  return map;
}, new Map());

const allFilterGroups = FILTER_GROUPS.map((group) => group.key);

let activeFilterGroups = new Set(allFilterGroups);

function createFilterCheckbox(group) {
  const id = `filter-${group.key.replace(/\s+/g, '-')}`;
  const wrapper = document.createElement('label');
  wrapper.setAttribute('for', id);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;
  checkbox.name = 'sector';
  checkbox.value = group.key;
  checkbox.checked = true;

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      activeFilterGroups.add(group.key);
    } else {
      activeFilterGroups.delete(group.key);
      if (activeFilterGroups.size === 0) {
        // avoid empty state: re-enable the changed checkbox
        activeFilterGroups.add(group.key);
        checkbox.checked = true;
        return;
      }
    }
    refreshCalendar();
    refreshUpcomingList();
  });

  const labelText = document.createElement('span');
  labelText.textContent = group.label;

  wrapper.append(checkbox, labelText);
  return wrapper;
}

function buildFilterControls() {
  const fragment = document.createDocumentFragment();
  FILTER_GROUPS.forEach((group) => {
    fragment.appendChild(createFilterCheckbox(group));
  });
  sectorFiltersEl.appendChild(fragment);
}

function filterEvents(events) {
  return events.filter((event) =>
    event.sector.some((sector) => {
      const groups = sectorToGroupMap.get(sector);
      if (!groups) {
        return false;
      }
      for (const groupKey of groups) {
        if (activeFilterGroups.has(groupKey)) {
          return true;
        }
      }
      return false;
    })
  );
}

function eventSectorBadges(event) {
  const group = document.createElement('div');
  group.className = 'badge-group';
  event.sector.forEach((sector) => {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = SECTOR_DISPLAY_NAMES[sector] ?? sector;
    group.appendChild(badge);
  });
  return group;
}

function formatDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedStart = startDate.toLocaleDateString(undefined, options);
  if (!endDate || endDate <= startDate) {
    return formattedStart;
  }
  const formattedEnd = endDate.toLocaleDateString(undefined, options);
  return `${formattedStart} – ${formattedEnd}`;
}

function renderEventDetails(event) {
  eventDetailsEl.innerHTML = '';
  if (!event) {
    eventDetailsEl.innerHTML = '<p>No event selected.</p>';
    return;
  }

  const title = document.createElement('h3');
  title.textContent = event.title;

  const date = document.createElement('p');
  date.innerHTML = `<strong>Date:</strong> ${formatDateRange(
    event.start,
    event.end
  )}`;

  const location = document.createElement('p');
  location.innerHTML = `<strong>Location:</strong> ${event.location}`;

  const description = document.createElement('p');
  description.textContent = event.description;

  const badges = eventSectorBadges(event);

  const link = document.createElement('a');
  link.href = event.website;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'View organiser website';

  eventDetailsEl.append(title, badges, date, location, description, link);
}

function renderUpcomingList(events) {
  upcomingListEl.innerHTML = '';
  if (events.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No events match the selected sectors. Try resetting your filters.';
    upcomingListEl.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  events
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .forEach((event) => {
      const item = document.createElement('article');
      item.className = 'upcoming-item';

      const title = document.createElement('h3');
      title.textContent = event.title;

      const date = document.createElement('time');
      date.dateTime = event.start;
      date.textContent = formatDateRange(event.start, event.end);

      const location = document.createElement('p');
      location.className = 'location';
      location.textContent = event.location;

      const description = document.createElement('p');
      description.textContent = event.description;

      const badges = eventSectorBadges(event);

      const link = document.createElement('a');
      link.href = event.website;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Event website';

      item.append(title, date, location, description, badges, link);
      fragment.appendChild(item);
    });

  upcomingListEl.appendChild(fragment);
}

let calendar;

function refreshCalendar() {
  const filtered = filterEvents(window.eventData);
  const events = filtered.map((event) => ({
    ...event,
    end: event.end ? new Date(new Date(event.end).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : undefined,
    backgroundColor: '#0b6efd',
    borderColor: '#0b6efd',
  }));

  if (calendar) {
    calendar.removeAllEvents();
    calendar.addEventSource(events);
  }
}

function refreshUpcomingList() {
  const filtered = filterEvents(window.eventData);
  renderUpcomingList(filtered);
}

function initCalendar() {
  if (!window.FullCalendar || !window.FullCalendar.Calendar) {
    const errorMessage = document.createElement('p');
    errorMessage.className = 'calendar-error';
    errorMessage.textContent =
      'The calendar could not load. Please check your connection and reload the page.';
    calendarEl.setAttribute('role', 'alert');
    calendarEl.innerHTML = '';
    calendarEl.appendChild(errorMessage);
    console.error('FullCalendar library failed to load.');
    return;
  }

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    eventDisplay: 'block',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,listMonth',
    },
    events: filterEvents(window.eventData).map((event) => ({
      ...event,
      end: event.end
        ? new Date(new Date(event.end).getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10)
        : undefined,
      backgroundColor: '#0b6efd',
      borderColor: '#0b6efd',
    })),
    eventClick: (info) => {
      info.jsEvent.preventDefault();
      const matched = window.eventData.find((event) => event.title === info.event.title);
      renderEventDetails(matched);
      const activeElement = document.querySelector('.fc-event.fc-event-selected');
      if (activeElement) {
        activeElement.classList.remove('fc-event-selected');
      }
      info.el.classList.add('fc-event-selected');
    },
    eventDidMount: (info) => {
      info.el.setAttribute('title', `${info.event.title}\n${info.event.extendedProps.location}`);
    },
  });

  calendar.render();
}

function attachResetButton() {
  resetFiltersBtn.addEventListener('click', () => {
    activeFilterGroups = new Set(allFilterGroups);
    document
      .querySelectorAll("#sector-filters input[type='checkbox']")
      .forEach((checkbox) => {
        checkbox.checked = true;
      });
    refreshCalendar();
    refreshUpcomingList();
  });
}

function init() {
  buildFilterControls();
  attachResetButton();
  initCalendar();
  refreshUpcomingList();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
