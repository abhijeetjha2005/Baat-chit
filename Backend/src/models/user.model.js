const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
 
  
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },  
    profilePic: {
      type: String,
      default: "",
    },
    isOnline: {
  type: Boolean,
  default: false,
},
lastSeen: {
  type: Date,
  default: null,
},
  },

{
  timestamps: true
});

// Optional: Remove password when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);