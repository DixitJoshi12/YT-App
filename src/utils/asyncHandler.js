// asyncHandler with Promise
const asyncHandler = (requestHandler)=>{
    return (req,res,next) => { 
        Promise.resolve(requestHandler(req,res,next)).reject((err)=> next(err));
    }
}


export {asyncHandler}

// asyncHandler with try catch
// const asyncHandler = (fn)=> async (req,res,next) => {
//     try {
//         await fn(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success : false,
//             message : error.message
//         });
//     }
// }