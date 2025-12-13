import { Request, Response } from 'express';
import { registerUser } from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await registerUser(email, password, role);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user;

    res.status(201).json({ 
      user: userWithoutPassword, 
      token: result.token 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};