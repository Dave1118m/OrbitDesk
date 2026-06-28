# OrbitDesk

OrbitDesk is an NGO-focused project and financial management platform.

## Structure

- `src/Backend/OrbitDesk.Api` - ASP.NET Core 10 Web API
- `src/Frontend` - React + TypeScript frontend

## Setup

Backend:
```powershell
cd src\Backend\OrbitDesk.Api
dotnet restore
dotnet run
```

Frontend:
```powershell
cd src\Frontend
npm install
npm run dev
```

## Notes

- The solution is `OrbitDesk.sln`
- Frontend is scaffolded with Vite + React + TypeScript
