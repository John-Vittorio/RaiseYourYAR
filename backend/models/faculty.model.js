import mongoose, { mongo } from "mongoose";

const facultySchema = new mongoose.Schema({
    netID: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

const Faculty = mongoose.model("Faculty", facultySchema);
export default Faculty;