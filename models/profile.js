import mongoose from 'mongoose'
// import { Restaurant } from './restaurant'

const Schema = mongoose.Schema

const profileSchema = new Schema({
  name: String,
  photo: String,
  handle: String,
  friends: [{type: Schema.Types.ObjectId, ref: 'Profile'}],
  friendRequests: [{type: Schema.Types.ObjectId, ref: 'Profile'}],
  bio: String,
  followers: [{type: Schema.Types.ObjectId, ref: 'Profile'}],
  following: [{type: Schema.Types.ObjectId, ref: 'Profile'}],
  blocked: [{type: Schema.Types.ObjectId, ref: 'Profile'}],
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
