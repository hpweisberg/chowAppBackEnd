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
// req.user.profile
// ! not using
// async function indexByFriends(req, res) {
//   try {
//     const userProfile = await Profile.findOne({ handle: req.user.handle }).populate('friends');
//     console.log('friends handles:', userProfile.friends);

//     const friendHandles = userProfile.friends.map(friend => friend.handle);
//     console.log('friend handles:', friendHandles);

//     const posts = await Post.find({ author: { $in: friendHandles } })
//       .sort({ createdAt: -1 }) // Sort posts by createdAt field in descending order (newest first)
//       .populate({
//         path: 'author',
//         select: '-_id -__v' // Exclude _id and __v fields from the populated author's profile
//       });

//     res.json(posts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json(err);
//   }
// }

async function indexByFriends(req, res) {
  const { handle } = req.user;
  try {
    const userProfile = await Profile.findOne({ handle });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const friendHandles = userProfile.friends.map((friend) => friend);

    if (friendHandles.length === 0) {
      return res.status(404).json({ message: 'No friends yet' });
    }

    const posts = await Post.find({ author: { $in: friendHandles } })
      .sort({ createdAt: -1 });

    const populatedPosts = await Promise.all(
      posts.map(async (post) => {
        const author = await Profile.findOne({ handle: post.author });

        if (!author) {
          return null;
        }

        return {
          ...post.toObject(),
          author: author.toObject(),
        };
      })
    );

    const filteredPosts = populatedPosts.filter((post) => post !== null);

    res.json(filteredPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
}

async function indexByFollowing(req, res) {
  const { handle } = req.user;
  try {
    const userProfile = await Profile.findOne({ handle });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const followingHandles = userProfile.following.map((friend) => friend);

    if (followingHandles.length === 0) {
      return res.status(404).json({ message: 'Not following anyone yet' });
    }

    const posts = await Post.find({ author: { $in: followingHandles } })
      .sort({ createdAt: -1 });

    const populatedPosts = await Promise.all(
      posts.map(async (post) => {
        const author = await Profile.findOne({ handle: post.author });

        if (!author) {
          return null;
        }

        return {
          ...post.toObject(),
          author: author.toObject(),
        };
      })
    );

    const filteredPosts = populatedPosts.filter((post) => post !== null);

    res.json(filteredPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
}















async function create(req, res) {
  try {
    const authorProfile = await Profile.findOne({ handle: req.user.handle });
    req.body.author = authorProfile.handle;

    const post = await Post.create(req.body);

    const updatedProfile = await Profile.findByIdAndUpdate(
      authorProfile._id,
      { $push: { posts: post._id } },
      { new: true }
    );

    post.author = updatedProfile.handle; // Set the author to the handle of the updated profile

    res.status(201).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}





async function show(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const author = await Profile.findOne({ handle: post.author });
    
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    
    post.author = author;
    
    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}



async function update(req, res) {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function deletePost(req, res) {
  try {
    const post = await Post.findByIdAndDelete(req.params.id)
    res.status(200).json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function addPhoto(req, res) {
  try {
    const imageFile = req.files.photo.path;
    const post = await Post.findById(req.params.id);

    const image = await cloudinary.uploader.upload(
      imageFile,
      {
        tags: `${post._id}`,
        transformation: [
          {
            width: 600,
            height: 600,
            crop: 'fill',
            gravity: 'center',
          },
        ],
      }
    );

    post.photo = image.url;
    await post.save();
    res.status(201).json(post.photo);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


// async function addPhoto(req, res) {
//   try {
//     // console.log('Add Photo Ran')
//     // console.log('req.files: ',req.files)
//     const imageFile = req.files.photo.path
//     // console.log('imageFile: ',imageFile)
//     const post = await Post.findById(req.params.id)
//     // console.log('post: ',post)

//     const image = await cloudinary.uploader.upload(
//       imageFile,
//       { tags: `${post._id}` }
//     )
//     // console.log('image: ',image)
//     post.photo = image.url
//     // console.log('post.photo: ',post.photo)
//     await post.save()
//     res.status(201).json(post.photo)
//   } catch (err) {
//     console.log(err)
//     res.status(500).json(err)
//   }
// }

// async function addRestaurant(req, res) {
//   try {
//     const post = await Post.findById(req.params.id)
//     post.restaurant = req.body.restaurant
//     await post.save()
//     res.status(201).json(post.restaurant)
//   } catch (err) {
//     console.log(err)
//     res.status(500).json(err)
//   }
// }

export {
  index,
  addPhoto,
  create,
  show,
  update,
  deletePost,
  indexByFriends,
  indexByFollowing
  // addRestaurant
}
