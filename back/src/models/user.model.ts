import { Schema, model } from "mongoose";
import crypto from "crypto";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "O nome é obrigatório."],
    },
    email: {
      type: String,
      required: [true, "O email é obrigatório."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "A senha é obrigatória."],
      select: false,
    },
    salt: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["Cliente", "Vendedor"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    purchases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", function (next) {
  if (!this.isModified("senha")) {
    return next();
  }

  this.salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .pbkdf2Sync(this.password, this.salt, 100000, 64, "sha512")
    .toString("hex");

  this.password = hash;

  next();
});

userSchema.methods.comparePassword = function (
  candidatePassword: string,
): boolean {
  const hashCandidate = crypto
    .pbkdf2Sync(candidatePassword, this.salt, 100000, 64, "sha512")
    .toString("hex");

  const hashReal = Buffer.from(this.password, "hex");
  const hashProvided = Buffer.from(hashCandidate, "hex");

  return crypto.timingSafeEqual(hashReal, hashProvided);
};

const User = model("User", userSchema);
export default User;
