import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import { nanoid } from 'nanoid';
import Database from 'better-sqlite3';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const db = new Database('notes.db');

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

if (supabase) {
  console.log('Supabase integration enabled for persistent storage');
} else {
  console.warn('Supabase not configured. Using local SQLite (data will be lost on restart)');
}

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    sub_category TEXT,
    file_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS access_codes (
    code TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    is_used INTEGER DEFAULT 0,
    used_at DATETIME,
    user_id TEXT,
    FOREIGN KEY(note_id) REFERENCES notes(id)
  );
  
  CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    questions TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS global_access_codes (
    code TEXT PRIMARY KEY,
    device_id TEXT,
    name TEXT,
    email TEXT,
    age INTEGER,
    class TEXT,
    city TEXT,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    media_url TEXT,
    media_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS live_classes (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    zoom_link TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS class_requests (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.prepare('ALTER TABLE notes ADD COLUMN sub_category TEXT').run();
} catch (err) {
  // Column already exists
}

// Migration: Add user_id column to access_codes if it doesn't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(access_codes)").all() as any[];
  const hasUserId = tableInfo.some(col => col.name === 'user_id');
  if (!hasUserId) {
    db.exec("ALTER TABLE access_codes ADD COLUMN user_id TEXT");
    console.log("Migration: Added user_id column to access_codes table");
  }
} catch (err) {
  console.error("Migration error (access_codes):", err);
}

// Migration: Add category column to notes if it doesn't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(notes)").all() as any[];
  const hasCategory = tableInfo.some(col => col.name === 'category');
  if (!hasCategory) {
    db.exec("ALTER TABLE notes ADD COLUMN category TEXT");
    console.log("Migration: Added category column to notes table");
  }
} catch (err) {
  console.error("Migration error (notes):", err);
}

// Migration: Add user details columns to global_access_codes if they don't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(global_access_codes)").all() as any[];
  const columnsToAdd = ['name', 'email', 'age', 'class', 'city'];
  for (const colName of columnsToAdd) {
    if (!tableInfo.some(col => col.name === colName)) {
      const type = colName === 'age' ? 'INTEGER' : 'TEXT';
      db.exec(`ALTER TABLE global_access_codes ADD COLUMN ${colName} ${type}`);
      console.log(`Migration: Added ${colName} column to global_access_codes table`);
    }
  }
} catch (err) {
  console.error("Migration error (global_access_codes):", err);
}

