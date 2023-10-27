# Bloggo - A Blogging API with Node.js, Express, and MongoDB

![Bloggo Logo](https://)

Bloggo is a powerful blogging API that allows users to create, manage, and read blogs seamlessly. It is built using Node.js, Express, and MongoDB, providing a robust and efficient platform for bloggers and readers.

## Table of Contents

- Features
- Requirements
- Getting Started
    - Installation
    - Usage
- API Endpoints
- Authentication
- Database Models
- Testing
- Contributing
- License

## Features

- User registration and authentication with JWT token
- Create, edit, and delete blogs
- Publish and draft states for blogs
- Pagination and filtering for blog lists
- Order blogs by various criteria
- Real-time read count update
- Calculate reading time for each blog
- View user information with blogs

## Requirements
To run Bloggo, you'll need the following dependencies:

- bcrypt: ^5.1.1
- connect-mongo: ^5.1.0
- cookie-parser: ^1.4.6
- dotenv: ^16.3.1
- ejs: ^3.1.9
- express: ^4.18.2
- express-ejs-layouts: ^2.5.1
- express-session: ^1.17.3
- jsonwebtoken: ^9.0.2
- method-override: ^3.0.0
- mongoose: ^7.6.3

## Getting Started
### Installation

1. Clone the Bloggo repository:
    git clone https://github.com/yourusername/Bloggo.git

2. Install the project dependencies:
    cd Bloggo
    npm install

### Installation

1. Set up your environment variables by creating a .env file and defining the following:

    PORT=4000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret

2. Start the application:
    npm start

3. You can access the Bloggo API at http://localhost:4000.

## API Endpoints

- `GET /` Get a list of blogs (publicly accessible).
- `GET /api/post/:id:` Get a specific blog (publicly accessible).
- `POST /api/add-post:` Create a new blog (requires authentication).
- `PUT /api/edit-post/:id:` Update a blog (requires authentication).
- `DELETE /api/delete-post/:id:` Delete a blog (requires authentication).
- `GET /api/admin/dashboard:` Get a list of user's blogs (requires authentication).
- `GET /api/admin/drafts:` Get a list of user's unpublished (draft) blogs (requires authentication).
- `GET /api/admin/published:` Get a list of user's published blogs (requires authentication).
- `POST /api/register` Create a new User.
- `POST /api/search:` Search for a blog post
- `GET /api/logout:` Log out of the blogging application.

## Authentication
Bloggo uses JWT (JSON Web Token) for authentication. Tokens expire after 1 hour for security.

## Database Models
![ERD](https://github.com/)

### User

- `email` (required, unique)
- `first_name` (required)
- `last_name` (required)
- `username` (required, unique)
- `password`

### Blog/Article

- `title` (required, unique)
- `description`
- `author`
- `state` (draft or published)
- `read_count`
- `reading_time`
- `tags`
- `body` (required)
- `timestamp`

## Testing
To run tests for the Bloggo project, use the following command:
    npm test

## License
This project is licensed under the MIT License.
