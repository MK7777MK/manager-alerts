# Manager Alerts (mini)

This project contains a small Django + DRF backend implementing a "Manager Alerts" slice and a minimal seed data loader. The frontend is a small placeholder; see notes about what was cut for time.

Setup (Windows)

1. Create a virtualenv and install dependencies

```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Run migrations and load seed data

```
python manage.py migrate
python manage.py loadseed
python manage.py runserver
```

The API will be at http://localhost:8000/api/alerts

Additional endpoints:

- GET /api/managers — returns a JSON array of employees ({id, name}) for populating the manager select box in the UI.

Examples

GET alerts for manager E2 direct:
http://localhost:8000/api/alerts?manager_id=E2&scope=direct

Dismiss alert A1:
POST http://localhost:8000/api/alerts/A1/dismiss

Tests

Run backend tests with pytest:

```
cd backend
pytest -q
```

What I cut for time

- The frontend is provided under `frontend/` as a Vite + React + TypeScript app. It implements filters (select boxes), scope toggle, severity / status filters, URL-persisted filters, and optimistic dismissal with rollback.

How I used AI/LLMs

- I used Github Copilot to scaffold project files, suggest test cases, and traversal handling.

- Some of the code was reviewed and adjusted manually. Since this assessment was supposed to be done under 2-3 hours, I haven't refactored or changed much of the code there, but I made sure that it's functional

- In a real project, I would've reviewed all the generated code in details and made sure that it's easy to read, commented, scalable, and optimized.

Frontend run:

```
npm install
npm run dev
```

Run both servers for development (backend on 8000, frontend on 3000):

```
:: in one terminal (backend)
python manage.py migrate
python manage.py loadseed
python manage.py runserver

:: in another terminal (frontend)
npm install
npm run dev
```

The frontend dev server will be available at http://localhost:3000

Self-review

- Why this is good: The backend implements the exact endpoints and validations requested, traversal with cycle protection, idempotent dismiss, and tests covering the critical behaviors.

- Next improvements: This is a quick project setup that's done in around 3 hours. The generated code is functional but still requires a manual review. It hasn’t received my full approval yet, as it needs to be evaluated for quality, readability, scalability, and optimization. Additional tests should also be implemented, and the code logic can be further refined. The same applies to the front end, where the UI could benefit from further improvements. Additionally, it's missing deployment preparation and Docker files.


Project meta
-------------------------

Time spent: Around 3 hours

Deployment: it's not deployed, but can be done under request.

Frontend tests & lint
---------------------

Quick commands:

```
npm install
npm test        # run unit tests (vitest)
npm run lint    # run ESLint checks
```

Quick preview:
<img width="1203" height="652" alt="image" src="https://github.com/user-attachments/assets/a66b9b3e-c2f7-4a4c-ac13-10b752c9aa8a" />

