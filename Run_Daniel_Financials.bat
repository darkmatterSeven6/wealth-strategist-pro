@echo off
set USER_TENANT=danilo
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm start"
