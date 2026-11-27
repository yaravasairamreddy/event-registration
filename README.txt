COLLEGE EVENT REGISTRATION SYSTEM

REQUIREMENTS
- Node.js (LTS version)
- Visual Studio Code

HOW TO RUN
1. Extract this folder.
2. Open the college-event-registration folder in VS Code.
3. Open Terminal > New Terminal.
4. Run: npm install
5. Run: npm start
6. Open this address in your browser: http://localhost:3000

PROJECT FILES
- server.js: Node.js + Express backend and API routes
- public/index.html: website structure
- public/style.css: website design
- public/app.js: frontend behavior and API requests
- data/events.json: event information (created automatically)
- data/registrations.json: saved registrations (created automatically)

NOTES
- Registrations are stored locally in JSON files.
- The default events are sample events. Edit data/events.json after the first run to change them.
- This is a classroom/demo project, not a production system. A real deployment should use a database, authentication, access controls, and secure handling of student personal data.
