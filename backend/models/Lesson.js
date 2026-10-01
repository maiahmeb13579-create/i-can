const mongoose = require('mongoose');

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

module.exports = mongoose.model('Lesson', lessonSchema);
