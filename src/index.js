import app from './app.js';
import connectDb from './config/database.js';
import dotenv from 'dotenv';
const PORT = 4000

dotenv.config({
    path: "./.env"
})

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port no ${PORT}`)
        });
    })
    .catch((err) => {
        console.log('Mongo DB Connection Failed!!', err)
    })
