# UniSync CSE — Institutional Academic Coordination Platform
### Department of Computer Science & Engineering | Anurag University

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)

---

## 📖 Executive Summary

**UniSync CSE** is an enterprise-grade academic collaboration, workflow orchestration, and communication platform engineered specifically for the Department of Computer Science & Engineering at Anurag University.

In large academic institutions, faculty responsibilities—such as internal marks verification, NBA accreditation deliverables, curriculum revisions, laboratory rubrics, and examination duties—are frequently dispersed across disconnected email chains, messaging apps, and manual spreadsheets. UniSync centralizes departmental governance into a unified, secure, and responsive web platform connecting the Dean, Academic Coordinators, and Faculty Members.

---

## 🏛️ Three-Tier Role Governance

UniSync implements strict **Role-Based Access Control (RBAC)** reflecting the official institutional hierarchy:

```
Dean (HOD)  ──▶  Academic Coordinator  ──▶  Faculty Member
```

### 1. Dean, CSE
- **Institutional Oversight:** Department-wide visibility into academic milestones, completion velocities, and operational readiness.
- **Progress Monitoring:** High-level tracking of faculty task completion rates via horizontal visual progress bars.
- **Account Approvals:** Administrative verification and approval of faculty and coordinator registrations.
- **Official Communications:** Issuing official departmental notices and circulars with priority tags.

### 2. Academic Coordinator
- **Task Creation & Assignment:** Structuring academic responsibilities, setting deadlines, and assigning tasks to individual or multiple faculty members.
- **Deliverable Review & Approval:** Reviewing submitted academic artifacts, issuing revision feedback, or approving deliverables.
- **Accountability & Reminders:** Sending direct progress notifications and deadline reminders to assigned faculty members.

### 3. Faculty Member
- **Assigned Tasks Workspace:** Dedicated dashboard to view assigned responsibilities, update progress, and submit work dossiers.
- **Document Submissions:** Direct upload of syllabus files, question papers, and evaluation rubrics with status tracking.
- **Personal To-Dos:** Private task manager for lecture preparations, research notes, and daily student evaluations.
- **Institutional Requisitions:** Submitting formal laboratory equipment, software license, or deadline extension requests.

---

## 🚀 Core Capabilities & Modules

### 1. Academic Task Management & Dossier Reviews
- Multi-assignee support for departmental responsibilities (e.g., Mid-Term Internal Marks, NBA Course Files).
- Document attachments with support for `.pdf`, `.docx`, `.xlsx`, and images up to 25 MB.
- Structured workflow lifecycle: `Pending` &rarr; `In Progress` &rarr; `Submitted` &rarr; `Under Review` &rarr; `Approved` or `Revision Requested`.

### 2. Faculty Progress Monitoring
- Intuitive, horizontal completion rate indicators per faculty member.
- Instant, one-click reminder mechanism sending targeted real-time alerts to faculty notification centers.
- Quick-access faculty dossiers detailing all historical and ongoing assignments.

### 3. Real-Time Departmental Communication
- **Direct 1-on-1 Messages:** End-to-end access-controlled private messaging between colleagues, coordinators, and the Dean.
- **Departmental Channels:** Dedicated communication channels for academic committees and subject groups.
- Powered by WebSockets (`Socket.IO`) with instant delivery and read acknowledgments.

### 4. Circulars & Institutional Calendar
- High-priority department ticker and notice board for urgent institutional circulars.
- Departmental deadlines and meeting scheduling with direct Google Meet conferencing links.

### 5. AI Academic Drafting Assistant
- Integrated with Groq LLM API to assist faculty and coordinators in drafting formal academic circulars, meeting minutes, and task instructions in seconds.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose ODM |
| **Database** | MongoDB / MongoDB Atlas |
| **Real-Time** | Socket.IO (WebSockets & Polling fallback) |
| **Security** | JWT (Access & Refresh tokens), bcrypt.js password hashing, Helmet security headers, Zod validation |
| **Deployment** | Vercel (Frontend SPA), Render (Backend Web Service), MongoDB Atlas (Cloud DB) |

---

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas account)
- npm (v9.0.0 or higher)

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/<your-org>/Slack-4-Anurag-University.git
   cd Slack-4-Anurag-University
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy the sample backend environment file:
     ```bash
     cp server/.env.example server/.env
     ```
   - Update `server/.env` with your MongoDB connection string and security secrets.
   - For the client, create `client/.env` if connecting to an external backend:
     ```bash
     cp client/.env.example client/.env
     ```

4. **Initialize Database (Optional):**
   Seed initial departmental roles and structure:
   ```bash
   npm run seed
   ```

5. **Start Development Servers:**
   - **Backend Server:**
     ```bash
     npm run dev:server
     ```
     Runs on `http://localhost:5000`
   - **Frontend Client:**
     ```bash
     npm run dev:client
     ```
     Runs on `http://localhost:5173`

---

## 🌐 Production Deployment

UniSync is structured for deployment using modern cloud infrastructure:

- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) (Managed M0/M10+ cluster)
- **Backend API:** [Render](https://render.com) (Node.js Web Service)
- **Frontend SPA:** [Vercel](https://vercel.com) (Vite Framework Preset)

For complete deployment instructions, build commands, and environment variable configurations, please refer to the [Deployment Guide](file:///c:/Users/Sai%20Ananya/Desktop/Slack-4-Anurag-University/DEPLOYMENT.md).

---

## 🔒 Security & Institutional Privacy

- **Institutional Domain Access:** Accounts are associated with verified institutional emails (`@anurag.edu.in`).
- **Access Control:** All REST API endpoints and Socket.IO events enforce JWT validation and role authorization.
- **Private Data Protection:** Personal task lists and private communications are strictly isolated; non-participants are barred with `403 Forbidden` policies.
- **Upload Restrictions:** Multi-layer MIME-type and extension validation restricting uploads strictly to academic files.

---

## 📄 License & Attribution

Designed and maintained for the **Department of Computer Science & Engineering**, **Anurag University**, Hyderabad, Telangana.  
All rights reserved.
