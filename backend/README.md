# Equb Backend API

Simple Node.js backend for the Equb management system using Express.js and dummy data.

## Getting Started

### Installation

```bash
cd backend
npm install
```

### Running the Server

```bash
# Development mode (auto-restarts on changes)
npm run dev

# Production mode
npm start
```

The server will start on http://localhost:3000

## API Endpoints

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get a member by ID

### Contributions
- `GET /api/contributions` - Get all contributions
- `GET /api/contributions/:id` - Get a contribution by ID

### Winners
- `GET /api/winners` - Get all past winners

### Other
- `GET /api/chart-data` - Get contribution chart data
- `GET /api/notifications` - Get notifications
- `GET /api/stats` - Get dashboard statistics

## Tech Stack
- Node.js
- Express.js
- CORS
