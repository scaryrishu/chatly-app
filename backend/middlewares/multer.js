import multer from "multer"

const storage = multer.memoryStorage()

export default multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB cap, adjust as you like
})