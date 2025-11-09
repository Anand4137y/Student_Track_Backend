import mongoose, { Schema, Document } from "mongoose";

interface Admin extends Document {
    email: string;
    password: string;
    name: string;
    role: "superadmin";
}

const AdminSchema = new Schema<Admin>({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "superadmin"
    }
},{
    timestamps: true
});

export default mongoose.model<Admin>('Admin', AdminSchema);