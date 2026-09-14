# LifeOS

> **An AI-powered productivity workspace for managing your work, life, knowledge, and goals in one place.**

LifeOS is a full-stack AI productivity platform designed to bring everyday productivity tools into a single intelligent workspace.

Instead of switching between separate applications for tasks, notes, calendars, habits, documents, finances, goals, journaling, and AI assistance, LifeOS aims to provide one connected system where these parts of your life can work together.

The platform combines a modern responsive web application with a Python backend, PostgreSQL database, local AI, document intelligence, analytics, and eventually collaborative and mobile experiences.

---

## ✨ Vision

LifeOS is being built around a simple idea:

> **Your productivity system should understand your work, not just store it.**

The long-term goal is to create an intelligent workspace that can help users:

* Plan their days
* Manage tasks and projects
* Organize notes and knowledge
* Track habits and routines
* Schedule events
* Manage personal goals
* Store and understand documents
* Chat with their own knowledge
* Track finances
* Reflect through journaling
* Understand productivity patterns
* Collaborate with other people
* Use AI to turn information into useful actions

---

# 🚀 Features

LifeOS is being developed as a modular productivity ecosystem.

### 🏠 Dashboard

A centralized workspace providing an overview of the user's day and important activity.

Planned capabilities include:

* Today's tasks
* Upcoming events
* Habit progress
* Planner overview
* AI-generated daily brief
* Goals and progress
* Productivity statistics
* Important reminders
* Recent documents and notes

**Status:** 🟢 Implemented / expanding

---

### ✅ Tasks

Task management for organizing daily and long-term work.

Planned capabilities include:

* Create tasks
* Edit tasks
* Delete tasks
* Complete tasks
* Priorities
* Due dates
* Task filtering
* Task organization
* Project-based tasks
* AI-assisted task management

**Status:** 🟢 Implemented

---

### 📝 Notes

A personal knowledge and note-taking system.

Planned capabilities include:

* Create notes
* Edit notes
* Delete notes
* Pin important notes
* Organize knowledge
* Search notes
* AI-assisted note understanding
* Connect notes with documents and tasks

**Status:** 🟢 Implemented / expanding

---

### 📅 Calendar

Calendar and event management integrated into the workspace.

Planned capabilities include:

* Create events
* Edit events
* Delete events
* Upcoming event views
* Daily/weekly planning
* Task and event integration
* AI-assisted scheduling

**Status:** 🟢 Implemented / expanding

---

### 🗓️ Daily Planner

A time-based planning system for organizing the day.

Planned capabilities include:

* Time blocks
* Daily schedules
* Task assignment to time slots
* Schedule visualization
* Conflict detection
* Productivity planning
* AI-generated daily plans

**Status:** 🟢 Implemented / expanding

---

### 🔥 Habits

Habit tracking for building consistent routines.

Planned capabilities include:

* Create habits
* Daily completion tracking
* Streaks
* Habit history
* Progress visualization
* Habit analytics
* AI habit insights

**Status:** 🟢 Implemented / expanding

---

### 📓 Journal

A private space for reflection and personal journaling.

Planned capabilities include:

* Daily journal entries
* Rich text
* Mood tracking
* Journal history
* Search
* Reflection prompts
* AI-assisted reflection
* Long-term personal insights

**Status:** 🟡 Planned / early development

---

### 🎯 Goals

Long-term goal management connected with everyday productivity.

Planned capabilities include:

* Create goals
* Milestones
* Deadlines
* Progress tracking
* Goal categories
* Task-to-goal relationships
* Habit-to-goal relationships
* Progress analytics
* AI goal planning

**Status:** 🟡 Planned

---

### 💰 Finance

Personal finance management inside the productivity workspace.

Planned capabilities include:

* Income tracking
* Expense tracking
* Categories
* Budgets
* Transactions
* Monthly summaries
* Spending analytics
* Financial goals
* Visual reports

**Status:** 🟡 Planned

---

# 📄 Document Intelligence

One of the major LifeOS features is an intelligent document system.

Users will be able to upload documents and eventually interact with their contents using AI.

### Current pipeline

```text
PDF
 ↓
Upload
 ↓
Secure Storage
 ↓
Background Processing
 ↓
PDF Text Extraction
 ↓
Ready
```

### Planned intelligent pipeline

