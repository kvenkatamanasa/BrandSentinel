# BrandSentinel
### Explainable AI-Powered Brand Governance Platform

BrandSentinel is an AI-powered pre-publication content review platform that helps organizations identify potential brand guideline violations, unsupported marketing claims, risky expressions and inconsistent brand messaging before publication.

## 1. Project Overview

Organizations publish marketing content across websites, advertisements, social media and other digital platforms. Manual content verification can be time-consuming and inconsistent.

BrandSentinel provides a centralized platform to review content, identify potential issues, explain findings and manage administrative approval workflows.

## 2. Problem Statement

- Manual content verification requires significant time and effort.
- Marketing content may contain unsupported promotional claims.
- Content may violate brand guidelines.
- Brand tone and messaging may be inconsistent.
- Organizations need a structured content approval process.

## 3. Proposed Solution

BrandSentinel combines rule-based content analysis, configurable brand guidelines and local AI-assisted review to help identify potential content risks before publication.

Users can submit content for review, view findings and request approval. Administrators can manage users, monitor reviews and approve or reject submissions.

## 4. Key Features

- Content Review and issue detection.
- Explainable AI findings with evidence and explanations.
- Severity classification and suggested corrections.
- Custom Brand Guidelines.
- Preferred tone and preferred words configuration.
- Restricted words management.
- Ollama local AI integration.
- Separate Admin and User login.
- Approval Management.
- Admin notifications for new approval requests.
- User Management with edit and delete options.
- Review History.
- Dashboard with review statistics.

## 5. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Backend | Python |
| API Framework | FastAPI |
| Database | SQLite |
| AI Integration | Ollama |
| AI Model | Llama 3.2 (1B) |
| Version Control | Git and GitHub |

## 6. Project Structure

```text
BrandSentinel/
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   
│
├── screenshots/
│   
│
├── .gitignore
├── README.md
└── LICENSE
```

## 7. Prerequisites

Install the following software:

- Python 3.10 or newer.
- Node.js and npm.
- Git.
- Ollama for local AI analysis.

## 8. Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/BrandSentinel.git
cd BrandSentinel
```

Replace YOUR_USERNAME with your GitHub username.

### Step 2: Backend Setup

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Start the backend:

```cmd
uvicorn main:app --reload
```

Backend URL:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

### Step 3: Frontend Setup

Open another CMD window:

```cmd
cd frontend
npm install
npm run dev
```

Open the frontend URL displayed in the terminal, usually:

http://localhost:5173

### Step 4: Ollama Setup

Install Ollama:

https://ollama.com/

Download the AI model:

```cmd
ollama pull llama3.2:1b
```

Start Ollama if it is not already running:

```cmd
ollama serve
```

Ensure the backend is configured to use the correct Ollama URL and model name.

## 9. System Workflow

1. User logs in to BrandSentinel.
2. User submits content for review.
3. Backend checks content against configured brand guidelines.
4. Rule-based analysis identifies potential issues.
5. Ollama can provide deeper AI-assisted analysis.
6. Findings and suggested corrections are displayed.
7. User submits content for administrative approval.
8. Administrator receives an approval notification.
9. Administrator reviews and approves or rejects the request.
10. Review and approval information is maintained in the database.

## 10. Explainable AI

BrandSentinel aims to make content review understandable by presenting:

- Detected issue.
- Supporting content or evidence.
- Explanation of the potential risk.
- Severity level.
- Suggested correction.

The platform supports human decision-making rather than automatically determining legal compliance.

## 11. Security and Data Management

- Separate administrator and user access.
- Protected user-management operations.
- Backend-controlled approval workflows.
- Environment-based configuration for secrets.
- Local database storage during development.

Never publish passwords, secret keys, private user data or local database files to GitHub.

## 12. Future Enhancements

- Cloud deployment.
- Multi-brand support.
- Advanced reporting and analytics.
- Content management system integration.
- Improved AI-assisted recommendations.
- Scalable cloud database integration.
- Automated content governance workflows.

## 13. Project Documentation

Detailed project description:

`project-description.md`

Application screenshots:

`screenshots/`

## 14. Project Team

**Project Name:** BrandSentinel

**Project Category:** Artificial Intelligence / Brand Governance

**Team Members:**

- Kammineni Venkata Manasa — Team Leader, Frontend and Product Workflow.
- Gowreddy Supraja — Backend, AI and Data.

## 15. Conclusion

BrandSentinel aims to make pre-publication content governance more efficient, transparent and explainable. By combining configurable brand guidelines, rule-based checks, AI-assisted analysis and administrative approval workflows, it helps organizations identify potential content risks before publication.

## 16. License

This project is currently intended for educational and demonstration purposes. Add an open-source license only when the project owners decide to grant permission for reuse and distribution.

---

**BrandSentinel — Review Before You Publish.**
