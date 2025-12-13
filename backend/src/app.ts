import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import sweetRoutes from './routes/sweets.routes'; // <--- Import

const app: Application = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes); // <--- Add this

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to Sweet Shop API" });
});

export default app;