import mongoose from 'mongoose'
// import { Restaurant } from './restaurant'

const Schema = mongoose.Schema

const profileSchema = new Schema({
  name: String,
  photo: String,
  handle: String,
  friends: [{
    type: String,
    ref: 'Profile'
  }],
  friendRequests: [String],
  bio: String,
  followers: [String],
  following: [String],
  followRequests: [String],
  followPublic: {
    type: Boolean,
    default: true
  },
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
}, {
  timestamps: true,
})

const Profile = mongoose.model('Profile', profileSchema)

export { Profile }
