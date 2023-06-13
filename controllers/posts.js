import { Post } from '../models/post.js'
import { v2 as cloudinary } from 'cloudinary'
import { Profile } from '../models/profile.js'

async function index(req, res) {
  try {
    const posts = await Post.find({})
    res.json(posts)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function create(req, res) {
  try {
    req.body.author = req.user.profile
    const post = await Post.create(req.body)
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      { $push: { posts: post } },
      { new: true }
    )
    profile.author = profile
    res.status(201).json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function show(req, res) {
  try {
    const post = await Post.findById(req.params.id)
    res.json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function update(req, res) {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function deletePost(req, res) {
  try {
    const post = await Post.findByIdAndDelete(req.params.id)
    res.json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function addPhoto(req, res) {
  try {
    const imageFile = req.files.photo.path
    const post = await Post.findById(req.params.id)

    const image = await cloudinary.uploader.upload(
      imageFile, 
      { tags: `${req.user.email}` }
    )
    post.photo = image.url
    
    await post.save()
    res.status(201).json(post.photo)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

export { 
  index,
  addPhoto,
  create,
  show,
  update,
  deletePost
}
