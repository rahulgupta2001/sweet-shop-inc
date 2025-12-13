import { Request, Response } from 'express';
import { createSweet, getAllSweets } from '../services/sweets.service';

export const addSweet = async (req: Request, res: Response) => {
  try {
    const { name, category, price, quantity } = req.body;
    
    // Basic validation
    if (!name || !price) {
      res.status(400).json({ error: "Name and Price are required" });
      return;
    }

    const sweet = await createSweet({ 
      name, 
      category, 
      price: parseFloat(price), 
      quantity: parseInt(quantity) 
    });
    
    res.status(201).json(sweet);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const listSweets = async (req: Request, res: Response) => {
  try {
    const sweets = await getAllSweets();
    res.status(200).json(sweets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};