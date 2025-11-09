# Admin Panel Backend API Documentation

## Overview
This is the backend API for the Admin Panel Web Application. It provides endpoints for managing users, authentication, and administrative tasks.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository
```bash
git clone <repository-url>
cd Backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with:
```
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```

4. Start the server
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/login`
    - Login for users
    - Body: `{ email, password }`

- POST `/api/auth/register`
    - Register new users
    - Body: `{ name, email, password }`

### Users
- GET `/api/users`
    - Get all users (Admin only)
    - Headers: `Authorization: Bearer <token>`

- PUT `/api/users/:id`
    - Update user
    - Headers: `Authorization: Bearer <token>`
    - Body: `{ name, email, role }`

- DELETE `/api/users/:id`
    - Delete user
    - Headers: `Authorization: Bearer <token>`

## Error Handling
All endpoints return standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License.