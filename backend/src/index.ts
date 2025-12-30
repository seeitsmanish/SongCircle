import express from "express";
import { ALLOWED_ORIGINS, PORT } from "./config/serverConfig";
const app = express();
import apiRoutes from "./api";
import cors from "cors";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";
import { logger } from "./utils/logger";
import { setUpWebSocketServer } from "./webSocketServer";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";


app.use(helmet());
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests, please try again later.",
            data: null,
        });
    }
});
app.use(limiter);
// Morgan logs HTTP requests to Pino
app.use(
    morgan(
        ":method :url :status :response-time ms - reqId=:req[id]",
        {
            stream: {
                write: (msg) => logger.info(msg.trim()),
            },
        }
    )
);

// Middleware
app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(clerkMiddleware())

// global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(`Global error handler: ${err.stack || err.message}`);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        data: null,
    });
});


app.use('/api', apiRoutes)
const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
})
setUpWebSocketServer(server);