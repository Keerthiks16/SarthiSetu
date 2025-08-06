import mongoose from "mongoose";
import dotenv from "dotenv";

const connectdb = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log(`Database Connected: ${process.env.MONGO_URI}`))
    .catch(() => console.log(`Error in Database Connection`));
};
export default connectdb;
