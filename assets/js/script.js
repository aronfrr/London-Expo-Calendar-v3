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
    color: '#2563eb',
  },
  {
    key: 'security',
    label: 'Security, Cyber & Defence',
    sectors: ['security', 'cyber', 'defence'],
    color: '#f97316',
  },
  {
    key: 'fintech',
    label: 'Fintech, Finance & Blockchain',
    sectors: ['fintech', 'finance', 'blockchain'],
    color: '#7c3aed',
  },
  {
    key: 'infrastructure',
    label: 'Infrastructure & Construction',
    sectors: ['infrastructure', 'construction'],
    color: '#0ea5e9',
  },
  {
    key: 'energy',
    label: 'Energy & Renewables',
    sectors: ['energy', 'renewables'],
    color: '#22c55e',
  },
  {
    key: 'public-sector',
    label: 'Public Sector',
    sectors: ['public sector'],
    color: '#ef4444',
  },
  {
    key: 'life-sciences',
    label: 'Life Sciences',
    sectors: ['life sciences'],
    color: '#d946ef',
  },
];

const ACCESS_OPTIONS = [
  {
    key: 'free',
    label: 'Free to attend',
    badgeLabel: 'Free access',
  },
  {
    key: 'paid',
    label: 'Paid ticket',
    badgeLabel: 'Paid access',
  },
];

const calendarEl = document.getElementById('calendar');
const sectorFiltersEl = document.getElementById('sector-filters');
const accessFiltersEl = document.getElementById('access-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const eventDetailsEl = document.getElementById('event-details');
const upcomingListEl = document.getElementById('upcoming-list');

const accessMetaByKey = new Map(ACCESS_OPTIONS.map((option) => [option.key, option]));

const sectorToGroupMap = FILTER_GROUPS.reduce((map, group) => {
  group.sectors.forEach((sector) => {
    if (!map.has(sector)) {
      map.set(sector, new Set());
    }
    map.get(sector).add(group.key);
  });
  return map;
}, new Map());

const sectorPrimaryGroup = new Map();
FILTER_GROUPS.forEach((group) => {
  group.sectors.forEach((sector) => {
    if (!sectorPrimaryGroup.has(sector)) {
      sectorPrimaryGroup.set(sector, group.key);
    }
  });
});

const groupColorMap = new Map(FILTER_GROUPS.map((group) => [group.key, group.color]));

const allFilterGroups = FILTER_GROUPS.map((group) => group.key);
const allAccessFilters = ACCESS_OPTIONS.map((option) => option.key);

let activeFilterGroups = new Set(allFilterGroups);
let activeAccessFilters = new Set(allAccessFilters);

function createFilterCheckbox(group) {
  const id = `filter-${group.key.replace(/\s+/g, '-')}`;
  const wrapper = document.createElement('label');
  wrapper.setAttribute('for', id);
  wrapper.dataset.group = group.key;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;
  checkbox.name = 'sector';
  checkbox.value = group.key;
  checkbox.checked = true;

  const swatch = document.createElement('span');
  swatch.className = 'filter-swatch';
  swatch.style.setProperty('--swatch-color', group.color);

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
    const filtered = refreshCalendar();
    refreshUpcomingList(filtered);
  });

  const labelText = document.createElement('span');
  labelText.textContent = group.label;

  wrapper.append(checkbox, swatch, labelText);
  return wrapper;
}

function createAccessCheckbox(option) {
  const id = `access-${option.key}`;
  const wrapper = document.createElement('label');
  wrapper.setAttribute('for', id);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;
  checkbox.name = 'access';
  checkbox.value = option.key;
  checkbox.checked = true;

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      activeAccessFilters.add(option.key);
    } else {
      activeAccessFilters.delete(option.key);
      if (activeAccessFilters.size === 0) {
        activeAccessFilters.add(option.key);
        checkbox.checked = true;
        return;
      }
    }
    const filtered = refreshCalendar();
    refreshUpcomingList(filtered);
  });

  const labelText = document.createElement('span');
  labelText.textContent = option.label;

  wrapper.append(checkbox, labelText);
  return wrapper;
}

function buildFilterControls() {
  if (sectorFiltersEl) {
    const fragment = document.createDocumentFragment();
    FILTER_GROUPS.forEach((group) => {
      fragment.appendChild(createFilterCheckbox(group));
    });
    sectorFiltersEl.appendChild(fragment);
  }

  if (accessFiltersEl) {
    const fragment = document.createDocumentFragment();
    ACCESS_OPTIONS.forEach((option) => {
      fragment.appendChild(createAccessCheckbox(option));
    });
    accessFiltersEl.appendChild(fragment);
  }
}

function filterEvents(events) {
  return events.filter((event) => {
    const accessKey = event.access;
    if (accessKey) {
      if (!activeAccessFilters.has(accessKey)) {
        return false;
      }
    } else if (activeAccessFilters.size !== allAccessFilters.length) {
      return false;
    }

    return event.sector.some((sector) => {
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
    });
  });
}

function eventSectorBadges(event) {
  const group = document.createElement('div');
  group.className = 'badge-group';
  event.sector.forEach((sector) => {
    const badge = document.createElement('span');
    badge.className = 'badge badge--sector';
    const groupKey = sectorPrimaryGroup.get(sector);
    if (groupKey) {
      badge.classList.add(`badge--group-${groupKey}`);
    }
    badge.textContent = SECTOR_DISPLAY_NAMES[sector] ?? sector;
    group.appendChild(badge);
  });
  return group;
}

