import mongoose from 'mongoose'
// import { Restaurant } from './restaurant'

const Schema = mongoose.Schema

const profileSchema = new Schema({
  name: String,
  photo: String,
  friends: [String],
  friendRequests: [String],
  bio: String,
  followers: [String],
  following: [String],
  blocked: [String],
  verified: Boolean,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  restaurants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }]
},{
  timestamps: true,
})

const Profile = mongoose.model('Profile', profileSchema)

export { Profile }
