import mongoose from "mongoose";
import bcrypt from "bcryptjs";//cant brute force through this

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    fullName:{
        type:String,
        required:true,
    },
    userType:{
        type:String,
        required:true,
        enum : ['staff','student']
    }
},{timestamps:true});

userSchema.pre("save", async function (next) { //this will covert my password to hashed password (better security)
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {//comapre the entered password with hashed pasword
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);