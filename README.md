# Kindred

A mobile-first friendship CRM prototype for remembering who to reach out to, when to follow up, and what each person cares about.

## What it does

- Tracks friends, birthdays, interests, notes, and important dates
- Lets you set a reach-out cadence per friend
- Shows who is due today and what is coming soon
- Logs contacts and creates relative follow-up reminders
- Suggests outreach ideas from notes, interests, and upcoming events
- Runs as a small installable PWA using local browser storage

## Run locally

Open `index.html` directly or serve the folder with a simple local server.

On Windows:

```powershell
py -m http.server 5173
```

On macOS:

```bash
python3 -m http.server 5173
```

Then visit `http://localhost:5173` on the computer running the server.

## Deploy to iPhone from a MacBook

This app is currently a Progressive Web App, not a native App Store app. The quickest iPhone deployment path is to run it from your MacBook and install it to your iPhone home screen through Safari.

### 1. Clone the repo on your MacBook

```bash
git clone https://github.com/erin-beacham/kindred.git
cd kindred
```

### 2. Start a local web server

```bash
python3 -m http.server 5173
```

Leave this Terminal window open while testing on your iPhone.

### 3. Find your MacBook's local IP address

Option A, from System Settings:

- Open System Settings
- Go to Wi-Fi
- Click Details next to your current network
- Copy the IP address

Option B, from Terminal:

```bash
ipconfig getifaddr en0
```

The result usually looks like `192.168.1.42`.

### 4. Open Kindred on your iPhone

Make sure your iPhone and MacBook are on the same Wi-Fi network. Then open Safari on your iPhone and visit:

```text
http://YOUR-MACBOOK-IP:5173
```

For example:

```text
http://192.168.1.42:5173
```

### 5. Add it to your iPhone home screen

In Safari on your iPhone:

- Tap the Share button
- Tap Add to Home Screen
- Name it Kindred
- Tap Add

Kindred will now launch from your home screen like an app.

## Notes

- Data is stored in the browser's local storage on the device where you use the app.
- The MacBook server must be running for the iPhone to load this local development version.
- For a public hosted version, deploy the static files to GitHub Pages, Netlify, Vercel, or another static host, then open that hosted URL on iPhone and add it to the home screen.
- For a true native iOS app, this project would need to be converted to Swift/SwiftUI, React Native, Expo, or wrapped with a native shell such as Capacitor.
