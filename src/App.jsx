import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Check,
  ChevronDown,
  BookMarked,
  Sun,
  Moon,
  LogOut,
  GraduationCap,
  UserCheck,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight
} from 'lucide-react';
import {
  initialUsers,
  initialCourses,
  initialLessons,
  initialEnrollments,
  initialComments
} from './data/initialData';

export default function App() {
  // Theme state: dark or light
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ican_theme');
    return saved ? saved === 'dark' : false;
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('ican_theme', next ? 'dark' : 'light');
  };

  // State persistence
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('ican_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('ican_courses');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.some(c => c.title === 'Machine Learning')) {
        return parsed;
      }
    }
    return initialCourses;
  });

  const [lessons, setLessons] = useState(() => {
    const saved = localStorage.getItem('ican_lessons');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.some(l => l.title.includes('Machine Learning'))) {
        return parsed;
      }
    }
    return initialLessons;
  });

  const [enrollments, setEnrollments] = useState(() => {
    const saved = localStorage.getItem('ican_enrollments');
    return saved ? JSON.parse(saved) : initialEnrollments;
  });

  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('ican_comments');
    return saved ? JSON.parse(saved) : initialComments;
  });

  // Current logged in user (null if on intro landing page, or persisted)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ican_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Views: 'intro' | 'courses' | 'course-details' | 'lesson-details' | 'my-courses' | 'my-created-courses'
  // Default to 'intro' so user lands directly on the simple intro page
  const [currentView, setCurrentView] = useState('intro');

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  // Search & Filter & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 4;

  // Account Dropdown menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Intro landing form state
  const [introAuthTab, setIntroAuthTab] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [authError, setAuthError] = useState('');

  // Course Form (Create / Edit)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({ title: '', category: 'Artificial Intelligence', description: '' });

  // Lesson Form (Create / Edit)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({ title: '', content: '', order: 1 });

  // Comments
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Feedback Notification
  const [message, setMessage] = useState(null);
  const notify = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('ican_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('ican_courses', JSON.stringify(courses));
  }, [courses]);
  useEffect(() => {
    localStorage.setItem('ican_lessons', JSON.stringify(lessons));
  }, [lessons]);
  useEffect(() => {
    localStorage.setItem('ican_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);
  useEffect(() => {
    localStorage.setItem('ican_comments', JSON.stringify(comments));
  }, [comments]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ican_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ican_current_user');
    }
  }, [currentUser]);

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(courses.map(c => c.category));
    return ['All', ...Array.from(list)];
  }, [courses]);

  // Filtered & Paginated Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [courses, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * coursesPerPage;
    return filteredCourses.slice(start, start + coursesPerPage);
  }, [filteredCourses, currentPage]);

  // Instructor-specific stats
  const instructorCourses = useMemo(() => {
    if (!currentUser || currentUser.role !== 'instructor') return [];
    return courses.filter(c => c.instructor === currentUser._id);
  }, [courses, currentUser]);

  const instructorTotalStudents = useMemo(() => {
    if (!currentUser || currentUser.role !== 'instructor') return 0;
    const courseIds = new Set(instructorCourses.map(c => c._id));
    return enrollments.filter(e => courseIds.has(e.course)).length;
  }, [instructorCourses, enrollments, currentUser]);

  const instructorTotalLessons = useMemo(() => {
    if (!currentUser || currentUser.role !== 'instructor') return 0;
    const courseIds = new Set(instructorCourses.map(c => c._id));
    return lessons.filter(l => courseIds.has(l.course)).length;
  }, [instructorCourses, lessons, currentUser]);

  // Student-specific stats
  const studentEnrollments = useMemo(() => {
    if (!currentUser || currentUser.role !== 'student') return [];
    return enrollments.filter(e => e.student === currentUser._id);
  }, [enrollments, currentUser]);

  // Active Course & Relations
  const activeCourse = useMemo(() => {
    return courses.find(c => c._id === selectedCourseId) || null;
  }, [courses, selectedCourseId]);

  const activeInstructor = useMemo(() => {
    if (!activeCourse) return null;
    return users.find(u => u._id === activeCourse.instructor);
  }, [activeCourse, users]);

  const activeLessons = useMemo(() => {
    if (!selectedCourseId) return [];
    return lessons
      .filter(l => l.course === selectedCourseId)
      .sort((a, b) => a.order - b.order);
  }, [lessons, selectedCourseId]);

  // Active Lesson & Comments
  const activeLesson = useMemo(() => {
    return lessons.find(l => l._id === selectedLessonId) || null;
  }, [lessons, selectedLessonId]);

  const activeComments = useMemo(() => {
    if (!selectedLessonId) return [];
    return comments
      .filter(c => c.lesson === selectedLessonId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [comments, selectedLessonId]);

  // Check enrollment
  const isUserEnrolled = (courseId) => {
    if (!currentUser || currentUser.role !== 'student') return false;
    return enrollments.some(
      e => e.student === currentUser._id && e.course === courseId
    );
  };

  // Switch demo user
  const handleSwitchUser = (u) => {
    setCurrentUser(u);
    setIsUserMenuOpen(false);
    notify(`Switched to ${u.name} (${u.role})`);
    if (currentView === 'intro') {
      setCurrentView('courses');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    setCurrentView('intro');
    notify('Logged out successfully.');
  };

  // Auth handler (Login / Register)
  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');

    if (introAuthTab === 'register') {
      if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password.trim()) {
        setAuthError('All fields are required');
        return;
      }
      if (authForm.password.length < 6) {
        setAuthError('Password must be at least 6 characters');
        return;
      }
      const existing = users.find(u => u.email.toLowerCase() === authForm.email.toLowerCase());
      if (existing) {
        setAuthError('An account with this email already exists');
        return;
      }
      const newUser = {
        _id: 'u_' + Date.now(),
        name: authForm.name.trim(),
        email: authForm.email.trim().toLowerCase(),
        role: authForm.role,
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setCurrentView('courses');
      notify(`Welcome to i can, ${newUser.name}! Registered as ${newUser.role}.`);
    } else {
      const user = users.find(u => u.email.toLowerCase() === authForm.email.toLowerCase());
      if (!user) {
        setAuthError('Invalid email or password');
        return;
      }
      setCurrentUser(user);
      setCurrentView('courses');
      notify(`Welcome back, ${user.name}!`);
    }
  };

  // Enroll in course
  const handleEnroll = (courseId) => {
    if (!currentUser) {
      setCurrentView('intro');
      notify('Please sign in or register to enroll', 'info');
      return;
    }
    if (currentUser.role !== 'student') {
      notify('Only students can enroll in courses', 'error');
      return;
    }
    if (isUserEnrolled(courseId)) {
      notify('You are already enrolled in this course', 'info');
      return;
    }
    const newEnrollment = {
      _id: 'e_' + Date.now(),
      student: currentUser._id,
      course: courseId,
      enrolledAt: new Date().toISOString()
    };
    setEnrollments(prev => [...prev, newEnrollment]);
    notify('Successfully enrolled in course!');
  };

  // Cancel enrollment
  const handleCancelEnrollment = (courseId) => {
    if (window.confirm('Are you sure you want to drop this course?')) {
      setEnrollments(prev => prev.filter(e => !(e.student === currentUser._id && e.course === courseId)));
      notify('Enrollment cancelled.', 'info');
    }
  };

  // Course management
  const openCourseForm = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseFormData({
        title: course.title,
        category: course.category,
        description: course.description
      });
    } else {
      setEditingCourse(null);
      setCourseFormData({ title: '', category: 'Artificial Intelligence', description: '' });
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!courseFormData.title.trim() || !courseFormData.description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    if (editingCourse) {
      setCourses(prev =>
        prev.map(c => (c._id === editingCourse._id ? { ...c, ...courseFormData } : c))
      );
      notify('Course updated successfully');
    } else {
      const newCourse = {
        _id: 'c_' + Date.now(),
        ...courseFormData,
        instructor: currentUser._id,
        createdAt: new Date().toISOString()
      };
      setCourses(prev => [newCourse, ...prev]);
      notify('Course created successfully');
      setSelectedCourseId(newCourse._id);
      setCurrentView('course-details');
    }
    setIsCourseModalOpen(false);
  };

  const handleDeleteCourse = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    if (!course) return;
    if (course.instructor !== currentUser._id) {
      notify('You can only delete your own courses', 'error');
      return;
    }
    if (window.confirm(`Delete "${course.title}"?`)) {
      setCourses(prev => prev.filter(c => c._id !== courseId));
      setLessons(prev => prev.filter(l => l.course !== courseId));
      setEnrollments(prev => prev.filter(e => e.course !== courseId));
      if (selectedCourseId === courseId) {
        setSelectedCourseId(null);
        setCurrentView('courses');
      }
      notify('Course deleted');
    }
  };

  // Lesson management
  const openLessonForm = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonFormData({
        title: lesson.title,
        content: lesson.content,
        order: lesson.order
      });
    } else {
      setEditingLesson(null);
      const nextOrder = activeLessons.length + 1;
      setLessonFormData({ title: '', content: '', order: nextOrder });
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = (e) => {
    e.preventDefault();
    if (!lessonFormData.title.trim() || !lessonFormData.content.trim()) {
      alert('Lesson title and content are required');
      return;
    }

    if (editingLesson) {
      setLessons(prev =>
        prev.map(l =>
          l._id === editingLesson._id
            ? { ...l, ...lessonFormData, order: Number(lessonFormData.order) }
            : l
        )
      );
      notify('Lesson updated');
    } else {
      const newLesson = {
        _id: 'l_' + Date.now(),
        ...lessonFormData,
        order: Number(lessonFormData.order),
        course: selectedCourseId,
        createdAt: new Date().toISOString()
      };
      setLessons(prev => [...prev, newLesson]);
      notify('Lesson added');
    }
    setIsLessonModalOpen(false);
  };

  const handleDeleteLesson = (lessonId) => {
    if (window.confirm('Delete this lesson?')) {
      setLessons(prev => prev.filter(l => l._id !== lessonId));
      setComments(prev => prev.filter(c => c.lesson !== lessonId));
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null);
        setCurrentView('course-details');
      }
      notify('Lesson deleted');
    }
  };

  // Comment actions
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    const newComment = {
      _id: 'comm_' + Date.now(),
      user: currentUser._id,
      lesson: selectedLessonId,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
    setCommentText('');
    notify('Comment posted');
  };

  const handleUpdateComment = (commentId) => {
    if (!editingCommentText.trim()) return;
    setComments(prev =>
      prev.map(c => (c._id === commentId ? { ...c, text: editingCommentText.trim() } : c))
    );
    setEditingCommentId(null);
    setEditingCommentText('');
    notify('Comment updated');
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Delete comment?')) {
      setComments(prev => prev.filter(c => c._id !== commentId));
      notify('Comment deleted');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#fcfcfd] text-slate-800'
    }`}>
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-md text-white text-xs font-medium flex items-center gap-2 ${
            message.type === 'error'
              ? 'bg-red-600'
              : message.type === 'info'
              ? 'bg-blue-600'
              : 'bg-emerald-600'
          }`}
        >
          <span>{message.text}</span>
        </div>
      )}

      {/* 
        =======================================================
        VIEW: INTRO PAGE (Simple, Clean, Login/Register Only)
        =======================================================
      */}
      {currentView === 'intro' ? (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative">
          {/* Top Right Theme Toggle */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-2.5 rounded-xl transition-all border shadow-xs ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Centered Minimalist Auth Card */}
          <div className="w-full max-w-md">
            <div className={`p-8 rounded-2xl border shadow-xl transition-all duration-200 ${
              isDark ? 'bg-slate-800/95 border-slate-700/80 shadow-slate-950/40' : 'bg-white border-slate-200/90 shadow-slate-200/50'
            }`}>
              {/* Brand Logo & Name */}
              <div className="text-center mb-7">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg shadow-sm mb-3">
                  ic
                </div>
                <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  i can<span className="text-blue-600">.</span>
                </h1>
                <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Online Course Platform
                </p>
              </div>

              {/* Tab Selector: Sign In vs Register */}
              <div className={`grid grid-cols-2 p-1 rounded-xl mb-6 border ${
                isDark ? 'bg-slate-900/80 border-slate-700/80' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIntroAuthTab('login');
                    setAuthError('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    introAuthTab === 'login'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIntroAuthTab('register');
                    setAuthError('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    introAuthTab === 'register'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center justify-between">
                  <span>{authError}</span>
                  <button onClick={() => setAuthError('')} className="text-xs hover:opacity-75 font-bold">✕</button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {introAuthTab === 'register' && (
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        placeholder="e.g. Mai Yousri"
                        className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          isDark
                            ? 'bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500'
                            : 'bg-slate-50 border border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      placeholder="e.g. mai@example.com"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        isDark
                          ? 'bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 border border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        isDark
                          ? 'bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 border border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                {introAuthTab === 'register' && (
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Select Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer font-semibold transition-all ${
                          authForm.role === 'student'
                            ? 'border-blue-600 bg-blue-600/10 text-blue-500'
                            : isDark
                            ? 'border-slate-700 text-slate-400 hover:border-slate-600'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          checked={authForm.role === 'student'}
                          onChange={() => setAuthForm({ ...authForm, role: 'student' })}
                          className="hidden"
                        />
                        <GraduationCap className="w-4 h-4" />
                        <span>Student</span>
                      </label>

                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer font-semibold transition-all ${
                          authForm.role === 'instructor'
                            ? 'border-purple-600 bg-purple-600/10 text-purple-400'
                            : isDark
                            ? 'border-slate-700 text-slate-400 hover:border-slate-600'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="instructor"
                          checked={authForm.role === 'instructor'}
                          onChange={() => setAuthForm({ ...authForm, role: 'instructor' })}
                          className="hidden"
                        />
                        <UserCheck className="w-4 h-4" />
                        <span>Instructor</span>
                      </label>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  {introAuthTab === 'login' ? 'Sign In to i can' : 'Register Account'}
                </button>
              </form>

              {/* 1-Click Quick Demo Login Helper for Testing */}
              {introAuthTab === 'login' && (
                <div className={`mt-6 pt-5 border-t text-center space-y-2 ${
                  isDark ? 'border-slate-700/80' : 'border-slate-100'
                }`}>
                  <p className="text-[11px] text-slate-400 font-medium">Quick Demo Login:</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSwitchUser(users[0])} // Mai Yousri (Instructor)
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors border ${
                        isDark
                          ? 'bg-purple-950/40 text-purple-300 border-purple-800/80 hover:bg-purple-900/50'
                          : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      Instructor (Mai)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchUser(users[2])} // Ahmed Hassan (Student)
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors border ${
                        isDark
                          ? 'bg-blue-950/40 text-blue-300 border-blue-800/80 hover:bg-blue-900/50'
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      Student (Ahmed)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 
          =======================================================
          MAIN APP: LOGGED IN / EXPLORING COURSES
          =======================================================
        */
        <>
          {/* Main App Navbar */}
          <header className={`border-b sticky top-0 z-40 transition-colors duration-200 ${
            isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200/90'
          }`}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              {/* Brand Logo: i can */}
              <div
                onClick={() => {
                  setCurrentView('courses');
                  setSelectedCourseId(null);
                  setSelectedLessonId(null);
                }}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  ic
                </div>
                <span className={`text-xl font-black tracking-tight group-hover:text-blue-500 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  i can<span className="text-blue-600">.</span>
                </span>
              </div>

              {/* Navigation Links based on role */}
              <nav className={`flex items-center gap-6 text-sm font-semibold ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <button
                  onClick={() => {
                    setCurrentView('courses');
                    setSelectedCourseId(null);
                    setSelectedLessonId(null);
                  }}
                  className={`hover:text-blue-500 transition-colors ${
                    currentView === 'courses' ? 'text-blue-500 font-bold' : ''
                  }`}
                >
                  Courses
                </button>

                {currentUser?.role === 'student' && (
                  <button
                    onClick={() => setCurrentView('my-courses')}
                    className={`hover:text-blue-500 transition-colors ${
                      currentView === 'my-courses' ? 'text-blue-500 font-bold' : ''
                    }`}
                  >
                    My Enrolled Courses ({studentEnrollments.length})
                  </button>
                )}

                {currentUser?.role === 'instructor' && (
                  <>
                    <button
                      onClick={() => setCurrentView('my-created-courses')}
                      className={`hover:text-blue-500 transition-colors ${
                        currentView === 'my-created-courses' ? 'text-blue-500 font-bold' : ''
                      }`}
                    >
                      My Courses ({instructorCourses.length})
                    </button>
                    <button
                      onClick={() => openCourseForm()}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Course</span>
                    </button>
                  </>
                )}
              </nav>

              {/* Right Controls: Dark/Light Mode Button & User Account */}
              <div className="flex items-center gap-2">
                {/* Dark / Light Mode Toggle Button */}
                <button
                  onClick={toggleTheme}
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark / Night Mode"}
                  className={`p-2 rounded-lg transition-colors border ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Direct Logout Button */}
                {currentUser && (
                  <button
                    onClick={handleLogout}
                    title="Log Out to Intro Page / تسجيل الخروج"
                    className={`p-2 rounded-lg transition-colors border ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-red-600 hover:bg-slate-200'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}

                {/* User Account / Role Menu */}
                <div className="relative">
                  {currentUser ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors border ${
                          isDark
                            ? 'hover:bg-slate-700 border-transparent hover:border-slate-600'
                            : 'hover:bg-slate-100 border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-500 font-bold flex items-center justify-center text-xs">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="hidden sm:block text-left text-xs">
                          <p className={`font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {currentUser.name}
                          </p>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            currentUser.role === 'instructor'
                              ? isDark ? 'bg-purple-900/60 text-purple-300' : 'bg-purple-100 text-purple-700'
                              : isDark ? 'bg-emerald-900/60 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {currentUser.role}
                          </span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {isUserMenuOpen && (
                        <div className={`absolute right-0 mt-2 w-56 rounded-lg border shadow-lg py-1.5 z-50 text-xs ${
                          isDark ? 'bg-[#1e293b] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                        }`}>
                          <div className={`px-3.5 py-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{currentUser.name}</p>
                            <p className="text-slate-400 text-[11px]">{currentUser.email}</p>
                            <span className="inline-block mt-1 text-[10px] font-bold uppercase text-slate-400">
                              Role: {currentUser.role}
                            </span>
                          </div>

                          <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Switch User
                          </div>
                          {users.map(u => (
                            <button
                              key={u._id}
                              onClick={() => handleSwitchUser(u)}
                              className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${
                                isDark ? 'hover:bg-slate-700/60' : 'hover:bg-slate-50'
                              } ${currentUser._id === u._id ? 'text-blue-500 font-semibold' : ''}`}
                            >
                              <span>{u.name}</span>
                              <span className="capitalize text-slate-400 text-[10px]">({u.role})</span>
                            </button>
                          ))}

                          <div className={`border-t mt-1 pt-1 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <button
                              onClick={handleLogout}
                              className={`w-full text-left px-3.5 py-1.5 text-red-400 flex items-center gap-1.5 ${
                                isDark ? 'hover:bg-slate-700/60' : 'hover:bg-slate-50'
                              }`}
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setCurrentView('intro')}
                      className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                    >
                      Sign In / Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
            {/* VIEW 1: COURSES CATALOG */}
            {currentView === 'courses' && (
              <div className="space-y-8">
                {/* Logical Role-Specific Overview Box */}
                {currentUser?.role === 'instructor' ? (
                  // INSTRUCTOR OVERVIEW
                  <div className={`rounded-xl border p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors ${
                    isDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                      : 'bg-white border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-white text-slate-800'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                          isDark
                            ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          Instructor Studio
                        </span>
                        <button
                          onClick={() => openCourseForm()}
                          className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create New Course</span>
                        </button>
                      </div>

                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                          Welcome, Instructor {currentUser.name}
                        </h1>
                        <p className={`mt-2 text-sm leading-relaxed max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          Manage your syllabus, publish new lessons, and oversee student enrollments.
                        </p>
                      </div>

                      {/* Instructor stats */}
                      <div className={`pt-4 border-t flex flex-wrap items-center gap-6 text-xs ${
                        isDark ? 'border-slate-700' : 'border-slate-100'
                      }`}>
                        <div>
                          <span className="text-slate-400 font-medium">Your Courses:</span>{' '}
                          <strong className={`font-bold text-sm ml-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {instructorCourses.length}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Your Lessons:</span>{' '}
                          <strong className={`font-bold text-sm ml-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {instructorTotalLessons}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Students Enrolled:</span>{' '}
                          <strong className={`font-bold text-sm ml-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {instructorTotalStudents}
                          </strong>
                        </div>
                        <button
                          onClick={() => setCurrentView('my-created-courses')}
                          className="text-blue-500 hover:underline font-semibold ml-auto"
                        >
                          Go to My Created Courses →
                        </button>
                      </div>

                      {/* Search & Category Filter */}
                      <div className={`pt-4 border-t flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between ${
                        isDark ? 'border-slate-700' : 'border-slate-100'
                      }`}>
                        <div className="relative flex-1 max-w-md">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search all courses..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setCurrentPage(1);
                            }}
                            className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDark
                                ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-400'
                                : 'bg-slate-50 border border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setCurrentPage(1);
                              }}
                              className={`px-3 py-1.5 text-xs rounded-lg font-medium shrink-0 transition-colors ${
                                selectedCategory === cat
                                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                                  : isDark
                                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // STUDENT / GUEST OVERVIEW
                  <div className={`rounded-xl border p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors ${
                    isDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-200/90 text-slate-800'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                          isDark
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          Student Learning Portal
                        </span>
                        {currentUser?.role === 'student' && (
                          <button
                            onClick={() => setCurrentView('my-courses')}
                            className="text-xs text-blue-500 hover:underline font-semibold flex items-center gap-1"
                          >
                            <BookMarked className="w-3.5 h-3.5" />
                            <span>My Enrolled Courses ({studentEnrollments.length})</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                          {currentUser ? `Welcome, ${currentUser.name}` : 'Welcome to i can'}
                        </h1>
                        <p className={`mt-2 text-sm leading-relaxed max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          Explore our collection of machine learning, mathematics, and data science courses. Enroll to access all lessons and join discussions.
                        </p>
                      </div>

                      {/* Search & Category Filter */}
                      <div className={`pt-4 border-t flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between ${
                        isDark ? 'border-slate-700' : 'border-slate-100'
                      }`}>
                        <div className="relative flex-1 max-w-md">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setCurrentPage(1);
                            }}
                            className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDark
                                ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-400'
                                : 'bg-slate-50 border border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setCurrentPage(1);
                              }}
                              className={`px-3 py-1.5 text-xs rounded-lg font-medium shrink-0 transition-colors ${
                                selectedCategory === cat
                                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                                  : isDark
                                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Courses Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                    <span>
                      Showing <strong className={isDark ? 'text-white' : 'text-slate-800'}>{filteredCourses.length}</strong> courses
                    </span>
                    {currentUser?.role === 'instructor' && (
                      <span className="text-purple-400 font-semibold">
                        You authored {instructorCourses.length} courses
                      </span>
                    )}
                    {currentUser?.role === 'student' && (
                      <span className="text-emerald-400 font-semibold">
                        Enrolled in {studentEnrollments.length} courses
                      </span>
                    )}
                  </div>

                  {paginatedCourses.length === 0 ? (
                    <div className={`p-12 rounded-xl border text-center text-sm space-y-2 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      <p className="font-semibold">No courses match your search criteria.</p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('All');
                        }}
                        className="mt-2 text-xs text-blue-500 hover:underline font-semibold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {paginatedCourses.map(course => {
                        const ins = users.find(u => u._id === course.instructor);
                        const courseLessons = lessons.filter(l => l.course === course._id);
                        const enrolledCount = enrollments.filter(e => e.course === course._id).length;
                        const isEnrolled = isUserEnrolled(course._id);
                        const isOwner = currentUser && currentUser._id === course.instructor;

                        return (
                          <div
                            key={course._id}
                            className={`rounded-xl border p-6 flex flex-col justify-between transition-all ${
                              isDark
                                ? isOwner
                                  ? 'bg-slate-800/90 border-purple-500/40 shadow-xs'
                                  : 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
                                : isOwner
                                ? 'bg-white border-purple-200 shadow-2xs'
                                : 'bg-white border-slate-200/90 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className={`font-semibold px-2.5 py-0.5 rounded-md border text-[11px] ${
                                  isDark
                                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                                    : 'text-blue-700 bg-blue-50 border-blue-100'
                                }`}>
                                  {course.category}
                                </span>
                                {isOwner && (
                                  <span className={`font-semibold text-xs px-2 py-0.5 rounded border ${
                                    isDark
                                      ? 'bg-purple-950 text-purple-300 border-purple-800'
                                      : 'text-purple-700 bg-purple-50 border-purple-200'
                                  }`}>
                                    Your Course (Author)
                                  </span>
                                )}
                                {!isOwner && isEnrolled && (
                                  <span className={`font-semibold text-xs flex items-center gap-1 px-2 py-0.5 rounded border ${
                                    isDark
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                      : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                  }`}>
                                    <Check className="w-3.5 h-3.5" /> Enrolled
                                  </span>
                                )}
                              </div>

                              <h3 className={`text-base font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {course.title}
                              </h3>

                              <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {course.description}
                              </p>

                              <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
                                <span>Instructor: <strong className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{ins?.name}</strong></span>
                                <span>{enrolledCount} students</span>
                              </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className={`pt-4 mt-5 border-t flex items-center justify-between text-xs ${
                              isDark ? 'border-slate-700' : 'border-slate-100'
                            }`}>
                              <span className="text-slate-400 font-medium">
                                {courseLessons.length} lessons
                              </span>

                              <div className="flex items-center gap-2">
                                {isOwner ? (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => openCourseForm(course)}
                                      className={`px-2.5 py-1 border rounded-lg font-medium ${
                                        isDark
                                          ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedCourseId(course._id);
                                        setCurrentView('course-details');
                                      }}
                                      className="px-3 py-1 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                                    >
                                      Manage Syllabus
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedCourseId(course._id);
                                        setCurrentView('course-details');
                                      }}
                                      className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                                    >
                                      View Course →
                                    </button>

                                    {currentUser?.role === 'student' && !isEnrolled && (
                                      <button
                                        onClick={() => handleEnroll(course._id)}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-2xs"
                                      >
                                        Enroll
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      <span>
                        Page <strong className={isDark ? 'text-white' : 'text-slate-800'}>{currentPage}</strong> of <strong className={isDark ? 'text-white' : 'text-slate-800'}>{totalPages}</strong>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className={`p-1.5 rounded-lg border disabled:opacity-40 ${
                            isDark ? 'border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                              currentPage === i + 1
                                ? 'bg-blue-600 text-white'
                                : isDark
                                ? 'border border-slate-700 text-slate-300 hover:bg-slate-700'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className={`p-1.5 rounded-lg border disabled:opacity-40 ${
                            isDark ? 'border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: COURSE DETAILS */}
            {currentView === 'course-details' && activeCourse && (
              <div className="space-y-6">
                <button
                  onClick={() => setCurrentView('courses')}
                  className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Courses</span>
                </button>

                <div className={`p-6 sm:p-8 rounded-xl border space-y-4 ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                      isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'text-blue-700 bg-blue-50 border-blue-100'
                    }`}>
                      {activeCourse.category}
                    </span>

                    {currentUser && currentUser._id === activeCourse.instructor && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openCourseForm(activeCourse)}
                          className={`px-2.5 py-1 border text-xs rounded-lg flex items-center gap-1 font-medium ${
                            isDark ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Course</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(activeCourse._id)}
                          className="px-2.5 py-1 border border-red-500/40 text-red-400 text-xs rounded-lg hover:bg-red-500/10 flex items-center gap-1 font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeCourse.title}
                  </h1>
                  <p className={`text-sm leading-relaxed max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {activeCourse.description}
                  </p>

                  <div className={`pt-4 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-slate-700' : 'border-slate-100'
                  }`}>
                    <div>
                      Instructor: <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeInstructor?.name}</span>
                    </div>

                    {currentUser?.role === 'student' && (
                      <div>
                        {isUserEnrolled(activeCourse._id) ? (
                          <div className="flex items-center gap-3">
                            <span className={`font-semibold px-3 py-1 rounded-lg border flex items-center gap-1 ${
                              isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                            }`}>
                              <Check className="w-3.5 h-3.5" /> Enrolled in this Course
                            </span>
                            <button
                              onClick={() => handleCancelEnrollment(activeCourse._id)}
                              className="text-red-400 hover:underline font-medium"
                            >
                              Cancel Enrollment
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnroll(activeCourse._id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-2xs"
                          >
                            Enroll in Course
                          </button>
                        )}
                      </div>
                    )}

                    {currentUser && currentUser._id === activeCourse.instructor && (
                      <span className="text-purple-400 font-semibold">
                        You are the instructor of this course
                      </span>
                    )}
                  </div>
                </div>

                {/* Lessons List */}
                <div className={`p-6 sm:p-8 rounded-xl border space-y-4 ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div className={`flex items-center justify-between pb-3 border-b ${
                    isDark ? 'border-slate-700' : 'border-slate-100'
                  }`}>
                    <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Course Lessons ({activeLessons.length})
                    </h2>
                    {currentUser && currentUser._id === activeCourse.instructor && (
                      <button
                        onClick={() => openLessonForm()}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lesson</span>
                      </button>
                    )}
                  </div>

                  {activeLessons.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No lessons added yet.</p>
                  ) : (
                    <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                      {activeLessons.map(lesson => {
                        const commentCount = comments.filter(c => c.lesson === lesson._id).length;
                        const isOwner = currentUser && currentUser._id === activeCourse.instructor;

                        return (
                          <div
                            key={lesson._id}
                            className={`py-3.5 flex items-center justify-between gap-4 px-2 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <div
                              onClick={() => {
                                setSelectedLessonId(lesson._id);
                                setCurrentView('lesson-details');
                              }}
                              className="cursor-pointer flex-1"
                            >
                              <h4 className={`text-sm font-semibold hover:text-blue-500 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                {lesson.order}. {lesson.title}
                              </h4>
                              <span className="text-[11px] text-slate-400">{commentCount} comments</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isOwner && (
                                <>
                                  <button
                                    onClick={() => openLessonForm(lesson)}
                                    className="p-1.5 text-slate-400 hover:text-slate-200"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(lesson._id)}
                                    className="p-1.5 text-slate-400 hover:text-red-400"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                setSelectedLessonId(lesson._id);
                                setCurrentView('lesson-details');
                              }}
                              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                                isDark
                                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                                  : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700'
                              }`}
                            >
                              Open Lesson
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: LESSON DETAILS & COMMENTS */}
          {currentView === 'lesson-details' && activeLesson && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentView('course-details')}
                  className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Lessons</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {(() => {
                    const sorted = activeLessons;
                    const idx = sorted.findIndex(l => l._id === activeLesson._id);
                    const prev = idx > 0 ? sorted[idx - 1] : null;
                    const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
                    return (
                      <>
                        {prev && (
                          <button
                            onClick={() => setSelectedLessonId(prev._id)}
                            className={`px-3 py-1 text-xs border rounded-lg font-medium ${
                              isDark
                                ? 'border-slate-700 text-slate-300 hover:bg-slate-700'
                                : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            ← Previous
                          </button>
                        )}
                        {next && (
                          <button
                            onClick={() => setSelectedLessonId(next._id)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                          >
                            Next →
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Lesson Body */}
              <div className={`p-6 sm:p-8 rounded-xl border space-y-4 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <span className="text-xs font-semibold text-slate-400">
                    Lesson {activeLesson.order} • {activeCourse?.title}
                  </span>
                  <h1 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeLesson.title}
                  </h1>
                </div>

                <div className={`p-5 rounded-lg border text-sm whitespace-pre-line leading-relaxed font-mono text-xs sm:text-sm ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  {activeLesson.content}
                </div>
              </div>

              {/* Comments */}
              <div className={`p-6 sm:p-8 rounded-xl border space-y-4 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Comments ({activeComments.length})
                </h3>

                <form onSubmit={handleAddComment} className="space-y-2">
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      currentUser
                        ? `Write a comment as ${currentUser.name}...`
                        : 'Please sign in to comment...'
                    }
                    disabled={!currentUser}
                    className={`w-full p-3 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-400'
                        : 'bg-slate-50 border border-slate-300 text-slate-800'
                    }`}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!currentUser || !commentText.trim()}
                      className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>

                <div className={`divide-y pt-2 ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                  {activeComments.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No comments yet.</p>
                  ) : (
                    activeComments.map(comment => {
                      const commenter = users.find(u => u._id === comment.user);
                      const isOwn = currentUser && currentUser._id === comment.user;
                      const isEditing = editingCommentId === comment._id;

                      return (
                        <div key={comment._id} className="py-3 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {commenter?.name}
                              </span>
                              <span className="text-[10px] text-slate-400 capitalize">({commenter?.role})</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {isOwn && (
                              <div className="flex items-center gap-2 text-xs">
                                {!isEditing ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(comment._id);
                                        setEditingCommentText(comment.text);
                                      }}
                                      className="text-slate-400 hover:text-blue-400 font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment._id)}
                                      className="text-slate-400 hover:text-red-400 font-medium"
                                    >
                                      Delete
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="text-slate-400 hover:text-slate-300 font-medium"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="pt-2 space-y-2">
                              <textarea
                                rows={2}
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className={`w-full p-2 text-xs border rounded-lg ${
                                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'border-slate-300'
                                }`}
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleUpdateComment(comment._id)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {comment.text}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: STUDENT - MY COURSES */}
          {currentView === 'my-courses' && (
            <div className="space-y-6">
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  My Enrolled Courses
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Courses you are currently learning as a student</p>
              </div>

              {(() => {
                const myEnrollments = enrollments.filter(e => e.student === currentUser?._id);
                const enrolledCourses = courses.filter(c =>
                  myEnrollments.some(e => e.course === c._id)
                );

                if (enrolledCourses.length === 0) {
                  return (
                    <div className={`p-10 rounded-xl border text-center space-y-3 ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        You are not enrolled in any courses yet.
                      </p>
                      <button
                        onClick={() => setCurrentView('courses')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                      >
                        Browse Available Courses
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {enrolledCourses.map(course => {
                      const ins = users.find(u => u._id === course.instructor);
                      const courseLessons = lessons.filter(l => l.course === course._id);
                      return (
                        <div key={course._id} className={`p-6 rounded-xl border flex flex-col justify-between ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}>
                          <div>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                              isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'text-blue-700 bg-blue-50 border-blue-100'
                            }`}>
                              {course.category}
                            </span>
                            <h3 className={`text-base font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {course.title}
                            </h3>
                            <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              {course.description}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">Instructor: {ins?.name}</p>
                          </div>
                          <div className={`mt-5 pt-3 border-t flex items-center justify-between text-xs ${
                            isDark ? 'border-slate-700' : 'border-slate-100'
                          }`}>
                            <button
                              onClick={() => {
                                setSelectedCourseId(course._id);
                                setCurrentView('course-details');
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                              Continue ({courseLessons.length} lessons)
                            </button>
                            <button
                              onClick={() => handleCancelEnrollment(course._id)}
                              className="text-red-400 hover:underline font-medium"
                            >
                              Cancel Enrollment
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW 5: INSTRUCTOR - MY CREATED COURSES */}
          {currentView === 'my-created-courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    My Created Courses
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Manage your courses, lessons, and curriculum</p>
                </div>
                <button
                  onClick={() => openCourseForm()}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Course</span>
                </button>
              </div>

              {(() => {
                const myCourses = courses.filter(c => c.instructor === currentUser?._id);

                if (myCourses.length === 0) {
                  return (
                    <div className={`p-10 rounded-xl border text-center space-y-3 ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        You haven't created any courses yet.
                      </p>
                      <button
                        onClick={() => openCourseForm()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                      >
                        Create Your First Course
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {myCourses.map(course => {
                      const courseLessons = lessons.filter(l => l.course === course._id);
                      const enrolledCount = enrollments.filter(e => e.course === course._id).length;
                      return (
                        <div key={course._id} className={`p-6 rounded-xl border flex flex-col justify-between ${
                          isDark ? 'bg-slate-800 border-purple-500/40' : 'bg-white border-purple-200 shadow-2xs'
                        }`}>
                          <div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-semibold px-2.5 py-0.5 rounded-md border ${
                                isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'text-blue-700 bg-blue-50 border-blue-100'
                              }`}>
                                {course.category}
                              </span>
                              <span className="text-slate-400">{enrolledCount} enrolled students</span>
                            </div>
                            <h3 className={`text-base font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {course.title}
                            </h3>
                            <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              {course.description}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">{courseLessons.length} lessons in syllabus</p>
                          </div>

                          <div className={`mt-5 pt-3 border-t flex items-center justify-between gap-2 text-xs ${
                            isDark ? 'border-slate-700' : 'border-slate-100'
                          }`}>
                            <button
                              onClick={() => {
                                setSelectedCourseId(course._id);
                                setCurrentView('course-details');
                              }}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                              Manage Syllabus
                            </button>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openCourseForm(course)}
                                className={`px-2.5 py-1.5 border rounded-lg font-medium ${
                                  isDark ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course._id)}
                                className="px-2.5 py-1.5 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/10 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      </>
    )}

      {/* MODAL: CREATE / EDIT COURSE */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className={`rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingCourse ? 'Edit Course' : 'Create Course'}
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  placeholder="e.g. Machine Learning"
                  className={`w-full p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={courseFormData.category}
                  onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                  placeholder="e.g. Artificial Intelligence, Mathematics, Data Science"
                  className={`w-full p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  placeholder="Provide a course overview..."
                  className={`w-full p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-medium ${
                    isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT LESSON */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className={`rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
              </h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                  <label className="block text-xs font-medium mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                    placeholder="e.g. 1. Introduction to Neural Networks"
                    className={`w-full p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Order</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={lessonFormData.order}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, order: e.target.value })}
                    className={`w-full p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Lesson Content</label>
                <textarea
                  rows={5}
                  required
                  value={lessonFormData.content}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                  placeholder="Write lesson notes and explanation here..."
                  className={`w-full p-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-medium ${
                    isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  {editingLesson ? 'Save' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
