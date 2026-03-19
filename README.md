# Recipe Sharing Platform 🍳

A full-stack recipe platform featuring user authentication, admin management, and advanced search capabilities.


## 🎥 Demo Video

<p align="center">
  <a href="https://drive.google.com/file/d/1kXgsBL50NXIZpPgTU_lXWsvb2liPNhHW/view?usp=sharing">
    <img src="https://img.icons8.com/color/144/google-drive--v1.png" width="100" alt="Google Drive Icon">
    <br>
    <strong>Click here to watch the project demonstration on Google Drive</strong>
  </a>
</p>


---

## ✨ Core Features
* 🔐 **Authentication:** Secure login & signup using JWT
* 👩‍🍳 **Recipe Management:** Create, edit, and delete recipes (full CRUD)
* 🔍 **Advanced Search:** Filter recipes by ingredients and categories
* 🛠️ **Admin Dashboard:** Manage users and content efficiently
* 🖼️ **Image Handling:** Upload and process recipe images

---

## 🛠️ Tech Stack
* **Frontend:** Angular (TypeScript, HTML, CSS)
* **Backend:** Python, Flask (REST API)
* **Database:** MySQL with SQLAlchemy ORM
* **Authentication:** JWT (Flask-JWT-Extended)

---

## 🏗️ Architecture
Monorepo structure containing:
* `/client` – Angular frontend
* `/server` – Flask backend API

---

## 📸 Screenshots (Compact Version)

| Feature | Screenshot |
|---------|-----------|
| Home Page | <img src="./screenshots/home.png" width="150"/> |
| All Recipes | <img src="./screenshots/all-recipe.png" width="150"/> |
| Recipe Details | <img src="./screenshots/recipe.png" width="150"/> |
| Add Recipe | <img src="./screenshots/add-recipe.png" width="150"/> |
| Fridge Search | <img src="./screenshots/open-fridge.png" width="150"/> |
| Admin Panel | <img src="./screenshots/admin.png" width="150"/> |


---

## 🚀 Quick Setup

### Backend
```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd client
npm install
ng serve
```
