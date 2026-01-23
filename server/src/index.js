import http from "http";
import dotenv from "dotenv";
import { configureExpress } from "./config/express.js";
import { configureSocket } from "./config/socket.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = configureExpress();
const server = http.createServer(app);
configureSocket(server);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Server failed to start:", err.message);
    }
};

startServer();
