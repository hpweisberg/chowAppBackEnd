import mongoose from 'mongoose'

const Schema = mongoose.Schema

const restaurantSchema = new Schema({
  name: String,
  latutude: String,
  longitude: String,
  phoneNum: String,
  website: String,
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  postedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  }]
},{
  timestamps: true,
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

export { Restaurant }
