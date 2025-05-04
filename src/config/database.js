import { connect } from 'mongoose';
import { DB_NAME } from '../utils/constant.js';


const connectDb = async ()=> {
    try {
        const connectionInstance = await connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\nMongoDb connected!! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDb connection failed", error);
        process.exit(1);
    }
} 

export default connectDb;

