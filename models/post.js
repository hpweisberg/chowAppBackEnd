import mongoose from 'mongoose'

const Schema = mongoose.Schema

const postSchema = new Schema({
  name: String,
  photo: String,
  meal: String,
  review: String,
  title: String,
  rating: Number,
  description: String,
  author: { 
    type: String, 
    ref: 'Profile',
    field: 'handle' 
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }},{
  timestamps: true,
})

const Post = mongoose.model('Post', postSchema)

export { Post }
