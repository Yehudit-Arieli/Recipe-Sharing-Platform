\# Recipe Sharing Platform



A full-stack web application for sharing, discovering, and managing recipes.



\## Project Architecture



This repository is organized as a monorepo containing both the frontend and backend:

\* `/client` - The frontend application (Angular).

\* `/server` - The backend REST API (Python \& Flask).



\## Tech Stack



\* \*\*Frontend:\*\* Angular, TypeScript, HTML, CSS

\* \*\*Backend:\*\* Python, Flask, Flask-JWT-Extended (Authentication)

\* \*\*Database:\*\* MySQL, SQLAlchemy

\* \*\*Image Processing:\*\* Pillow (PIL)



\## Setup and Installation



\### 1. Server Setup (Backend)

Navigate to the server directory and set up the Python environment:

```bash

cd server

python -m venv venv

venv\\Scripts\\activate      # On Windows

pip install -r requirements.txt

python app.py

