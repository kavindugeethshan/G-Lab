# G-Lab

A modern full-stack e-commerce web application for browsing, managing, and purchasing computer parts online.

G-Lab has evolved from a traditional HTML, CSS and JavaScript frontend into a React-based frontend architecture, while maintaining a Node.js and Express.js backend.

## Features

* User Registration & Login
* JWT-based Authentication
* Email Verification
* Password Reset
* Browse Computer Parts
* Search Products
* Product Filtering
* Shopping Cart
* Product Reviews
* Secure Checkout
* PayHere Payment Integration
* Admin Dashboard
* Product Management
* User Management
* Order Management
* Firebase Image Storage
* MongoDB Database
* Responsive React Interface
* Real-time updates using Socket.IO

## Tech Stack

### Frontend

* React
* JavaScript
* CSS
* React Components
* Responsive UI

### Backend

* Node.js
* Express.js
* REST API
* Socket.IO

### Database

* MongoDB
* MongoDB Atlas

### Authentication & Security

* JSON Web Token (JWT)
* bcrypt
* Environment Variables
* Authentication Middleware
* Admin Authorization Middleware
* Server-side Validation
* Rate Limiting

### Storage

* Firebase Storage

### Payment

* PayHere Payment Gateway
* PayHere Sandbox for testing

### DevOps & Deployment

* Docker
* Git
* GitHub
* GitHub Container Registry
* GitHub Actions
* Linux
* Nginx
* Prometheus
* Grafana

### Hosting

* Render

## Frontend Migration

G-Lab originally used a traditional HTML, CSS and JavaScript frontend.

The frontend has now been migrated to React to provide a more maintainable component-based architecture.

### Previous Frontend

```text
HTML
CSS
JavaScript
Static Pages
```

### Current Frontend

```text
React
 |
 ├── Components
 ├── Layouts
 ├── Pages
 ├── Reusable UI
 └── Application State
```

The migration separates the frontend into reusable React components and pages while continuing to communicate with the existing Node.js and Express.js REST API.

This makes the frontend easier to maintain, extend and integrate with future features.

## System Architecture

```text
                        User
                          |
                          v
                   React Frontend
                          |
                          | REST API
                          v
                   Node.js Backend
                   Express.js API
                          |
            +-------------+-------------+
            |             |             |
            v             v             v
      MongoDB Atlas   Firebase      PayHere
                      Storage       Payment
            |
            v
          Data
```

## DevOps Architecture

G-Lab is also being used as a DevOps and cloud-native home lab project.

The deployment workflow is designed around containerization, CI/CD and Linux-based monitoring.

```text
Developer
   |
   | git push
   v
GitHub Repository
   |
   v
GitHub Actions
   |
   v
Self-hosted Linux Runner
   |
   v
Docker Build
   |
   v
GitHub Container Registry
   |
   v
Linux Server
   |
   +----------------------+
   |                      |
   v                      v
Frontend Container    Backend Container
   |                      |
   +----------+-----------+
              |
              v
       MongoDB Atlas
              |
              v
          Firebase
              |
              v
           PayHere
```

## Monitoring

The Linux deployment environment uses monitoring and observability tools.

```text
Linux Server
    |
    +---- node_exporter
    |
    v
Prometheus
    |
    v
Grafana
```

Prometheus collects system metrics and Grafana is used to visualize the collected metrics through dashboards.

Future observability improvements may include deeper application-level tracing and Linux-level observability technologies.

## Project Structure

```text
G-Lab/
│
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routers/
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
├── frontend-react/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   └── ...
│   └── ...
│
├── .github/
│   └── workflows/
│
├── Dockerfile
├── frontend-react/
│   └── Dockerfile
│
├── .dockerignore
├── package.json
└── README.md
```

## Authentication

The application uses JWT-based authentication.

The authentication flow is:

```text
User
 |
 v
Login
 |
 v
Backend verifies credentials
 |
 v
JWT Token generated
 |
 v
React Frontend
 |
 v
Protected API Request
 |
 v
Authentication Middleware
 |
 v
Protected API Route
```

Passwords are securely hashed using bcrypt before being stored in the database.

Admin-only operations are protected using authorization middleware.

## Product Management

Administrators can manage products through the admin functionality.

