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

## Build and Install as a Standalone iPhone App

Kindred is currently a static web app. To install it as a standalone iPhone app through Xcode, wrap the web files in a native iOS shell using Capacitor. Capacitor creates an Xcode project that runs the app inside an iOS `WKWebView`, with normal app signing, an app icon, and a home-screen app icon.

These instructions are for deploying from a MacBook directly to your own iPhone. This is different from the local Safari/PWA flow.

### Requirements

- A MacBook with current macOS
- Xcode from the Mac App Store
- Xcode Command Line Tools
- Node.js LTS
- An Apple Account added to Xcode
- Your iPhone, a cable for first pairing, and Developer Mode enabled when prompted
- Optional but recommended: Apple Developer Program membership for longer-lived signing, TestFlight, and App Store distribution

Install or verify the command line tools:

```bash
xcode-select --install
```

Verify Node.js:

```bash
node --version
npm --version
```

If Node is not installed, install it from <https://nodejs.org/> or with Homebrew:

```bash
brew install node
```

### 1. Clone the repo

```bash
git clone https://github.com/erin-beacham/kindred.git
cd kindred
```

### 2. Create a Capacitor wrapper

Create a `package.json` if one does not exist:

```bash
npm init -y
```

Install Capacitor:

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios
```

Create a dedicated web output folder for the iOS wrapper:

```bash
mkdir -p www
cp index.html app.js styles.css fix.css manifest.webmanifest sw.js icon.svg www/
```

Initialize Capacitor:

```bash
npx cap init Kindred com.erinbeacham.kindred --web-dir www
```

The bundle identifier `com.erinbeacham.kindred` must be unique to your Apple developer account. If Xcode later reports that it is already taken, change it to something unique, such as:

```text
com.yourname.kindred
```

### 3. Add the iOS project

```bash
npx cap add ios
```

After future web changes, refresh the iOS app bundle with:

```bash
cp index.html app.js styles.css fix.css manifest.webmanifest sw.js icon.svg www/
npx cap sync ios
```

### 4. Open the app in Xcode

```bash
npx cap open ios
```

This opens the generated Xcode workspace. If it does not open automatically, open:

```bash
ios/App/App.xcworkspace
```

Use the `.xcworkspace`, not the `.xcodeproj`.

### 5. Configure signing in Xcode

In Xcode:

- Select the `App` project in the left sidebar
- Select the `App` target
- Open Signing & Capabilities
- Check Automatically manage signing
- Choose your Team
- Confirm the Bundle Identifier is unique

If you do not see a team:

- Open Xcode > Settings > Accounts
- Add your Apple Account
- Return to Signing & Capabilities and choose your team

### 6. Connect and prepare your iPhone

- Connect your iPhone to the MacBook with a cable
- Unlock the iPhone
- Tap Trust This Computer if prompted
- In Xcode, open Window > Devices and Simulators
- Confirm your iPhone appears and finishes pairing
- If prompted on the iPhone, enable Developer Mode

Developer Mode is usually found at:

```text
Settings > Privacy & Security > Developer Mode
```

The iPhone may restart after enabling it.

### 7. Build and install on iPhone

In Xcode:

- Select the `App` scheme in the toolbar
- Select your iPhone as the run destination
- Click the Run button, or press `Cmd + R`

Xcode will build, sign, install, and launch Kindred on your iPhone. After the first install, the app appears on your iPhone home screen like a normal standalone app.

If Xcode says the device is not registered, use the Register Device button in Signing & Capabilities or follow the prompt that appears.

### 8. Trust the developer profile if needed

If the app installs but will not open, your iPhone may ask you to trust the developer profile.

On the iPhone:

```text
Settings > General > VPN & Device Management
```

Then trust the developer profile associated with your Apple Account.

### 9. Make later code changes

When you change the web app files:

```bash
cp index.html app.js styles.css fix.css manifest.webmanifest sw.js icon.svg www/
npx cap sync ios
npx cap open ios
```

Then run the app again from Xcode with `Cmd + R`.

### 10. Optional: run wirelessly after first pairing

After the iPhone has been paired once by cable, Xcode can run the app over Wi-Fi if the MacBook and iPhone are on the same network.

In Xcode:

- Open Window > Devices and Simulators
- Select your iPhone
- Enable network/wireless connection if available
- Disconnect the cable
- Select the iPhone as the run destination and run again

### 11. Optional: distribute with TestFlight later

Direct Xcode install is best for personal testing. To share Kindred with other people or install it more permanently, use TestFlight:

- Join the Apple Developer Program
- Create an App Store Connect app record
- In Xcode, choose Product > Archive
- Upload the archive to App Store Connect
- Add yourself or testers in TestFlight

## Host as a Website You Can Use From iPhone

If you want something between "native iOS app" and "only works while my laptop is open," deploy Kindred as a hosted static website. This keeps the current app architecture, gives you a real URL you can open from your iPhone anywhere, and still stores data locally in the browser on your phone.

This is usually the best next step for personal use before investing in a native iOS build.

### What this gives you

- A real `https://...` URL reachable from your iPhone
- No laptop server needed after deployment
- Home-screen install through Safari's Add to Home Screen
- Local storage on the iPhone browser or home-screen web app
- Simple updates by pushing changes to GitHub or redeploying the folder