```text
PDF
 ↓
Upload
 ↓
Storage
 ↓
Text Extraction
 ↓
Cleaning
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector Database
 ↓
Semantic Search
 ↓
AI / RAG
 ↓
Chat with Document
```

Future capabilities include:

* PDF uploads
* Document management
* Secure document access
* PDF text extraction
* Document processing
* Document search
* Document viewer
* Text chunking
* Embeddings
* Semantic search
* Retrieval-Augmented Generation (RAG)
* AI summaries
* Ask questions about documents
* Multiple-document knowledge bases

**Status:** 🟢 Upload, storage, extraction and background processing implemented
**Status:** 🟡 RAG pipeline planned

---

# 🤖 AI Workspace

LifeOS includes a local AI assistant designed to become the intelligence layer of the platform.

The AI system will eventually understand context from:

* Tasks
* Notes
* Calendar events
* Planner blocks
* Habits
* Goals
* Journal entries
* Documents
* Financial information
* Productivity analytics

### Current AI architecture

```text
LifeOS Web App
      ↓
FastAPI API
      ↓
AI Service
      ↓
Ollama
      ↓
Qwen
      ↓
Local GPU
```

The current implementation supports:

* AI chat
* Conversation persistence
* Multiple conversations
* Message history
* Responsive conversation navigation
* Local LLM inference

### Planned AI capabilities

* Personal productivity assistant
* Daily planning
* Task creation through natural language
* Task prioritization
* Note summarization
* Document Q&A
* PDF chat
* RAG
* AI-generated daily briefings
* Productivity insights
* Goal planning
* Habit recommendations
* Context-aware assistance
* Natural-language workspace commands

**Status:** 🟢 Local AI chat implemented
**Status:** 🟡 Advanced AI integration planned

---

# 📊 Analytics

LifeOS will provide a centralized analytics dashboard for understanding productivity.

Planned analytics include:

* Task completion rate
* Habit consistency
* Planning accuracy
* Time allocation
* Goal progress
* Productivity trends
* Weekly summaries
* Monthly summaries
* Personal productivity insights
* AI-generated insights

**Status:** 🟡 Planned

---

# 👥 Collaboration

LifeOS is designed to eventually support collaborative workspaces.

Planned capabilities include:

* Teams
* Shared workspaces
* Shared tasks
* Shared notes
* Team projects
* Comments
* Mentions
* Activity feeds
* Permissions
* Role-based access
* Collaborative documents

**Status:** 🟡 Planned

---

# 📱 Responsive & Mobile Experience

The LifeOS interface is designed to work across different screen sizes.

### Web

* Desktop
* Laptop
* Tablet
* Mobile browser
* Responsive navigation
* Responsive AI conversation interface

**Status:** 🟢 Implemented / expanding

### Mobile Application

A dedicated mobile experience is planned for future development.

Potential technologies include:

* React Native
* Expo

Potential mobile capabilities:

* Tasks
* Notes
* Habits
* Calendar
* Planner
* AI assistant
* Notifications
* Quick capture
* Voice notes

**Status:** 🟡 Planned

---

# 🎙️ Voice Notes

A future voice capture system for quickly recording thoughts and ideas.

Planned workflow:

```text
Voice
 ↓
Speech-to-Text
 ↓
AI Processing
 ↓
Structured Information
 ↓
Task / Note / Journal / Reminder
```

Potential capabilities:

* Voice notes
* Speech-to-text
* AI transcription
* Automatic categorization
* Task extraction
* Note generation
* Voice commands

**Status:** 🟡 Planned

---

# 🔔 Notifications & Reminders

Future notification infrastructure will support:

* Task reminders
* Event reminders
* Habit reminders
* Goal reminders
* Planner notifications
* AI-generated reminders
* Daily summaries

**Status:** 🟡 Planned

---

# 🏗️ Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Base UI
* Lucide Icons
* Geist

## Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* Pydantic
* PostgreSQL

## AI

* Ollama
* Qwen
* Local GPU inference
* Retrieval-Augmented Generation (planned)
* Embeddings (planned)
* Vector search (planned)

## Development

* pnpm
* Git
* GitHub
* VS Code
* WSL / Ubuntu

---

# 🧩 Architecture

LifeOS follows a modular full-stack architecture.

