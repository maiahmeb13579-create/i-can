// Contains the full, clean JavaScript files for the academic submission
export const backendCodeFiles = [
  {
    path: "backend/server.js",
    title: "server.js (Express Application Entry Point)",
    description: "Configures Express, connects to MongoDB, mounts JSON parser, CORS, routes, and centralized error middleware.",
    code: `const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB database
connectDB();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/my-courses', require('./routes/enrollmentRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Welcome & health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Online Course Platform API is running'
  });
});

// Centralized error handling middleware (must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running in \${process.env.NODE_ENV || 'development'} mode on port \${PORT}\`);
});`
  },
  {
    path: "backend/config/db.js",
    title: "config/db.js (MongoDB Connection)",
    description: "Establishes connection to MongoDB using Mongoose.",
    code: `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Database Connection Error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;`
  },
  {
    path: "backend/models/User.js",
    title: "models/User.js (User Model)",
    description: "User schema supporting 'instructor' and 'student' roles with bcrypt password hashing.",
    code: `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6
    },
    role: {
      type: String,
      enum: ['student', 'instructor'],
      default: 'student'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password on login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);`
  },
  {
    path: "backend/models/Course.js",
    title: "models/Course.js (Course Model)",
    description: "Course schema referencing instructor via ObjectId.",
    code: `const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      trim: true
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Course', courseSchema);`
  },
  {
    path: "backend/models/Lesson.js",
    title: "models/Lesson.js (Lesson Model)",
    description: "Lesson schema with text content, order index, and Course reference.",
    code: `const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Lesson content is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
      min: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Lesson', lessonSchema);`
  },
  {
    path: "backend/models/Enrollment.js",
    title: "models/Enrollment.js (Enrollment Model)",
    description: "Links student to course with a compound unique index to prevent duplicate enrollments.",
    code: `const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Prevent duplicate enrollments for the same student and course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);`
  },
  {
    path: "backend/models/Comment.js",
    title: "models/Comment.js (Comment Model)",
    description: "User feedback on lessons, referencing both User and Lesson.",
    code: `const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comment', commentSchema);`
  },
  {
    path: "backend/middleware/authMiddleware.js",
    title: "middleware/authMiddleware.js (JWT & Role Authorization)",
    description: "Verifies JWT tokens and verifies role permissions (instructor or student).",
    code: `const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes: verifies Bearer token in headers
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Authorize roles: ensures current user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: \`User role '\${req.user.role}' is not authorized to access this route\`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };`
  },
  {
    path: "backend/middleware/errorMiddleware.js",
    title: "middleware/errorMiddleware.js (Centralized Error Handler)",
    description: "Catches CastErrors (invalid ObjectIds), duplicate keys, validation errors, and server errors.",
    code: `const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error in console for debugging
  console.error(err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = 'Resource not found with specified ID format';
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const message = 'Duplicate field value entered (already exists)';
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Default server error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;`
  },
  {
    path: "backend/postman_collection.json",
    title: "postman_collection.json (Full API Test Collection)",
    description: "Ready-to-import Postman collection testing all routes.",
    code: JSON.stringify({
      info: {
        name: "Online Course Platform API",
        description: "Full suite of REST API endpoints for individual student evaluation",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        {
          name: "Auth - Register Instructor",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ name: "Mai Yousri", email: "mai@example.com", password: "password123", role: "instructor" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/auth/register", host: ["{{baseUrl}}"], path: ["api", "auth", "register"] }
          }
        },
        {
          name: "Auth - Login",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ email: "mai@example.com", password: "password123" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] }
          }
        },
        {
          name: "Courses - Get All (Search & Pagination)",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/api/courses?search=node&category=Programming&page=1&limit=10", host: ["{{baseUrl}}"], path: ["api", "courses"] }
          }
        },
        {
          name: "Courses - Create Course (Instructor only)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{token}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ title: "Node.js Basics", description: "Learn Node and Express", category: "Programming" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/courses", host: ["{{baseUrl}}"], path: ["api", "courses"] }
          }
        },
        {
          name: "Enrollment - Enroll in Course (Student only)",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{studentToken}}" }],
            url: { raw: "{{baseUrl}}/api/courses/{{courseId}}/enroll", host: ["{{baseUrl}}"], path: ["api", "courses", "{{courseId}}", "enroll"] }
          }
        }
      ]
    }, null, 2)
  },
  {
    path: "backend/README.md",
    title: "README.md (Academic Project Documentation)",
    description: "Detailed documentation for installation, environment setup, and architecture.",
    code: `# Online Course Platform

A beginner-friendly, clean Full-Stack JavaScript web application built with Node.js, Express, MongoDB, Mongoose, JWT, and React.

## Features
- **Two User Roles**: Student and Instructor.
- **Instructors**: Create, edit, and delete their own courses; add, update, and remove lessons.
- **Students**: Search, filter, and paginate courses; enroll in courses; view enrolled courses; comment on lessons.
- **Security**: Password hashing with bcrypt, JWT authentication, role-based authorization middleware.
- **Clean Validation**: Express-validator on input payloads.
- **Centralized Error Handling**: Unified JSON responses for all error types.

## Tech Stack
- Frontend: React (JavaScript / JSX), Axios, Tailwind CSS
- Backend: Node.js, Express.js (JavaScript only)
- Database: MongoDB & Mongoose ODM
- Auth: JSON Web Tokens (JWT), bcryptjs

## Installation & Setup

1. Clone or extract the project.
2. Install backend dependencies:
   \`\`\`bash
   cd backend
   npm install
   \`\`\`
3. Create a \`.env\` file in \`backend/\` with:
   \`\`\`env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/course_platform
   JWT_SECRET=super_secret_jwt_key_123
   \`\`\`
4. Run the backend:
   \`\`\`bash
   npm run dev
   \`\`\`
`
  }
];
