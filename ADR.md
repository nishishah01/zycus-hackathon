# ADR

## Run the project

### 1) Backend (Spring Boot)

Open a terminal in the backend project folder:

```bash
cd backend/stockpulse
```

Start the app:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell, if needed:

```powershell
cd backend/stockpulse
./mvnw.cmd spring-boot:run
```

The backend should start on:

```text
http://localhost:8080
```

### 2) Frontend (React Native / React Native Web)

Open a second terminal in the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

### 3) Environment variables

If the backend uses Gemini API access, set the key before starting Spring Boot:

Windows PowerShell:

```powershell
$env:GEMINI_API_KEY = "your_api_key_here"
```

Windows Command Prompt:

```cmd
set GEMINI_API_KEY=your_api_key_here
```

### 4) Common startup order

1. Start backend
2. Start frontend
3. Open the frontend URL in the browser
4. Use the app and verify API calls are reaching the backend

### 5) Notes

- Backend: Java + Spring Boot
- Frontend: React + Vite, with React Native Web support
- The frontend and backend are meant to run together in separate terminals

