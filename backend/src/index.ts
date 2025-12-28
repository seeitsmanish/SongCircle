import express from "express";
import { PORT } from "./config/serverConfig";
const app = express();
import apiRoutes from "./api";
import cors from "cors";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";
import { logger } from "./utils/logger";
import { setUpWebSocketServer } from "./webSocketServer";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware())


app.use('/api', apiRoutes)
const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
})
setUpWebSocketServer(server);