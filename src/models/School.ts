import mongoose,{ Schema, Document } from "mongoose";

export interface ISchool extends Document {
  schoolName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  schoolCode: string;
  staff: mongoose.Types.ObjectId[];
  status: "active" | "inactive";
  district: string;
  permission: "requested" | "approved" | "rejected";
}

const schoolSchema = new Schema<ISchool>({
    schoolName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pinCode: {
        type: String,
        required: true
    },
    schoolCode: {
        type: String,
        required: true,
        unique: true
    },
    staff: [{
        type: Schema.Types.ObjectId,
        ref: "Staff"
    }],
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    district: {
        type: String,
        required: true
    },
    permission: {
        type: String,
        enum: ["requested", "approved", "rejected"],
        default: "requested"
    }
},{
    timestamps: true
})

export default mongoose.model<ISchool>("School", schoolSchema);