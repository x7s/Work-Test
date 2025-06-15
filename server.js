import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

const productsFile = path.join(__dirname, 'data/products.json');
const uploadDir = path.join(__dirname, 'public', 'images');

// Настройка за Multer (качване на изображения)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /products → зарежда JSON с продуктите
app.get('/products', async (req, res) => {
  try {
    const data = await fs.readJson(productsFile);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при зареждане на продуктите.' });
  }
});

// POST /products → получава продукт + изображение
app.post('/products', upload.single('image'), async (req, res) => {
  const { name, plu, group } = req.body;
  const imageFile = req.file;

  if (!name || !plu || !group || !imageFile) {
    return res.status(400).json({ error: 'Всички полета са задължителни.' });
  }

  const newProduct = {
    image: `images/${imageFile.filename}`,
    name,
    plu,
    group
  };

  try {
    const products = await fs.readJson(productsFile).catch(() => []);
    products.push(newProduct);
    await fs.writeJson(productsFile, products, { spaces: 2 });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при записване на продукта.' });
  }
});

app.listen(PORT, () => {
  console.log(`Сървърът работи на http://localhost:${PORT}`);
});