// Seed some quizzes if empty
const quizCount = db.prepare('SELECT count(*) as count FROM quizzes').get() as { count: number };
if (quizCount.count === 0) {
  const sampleQuizzes = [
    {
      id: nanoid(),
      subject: 'Intelligence Test (Verbal)',
      questions: JSON.stringify([
        { q: 'What comes next in the series: 2, 4, 8, 16, ...?', options: ['20', '24', '32', '64'], correct: 2 },
        { q: 'Which one is different from the rest?', options: ['Car', 'Bus', 'Train', 'Bicycle'], correct: 3 },
        { q: 'If BAKE is coded as 21115, what is CAKE?', options: ['31115', '31116', '21115', '41115'], correct: 0 }
      ])
    },
    {
      id: nanoid(),
      subject: 'General Knowledge (Pakistan)',
      questions: JSON.stringify([
        { q: 'Who was the first Governor General of Pakistan?', options: ['Liaquat Ali Khan', 'Quaid-e-Azam Muhammad Ali Jinnah', 'Iskander Mirza', 'Ayub Khan'], correct: 1 },
        { q: 'What is the national sport of Pakistan?', options: ['Cricket', 'Hockey', 'Squash', 'Football'], correct: 1 },
        { q: 'Which is the highest mountain peak in Pakistan?', options: ['Nanga Parbat', 'K2', 'Broad Peak', 'Rakaposhi'], correct: 1 }
      ])
    },
    {
      id: nanoid(),
      subject: 'ISSB Academic (Physics)',
      questions: JSON.stringify([
        { q: 'What is the unit of Force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correct: 2 },
        { q: 'Light travels in a:', options: ['Curved line', 'Straight line', 'Zigzag way', 'Randomly'], correct: 1 }
      ])
    }
  ];
  const insertQuiz = db.prepare('INSERT INTO quizzes (id, subject, questions) VALUES (?, ?, ?)');
  sampleQuizzes.forEach(q => insertQuiz.run(q.id, q.subject, q.questions));
}

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs, Images, and Videos are allowed'));
    }
  }
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Seed Supabase quizzes if empty
  if (supabase) {
    try {
      const { count, error: countError } = await supabase.from('quizzes').select('*', { count: 'exact', head: true });
      if (!countError && count === 0) {
        const sampleQuizzes = [
          {
            id: nanoid(),
            subject: 'Intelligence Test (Verbal)',
            questions: [
              { q: 'What comes next in the series: 2, 4, 8, 16, ...?', options: ['20', '24', '32', '64'], correct: 2 },
              { q: 'Which one is different from the rest?', options: ['Car', 'Bus', 'Train', 'Bicycle'], correct: 3 },
              { q: 'If BAKE is coded as 21115, what is CAKE?', options: ['31115', '31116', '21115', '41115'], correct: 0 }
            ]
          },
          {
            id: nanoid(),
            subject: 'General Knowledge (Pakistan)',
            questions: [
              { q: 'Who was the first Governor General of Pakistan?', options: ['Liaquat Ali Khan', 'Quaid-e-Azam Muhammad Ali Jinnah', 'Iskander Mirza', 'Ayub Khan'], correct: 1 },
              { q: 'What is the national sport of Pakistan?', options: ['Cricket', 'Hockey', 'Squash', 'Football'], correct: 1 },
              { q: 'Which is the highest mountain peak in Pakistan?', options: ['Nanga Parbat', 'K2', 'Broad Peak', 'Rakaposhi'], correct: 1 }
            ]
          },
          {
            id: nanoid(),
            subject: 'ISSB Academic (Physics)',
            questions: [
              { q: 'What is the unit of Force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correct: 2 },
              { q: 'Light travels in a:', options: ['Curved line', 'Straight line', 'Zigzag way', 'Randomly'], correct: 1 }
            ]
          }
        ];
        await supabase.from('quizzes').insert(sampleQuizzes);
        console.log('Supabase: Seeded sample quizzes');
      }
    } catch (err) {
      console.error('Supabase seeding error:', err);
    }
  }

  app.use(express.json());
  app.use('/uploads', express.static('uploads'));

  app.get('/api/quizzes', async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('quizzes').select('id, subject');
      if (error) return res.status(500).json({ error: 'Failed to fetch quizzes' });
      return res.json(data);
    }
    const quizzes = db.prepare('SELECT id, subject FROM quizzes').all();
    res.json(quizzes);
  });

  app.get('/api/quizzes/:id', async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('quizzes').select('*').eq('id', req.params.id).single();
      if (error || !data) return res.status(404).json({ error: 'Quiz not found' });
      return res.json({ ...data, questions: typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions });
    }
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(req.params.id) as any;
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ ...quiz, questions: JSON.parse(quiz.questions) });
  });

  // Global Access Codes validation
  app.post('/api/auth/verify-global', (req, res) => {
    const { code, deviceId, name, email, age, class: className, city } = req.body;
    
    // Check if code exists and is unused
    const valCode = db.prepare('SELECT * FROM global_access_codes WHERE code = ?').get(code) as any;
    if (!valCode) {
      return res.status(400).json({ success: false, error: 'Invalid access code' });
    }
    if (valCode.used_at) {
      return res.status(400).json({ success: false, error: 'Access code already used' });
    }

    db.prepare('UPDATE global_access_codes SET used_at = CURRENT_TIMESTAMP, device_id = ?, name = ?, email = ?, age = ?, class = ?, city = ? WHERE code = ?').run(
      deviceId, name, email, age, className, city, code
    );
    res.json({ success: true });
  });

  // Admin APIs (we'll skip proper auth token checking here for simplicity, but in a real app we should)
  app.post('/api/admin/global-access-codes', (req, res) => {
    const code = nanoid(8).toUpperCase();
    db.prepare('INSERT INTO global_access_codes (code) VALUES (?)').run(code);
    res.json({ success: true, code });
  });

  app.get('/api/admin/global-access-codes', (req, res) => {
    const codes = db.prepare('SELECT * FROM global_access_codes ORDER BY created_at DESC').all();
    res.json({ success: true, codes });
  });

  app.post('/api/articles', upload.single('media'), (req, res) => {
    const { title, content } = req.body;
    const media_url = (req as any).file ? `/uploads/${(req as any).file.filename}` : null;
    const media_type = (req as any).file ? (req as any).file.mimetype : null;
    const id = nanoid();
    
    db.prepare('INSERT INTO articles (id, title, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)')
      .run(id, title, content, media_url, media_type);
      
    res.json({ success: true, id, media_url });
  });

  app.post('/api/upload', (req, res, next) => {
    console.log('--- /api/upload request received ---');
    console.log('Headers:', req.headers);
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Multer upload error encountered:', err);
        return res.status(400).json({ success: false, error: err.message });
      }
      try {
        if (!(req as any).file) {
          console.warn('Upload completed but no file was found in request.');
          return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        console.log('File uploaded successfully to system:', (req as any).file);
        res.json({
          success: true,
          url: `/uploads/${(req as any).file.filename}`,
          type: (req as any).file.mimetype,
          name: (req as any).file.originalname
        });
      } catch (catchErr: any) {
        console.error('Error in handling uploaded file callback:', catchErr);
        next(catchErr);
      }
    });
  });

  app.post('/api/verify-receipt', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'No file URL provided' });
    }

    try {
      const relativePath = url.startsWith('/') ? url.slice(1) : url;
      const fullPath = path.join(process.cwd(), relativePath);

      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ success: false, error: 'File not found on server' });
      }

      const fileBuffer = fs.readFileSync(fullPath);
      const base64Data = fileBuffer.toString('base64');

      const ext = path.extname(fullPath).toLowerCase();
      let mimeType = 'image/png';
      if (ext === '.pdf') {
        mimeType = 'application/pdf';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        mimeType = 'image/jpeg';
      } else if (ext === '.png') {
        mimeType = 'image/png';
      }

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return res.status(500).json({ success: false, error: 'Gemini API is not configured on server' });
      }

      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      console.log('Calling Gemini to parse metadata from file:', fullPath, 'Mime type:', mimeType);
      
      let lastError: any = null;
      let response = null;
      
      // We list the models in order of fallback
      const modelsToTry = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite"
      ];
      
      for (let attempt = 0; attempt < 3; attempt++) {
        // We attempt gemini-3.5-flash for the first two tries, and then fallback to gemini-3.1-flash-lite on the third
        const currentModel = (attempt < 2) ? "gemini-3.5-flash" : "gemini-3.1-flash-lite";
        
        try {
          console.log(`[Attempt ${attempt + 1}/3] Querying OCR details with model: ${currentModel}`);
          
          const configStructure: any = {
            systemInstruction: "You are a professional transactional auditing OCR engine. Extract PK payment details with 100% precision. Return empty strings if details cannot be found.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                receiverName: {
                  type: Type.STRING,
                  description: "Name of the person or entity receiving the payment (e.g. Shams Uddin, Shamas ud Din)."
                },
                receiverNumber: {
                  type: Type.STRING,
                  description: "Account/wallet number of the receiver, or masked number such as ****8280."
                },
                senderName: {
                  type: Type.STRING,
                  description: "Name of the person sending/paying."
                },
                senderNumber: {
                  type: Type.STRING,
                  description: "Account or digital wallet number of the sender."
                },
                amount: {
                  type: Type.STRING,
                  description: "Paid amount (e.g., 980, 980.00, Rs. 980)."
                },
                transactionId: {
                  type: Type.STRING,
                  description: "Transaction reference identifier or TID/Ref Number."
                },
                date: {
                  type: Type.STRING,
                  description: "Detailed transaction date, e.g. June 3, 2026 or 2026-06-03."
                },
                time: {
                  type: Type.STRING,
                  description: "Detailed transaction time, e.g. 10:13 AM, 9:49:04."
                },
                paymentProvider: {
                  type: Type.STRING,
                  description: "Banking/wallet provider, e.g. JazzCash, EasyPaisa, Sadapay, Nayapay, Raast, Allied Bank, HBL, Meezan, MCB, UBL, Alfalah etc."
                },
                isGenuineReceipt: {
                  type: Type.BOOLEAN,
                  description: "Boolean indicating if file contains a valid transaction receipt."
                }
              }
            }
          };

          // thinkingConfig is only available for Gemini 3 series models
          if (currentModel.startsWith("gemini-3")) {
            configStructure.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
          }

          response = await ai.models.generateContent({
            model: currentModel,
            contents: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              },
              "Parse this payment receipt. Extract all required transaction parameters."
            ],
            config: configStructure
          });

          if (response && response.text) {
            console.log(`[Success] Gemini parse succeeded on attempt ${attempt + 1} using ${currentModel}!`);
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err.message || String(err);
          console.warn(`[Warning] Attempt ${attempt + 1} with ${currentModel} failed:`, errMsg);
          
          const isTransient = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("ResourceExhausted") || errMsg.includes("429");
          
          if (!isTransient && attempt < 2) {
            // Non-transient errors might also be retried with the next model anyway
            console.log(`Non-transient error found, but we will schedule retry with fallback.`);
          }

          if (attempt < 2) {
            const delay = (attempt + 1) * 1200;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error("Failed to receive response from Gemini models after retries");
      }

      const text = response.text;
      console.log('Successfully completed Gemini OCR payload extraction:', text);
      const extracted = JSON.parse(text);

      return res.json({
        success: true,
        extracted
      });

    } catch (err: any) {
      console.error('OCR API Failure:', err);
      let cleanMsg = err.message || 'An error occurred during verification';
      
      // Clean up raw Google API JSON strings from the error message for display
      try {
        if (cleanMsg.trim().startsWith('{')) {
          const parsed = JSON.parse(cleanMsg);
          if (parsed.error && parsed.error.message) {
            cleanMsg = parsed.error.message;
          }
        }
      } catch (e) {
        // ignore parsing failures
      }

      if (cleanMsg.includes('high demand') || cleanMsg.includes('503') || cleanMsg.includes('UNAVAILABLE')) {
        cleanMsg = "The AI verification engine is currently experiencing high demand. Please click 'Upload & Analyze Receipt' to retry in a few seconds.";
      }

      return res.status(500).json({ success: false, error: cleanMsg });
    }
  });

  app.get('/api/articles', (req, res) => {
    const articles = db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
    res.json({ success: true, articles });
  });

  app.post('/api/admin/live-classes', (req, res) => {
    const { topic, teacher_name, start_time, end_time, zoom_link, description } = req.body;
    const id = nanoid();
    db.prepare('INSERT INTO live_classes (id, topic, teacher_name, start_time, end_time, zoom_link, description) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, topic, teacher_name, start_time, end_time, zoom_link, description);
    res.json({ success: true, id });
  });

  app.get('/api/live-classes', (req, res) => {
    const classes = db.prepare('SELECT * FROM live_classes ORDER BY start_time DESC').all();
    res.json({ success: true, classes });
  });

  app.post('/api/class-requests', (req, res) => {
    const { topic, description } = req.body;
    const id = nanoid();
    db.prepare('INSERT INTO class_requests (id, topic, description) VALUES (?, ?, ?)')
      .run(id, topic, description);
    res.json({ success: true, id });
  });

  app.get('/api/admin/class-requests', (req, res) => {
    const requests = db.prepare('SELECT * FROM class_requests ORDER BY created_at DESC').all();
    res.json({ success: true, requests });
  });

  app.delete('/api/admin/live-classes/:id', (req, res) => {
    db.prepare('DELETE FROM live_classes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Global Error Handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('--- EXPRESS GLOBAL ERROR CAUGHT ---');
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'An unexpected internal server error occurred.'
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
