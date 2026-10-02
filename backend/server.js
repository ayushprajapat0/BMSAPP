import express from 'express'
const app = express()
import 'dotenv/config'
import { connectToMongoDB } from './configs/db.js'
import transportManagerRoutes from "./routes/transportManagerRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import routeRoutes from "./routes/routeRoutes.js"
import busRoutes from "./routes/busRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";

const port = process.env.PORT

app.use(express.json())
await connectToMongoDB();


app.use("/api/transport-managers",transportManagerRoutes);
app.use("/api/drivers",driverRoutes);
app.use("/api/routes",routeRoutes);
app.use("/api/bus",busRoutes);
app.use("/api/assignments", assignmentRoutes);

app.listen(port,()=>{
    console.log(`Server is listning at ${port}`)
})