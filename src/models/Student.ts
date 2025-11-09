import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  name: string;
  gender: "male" | "female" | "other";
  dob: Date;
  rollNumber: string;
  admissionNumber: string;
  class: string;
  section: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  school: mongoose.Schema.Types.ObjectId; // Reference to School
  assignedTeacher?: mongoose.Schema.Types.ObjectId; // Reference to Staff
  status: "active" | "inactive";
  absenteeDates?: Date[];
}

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    dob: { type: Date, required: true },
    rollNumber: { type: String, required: true },
    admissionNumber: { type: String, required: true, unique: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    parentName: { type: String },
    parentPhone: { type: String },
    address: { type: String },

    school: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    assignedTeacher: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    absenteeDates: {
      type: [Date],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudent>("Student", studentSchema);
