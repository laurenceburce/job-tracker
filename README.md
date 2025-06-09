# Backend http://127.0.0.1:8000/docs
cd job-tracker\backend
..\env\Scripts\activate
uvicorn main:app --reload

# Frontend http://localhost:3000
cd job-tracker\frontend
npm start

# POSSIBLE IMPROVEMENTS
Save the data for when the server is restarted
the AI response takes a while to generate, add a feature that shows a loading icon or output what the bot is saying/thinking

Job Application Tracker
- Automatically track updates from email
- Auto fill (company and position) from link
- Current Date set automatically

Resume vs Job Description Matcher
- Turning the AI suggestions into one-click edits to resume sections
- Allow toggling between Concise vs Detailed mode, just add a checkbox in your UI and append an extra instruction in the prompt.