function createAccessBadge(accessKey) {
  const meta = accessMetaByKey.get(accessKey);
  if (!meta) {
    return null;
  }

  const badge = document.createElement('span');
  badge.className = `badge badge--access badge--access-${accessKey}`;
  badge.textContent = meta.badgeLabel;
  return badge;
}

function getPrimaryGroupForEvent(event) {
  for (const sector of event.sector) {
    const groupKey = sectorPrimaryGroup.get(sector);
    if (groupKey) {
      return groupKey;
    }
  }
  return null;
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
  if (!eventDetailsEl) {
    return;
  }

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
  const accessBadge = createAccessBadge(event.access);

  const metaRow = document.createElement('div');
  metaRow.className = 'meta-row';
  metaRow.appendChild(badges);
  if (accessBadge) {
    metaRow.appendChild(accessBadge);
  }

  const link = document.createElement('a');
  link.href = event.website;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'View organiser website';

  eventDetailsEl.append(title, metaRow, date, location, description, link);
}

function renderUpcomingList(events) {
  if (!upcomingListEl) {
    return;
  }

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
      const accessBadge = createAccessBadge(event.access);

      const metaRow = document.createElement('div');
      metaRow.className = 'meta-row';
      metaRow.appendChild(badges);
      if (accessBadge) {
        metaRow.appendChild(accessBadge);
      }

      const link = document.createElement('a');
      link.href = event.website;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Event website';

      item.append(title, date, location, description, metaRow, link);
      fragment.appendChild(item);
    });

  upcomingListEl.appendChild(fragment);
}

let calendar;
let lastSelectedEventTitle = null;

function removeSelectedEventHighlight() {
  document
    .querySelectorAll('.fc-event-selected')
    .forEach((element) => element.classList.remove('fc-event-selected'));
}

function clearSelectedEvent() {
  removeSelectedEventHighlight();
  lastSelectedEventTitle = null;
  if (eventDetailsEl) {
    renderEventDetails(null);
  }
}

function getCalendarEvents(events) {
  return events.map((event) => ({
    ...event,
    end: event.end
      ? new Date(new Date(event.end).getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      : undefined,
    groupKey: getPrimaryGroupForEvent(event),
  }))
    .map((event) => {
      const color = event.groupKey ? groupColorMap.get(event.groupKey) : null;
      return {
        ...event,
        backgroundColor: color ?? '#0b6efd',
        borderColor: color ?? '#0b6efd',
        textColor: '#ffffff',
        allDay: true,
        classNames: event.groupKey ? [`fc-event--group-${event.groupKey}`] : [],
      };
    });
}

function syncSelectedEvent(filteredEvents) {
  if (!lastSelectedEventTitle) {
    return;
  }

  const stillVisible = filteredEvents.some((event) => event.title === lastSelectedEventTitle);
  if (!stillVisible) {
    clearSelectedEvent();
  }
}

function refreshCalendar() {
  const filtered = filterEvents(window.eventData);
  const events = getCalendarEvents(filtered);

  if (calendar) {
    calendar.removeAllEvents();
    calendar.addEventSource(events);
    syncSelectedEvent(filtered);
  }

  return filtered;
}

function refreshUpcomingList(events) {
  const filtered = events ?? filterEvents(window.eventData);
  renderUpcomingList(filtered);
}

function initCalendar() {
  if (!calendarEl) {
    return filterEvents(window.eventData);
  }

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

  const initialFiltered = filterEvents(window.eventData);

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    eventDisplay: 'block',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,listMonth',
    },
    events: getCalendarEvents(initialFiltered),
    eventClick: (info) => {
      info.jsEvent.preventDefault();
      removeSelectedEventHighlight();
      lastSelectedEventTitle = info.event.title;
      const matched = window.eventData.find((event) => event.title === info.event.title);
      renderEventDetails(matched);
      info.el.classList.add('fc-event-selected');
    },
    eventDidMount: (info) => {
      info.el.setAttribute('title', `${info.event.title}\n${info.event.extendedProps.location}`);
      if (info.event.title === lastSelectedEventTitle) {
        info.el.classList.add('fc-event-selected');
      }
    },
  });

  calendar.render();

  return initialFiltered;
}

function attachResetButton() {
  if (!resetFiltersBtn) {
    return;
  }

  resetFiltersBtn.addEventListener('click', () => {
    activeFilterGroups = new Set(allFilterGroups);
    activeAccessFilters = new Set(allAccessFilters);
    document
      .querySelectorAll("#sector-filters input[type='checkbox']")
      .forEach((checkbox) => {
        checkbox.checked = true;
      });
    document
      .querySelectorAll("#access-filters input[type='checkbox']")
      .forEach((checkbox) => {
        checkbox.checked = true;
      });
    const filtered = refreshCalendar();
    refreshUpcomingList(filtered);
  });
}

function init() {
  buildFilterControls();
  attachResetButton();

  const filtered = calendarEl ? initCalendar() : filterEvents(window.eventData);
  refreshUpcomingList(filtered);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
