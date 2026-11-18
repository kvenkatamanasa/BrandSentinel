# BrandSentinel
## Explainable AI-Powered Brand Governance Platform

**Tagline:** Review Before You Publish.

### 1. Project Overview

BrandSentinel is an AI-powered brand governance platform designed to help organizations review digital content before publication. It identifies potential brand guideline violations, unsupported marketing claims, risky expressions and inconsistent brand messaging.

The platform combines rule-based content analysis with AI-assisted review using Ollama to provide understandable findings and recommendations.

### 2. Problem Statement

Organizations publish large amounts of marketing content across websites, advertisements, social media and other digital platforms.

Manual content verification can be time-consuming and inconsistent. Content may contain:
- Unsupported promotional claims.
- Words that violate brand guidelines.
- Inconsistent brand tone and messaging.
- Potentially misleading statements.
- Content requiring additional review or approval.

### 3. Proposed Solution

BrandSentinel provides a centralized platform where users can submit content for review. The system checks content against configured brand guidelines and identifies potential issues.

Administrators can manage users, review submissions, monitor approval requests and approve or reject content.

### 4. Project Objectives

- Automate preliminary content checking.
- Identify potential brand guideline violations.
- Detect potentially unsupported promotional claims.
- Maintain consistent brand tone and messaging.
- Provide explainable review findings.
- Simplify administrative approval workflows.
- Maintain review history and user records.

### 5. Key Features

**Content Review**
- Analyze submitted content.
- Identify potential issues.
- Display evidence and explanations.
- Show severity levels.
- Provide suggested corrections.

**Brand Guidelines**
- Configure brand name.
- Define preferred tone.
- Add preferred words.
- Specify restricted words.
- Configure brand tagline.

**AI Integration**
- Local AI integration through Ollama.
- Llama 3.2 (1B) model support.
- AI-assisted content analysis.
- Explainable recommendations.

**User Management**
- Separate Admin and User login.
- Administrator access to registered users.
- Edit and delete user accounts.

**Approval Management**
- Submit content for administrative approval.
- Review pending requests.
- Approve or reject content.
- Maintain approval records.

**Admin Notifications**
- Notify administrators about new approval requests.
- Display clickable notifications.
- Open relevant approval requests.
- Track notification read status.

**Review History and Dashboard**
- View previous content reviews.
- Display review statistics.
- Track detected issues and approval information.

### 6. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Backend | Python |
| API Framework | FastAPI |
| Database | SQLite |
| AI Runtime | Ollama |
| AI Model | Llama 3.2 (1B) |
| Version Control | Git and GitHub |

### 7. System Architecture

BrandSentinel uses a frontend-backend architecture.

1. React and TypeScript provide the user interface.
2. FastAPI handles backend requests and application logic.
3. SQLite stores user, review and approval information.
4. Rule-based analysis checks content against brand guidelines.
5. Ollama provides deeper AI-assisted analysis.
6. The administrator manages approval requests and user accounts.

### 8. Application Workflow

1. User logs in.
2. User enters content for review.
3. Backend receives the content.
4. Content is checked against brand guidelines.
5. Potential issues are identified.
6. AI-assisted analysis can provide additional findings.
7. Findings and corrections are displayed.
8. User submits content for approval.
9. Administrator receives an approval notification.
10. Administrator approves or rejects the request.

### 9. Expected Outcomes

- Reduce manual preliminary content review effort.
- Improve brand guideline consistency.
- Identify potentially unsupported claims.
- Provide understandable explanations.
- Improve collaboration between users and administrators.
- Support structured pre-publication approval workflows.

### 10. Future Enhancements

- Cloud deployment.
- Multi-brand organization support.
- Advanced analytics and reporting.
- Content management system integration.
- Improved AI recommendations.
- Scalable cloud database integration.
- Automated marketing workflow integration.

### 11. Project Team

**Project Name:** BrandSentinel

**Project Category:** Artificial Intelligence / Brand Governance

**Team Members:**

- Kammineni Venkata Manasa — Team Leader, Frontend and Product Workflow.
- Gowreddy Supraja — Backend, AI and Data.

### 12. Conclusion

BrandSentinel aims to make pre-publication content governance more efficient, transparent and explainable.

By combining configurable brand guidelines, rule-based checks, AI-assisted analysis and administrative approval workflows, it helps organizations identify potential content risks before publication.

**Important:** BrandSentinel provides preliminary content analysis and decision support. Its findings are not a substitute for legal review or final human approval.

---

**BrandSentinel — Review Before You Publish.**
