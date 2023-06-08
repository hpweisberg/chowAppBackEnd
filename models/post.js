import mongoose from 'mongoose'

const Schema = mongoose.Schema

const postSchema = new Schema({
  name: String,
  photo: String,
  meal: String,
  review: String,
  picture: String,
  title: String,
  raiting: Number,
  discription: String,
  Location: String,
},{
  timestamps: true,
})

const Post = mongoose.model('Post', postSchema)

export { Post }
