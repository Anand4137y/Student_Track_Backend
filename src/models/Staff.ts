import mongoose, { Schema, Document } from 'mongoose';

interface IStaff extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    isActive: boolean;
    permission: "requested" | "approved" | "rejected";
    school: mongoose.Schema.Types.ObjectId;
}

 const staffSchema = new Schema<IStaff> ({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "teacher"
    },
    phone: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permission: {
        type: String,
        enum: ["requested", "approved", "rejected"],
        default: "requested"
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true
    }
},{
    timestamps: true
})

export default mongoose.model<IStaff>('Staff', staffSchema);