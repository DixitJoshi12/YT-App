//require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
});
connectDB()
    .then(() => {
        // listen on port
        app.listen(process.env.PORT || 3000,()=>{
            console.log(`Server is Running at PORT : ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.error("MongoDB connection Failed! ", err);
    });



/*
// using IIFE function
;(async ()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
    }catch(err){
        console.log("Error : ",err);
    }
})()
*/