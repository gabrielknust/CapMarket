import { Schema, model } from "mongoose";
import crypto from "crypto";
import { Document } from "mongoose";
import Cart from "./cart.model";

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  salt: string;
  role: "Cliente" | "Vendedor";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): boolean;
}

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
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(this.password, this.salt, 100000, 64, "sha512")
    .toString("hex");
  next();
});

userSchema.post("save", async function (doc, next) {
  try {
    await Cart.create({ customer: this._id });
  } catch (error: any) {
    if (error.code === 11000) {
    } else {
      console.error(
        "Erro ao criar carrinho automaticamente para o usuário:",
        this._id,
        error,
      );
    }
  }

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

const User = model<IUser>("User", userSchema);
export default User;
