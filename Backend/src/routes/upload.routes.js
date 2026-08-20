const express= require("express")
const multer=require("multer")

const router =express.Router();

const storage=multer.diskStorage({
 destination:(req,file,cb)=>{
  cb(null,"uploads/")
 },
 filename:(req,file,cb)=>{
   cb(null, Date.now() + "-" + file.originalname);
 }
})
const upload=multer({storage});
router.post("/audio",upload.single("audio"),(req,res)=>{
    console.log("Uploaded file:", req.file);
    res.json({
      message:"Audio upload successfully",
      file:req.file,
    })
})

module.exports = router;