### Important local-storage behavior

Kindred currently stores data in browser local storage. That means:

- Data entered on your iPhone stays on that iPhone/browser.
- Data entered on your laptop does not automatically sync to your iPhone.
- Data can be lost if Safari site data is cleared.
- Private browsing may not preserve data.
- Changing domains can create a separate local-storage bucket.

If you eventually want the same friend data across multiple devices, the app will need a backend database, authentication, or iCloud-style sync. A hosted static site does not provide cross-device sync by itself.

### Option A: GitHub Pages

This is the simplest path because the app is already in GitHub.

GitHub Pages works well for public static hosting. Be aware that GitHub Pages sites are publicly available on the internet, even when the repo itself is private on plans that support private-repo Pages. Do not put secrets or private data directly in the repository.

To publish from GitHub:

- Open the `erin-beacham/kindred` repository on GitHub
- Go to Settings
- Open Pages in the left sidebar
- Under Build and deployment, set Source to Deploy from a branch
- Choose branch `main`
- Choose folder `/ (root)`
- Save
- Wait for GitHub Pages to build and publish

The site URL will usually look like:

```text
https://erin-beacham.github.io/kindred/
```

Open that URL in iPhone Safari. Then:

- Tap the Share button
- Tap Add to Home Screen
- Name it Kindred
- Tap Add

After that, Kindred launches from your home screen and keeps its local data on the iPhone.

### Option B: Netlify

Netlify is a good choice if you want a friendly dashboard, easy custom domains, deploy previews, or drag-and-drop deploys.

Git-based deploy:

- Create or log into Netlify
- Add a new project
- Import the GitHub repository
- Choose `erin-beacham/kindred`
- Leave Build command blank
- Leave Publish directory as the repository root, or `.`
- Deploy

Manual drag-and-drop deploy:

- Download or clone the repo on your MacBook
- Go to Netlify Drop
- Drag the project folder into the deploy area
- Use the generated `netlify.app` URL on your iPhone

For ongoing work, Git-based deploy is better because every GitHub push can update the website automatically.

### Option C: Vercel

Vercel can also host this as a static site.

- Create or log into Vercel
- Add a new project
- Import the GitHub repository
- Choose the default/static settings
- Leave Build command empty unless Vercel requires one
- Set Output directory to the repository root if prompted
- Deploy

Use the generated `vercel.app` URL on your iPhone and add it to the home screen from Safari.

### Option D: Cloudflare Pages

Cloudflare Pages is another solid static-hosting option, especially if you already use Cloudflare for domains.

- Create or log into Cloudflare
- Go to Workers & Pages
- Create a Pages project
- Connect the GitHub repository
- Leave Build command blank
- Set Build output directory to `/` or the repository root if prompted
- Deploy

Use the generated `pages.dev` URL on your iPhone and add it to the home screen from Safari.

### Recommended middle-ground path

For this project right now:

1. Use GitHub Pages if you are comfortable with a public URL.
2. Use Netlify if you want the easiest hosted dashboard and custom domain setup.
3. Add the hosted URL to your iPhone home screen.
4. Keep using local storage until you decide you need cross-device sync.

### Privacy note

A hosted static website means the app code is reachable by anyone who has the URL if the hosting service publishes it publicly. Your friend data is not committed to GitHub by the app; it is stored in your iPhone browser's local storage. Still, do not hard-code private notes, API keys, contacts, or secrets into the repository files.

## Local Browser Testing

For quick browser testing without building the iOS wrapper, serve the folder locally.

```bash
python3 -m http.server 5173
```

Then visit `http://localhost:5173` on the MacBook.

To preview from iPhone Safari on the same Wi-Fi, find your MacBook's local IP address.

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

Open Safari on your iPhone and visit:

```text
http://YOUR-MACBOOK-IP:5173
```

For example:

```text
http://192.168.1.42:5173
```

## Notes

- Data is stored in the browser's local storage on the device where you use the app.
- In the Capacitor version, that storage lives inside the installed app's web view.
- A direct Xcode install is for development and personal testing. TestFlight or the App Store is the better path for sharing.
- If using a free personal Apple Account instead of a paid Apple Developer Program account, the installed app may expire and need to be rebuilt from Xcode periodically.

## References

- Apple: Running your app in Simulator or on a device: <https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device>
- Apple: Signing & Capabilities workflow: <https://help.apple.com/xcode/mac/current/en.lproj/dev60b6fbbc7.html>
- Capacitor iOS documentation: <https://capacitorjs.com/docs/ios>
- GitHub Pages publishing source: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>
- Netlify deploy options: <https://docs.netlify.com/site-deploys/create-deploys/>
