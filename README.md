# Simple Pastebin

A lightweight Pastebin-like web application to create and share text or code snippets with optional expiration time and view limits.

---

## Features

- Create and share text snippets instantly  
- Optional expiration time (TTL)  
- Optional maximum view limit  
- Auto-delete expired or over-viewed pastes  
- Copy paste URL with one click  
- Clean and responsive UI  
- REST API support  

---

## Tech Stack

- HTML, CSS, JavaScript  
- Node.js, Express.js  
- MongoDB (Mongoose)  
- NanoID  
- Helmet, CORS  
- Deployed on Vercel  

---
API Endpoints

- POST /api/pastes – Create a paste

- GET /api/pastes/:id – Fetch paste data

- GET /p/:id – View paste in browser

- GET /api/healthz – Health check

Notes

-Pastes expire automatically based on time or view limits

-Built for learning, backend practice, and clean architecture
