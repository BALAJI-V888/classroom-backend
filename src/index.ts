import express from "express";

const app = express();
const port = process.env.PORT || 8000;

//defining express router
const router  = express.Router();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the classroom backend API!");
})



app.listen(port, () =>
    { console.log(`Server running on port http://localhost:${port}`)
    });