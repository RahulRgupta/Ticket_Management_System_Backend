import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoute';
import ticketRoutes from './routes/ticketRoute'
dotenv.config();

const app = express();

app.use(express.json());
// app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/ticket',ticketRoutes)

//app.use(errorHandler);

export default app;
