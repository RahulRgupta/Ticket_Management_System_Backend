import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser,getUserByEmail} from '../models/userModel';


//register
export const register = async (req: Request, res: Response) => {
  const { name, email,type,password } = req.body;
 
  if (type !== 'admin' && type !== 'customer') {
    return res.status(400).json({ message: 'Type must be either "admin" or "customer"' });
  }

  //validate email
  const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharPattern.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one special character' });
  }
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(name,email,type,hashedPassword);
    res.status(201).json({ id:user.id,name:user.name,email:user.email });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' });
  }
};


//login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id,type:user.type }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
