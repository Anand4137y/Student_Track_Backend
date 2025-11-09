import mongoose, { Schema, Document } from "mongoose";

export interface IReportedStudent extends Document {
  student?: mongoose.Schema.Types.ObjectId;   // Optional reference to Student
  school: mongoose.Schema.Types.ObjectId;
  reportedBy: mongoose.Schema.Types.ObjectId;
  name?: string;            // For unregistered student
  className?: string;       // Optional class info
  section?: string;
  rollNumber?: string;
  reason: string;
  reportType: "absent" | "disciplinary" | "other";
  date: Date;
  status: "pending" | "reviewed" | "resolved";
  remarks?: string;
}

const reportedStudentSchema = new Schema<IReportedStudent>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: false, // Not mandatory anymore
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    // ✅ These fields are used when there’s no linked student record
    name: {
      type: String,
    },
    className: {
      type: String,
    },
    section: {
      type: String,
    },
    rollNumber: {
      type: String,
    },
    reason: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      enum: ["absent", "disciplinary", "other"],
      default: "absent",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IReportedStudent>(
  "ReportedStudent",
  reportedStudentSchema
);