```text
                         ┌──────────────────────┐
                         │      LifeOS Web      │
                         │      Next.js         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      FastAPI         │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │ PostgreSQL  │       │ AI Service  │       │  Document   │
      │  Database   │       │             │       │  Services   │
      └─────────────┘       └──────┬──────┘       └──────┬──────┘
                                   │                     │
                                   ▼                     ▼
                              ┌─────────┐          ┌──────────┐
                              │ Ollama  │          │ Storage  │
                              │  + Qwen │          │  / Files │
                              └─────────┘          └──────────┘
```

---

# 📁 Project Structure

```text
lifeos/
│
├── apps/
│   │
│   ├── api/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── core/
│   │   │   ├── models/
│   │   │   ├── modules/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── main.py
│   │   │
│   │   ├── alembic/
│   │   ├── tests/
│   │   ├── storage/
│   │   ├── requirements.txt
│   │   └── .env.example
│   │
│   └── web/
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── public/
│       └── package.json
│
├── docs/
├── infrastructure/
├── packages/
│
├── .github/
│   └── workflows/
│
├── .gitignore
├── CONTRIBUTING.md
├── CHANGELOG.md
├── README.md
├── package.json
└── pnpm-workspace.yaml
```

---

# 🗄️ Database

LifeOS uses PostgreSQL as its primary relational database.

The database is designed around modular domain models.

Current major entities include:

```text
users
tasks
habits
habit_completions
notes
planner_blocks
conversations
messages
documents
```

Future entities are expected to include:

```text
calendar_events
goals
goal_milestones
journal_entries
financial_accounts
transactions
budgets
document_chunks
document_embeddings
teams
workspaces
notifications
```

Database migrations are managed using Alembic.

---

# 🔐 Security

Security is a core part of the architecture.

Current security mechanisms include:

* JWT authentication
* Protected API routes
* User ownership checks
* Secure document access
* User-isolated conversations
* Password hashing
* Environment-based secrets
* Database foreign-key constraints
* Cascading relationships where appropriate

Future security improvements include:

* Role-based access control
* Workspace permissions
* Refresh tokens
* Rate limiting
* Audit logging
* Advanced document access controls

---

# 🧪 Testing

The backend uses `pytest`.

Current coverage includes tests for:

* Authentication
* Tasks
* Habits
* Notes
* Calendar
* Planner
* AI conversations
* Documents
* Document storage
* PDF extraction
* Document processing
* Background processing
* Ownership/security behavior

Current backend test status:

```text
89 passed
```

The test suite is continuously expanded as new features are implemented.

---

# 🛣️ Development Roadmap

LifeOS is being developed incrementally.

## Phase 1 — Foundation

* [x] Monorepo
* [x] Backend foundation
* [x] Frontend foundation
* [x] PostgreSQL architecture
* [x] Authentication
* [x] Testing infrastructure

## Phase 2 — Core Productivity

* [x] Tasks
* [x] Habits
* [x] Notes
* [x] Calendar
* [x] Planner
* [x] Dashboard

## Phase 3 — AI

* [x] Local AI backend
* [x] Ollama integration
* [x] AI chat
* [x] Conversation persistence
* [x] Responsive AI interface
* [ ] AI workspace context
* [ ] AI task actions
* [ ] AI planning
* [ ] AI productivity insights

## Phase 4 — Documents

* [x] Document database model
* [x] Document upload
* [x] Local storage
* [x] Document CRUD
* [x] Secure file access
* [x] PDF validation
* [x] PDF extraction
* [x] Processing lifecycle
* [x] Background processing
* [ ] Extracted text persistence
* [ ] Document chunks
* [ ] Embeddings
* [ ] Vector search
* [ ] RAG
* [ ] Chat with PDF

## Phase 5 — Personal Productivity

* [ ] Journal
* [ ] Goals
* [ ] Finance
* [ ] Voice notes
* [ ] Notifications
* [ ] Advanced analytics

## Phase 6 — Intelligence

* [ ] Unified AI context
* [ ] AI daily planner
* [ ] AI task management
* [ ] AI goal planning
* [ ] AI habit insights
* [ ] AI document intelligence
* [ ] Personal productivity insights

## Phase 7 — Collaboration

* [ ] Teams
* [ ] Shared workspaces
* [ ] Shared projects
* [ ] Comments
* [ ] Mentions
* [ ] Permissions
* [ ] Collaborative workflows

## Phase 8 — Mobile

