@echo off
set USER_TENANT=wife
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm start"
