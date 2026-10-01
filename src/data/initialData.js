// Initial mock data simulating MongoDB collections with Mongoose ObjectId relationships
export const initialUsers = [
  {
    _id: "u_instructor_1",
    name: "Mai Yousri",
    email: "mai@example.com",
    role: "instructor",
    createdAt: "2026-09-15T10:00:00Z"
  },
  {
    _id: "u_instructor_2",
    name: "Dr. Tarek Omar",
    email: "tarek@example.com",
    role: "instructor",
    createdAt: "2026-09-18T11:00:00Z"
  },
  {
    _id: "u_student_1",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    role: "student",
    createdAt: "2026-09-20T12:00:00Z"
  },
  {
    _id: "u_student_2",
    name: "Sara Mahmoud",
    email: "sara@example.com",
    role: "student",
    createdAt: "2026-09-22T14:30:00Z"
  }
];

export const initialCourses = [
  {
    _id: "c_1",
    title: "Machine Learning",
    description: "Fundamentals of supervised and unsupervised learning, regression, classification algorithms, and model evaluation techniques.",
    category: "Artificial Intelligence",
    instructor: "u_instructor_1",
    createdAt: "2026-09-25T09:00:00Z"
  },
  {
    _id: "c_2",
    title: "Deep Learning",
    description: "Multi-layer neural networks, backpropagation, activation functions, convolutional neural networks (CNNs), and deep architectures.",
    category: "Artificial Intelligence",
    instructor: "u_instructor_1",
    createdAt: "2026-09-26T10:30:00Z"
  },
  {
    _id: "c_3",
    title: "Creative Thinking",
    description: "Creative problem-solving methodologies, lateral thinking, ideation techniques, and frameworks to innovate and create unique solutions.",
    category: "General Skills",
    instructor: "u_instructor_2",
    createdAt: "2026-09-27T11:15:00Z"
  },
  {
    _id: "c_4",
    title: "Math 0",
    description: "Foundational mathematics covering algebraic operations, equations, functions, coordinate systems, and essential trigonometry.",
    category: "Mathematics",
    instructor: "u_instructor_2",
    createdAt: "2026-09-28T13:45:00Z"
  },
  {
    _id: "c_5",
    title: "Math 1",
    description: "Differential calculus: understanding limits, continuity, rate of change, derivatives, and their real-world scientific applications.",
    category: "Mathematics",
    instructor: "u_instructor_1",
    createdAt: "2026-09-29T15:20:00Z"
  },
  {
    _id: "c_6",
    title: "Math 3",
    description: "Multivariable calculus and vector analysis, partial derivatives, gradients, double and triple integrals, and vector fields.",
    category: "Mathematics",
    instructor: "u_instructor_2",
    createdAt: "2026-09-30T10:00:00Z"
  },
  {
    _id: "c_7",
    title: "Data Science",
    description: "Comprehensive data science workflow: data collection, cleaning with Pandas, exploratory statistical analysis, and interactive visualizations.",
    category: "Data Science",
    instructor: "u_instructor_1",
    createdAt: "2026-10-01T08:00:00Z"
  }
];

export const initialLessons = [
  // Machine Learning lessons
  {
    _id: "l_101",
    title: "1. Introduction to Machine Learning",
    content: "Machine learning focuses on building algorithms that learn patterns from training data.\n\nKey Concepts:\n- Supervised vs. Unsupervised vs. Reinforcement Learning\n- Training, validation, and test datasets\n- Features, labels, and target variables.",
    course: "c_1",
    order: 1,
    createdAt: "2026-09-25T10:00:00Z"
  },
  {
    _id: "l_102",
    title: "2. Linear & Logistic Regression",
    content: "Understanding how regression models fit lines and boundary planes to continuous and categorical outputs.\n\nFormulas, cost functions (Mean Squared Error), and gradient descent.",
    course: "c_1",
    order: 2,
    createdAt: "2026-09-25T11:00:00Z"
  },

  // Deep Learning lessons
  {
    _id: "l_201",
    title: "1. Neural Networks & Perceptrons",
    content: "Anatomy of an artificial neuron: inputs, weights, bias, activation functions (ReLU, Sigmoid), and forward propagation.",
    course: "c_2",
    order: 1,
    createdAt: "2026-09-26T11:00:00Z"
  },
  {
    _id: "l_202",
    title: "2. Backpropagation & Optimization",
    content: "Calculating loss gradients using the chain rule and updating weights via Adam and SGD optimizers.",
    course: "c_2",
    order: 2,
    createdAt: "2026-09-26T12:00:00Z"
  },

  // Creative Thinking
  {
    _id: "l_301",
    title: "1. Divergent vs. Convergent Thinking",
    content: "How to generate a wide array of novel solutions before narrowing down to the most viable ideas.",
    course: "c_3",
    order: 1,
    createdAt: "2026-09-27T12:00:00Z"
  },

  // Math 0
  {
    _id: "l_401",
    title: "1. Algebra Essentials & Functions",
    content: "Domain and range of functions, factoring polynomials, solving systems of linear equations.",
    course: "c_4",
    order: 1,
    createdAt: "2026-09-28T14:00:00Z"
  },

  // Math 1
  {
    _id: "l_501",
    title: "1. Limits and Continuity",
    content: "Formal epsilon-delta definition, computing one-sided limits, and identifying continuous functions.",
    course: "c_5",
    order: 1,
    createdAt: "2026-09-29T16:00:00Z"
  },

  // Math 3
  {
    _id: "l_601",
    title: "1. Partial Derivatives and Gradients",
    content: "Differentiating functions of multiple variables f(x, y, z) with respect to one variable while holding others constant.",
    course: "c_6",
    order: 1,
    createdAt: "2026-09-30T11:00:00Z"
  },

  // Data Science
  {
    _id: "l_701",
    title: "1. Data Cleaning & Exploratory Analysis",
    content: "Handling missing values, outlier detection, statistical summaries, and plotting correlation heatmaps.",
    course: "c_7",
    order: 1,
    createdAt: "2026-10-01T09:00:00Z"
  }
];

export const initialEnrollments = [
  {
    _id: "e_1",
    student: "u_student_1",
    course: "c_1",
    enrolledAt: "2026-09-26T14:00:00Z"
  },
  {
    _id: "e_2",
    student: "u_student_1",
    course: "c_7",
    enrolledAt: "2026-09-27T15:00:00Z"
  },
  {
    _id: "e_3",
    student: "u_student_2",
    course: "c_1",
    enrolledAt: "2026-09-28T16:00:00Z"
  },
  {
    _id: "e_4",
    student: "u_student_2",
    course: "c_4",
    enrolledAt: "2026-09-29T10:00:00Z"
  }
];

export const initialComments = [
  {
    _id: "comm_1",
    user: "u_student_1",
    lesson: "l_101",
    text: "Very clear introduction to machine learning concepts!",
    createdAt: "2026-09-26T15:30:00Z"
  },
  {
    _id: "comm_2",
    user: "u_instructor_1",
    lesson: "l_101",
    text: "Glad you found it helpful Ahmed! Lesson 2 covers practical regressions.",
    createdAt: "2026-09-26T16:00:00Z"
  }
];
