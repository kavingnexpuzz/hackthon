# VET Institute of Arts and Science — Autonomous AI College Helpdesk & Complaint Agent 🎓🏛️

![VET Institute of Arts and Science Logo](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ44vhfTgtbILqr4iyuXaATJkCOpUtfW0JfUQXbrIgImQ&s=10)

A production-grade full-stack intelligent college helpdesk and autonomous issue-resolution portal built for **VET Institute of Arts and Science**. The application features an immediate public AI College Assistant (no forced login required), natural language defect detection, Gemini-powered ticket categorization and departmental routing, verified roll-number complaint tracking with visual timeline steppers, email/WhatsApp notification abstractions, and dedicated staff/admin workbenches.

---

## 🚀 Key Features

1. **Conversational AI Agent**:
   - Natural language complaint registration (extracts intent, category, location, and priority).
   - Interactive Ticket Preview Confirmation cards ("Confirm & Submit" / "Cancel").
   - Direct MySQL action execution: auto-generates ticket IDs (`CMP-2026-XXXX`, `REQ-2026-XXXX`).
   - Real-time status lookup without hallucinations—answers depend directly on database truth.
   - Built-in Knowledge Base search for organizational FAQs (timings, exam cell, library, procedures).
   - Powered by Google Gemini API with fallback NLP engine.

2. **Role-Based Access Control (RBAC)**:
   - **Student / Employee**: Register complaints, apply for service requests, track personal tickets, chat with AI, view in-app notifications.
   - **Staff**: Dedicated Staff Worklist to review assigned complaints/requests, update statuses (`In Progress`, `Resolved`, `Closed`), and add resolution notes.
   - **Admin**: Full administrative console with real-time KPI metrics, category & priority distribution charts, staff assignment dropdowns, user role editor, and FAQ CRUD management.

3. **Complaint Management**:
   - Categories: IT, Network, Electrical, Plumbing, Classroom Equipment, Maintenance, Security, Other.
   - Statuses: Open, Assigned, In Progress, Resolved, Closed, Rejected.
   - Priorities: Low, Medium, High, Critical.
   - Discussion & timeline comments feed on each ticket.

4. **Service Request Management**:
   - Types: Bonafide Certificate, ID Card, Course Certificate, Permission Request, Leave Request, Document Request, Hostel Request, Transport Request, Other.
   - Track application progress and official approval remarks.

5. **In-App Notification Engine**:
   - Automated alerts on ticket creation, staff assignment, and status updates.
   - Unread badges and one-click mark-as-read.

6. **Design & Aesthetics**:
   - Modern Tailwind CSS SaaS dashboard with custom typography (`Inter` & `Plus Jakarta Sans`).
   - Dark & Light mode toggle with persistent `localStorage` preference.
   - Responsive layouts for desktop, tablet, and mobile devices.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, React Router DOM, Axios, Lucide React |
| **Backend** | Node.js, Express.js, REST APIs, JWT (jsonwebtoken), bcryptjs, CORS, dotenv, express-rate-limit |
| **Database** | MySQL Server 8.0, mysql2 connection pool with promises |
| **AI Engine** | Google Gemini API (`@google/generative-ai`), structured JSON extraction & schema validation |

---

## 📁 Project Structure

```text
hackthon/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # MySQL connection pool
│   │   │   ├── initDb.js         # Schema migration script
│   │   │   └── seedDb.js         # Realistic demo seed data
│   │   ├── controllers/          # API endpoint controllers
│   │   │   ├── authController.js
│   │   │   ├── aiController.js
│   │   │   ├── complaintController.js
│   │   │   ├── requestController.js
│   │   │   ├── faqController.js
│   │   │   ├── notificationController.js
│   │   │   ├── adminController.js
│   │   │   └── staffController.js
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT verification & RBAC authorization
│   │   ├── routes/               # Express REST routes
│   │   ├── services/
│   │   │   ├── aiService.js      # Gemini API + intent extraction & MySQL execution
│   │   │   └── notificationService.js
│   │   ├── utils/
│   │   │   ├── response.js       # Standardized response wrapper
│   │   │   └── ticketGenerator.js# Sequential ticket ID generator
│   │   ├── app.js                # Express app setup
│   │   └── server.js             # Server entry point
│   ├── .env                      # Active backend environment variables
│   ├── .env.example              # Template environment configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Button, Input, Modal, Card, Badge, StatCard
│   │   │   └── chat/             # ChatMessage, ChatInput, TypingIndicator
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth provider & user state
│   │   │   └── ThemeContext.jsx  # Dark/Light mode provider
│   │   ├── layouts/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login with 1-click Hackathon quick-fill buttons
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AiChat.jsx        # Conversational AI Helpdesk
│   │   │   ├── Complaints.jsx
│   │   │   ├── Requests.jsx
│   │   │   ├── KnowledgeBase.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios client with interceptors
│   │   ├── App.jsx               # Protected and public routes
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── schema.sql                # Complete relational schema
│   └── seed.sql                  # Initial seed SQL
└── README.md
```

