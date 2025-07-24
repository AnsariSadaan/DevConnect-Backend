import express from 'express';
import cors from 'cors';
import userRouter from './routes/auth.routes.js';
import userProfileRouter from './routes/profile.routes.js';
import userFeedRouter from './routes/user.routes.js';
import requestSendReceiveRouter from './routes/request.routes.js';
import cookieParser from 'cookie-parser';
import './utils/Cronjob.js';

const app = express();

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
}));


app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));


app.use('/api', userRouter);
app.use('/api', userProfileRouter);
app.use('/api', userFeedRouter);
app.use('/api', requestSendReceiveRouter)



// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // ADDED A CHECK TO AVOID DUPLICATE RESPONSE
    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
});

export default app;