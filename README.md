# London Expo Calendar

An interactive calendar showcasing upcoming conferences, trade shows, and expos
in London across sectors including manufacturing, defence, aerospace,
automotive, infrastructure, energy, renewables, public sector, cyber security,
life sciences, fintech, finance, and blockchain.

## Features

- 📅 Month and list calendar views powered by [FullCalendar](https://fullcalendar.io/).
- ✅ Sector filters to focus on events relevant to your industry.
- 🎨 Colour-coded sectors in the calendar and listings for quick visual scanning.
- 🎟️ Access-type filter to switch between free-to-attend and paid events.
- 🔗 Dedicated events page with the complete chronological list, reachable from
  the "Open full event list" button on the homepage.
- 🔎 Detailed event cards with venue information, descriptions, and organiser links.
- 🪪 Accessible design with keyboard-friendly controls and live regions.

## Getting started

1. Clone the repository and change into the project directory:

   ```bash
   git clone https://github.com/<your-account>/London-Expo-Calendar-v3.git
   cd London-Expo-Calendar-v3
   ```

2. Serve the static site locally (pick any local server, e.g. Python):

   ```bash
   python -m http.server 8000
   ```

3. Visit <http://localhost:8000> in your browser.

## Deploying to GitHub Pages

This project ships with a GitHub Actions workflow that publishes the static
site to GitHub Pages whenever you push to `main`.

1. Push the repository to GitHub.
2. In the repository settings under **Pages → Build and deployment**, choose
   **GitHub Actions** as the source.
3. Ensure Actions are enabled for the repository (Settings → Actions → General).
4. The workflow defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   will build and deploy the site. After the first run completes, GitHub Pages
   will provide the live URL (typically `https://<your-account>.github.io/London-Expo-Calendar-v3/`).

If you prefer manual deployment, you can still serve the compiled site from any
static hosting provider by uploading the repository contents.

## Customising the events

- Event data lives in [`data/events.js`](data/events.js). Each entry includes a
  title, start and end date, sector tags, location, access type (free or paid),
  description, and organiser link.
- Add or update events by editing the array. Sector and access filters update
  automatically based on the properties you provide.
- The dataset in this repository was refreshed with publicly available
  organiser information in July 2025. Always confirm dates and venues with the
  official event website before publishing changes.

## License

Released under the MIT License.