---

## 🔑 Demo Credentials

For quick evaluation during hackathon presentations, 1-click login buttons are provided on the Login page (`http://localhost:3000/login`):

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@campus.edu` | `Password@123` |
| **IT Staff** | `staff.it@campus.edu` | `Password@123` |
| **Facilities Staff** | `staff.facilities@campus.edu` | `Password@123` |
| **Student** | `student@campus.edu` | `Password@123` |
| **Faculty / Employee** | `john.doe@campus.edu` | `Password@123` |

---

## ⚙️ Environment Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22 tested)
- **MySQL**: 8.0 running locally on port `3306` or `3307`

### 1. Database Initialization
1. Configure `backend/.env` with your MySQL server credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=Admin@1234
DB_NAME=ai_helpdesk
JWT_SECRET=supersecret_ai_helpdesk_jwt_token_key_2026
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
```

2. Run the database migration and seeder from `backend/`:
```bash
cd backend
npm run db:init
npm run db:seed
```

### 2. Backend Setup & Run
```bash
cd backend
npm install
npm run dev
```
*Backend runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.*

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 🤖 Example Conversational AI Flows

### Flow 1: Complaint Registration
- **User**: `"My classroom projector is not working in CSE Block Room 204."`
- **AI Extraction**:
  - Intent: `create_complaint`
  - Category: `Classroom Equipment`
  - Location: `CSE Block Room 204`
  - Priority: `Medium`
- **AI**: Shows interactive ticket preview confirmation card.
- **User**: Clicks `"Confirm & Submit"` (or types `"Yes"`).
- **Backend**: Executes MySQL `INSERT`, generates sequential ticket `CMP-2026-0005`, creates user notification.
- **AI**: `"Your complaint CMP-2026-0005 has been registered successfully in MySQL!"`

### Flow 2: Real-time Ticket Status Lookup
- **User**: `"What is the status of my latest complaint?"`
- **Backend**: Queries active tickets for the authenticated user.
- **AI**:
  ```text
  Here is the current status from our database:
  - Ticket: CMP-2026-0005
  - Status: Open
  - Category: Classroom Equipment
  - Location: CSE Block Room 204
  - Assigned Staff: Pending staff assignment
  ```

### Flow 3: Service Request Application
- **User**: `"I need a bonafide certificate for my summer internship."`
- **AI Extraction**:
  - Intent: `create_request`
  - Request Type: `Bonafide Certificate`
- **User**: Confirms request.
- **Backend**: Creates `REQ-2026-0004` in MySQL.

### Flow 4: Knowledge Base Search
- **User**: `"When does the library close?"`
- **AI**: Queries verified FAQ table and responds with campus library hours without hallucination.

---

## 🔒 Security Best Practices

1. **Zero Secret Exposure**: `GEMINI_API_KEY` and DB credentials exist strictly in backend `.env` and are never bundled into client JS.
2. **JWT & RBAC**: Every protected API route enforces JWT verification; role guards protect admin and staff endpoints.
3. **Database Security**: Prepared statements via `mysql2` prevent SQL injection attacks.
4. **Password Hashing**: Passwords stored as salted bcrypt hashes (`bcryptjs`, 10 rounds).
5. **Rate Limiting**: Protects against DoS and brute-force abuse on `/api` routes.
