import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),  
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = Date.now() + ext;
        cb(null, name);
    },
});

export const upload = multer({ 
    storage,
    fileFilter: (_req, file, cb) => {
        const isImage = file.mimetype.startsWith("image/");
        if (!isImage) return cb(new Error("Apenas arquivos de imagem são permitidos."));
        return cb(null, true);        
    },
});