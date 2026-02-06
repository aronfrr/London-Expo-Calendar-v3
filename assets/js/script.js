document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    // 1. Initialize the Calendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        initialDate: '2026-02-01', // Opens the calendar at Feb 2026
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth'
        },
        // 2. Link to the data in your events.js file
        events: EVENT_DATA, 
        
        eventClick: function(info) {
            info.jsEvent.preventDefault(); // Prevent browser from following link in same tab
            if (info.event.url) {
                window.open(info.event.url, "_blank"); // Opens event link in a new tab
            }
        },
        
        // 3. Improve the look of the events
        eventDidMount: function(info) {
            // This adds a small tooltip or title when hovering
            info.el.title = info.event.title + " - " + info.event.extendedProps.location;
        }
    });

    calendar.render();

    // 4. Sector Filter Logic
    const sectorFilter = document.getElementById('sector-filter');
    if (sectorFilter) {
        sectorFilter.addEventListener('change', function() {
            const selectedSector = this.value;
            
            calendar.removeAllEvents();
            
            if (selectedSector === 'all') {
                calendar.addEventSource(EVENT_DATA);
            } else {
                const filtered = EVENT_DATA.filter(event => event.sector === selectedSector);
                calendar.addEventSource(filtered);
            }
        });
    }
});
