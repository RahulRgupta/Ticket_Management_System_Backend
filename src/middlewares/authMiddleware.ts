import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
      const userId = (decoded as any).id;
      const type = (decoded as any).type;
      console.log(userId)
      if (!userId) return res.status(401).json({ message: 'Invalid token payload' });
      
      (req as any).userId = userId;
      (req as any).type = type;
    next();
  });
};
