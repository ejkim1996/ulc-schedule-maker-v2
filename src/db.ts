import mongoose, { Schema } from 'mongoose'
import { Course } from '../@types/scheduler'

const CourseSchema = new Schema<Course>({
  supported: {
    type: Boolean,
    required: true
  },
  abbreviation: {
    type: String,
    required: false
  },
  department: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  school: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true
  }
})

mongoose.model('Courses', CourseSchema)
