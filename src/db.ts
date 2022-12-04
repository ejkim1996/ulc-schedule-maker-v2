import mongoose, { Schema } from 'mongoose'
import { Course } from '../@types/scheduler'
import { v4 } from 'uuid'

const CourseSchema = new Schema<Course>({
  name: {
    type: String,
    required: true
  },
  supported: {
    type: Boolean,
    default: false,
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
    required: true,
    default: v4
  }
})

mongoose.model('Course', CourseSchema)

mongoose.connect(process.env.MONGODB_URI ?? '', (err) => {
  console.log(err ?? '✅ Connected to MongoDB Atlas!')
})

export const CourseModel = mongoose.model<Course>('Course')
