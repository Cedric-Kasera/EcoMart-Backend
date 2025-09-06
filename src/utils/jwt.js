import jwt from "jsonwebtoken";

export default function generateToken(user) {
  const payload = {
    sub: user._id.toString(),
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

  return token;
}