Supported operations include:

* Create products
* View products
* Update products
* Delete products
* Manage product information
* Upload product images

Product images are stored using Firebase Storage, while product information is stored in MongoDB.

## Payment Integration

G-Lab integrates the PayHere payment gateway for online payments.

### PayHere Sandbox

The PayHere Sandbox environment is used for testing the payment flow during development.

For local development, a tunneling service can be used to expose the payment notification endpoint to PayHere because PayHere requires a publicly accessible `notify_url`.

### Production Payment

Production payment integration requires a publicly accessible backend and HTTPS endpoint for receiving payment notifications from PayHere.

The payment flow is:

```text
Customer
   |
   v
Checkout
   |
   v
G-Lab Backend
   |
   v
PayHere
   |
   v
Payment Processing
   |
   v
notify_url
   |
   v
G-Lab Backend
   |
   v
Payment Status Updated
```

> Note: PayHere Sandbox is used for testing. Production payments require the appropriate PayHere production configuration and a publicly accessible HTTPS endpoint.

## Database

MongoDB Atlas is used as the application's cloud database.

The database stores information such as:

* Users
* Products
* Reviews
* Orders
* Payments

## Image Storage

Firebase Storage is used to store product images.

The application stores the image in Firebase Storage and saves the corresponding image URL with the product information in MongoDB.

## Deployment

G-Lab can be deployed using containerized services.

The application has separate frontend and backend Docker configurations.

```text
GitHub
   |
   v
GitHub Actions
   |
   v
Docker Build
   |
   v
GitHub Container Registry
   |
   v
Linux Server
   |
   +---- Frontend Container
   |
   +---- Backend Container
```

Render has also been used for application deployment and testing.

## Container Images

G-Lab container images are published through GitHub Container Registry.

GHCR Package:

https://github.com/kavindugeethshan/G-Lab/pkgs/container/g-lab

## Environment Variables

