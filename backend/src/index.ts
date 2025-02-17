import express from "express";
import { PORT } from "./config/serverConfig";
import apiRoutes from "./routes/apiRoutes";
const app = express();

const setUpAndStartServer = () => {

    app.use('/api', apiRoutes)

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}
