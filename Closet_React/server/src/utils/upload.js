import multer from 'multer';
import path from 'path';
import fs from 'fs';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = path.join(process.cwd(), 'public', 'uploads');
    
    let dest;
    if (file.fieldname === 'profilePicture') {
      dest = path.join(baseDir, 'photos_user');
    } else {
      dest = path.join(baseDir, 'photos_products');
    }
    
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safe = file.originalname.replace(/[^a-z0-9\\.\\-_]/gi, '_').toLowerCase();
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safe}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});