The application uses environment variables for sensitive configuration.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
```

Never commit real secrets or `.env` files to the repository.

## Installation

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git
* Docker

### 1. Clone the Repository

```bash
git clone https://github.com/kavindugeethshan/G-Lab.git
```

### 2. Navigate to the Project

```bash
cd G-Lab
```

### 3. Install Dependencies

Install the required Node.js dependencies:

```bash
npm install
```

Major dependencies include:

* Express.js
* Mongoose
* bcrypt
* JSON Web Token
* Socket.IO
* dotenv
* CORS
* Firebase
* Nodemailer
* Nodemon

### 4. Configure Environment Variables

Create the required `.env` configuration for the backend.

### 5. Start the Backend

For production:

```bash
npm start
```

For development:

```bash
npm run dev
```

The backend API runs on:

```text
http://localhost:3001
```

## API

The G-Lab backend provides RESTful API endpoints for:

* Authentication
* Users
* Products
* Cart
* Orders
* Reviews
* Payments
* Admin operations

### Base URL

```text
http://localhost:3001
```

Protected endpoints require a JWT token:

```text
Authorization: Bearer <JWT_TOKEN>
```

The APIs can be tested using Postman.

## Authentication Endpoints

### Create User

```text
POST /users/create
```

Example request body:

```json
{
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "password": "your_password"
}
```

### Login User

```text
POST /users/login
```

Example request body:

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

## Product Endpoints

### Get All Products

```text
GET /products
```

### Search Products

```text
GET /products?search=gaming
```

### Filter Products

```text
GET /products?category=phone
```

### Filter by Category, Brand and Price

```text
GET /products?category=GPU&brand=ASUS&minPrice=50000&maxPrice=110000
```

### Pagination and Price Sorting

```text
GET /products?page=1&limit=10&sort=price_asc
```

### Get Product by ID

```text
GET /products/<PRODUCT_ID>
```

### Create Product

```text
POST /admin/products/create
```

Admin token required.

### Update Product

```text
PUT /products/update/<PRODUCT_ID>
```

Admin token required.

### Delete Product

```text
DELETE /products/delete/<PRODUCT_ID>
```

Admin token required.

## User Endpoints

### Add Address

```text
PUT /users/address
```

Authentication required.

### Get Profile

```text
GET /users/profile
```

Authentication required.

### Update Profile

```text
PUT /users/profile
```

Authentication required.

### Change Password

```text
PUT /users/change-password
```

Authentication required.

## Cart Endpoints

### Add Product to Cart

```text
POST /cart/add
```

Authentication required.

### Get Cart

```text
GET /cart
```

Authentication required.

## Order Endpoints

### Create Order

```text
POST /order
```

Authentication required.

### Get My Orders

```text
GET /order/my-orders
```

Authentication required.

### Get Order by ID

```text
GET /order/<ORDER_ID>
```

Authentication required.

### Cancel Order

```text
PATCH /order/orders/<ORDER_ID>/cancel
```

Authentication required.

## Review Endpoints

### Add Product Review

```text
POST /products/<PRODUCT_ID>/reviews
```

Authentication required.

Example:

```json
{
  "rating": 5,
  "comment": "Great product!"
}
```

### Update Own Review

```text
PUT /reviews/<REVIEW_ID>
```

Authentication required.

### Delete Own Review

```text
DELETE /reviews/<REVIEW_ID>
```

Authentication required.

## Admin Endpoints

### Admin Dashboard

```text
GET /admin/dashboard
```

Admin token required.

### Get All Users

```text
GET /admin/users
```

Admin token required.

### Get User Details

```text
GET /admin/users/<USER_ID>
```

Admin token required.

### Block User

```text
PATCH /admin/users/<USER_ID>/block
```

Admin token required.

### Unblock User

```text
PATCH /admin/users/<USER_ID>/unblock
```

Admin token required.

### Get All Reviews

```text
GET /admin/reviews
```

Admin token required.

### Delete Review

```text
DELETE /admin/reviews/<REVIEW_ID>
```

Admin token required.

### Get Admin Statistics

```text
GET /admin/statistics
```

Admin token required.

## Admin Order Management

### Get All Orders

```text
GET /admin/orders
```

Admin token required.

### Get Order by ID

```text
GET /admin/orders/<ORDER_ID>
```

Admin token required.

### Search Orders by Order ID

```text
GET /admin/orders/search?orderId=<ORDER_ID>
```

Admin token required.

### Search Orders by User ID

```text
GET /admin/orders/search?userId=<USER_ID>
```

Admin token required.

### Search Orders by Email

```text
GET /admin/orders/search?email=user@example.com
```

Admin token required.

### Filter Orders by Status

```text
GET /admin/orders/filter?status=Pending
```

Admin token required.

### Update Order Status

```text
PATCH /admin/orders/<ORDER_ID>/status
```

Admin token required.

Example:

```json
{
  "status": "Confirmed"
}
```

## Postman Testing

The API can be tested locally using Postman.

For protected endpoints:

1. Login and obtain the JWT token.
2. Open the required request in Postman.
3. Go to Authorization.
4. Select Bearer Token.
5. Enter the JWT token.
6. Send the request.

```text
Bearer <JWT_TOKEN>
```

## Security

The application implements several security mechanisms:

* Password hashing with bcrypt
* JWT authentication
* Protected routes
* Admin authorization
* Environment-based secrets
* Server-side validation
* CORS configuration
* Authentication rate limiting
* Secure OTP generation
* Protected payment validation

## DevOps Goals

The G-Lab project is also being developed as a practical DevOps home lab.

Current and planned areas include:

* Docker containerization
* GitHub Actions CI/CD
* Self-hosted Linux runner
* GitHub Container Registry
* Linux server deployment
* Nginx
* Prometheus
* Grafana
* Container monitoring
* Automated security checks
* Automated deployment

## Future Improvements

Possible future improvements include:

* Kubernetes deployment
* OpenTelemetry integration
* eBPF-based observability
* Automated testing
* Advanced application logging
* Redis caching
* AWS cloud deployment
* Improved CI/CD automation
* Kubernetes monitoring

## Current Version

**v1.0.2**

The project includes the React frontend migration, security improvements, authentication fixes, admin functionality improvements and responsive UI improvements.

## Author

**Kavindu Geethshan**

Bachelor of Information Technology (BIT)

University of Colombo School of Computing

GitHub:

https://github.com/kavindugeethshan

## License

This project is developed for educational and portfolio purposes.
