## 🐰 Code Bunny

### A full-stack, AI-powered coding practice platform for tech bunnies 🥕

**Code Bunny** is a LeetCode inspired coding platform designed to make programming practice more interactive, engaging, and beginner friendly. Users can browse coding problems, write and execute solutions, test their code, manage their profiles, and use AI-powered assistance while learning.

---

## ✨ Features

### 🧩 Coding Problems

* Browse and explore coding problems
* Problems organized by difficulty and topic
* Detailed problem descriptions
* Input/output examples
* Constraints and test cases
* Code editor for solving problems

### 💻 Online Code Editor

* Write solutions directly in the browser
* Execute code against test cases
* View execution results
* Identify failed test cases
* Interactive coding workflow

### 🤖 AI-Powered Assistance

Powered by Google Gemini, Code Bunny can provide intelligent assistance to users while solving problems.

Potential AI capabilities include:

* 💡 Hint generation
* 🐛 Code debugging assistance
* 📖 Problem explanations
* 🔍 Solution analysis
* 🧠 Concept explanations
* ⚡ Optimization suggestions

### 👤 User Profiles

* User authentication
* Personalized profiles
* Coding activity
* Problem-solving progress
* User-specific data

### 📚 Problem Listing System

* Browse available problems
* Filter problems by difficulty
* Search problems
* Track solved problems
* View problem details

### 🥕 Bunny-Themed UI

A playful coding environment designed around the Code Bunny theme to make learning programming more engaging.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Code Bunny     │
                    │     React + Vite    │
                    └──────────┬──────────┘
                               │
                    HTTP / API Requests
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Node.js Backend  │
                    │      REST APIs      │
                    └───────┬─────┬───────┘
                            │     │
                 ┌──────────┘     └──────────┐
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │    Firebase     │         │   Gemini API    │
        │ Authentication  │         │   AI Features   │
        │   & Database    │         └─────────────────┘
        └─────────────────┘
```

---

## 🛠️ Tech Stack

| Technology             | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| **React**              | Frontend UI                                |
| **Vite**               | Frontend build tool and development server |
| **TypeScript**         | Type-safe application development          |
| **Node.js**            | Backend runtime                            |
| **Express.js**         | Backend API framework                      |
| **Firebase**           | Authentication and data storage            |
| **Google Gemini API**  | AI-powered coding assistance               |
| **CSS / Tailwind CSS** | UI styling                                 |
| **Git & GitHub**       | Version control                            |

> Update the table if your actual project uses different libraries such as Monaco Editor, Firebase Firestore, or Tailwind CSS.

---

## 📂 Project Structure

```text
Code-Bunny/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── server.ts
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/code-bunny.git
cd code-bunny
```

---

## 2. Install frontend dependencies

```bash
cd frontend
npm install
```

---

## 3. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file in the appropriate frontend/backend directories.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_firebase_app_id

PORT=5000
```

### ⚠️ Important

Never commit API keys or Firebase private credentials to GitHub.

Make sure `.env` is included in `.gitignore`:

```gitignore
.env
.env.local
node_modules/
dist/
```

---

# ▶️ Running the Application

### Start the frontend

```bash
cd frontend
npm run dev
```

The Vite development server will usually be available at:

```text
http://localhost:5173
```

### Start the backend

```bash
cd backend
npm run dev
```

The backend will run on the configured port, for example:

```text
http://localhost:5000
```

---

# 🤖 Gemini AI Integration

Code Bunny integrates Google's Gemini API to provide AI-assisted learning features.

Instead of simply giving users the answer, the AI layer can be designed to support the learning process through:

```text
Coding Problem
      │
      ▼
User's Code
      │
      ▼
Gemini AI
      │
 ┌────┴──────────────┐
 ▼                   ▼
Hints            Debugging
 │                   │
 └────────┬──────────┘
          ▼
   Better Understanding
```

This allows Code Bunny to function not only as a coding platform, but also as an **AI-assisted programming learning environment**.

---

# 🔐 Authentication & Data

Firebase is used to manage user-related functionality such as:

* User authentication
* User profiles
* Coding progress
* Problem-solving history
* Application data

The frontend communicates with Firebase and the Node.js backend depending on the functionality being performed.

---

# 🧪 Testing

Run the project's test suite using:

```bash
npm test
```

For production builds:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

> Replace these commands with your project's actual scripts if they differ.

---

# 📸 Screenshots

Add screenshots of the major parts of the application here.

### 🏠 Home Page

```text
Add screenshot here
```

### 💻 Coding Environment

```text
Add screenshot here
```

### 🧩 Problem Page

```text
Add screenshot here
```

### 🤖 AI Assistant

```text
Add screenshot here
```

### 👤 User Profile

```text
Add screenshot here
```

---

# 🔮 Future Improvements

Planned improvements include:

* [ ] Support for multiple programming languages
* [ ] Advanced code execution sandbox
* [ ] Submission history
* [ ] Coding streaks
* [ ] Leaderboards
* [ ] Achievement/badge system
* [ ] Difficulty-based recommendations
* [ ] AI-generated personalized learning paths
* [ ] AI code review
* [ ] Contest mode
* [ ] Real-time multiplayer coding
* [ ] Discussion section for each problem
* [ ] More advanced analytics for user progress

---

# 🎯 Project Goals

Code Bunny aims to combine three major components:

```text
       🧩 Coding Practice
              +
       🤖 AI Assistance
              +
       👤 Progress Tracking
              │
              ▼
     🐰 Interactive Learning
```

The goal is to create a platform where users can **practice coding, understand their mistakes, and improve their problem-solving skills** within a single application.

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "Add your feature"
```

5. Push the branch

```bash
git push origin feature/your-feature
```

6. Open a Pull Request

---

# 📄 License

This project is intended for educational and development purposes.

Add your preferred license here, such as the **MIT License**, if applicable.

---

## 🐰 Built for developers who love to code

**Code Bunny** 🥕
*Code. Learn. Debug. Repeat.*
