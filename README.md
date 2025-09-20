# 🚀 Meeting Action Tracker  

**Streamline your meetings and boost team productivity.**  
In modern collaborative workplaces, meetings often generate numerous tasks but lack systematic follow-up, leading to inefficiencies. This project presents a Meeting Action Tracker that leverages Natural Language Processing (NLP) and Intelligent Task Management to identify action items from meeting transcripts or notes. Using named entity recognition and context-aware classification, the system assigns tasks to the appropriate stakeholders, sets deadlines, and syncs them with calendars or project management tools. The solution ensures accountability, reduces manual effort, and enhances collaboration. With real-time updates and reminders, the platform bridges the gap between discussions and execution, transforming meetings into actionable outcomes.


## ✨ Features  

- 🔍 **Automatic Action Extraction** – AI pulls out *who, what, and when* from meeting notes.  
- 🤖 **AI Classification** – Distinguishes actionable tasks from general discussion points.  
- ⏰ **Deadline Parsing** – Smartly interprets phrases like *“next week”* or *“by Friday”*.  
- 📊 **Task Dashboard** – View, edit, sort, and filter tasks by assignee or due date.  
- 📤 **Export Tasks** – Send tasks to email, calendar, or project management tools.  
- 🔒 **Security** – HTTPS, local data processing, and role-based access controls.  
- 💻 **User-Friendly UI** – Responsive, clean frontend for managing tasks.  
- ⚡ **Instant Notifications** – Tasks sent directly via email or chat (Slack/MS Teams).  
- 🎯 **Quick Demo Mode** – Paste notes and see instant task extraction + assignment.  

---

## 🛠️ Tech Stack  

- **Frontend:** React.js, Tailwind CSS  
- **Backend:** Node.js + Express API, Python Flask microservice (for NLP)  
- **Database:** MongoDB with Mongoose ODM  
- **NLP Models:** [spaCy](https://spacy.io/), [Hugging Face Transformers](https://huggingface.co/), [dateparser](https://dateparser.readthedocs.io/)  
- **Integrations:** Nodemailer (Email), Google Calendar API, Slack API *(optional)*  
- **Tools:** VS Code, Postman, Git + GitHub, Docker *(optional)*  

---

## 📦 Installation & Setup  

```bash
# Clone the repository
git clone https://github.com/your-username/meeting-action-tracker.git
cd meeting-action-tracker

# Install dependencies
npm install              # For Node.js backend
cd frontend && npm install   # For React frontend
cd ../nlp-service && pip install -r requirements.txt  # For Python NLP microservice

# Start services
npm run dev              # Start backend + frontend
python nlp-service/app.py   # Start NLP microservice
