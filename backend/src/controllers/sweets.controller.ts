import { Request, Response } from 'express';
import { createSweet, getAllSweets, purchaseSweet } from '../services/sweets.service'; // <--- Update import

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

export const purchase = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updatedSweet = await purchaseSweet(id);
    
    res.status(200).json({
      message: "Purchase successful",
      remainingQuantity: updatedSweet.quantity
    });
  } catch (err: any) {
    if (err.message === "Out of stock") {
      res.status(400).json({ error: err.message });
    } else if (err.message === "Sweet not found") {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};