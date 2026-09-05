# 💬 बात-चीत (Baat-Chit)

A full-stack real-time messaging application built with the MERN stack, WebSockets, and an integrated AI assistant **सखा (Sakha AI)** powered by Gemini.

## 🚀 Features

### 👤 Authentication

* User registration and login
* JWT-based authentication
* OTP/email verification
* Secure password handling

### 💬 Real-Time Chat

* Real-time one-to-one messaging using WebSocket
* Online/offline status
* Last seen status
* Typing indicator
* Responsive chat interface

### 🎙️ Voice Messages

* Record voice messages directly from the browser
* Upload and send audio messages
* Audio playback inside conversations

### 📎 File Sharing

* Image sharing
* PDF sharing
* Text files
* Word documents
* ZIP files
* File preview/download support

### 🤖 सखा AI

* AI assistant integrated into the chat application
* Powered by the Gemini API
* User sends a question → backend → Gemini → AI response
* Loading state while Sakha generates a response

### 📱 Responsive Design

* Desktop-friendly interface
* Mobile-friendly chat experience
* Mobile back navigation

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* JavaScript
* Vite
* Lucide React

### Backend

* Node.js
* Express.js
* WebSocket (`ws`)
* JWT
* bcrypt
* Nodemailer

### Database

* MongoDB
* Mongoose

### AI

* Google Gemini API
* `@google/genai`

## 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │  React Frontend │
                    │     Vite        │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
        REST API / HTTP            WebSocket
                 │                       │
                 └───────────┬───────────┘
                             ▼
                    ┌─────────────────┐
                    │ Node + Express  │
                    │     Backend     │
                    └───────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        MongoDB Atlas    Gemini API    File Storage
```

## 🤖 Sakha AI Flow

```text
User enters message
        ↓
SakhaChat.jsx
        ↓
POST /api/sakha
        ↓
Express backend
        ↓
Gemini API
        ↓
AI generated response
        ↓
Response returned to React
        ↓
Sakha displays the answer
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd बात-चीत
```

### 2. Install backend dependencies

```bash
cd client/Backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../
npm install
```

### 4. Environment Variables

Create a `.env` file inside the backend directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```



### 5. Run the backend

```bash
cd Backend
npm run dev
```

### 6. Run the frontend

Open another terminal:

```bash
cd client
npm run dev
```

## 🔐 Security

The project uses:

* JWT authentication
* Password hashing
* API rate limiting
* Environment variables for secrets
* Authenticated WebSocket connections

## 📂 Project Structure

```text
बात-चीत/
│
├── client/
│   ├── Backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── ...
│   │   └── server.js
│   │
│   └── src/
│       ├── components/
│       ├── pages/
│       └── ...
│
└── README.md
```

## 🌐 Live Demo

**Coming soon:** `YOUR_DEPLOYED_FRONTEND_URL`

## 💻 GitHub

https://github.com/abhijeetjha2005

## 📸 Screenshots

Add screenshots of:

* Login/Register
* Contact list
* Real-time chat
* Voice message
* File sharing
* सखा AI

## 🔮 Future Improvements

* Conversation history for Sakha
* Streaming AI responses
* Group chat
* Message reactions
* Read receipts
* Persistent AI conversation memory
* Cloud object storage for uploaded files

## 👨‍💻 Author

**Abhijeet  Kumar Jha**

Built as a full-stack project to learn and implement real-time communication, backend development, authentication, file handling, and LLM integration.