* [ ] Mobile application
* [ ] Push notifications
* [ ] Mobile AI assistant
* [ ] Voice capture
* [ ] Quick actions
* [ ] Offline capabilities

---

# 🖥️ Application

The final LifeOS application is envisioned as a unified workspace with navigation across:

```text
LifeOS
│
├── Dashboard
├── Tasks
├── Notes
├── Calendar
├── Planner
├── Habits
├── Journal
├── Goals
├── Finance
├── Documents
├── AI
├── Analytics
└── Settings
```

The goal is for these modules to operate as **one connected productivity system**, rather than independent features.

For example:

```text
Goal
 ↓
Tasks
 ↓
Planner
 ↓
Calendar
 ↓
Habits
 ↓
Analytics
 ↓
AI Insights
```

And:

```text
Document
 ↓
Text Extraction
 ↓
Chunks
 ↓
Embeddings
 ↓
Search
 ↓
RAG
 ↓
AI
 ↓
Answer
```

---

# ⚙️ Local Development

## Prerequisites

Recommended development environment:

* Node.js
* pnpm
* Python
* PostgreSQL
* Git
* Ollama
* NVIDIA GPU (recommended for local AI)

---

## Clone the repository

```bash
git clone https://github.com/1054reddy/lifeos.git
cd lifeos
```

---

## Install frontend dependencies

```bash
pnpm install
```

---

## Backend setup

```bash
cd apps/api

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Configure the database and application secrets in `.env`.

---

## Run the backend

```bash
cd apps/api
source .venv/bin/activate

uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Run the frontend

From the repository root:

```bash
pnpm --dir apps/web dev
```

Frontend:

```text
http://localhost:3000
```

---

# 🤖 Local AI Setup

LifeOS is designed to support local AI inference using Ollama.

Example model configuration:

```text
Ollama
  ↓
Qwen
  ↓
Local GPU
```

The exact model and hardware configuration may evolve as the AI system develops.

---

# 🌐 Deployment

Future deployment architecture may include:

```text
                    Internet
                       │
                       ▼
                ┌─────────────┐
                │   Reverse   │
                │    Proxy    │
                └──────┬──────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       ┌───────────┐       ┌───────────┐
       │  Next.js  │       │  FastAPI  │
       │   Web     │       │    API    │
       └───────────┘       └─────┬─────┘
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
            PostgreSQL       Object Storage      AI
```

Potential future infrastructure:

* Docker
* Cloud hosting
* Object storage
* Managed PostgreSQL
* Redis
* Background workers
* Vector database
* CI/CD
* Monitoring
* Logging

---

# 📌 Current Status

LifeOS is actively under development.

### Currently implemented

* Full-stack monorepo
* Authentication
* Tasks
* Habits
* Notes
* Calendar
* Planner
* Dashboard
* Local AI chat
* Persistent AI conversations
* Responsive workspace navigation
* Document management
* PDF upload
* PDF extraction
* Background document processing
* Automated backend testing

### Currently being developed

* Advanced document intelligence
* AI-powered productivity workflows
* Expanded workspace integrations

### Planned

* RAG
* Document chat
* Goals
* Journal
* Finance
* Analytics
* Voice notes
* Notifications
* Collaboration
* Mobile application
* Advanced AI automation

---

# 🎯 Long-Term Goal

LifeOS is ultimately intended to become a **personal operating system for productivity**.

The long-term vision is:

```text
                 ┌───────────────┐
                 │    LifeOS     │
                 │  Intelligence │
                 └───────┬───────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   Productivity      Knowledge          Planning
       │                 │                 │
       ▼                 ▼                 ▼
 Tasks / Goals      Notes / Docs      Calendar / Planner
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
                       AI
                         │
                         ▼
                Personal Insights
```

The objective is not simply to build another task manager.

It is to build a system where **information, planning, actions, habits, goals, and AI intelligence are connected together.**

---

# 🤝 Contributing

LifeOS is currently being developed as an evolving project.

Contributions, suggestions, architecture discussions, and improvements are welcome as the project matures.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for development guidelines.

---

# 📄 License

License information will be added as the project approaches its first public release.

---

## ⭐ Project

**LifeOS — AI Productivity Workspace**

Built with:

**Next.js · React · TypeScript · FastAPI · PostgreSQL · SQLAlchemy · Ollama · Qwen**
