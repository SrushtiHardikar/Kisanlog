# KisanLog 🌾

**A comprehensive farm expense tracking and profitability analysis system for Indian farmers**

KisanLog helps farmers track their agricultural expenses and yields across different crops and seasons (Kharif, Rabi, Zaid), providing detailed profitability analysis and insights to optimize farm operations.

--- 

##  Features

- **Expense Management**: Track farm expenses across categories (Seeds, Fertilizers, Pesticides, Labor, Machinery, Fuel, Irrigation)
- **Yield Tracking**: Record harvest yields with quantity, unit pricing, and revenue calculation
- **Seasonal Analysis**: Organize data by agricultural seasons (Kharif 🌧️, Rabi ❄️, Zaid ☀️)
- **Profitability Analysis**: Automated calculation of expenses, revenue, net profit, and profit margins per crop
- **Visual Analytics**: Interactive charts for crop comparison and trend analysis
- **Export Options**: Download reports as PDF or CSV for offline analysis
- **Secure Authentication**: JWT-based authentication with httpOnly cookies
- **Responsive Design**: Works seamlessly on desktop and mobile devices

---

##  Table of Contents

- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

##  Technology Stack

### Backend
- **Runtime**: Node.js v14+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Middleware**: CORS, cookie-parser

### Frontend
- **Core**: HTML5, CSS3, Vanilla JavaScript
- **Charting**: Chart.js
- **PDF Generation**: jsPDF with jsPDF-AutoTable
- **Icons**: Font Awesome 6.4.0

---

##  Project Architecture

### High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │ ◄────► │   Express   │ ◄────► │   MongoDB   │
│  (Frontend) │  HTTP   │   Server    │  ODM    │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌───────────┐
                        │    JWT    │
                        │   Auth    │
                        └───────────┘
```

### Three-Tier Architecture

1. **Presentation Layer** (Frontend)
   - Static HTML/CSS/JS files
   - Client-side form validation
   - Dynamic UI updates
   - Chart rendering

2. **Application Layer** (Backend)
   - RESTful API endpoints
   - Business logic
   - Authentication & authorization
   - Input validation

3. **Data Layer** (Database)
   - MongoDB collections
   - Data persistence
   - Indexing for performance

### Component Breakdown

#### Frontend Components
- **Authentication Module**: Login, Registration, Session Management
- **Dashboard Module**: Main interface, tab navigation, overview cards
- **Expense Module**: Add, edit, delete, view expenses
- **Yield Module**: Add, edit, delete, view yields
- **Analysis Module**: Profitability calculations, data aggregation
- **Graphs Module**: Chart.js visualizations
- **Shared Utilities**: API calls, data loading, storage

#### Backend Components
- **Models**: Mongoose schemas (User, Expense, Yield)
- **Routes**: API endpoint handlers (auth, expenses, yields)
- **Middleware**: JWT authentication, error handling
- **Server**: Express app configuration, CORS, MongoDB connection

---

##  Installation

### Prerequisites

- **Node.js**: v14.0.0 or higher
- **MongoDB**: v4.0 or higher (local or Atlas)
- **npm**: v6.0.0 or higher

### Step 1: Clone the Repository

```bash
git clone https://github.com/Adinath-j/KisanLogWBackend.git
cd KisanLog
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory:
one is already there for local environment

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kisanlog
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Important**: Replace `JWT_SECRET` with a strong, random secret key in production.

### Step 4: Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
Update `MONGO_URI` in `.env` with your Atlas connection string.

### Step 5: Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

The frontend is served from the `frontend` directory automatically.

---

##  Configuration

### Database Configuration

**MongoDB Connection** (`backend/server.js`):
```javascript
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

### JWT Configuration

**Token Expiration** (`backend/routes/auth.js`):
```javascript
const token = jwt.sign(
  { userId: user._id }, 
  process.env.JWT_SECRET, 
  { expiresIn: '7d' }
);
```

### CORS Configuration

**Allowed Origins** (`backend/server.js`):
```javascript
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
```

---

##  Usage

### User Registration

1. Navigate to the homepage
2. Click "Get Started"
3. Fill in registration form:
   - Full Name
   - Email
   - Mobile Number
   - Location
   - Password
4. Click "Register"

### Adding Expenses

1. Login to dashboard
2. Navigate to "Expenses" tab
3. Click "➕ Add Expense"
4. Fill in details:
   - Date
   - Crop Name
   - Category
   - Season (optional)
   - Description
   - Amount
5. Click "Add Expense"

### Recording Yields

1. Navigate to "Yields" tab
2. Click "➕ Add Yield"
3. Fill in details:
   - Date
   - Crop Name
   - Season (optional)
   - Quantity & Unit
   - Price per Unit
4. Click "Add Yield"

### Viewing Analysis

1. Navigate to "Analysis" tab
2. View profitability metrics per crop:
   - Total Expenses
   - Total Revenue
   - Net Profit
   - Profit Margin %
3. Export as PDF for detailed reports

### Visualizing Data

1. Navigate to "Graphs" tab
2. View interactive charts:
   - Expense breakdown by category
   - Crop comparison (expenses vs revenue)
   - Trend analysis

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "location": "Mumbai",
  "password": "securePassword123"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /auth/me
Cookie: token=<jwt_token>
```

