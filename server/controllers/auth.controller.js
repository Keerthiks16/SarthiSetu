import { genToken } from "../middleware/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exist" });
    }
    let hashPassword = await bcrypt.hash(password, 12);
    let user = await User.create({ name, email, password: hashPassword, role });
    let token = await genToken(user._id);
    res.cookie("nfc-token", token, {
      httpOnly: true,
      secure: (process.env.NODE_ENV = "production"),
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Signup Error: ${error}` });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }
    let token = await genToken(user._id);
    res.cookie("nfc-token", token, {
      httpOnly: true,
      secure: (process.env.NODE_ENV = "production"),
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Login Error: ${error}` });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("nfc-token");
    return res.status(200).json({ message: `Logout Successful` });
  } catch (error) {
    return res.status(500).json({ message: `Logout Error: ${error}` });
  }
};

export const getcurrentuser = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.log(`Error in GetCurrentUser: ${error}`);
    return res
      .status(500)
      .json({ message: `Error in GetCurrentUser: ${error}` });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const currentUser = req.user; // From auth middleware

    // Check if the user is updating their own profile or is an admin
    if (currentUser._id.toString() !== id && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this profile" });
    }

    // Prevent certain fields from being updated
    const restrictedFields = [
      "_id",
      "email",
      "password",
      "role",
      "jobsPosted",
      "jobsApplied",
      "quizzesTaken",
      "mentorshipSessions",
      "communitiesJoined",
    ];
    for (const field of restrictedFields) {
      if (updates[field] !== undefined) {
        return res
          .status(400)
          .json({ message: `Cannot update ${field} field` });
      }
    }

    // If updating password, hash the new one
    if (updates.newPassword) {
      if (!updates.currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required to update password" });
      }

      const isMatch = await bcrypt.compare(
        updates.currentPassword,
        currentUser.password
      );
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      updates.password = await bcrypt.hash(updates.newPassword, 12);
      delete updates.newPassword;
      delete updates.currentPassword;
    }

    // Handle profile picture upload (assuming you're using a separate endpoint for file uploads)
    if (updates.profilePicture) {
      // You might want to validate the URL or process it further
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from the returned user data

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(`Update User Error: ${error}`);
    return res.status(500).json({ message: `Update Error: ${error.message}` });
  }
};
