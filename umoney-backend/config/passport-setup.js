const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path as necessary
const Category = require('../models/Category'); // Import Category model

passport.serializeUser((user, done) => {
  done(null, user.id); // Store user id in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Attach user object to req.user
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'] // Request profile and email info
    },
    async (accessToken, refreshToken, profile, done) => {
      // This function is called when Google redirects back to the callback URL
      // Check if user already exists in our DB
      try {
        let currentUser = await User.findOne({ googleId: profile.id });

        if (currentUser) {
          // Already have the user
          console.log('User is:', currentUser);
          done(null, currentUser); // Pass user to serializeUser
        } else {
          // If not, create user in our DB
          const newUser = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            email: profile.emails[0].value, // Assuming first email is primary
            profilePicture: profile.photos[0].value // Assuming first photo is primary
          });
          await newUser.save();
          console.log('Created new user:', newUser);

          // Create default categories for the new user
          const defaultCategories = [
            // Income categories
            { name: 'Salary', type: 'Income', isCustom: false },
            { name: 'Freelance', type: 'Income', isCustom: false },
            
            // Needs categories
            { name: 'Rent', type: 'Needs', isCustom: false },
            { name: 'Groceries', type: 'Needs', isCustom: false },
            { name: 'Utilities', type: 'Needs', isCustom: false },
            
            // Wants categories
            { name: 'Entertainment', type: 'Wants', isCustom: false },
            { name: 'Dining Out', type: 'Wants', isCustom: false },
            { name: 'Shopping', type: 'Wants', isCustom: false },
            
            // Savings categories
            { name: 'Emergency Fund', type: 'Savings', isCustom: false },
            { name: 'Investments', type: 'Savings', isCustom: false }
          ].map(category => ({
            ...category,
            user: newUser._id
          }));

          await Category.insertMany(defaultCategories);

          done(null, newUser); // Pass new user to serializeUser
        }
      } catch (err) {
        console.error('Error in Google Strategy:', err);
        done(err, null);
      }
    }
  )
);