#### Logout
```http
POST /auth/logout
```

### Expense Endpoints

#### Get All Expenses
```http
GET /expenses
Cookie: token=<jwt_token>
```

#### Create Expense
```http
POST /expenses
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "crop": "Wheat",
  "category": "Seeds",
  "season": "Rabi",
  "description": "Premium wheat seeds",
  "amount": 5000
}
```

#### Update Expense
```http
PUT /expenses/:id
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "amount": 5500
}
```

#### Delete Expense
```http
DELETE /expenses/:id
Cookie: token=<jwt_token>
```

### Yield Endpoints

#### Get All Yields
```http
GET /yields
Cookie: token=<jwt_token>
```

#### Create Yield
```http
POST /yields
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "date": "2024-03-20",
  "crop": "Wheat",
  "season": "Rabi",
  "quantity": 2000,
  "unit": "kg",
  "pricePerUnit": 25
}
```

#### Update Yield
```http
PUT /yields/:id
Cookie: token=<jwt_token>
```

#### Delete Yield
```http
DELETE /yields/:id
Cookie: token=<jwt_token>
```

---

##  Project Structure

```
KisanLog/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema with authentication
│   │   ├── Expense.js        # Expense schema with validation
│   │   └── Yield.js          # Yield schema with auto-calculation
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── expenses.js       # Expense CRUD routes
│   │   └── yields.js         # Yield CRUD routes
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── .env                  # Environment variables
│   ├── server.js             # Express server setup
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── auth.css      # Authentication page styles
│   │   │   ├── index.css     # Landing page styles
│   │   │   └── style.css     # Dashboard styles
│   │   └── js/
│   │       ├── analysis.js   # Profitability analysis logic
│   │       ├── auth.js       # Login/register handlers
│   │       ├── expenses.js   # Expense management
│   │       ├── graphs.js     # Chart.js visualizations
│   │       ├── index.js      # Landing page logic
│   │       ├── main.js       # Dashboard main controller
│   │       ├── shared.js     # Shared utilities & API calls
│   │       └── yields.js     # Yield management
│   ├── dashboard/
│   │   ├── index.html        # Main dashboard
│   │   ├── analysis.html     # Analysis tab content
│   │   ├── expenses.html     # Expenses tab content
│   │   ├── graphs.html       # Graphs tab content
│   │   └── yields.html       # Yields tab content
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   └── register.html         # Registration page
└── README.md
```

---

##  Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  fullName: String (required),
  email: String (required, unique, lowercase),
  mobile: String (required),
  location: String (required),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required, indexed),
  date: Date (required),
  crop: String (required),
  category: Enum (Seeds, Fertilizers, Pesticides, Labor, Machinery, Fuel, Irrigation, Other),
  season: Enum (Kharif, Rabi, Zaid, optional),
  description: String,
  amount: Number (required, min: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Yield Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required, indexed),
  date: Date (required),
  crop: String (required),
  season: Enum (Kharif, Rabi, Zaid, optional),
  quantity: Number (required, min: 0),
  unit: String (required),
  pricePerUnit: Number (required, min: 0),
  totalRevenue: Number (auto-calculated),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `User.email`: Unique index
- `Expense.user + Expense.date`: Compound index
- `Yield.user + Yield.date`: Compound index

---

##  Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **httpOnly Cookies**: Prevents XSS attacks
- **Input Validation**: Server-side validation on all endpoints
- **Ownership Verification**: Users can only access their own data
- **CORS Protection**: Strict origin policy
- **Environment Variables**: Sensitive data in .env file

---

##  Testing

### Manual Testing Checklist

- [ ] User registration with valid data
- [ ] User login with correct credentials
- [ ] Add expense record
- [ ] Edit expense record
- [ ] Delete expense record
- [ ] Add yield record
- [ ] Edit yield record
- [ ] Delete yield record
- [ ] View profitability analysis
- [ ] Generate PDF report
- [ ] Export CSV report
- [ ] View graphs and charts
- [ ] Logout functionality

---

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

##  License

This project is licensed under the MIT License.

---

##  Acknowledgments

- Chart.js for beautiful visualizations
- MongoDB for robust database solution
- Express.js for powerful backend framework
- Font Awesome for icons

---

##  Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for Indian Farmers** 🌾
