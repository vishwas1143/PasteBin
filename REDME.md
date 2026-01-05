# Pastebin-like Application

A controller-based pastebin application with MongoDB persistence. Users can create text pastes with optional expiration time and view limits.

## Features

- Create text pastes with optional constraints (TTL, view limits)
- Shareable URLs for each paste
- RESTful API for programmatic access
- MongoDB for persistent storage
- Automatic cleanup of expired pastes
- Test mode for deterministic expiry testing
- Responsive web interface

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **ID Generation**: NanoID
- **Security**: Helmet.js for security headers
- **Architecture**: Controller-based MVC pattern

## Prerequisites

- Node.js 14 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pastebin-app
```
