# Rh ChemBuddy mini app

Telegram Mini App for A/L Chemistry students of one tuition teacher.

- **Login**: Telegram signed `initData`, verified by n8n with Telegram's public key (no bot token in the app).
- **Data**: questions, timetable, announcements, fees, stats and leaderboard come from the n8n webhook `chembuddy-api` (teacher's Google Sheet + n8n data tables).
- **Points**: answers are checked on the server. First try: 10 points (correct) / 2 (wrong). Daily bonus +5, streaks.
- **AI tutor**: chemistry questions in Sinhala, Singlish, English or Tamil (daily limit set in the sheet).
- **Short notes**: photos stay on the student's phone only (IndexedDB).

Open `index.html?demo=1` (or the file directly) to see the app with demo data.
