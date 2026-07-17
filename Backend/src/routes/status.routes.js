const express =require("express")
const router =express.Router();

router.get("/status",(req,res)=>{
  res.json({
    status:"online",
    timeStamp:new Date(),
  })
})
module.exports = router;