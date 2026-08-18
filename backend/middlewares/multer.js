import multer from "multer"
import fs from "fs"
import path from "path"

const uploadDir = path.join(process.cwd(), "public")
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

export default multer({ storage })