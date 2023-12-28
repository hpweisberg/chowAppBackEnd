import jwt from 'jsonwebtoken'

import { User } from '../models/user.js'
import { Profile } from '../models/profile.js'

async function isEmailUnique(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const isUnique = !user;
    return { isUnique }; // Return the result instead of sending the response here
  } catch (error) {
    console.error('Error checking email uniqueness:', error);
    res.status(500).json({ error: 'Something went wrong while checking email uniqueness' });
  }
}



async function isHandleUnique(req, res) {
  try {
    const { handle } = req.body;
    const user = await User.findOne({ handle });
    const isUnique = !user;
    return { isUnique }; // Return the result instead of sending the response here
  } catch (error) {
    console.error('Error checking handle uniqueness:', error);
    res.status(500).json({ error: 'Something went wrong while checking handle uniqueness' });
  }
}




async function signup(req, res) {
  try {
    if (!process.env.SECRET) throw new Error('no SECRET in back-end .env');
    if (!process.env.CLOUDINARY_URL) {
      throw new Error('no CLOUDINARY_URL in back-end .env file');
    }

    const emailCheckResponse = await isEmailUnique(req, res); // Pass req and res as parameters
    const handleCheckResponse = await isHandleUnique(req, res); // Pass req and res as parameters

    const isEmailTaken = !emailCheckResponse.isUnique;
    const isHandleTaken = !handleCheckResponse.isUnique;

    if (!isEmailTaken && !isHandleTaken) {
      // ... (existing code for successful signup)
    } else if (!isEmailTaken && isHandleTaken) {
      throw new Error('Handle name is taken, please choose another');
    } else if (isEmailTaken && !isHandleTaken) {
      throw new Error('Account with this email already exists');
    } else {
      throw new Error('Account with this email and handle already exists');
    }

    const newProfile = await Profile.create(req.body);
    req.body.profile = newProfile._id;
    const newUser = await User.create(req.body);

    const token = createJWT(newUser);
    res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    try {
      if (req.body.profile) {
        await Profile.findByIdAndDelete(req.body.profile);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err: err.message });
    }
    res.status(500).json({ err: err.message });
  }
}


async function login(req, res) {
  try {
    if (!process.env.SECRET) throw new Error('no SECRET in back-end .env')
    if (!process.env.CLOUDINARY_URL) {
      throw new Error('no CLOUDINARY_URL in back-end .env')
    }

    const user = await User.findOne({ email: req.body.email })
    if (!user) throw new Error('User not found')

    const isMatch = await user.comparePassword(req.body.password)
    if (!isMatch) throw new Error('Incorrect password')

    const token = createJWT(user)
    res.json({ token })
  } catch (err) {
    handleAuthError(err, res)
  }
}

async function changePassword(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) throw new Error('User not found')

    const isMatch = user.comparePassword(req.body.password)
    if (!isMatch) throw new Error('Incorrect password')

    user.password = req.body.newPassword
    await user.save()

    const token = createJWT(user)
    res.json({ token })

  } catch (err) {
    handleAuthError(err, res)
  }
}

async function update(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) throw new Error('User not found')

    // user.email = req.body.email
    user.handle = req.body.handle
    await user.save()

    res.json({ user })
  } catch (err) {
    handleAuthError(err, res)
  }
}

/* --== Helper Functions ==-- */

function handleAuthError(err, res) {
  console.log(err)
  const { message } = err
  if (message === 'User not found' || message === 'Incorrect password') {
    res.status(401).json({ err: message })
  } else {
    res.status(500).json({ err: message })
  }
}

function createJWT(user) {
  return jwt.sign({ user }, process.env.SECRET, { expiresIn: '72h' })
}

async function getApiKey(req, res) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    res.status(200).json(apiKey)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

export {
  signup,
  login,
  changePassword,
  update,
  isEmailUnique,
  isHandleUnique,
  getApiKey
}
