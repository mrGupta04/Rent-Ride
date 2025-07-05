# 🏙️ Urban Nest – Rental Listing Platform

![React](https://img.shields.io/badge/Frontend-React.js-blue)
![Node](https://img.shields.io/badge/Backend-Node.js-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-lightblue)
![Status](https://img.shields.io/badge/status-Completed-brightgreen)

**Urban Nest** is a full-stack rental listing web application that helps users discover and list accommodations such as rooms, flats, PGs, and hostels in cities across India. Built with modern web technologies for a fast, secure, and responsive user experience.

---

## 📆 Project Duration

**September 2024 – November 2024**

---

## ✨ Features

- 🏠 Search listings for rooms, flats, PGs, and hostels  
- 🔍 Filter by city, rent range, accommodation type, and bed options  
- 🧑‍💼 Property owners can post and manage listings  
- 🔐 Secure user & owner login with role-based access via JWT  
- 📱 Responsive design for all screen sizes (mobile-first)

---

## 🧰 Tech Stack

| Layer        | Technologies                         |
|--------------|--------------------------------------|
| 🎨 Frontend   | React.js, CSS                        |
| ⚙️ Backend    | Node.js, Express.js                  |
| 🗄 Database   | PostgreSQL, PGAdmin                  |
| 🔐 Auth       | JSON Web Tokens (JWT)                |
| 🚀 Hosting    | (Add your deployment platform here)  |

---




## 📁 Folder Structure


```
urban-nest/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/ # UI components
│ │ ├── pages/ # Page-level views
│ │ └── App.js
│ └── public/
├── server/ # Express backend
│ ├── controllers/ # Business logic
│ ├── middleware/ # JWT auth, error handling
│ ├── models/ # DB schemas (PostgreSQL)
│ ├── routes/ # API endpoints
│ └── index.js # Server entry point
└── README.md

```

---

## 🛠️ Setup Instructions

### 📦 Backend Setup

```bash
cd server
cp .env.example .env   # Set DATABASE_URL and JWT_SECRET
npm install
npm start
```

### 🎨 Frontend Setup

```bash
cd client
npm install
npm start
```

⚠️ **Note:** Ensure the backend server is running before launching the frontend.

---

## 🔐 .env Example

```env
# PostgreSQL DB URL
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key
```

---

## 👨‍💻 Developer Role

Role: Full Stack Developer

Responsibilities:

🧱 Built secure REST APIs using Express.js

🗃️ Integrated PostgreSQL with structured schema design

🔐 Implemented JWT-based authentication with role-based access (User/Admin)

🎨 Developed a modern, mobile-friendly UI using React.js

🧩 Handled routing, state management, and API integration efficiently

