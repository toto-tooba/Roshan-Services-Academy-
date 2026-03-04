import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import { nanoid } from 'nanoid';
import Database from 'better-sqlite3';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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
`);

// Migration: Add user_id column to access_codes if it doesn't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(access_codes)").all() as any[];
  const hasUserId = tableInfo.some(col => col.name === 'user_id');
  if (!hasUserId) {
    db.exec("ALTER TABLE access_codes ADD COLUMN user_id TEXT");
    console.log("Migration: Added user_id column to access_codes table");
  }
} catch (err) {
  console.error("Migration error:", err);
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
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed'));
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

  // Admin middleware
  const authAdmin = (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    if (auth === ADMIN_PASSWORD) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // API Routes
  app.post('/api/admin/upload', authAdmin, upload.single('pdf'), async (req: any, res: any) => {
    const { title } = req.body;
    const file = req.file;
    
    if (!title || !file) return res.status(400).json({ error: 'Title and PDF file are required' });
    
    const id = nanoid();
    let filePath = file.path;

    if (supabase) {
      try {
        const fileBuffer = fs.readFileSync(file.path);
        const fileName = `${id}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('notes')
          .upload(fileName, fileBuffer, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) throw uploadError;
        filePath = `supabase://${fileName}`;
        
        const { error: dbError } = await supabase
          .from('notes')
          .insert([{ id, title, file_path: filePath }]);
        
        if (dbError) throw dbError;
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Supabase upload error:', err);
        return res.status(500).json({ error: 'Failed to upload to persistent storage' });
      }
    } else {
      db.prepare('INSERT INTO notes (id, title, file_path) VALUES (?, ?, ?)')
        .run(id, title, file.path);
    }
      
    res.json({ id, title });
  });

  app.get('/api/admin/notes', authAdmin, async (req, res) => {
    if (supabase) {
      try {
        const { data: notes, error } = await supabase
          .from('notes')
          .select('*, access_codes(is_used)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = notes.map((n: any) => ({
          ...n,
          available_codes: n.access_codes.filter((c: any) => !c.is_used).length,
          used_codes: n.access_codes.filter((c: any) => c.is_used).length
        }));
        return res.json(formatted);
      } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch notes' });
      }
    }

    const notes = db.prepare(`
      SELECT n.*, 
      (SELECT COUNT(*) FROM access_codes WHERE note_id = n.id AND is_used = 0) as available_codes,
      (SELECT COUNT(*) FROM access_codes WHERE note_id = n.id AND is_used = 1) as used_codes
      FROM notes n ORDER BY created_at DESC
    `).all();
    res.json(notes);
  });

  app.post('/api/admin/generate-codes', authAdmin, async (req, res) => {
    const { noteId, count } = req.body;
    const codes = [];
    const num = count || 1;
    
    for (let i = 0; i < num; i++) {
      const code = nanoid(10).toUpperCase();
      codes.push({ code, note_id: noteId });
    }

    if (supabase) {
      try {
        const { error } = await supabase.from('access_codes').insert(codes);
        if (error) throw error;
        res.json({ codes: codes.map(c => c.code) });
      } catch (err) {
        res.status(500).json({ error: 'Failed to generate codes' });
      }
    } else {
      const insert = db.prepare('INSERT INTO access_codes (code, note_id) VALUES (?, ?)');
      for (const c of codes) {
        insert.run(c.code, c.note_id);
      }
      res.json({ codes: codes.map(c => c.code) });
    }
  });

  app.get('/api/admin/codes/:noteId', authAdmin, async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('access_codes').select('*').eq('note_id', req.params.noteId);
      if (error) return res.status(500).json({ error: 'Failed to fetch codes' });
      return res.json(data);
    }
    const codes = db.prepare('SELECT * FROM access_codes WHERE note_id = ?').all(req.params.noteId);
    res.json(codes);
  });

  app.get('/api/notes/public', async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('notes').select('id, title, created_at').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: 'Internal server error' });
      return res.json(data);
    }
    try {
      const notes = db.prepare('SELECT id, title, created_at FROM notes ORDER BY created_at DESC').all();
      res.json(notes);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/notes/unlocked', async (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    if (supabase) {
      const { data, error } = await supabase
        .from('access_codes')
        .select('code, notes(id, title)')
        .eq('user_id', userId)
        .eq('is_used', 1);
      
      if (error) return res.status(500).json({ error: 'Internal server error' });
      
      const formatted = data.map((u: any) => ({
        id: u.notes.id,
        title: u.notes.title,
        viewToken: u.code
      }));
      return res.json(formatted);
    }

    try {
      const unlockedNotes = db.prepare(`
        SELECT notes.id, notes.title, access_codes.code as viewToken
        FROM notes
        JOIN access_codes ON notes.id = access_codes.note_id
        WHERE access_codes.user_id = ? AND access_codes.is_used = 1
      `).all(userId) as any[];
      
      res.json(unlockedNotes);
    } catch (err) {
      console.error('Fetch unlocked notes error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/notes/access', async (req, res) => {
    const { accessCode, userId } = req.body;
    console.log(`Access attempt: code=${accessCode}, userId=${userId}`);
    
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    if (supabase) {
      try {
        const { data: codeData, error } = await supabase.from('access_codes').select('*').eq('code', accessCode).single();
        if (error || !codeData) return res.status(403).json({ error: 'Invalid access code' });

        if (codeData.is_used === 1) {
          if (codeData.user_id !== userId) return res.status(403).json({ error: 'This code has already been used by another device' });
        } else {
          await supabase.from('access_codes').update({ is_used: 1, used_at: new Date().toISOString(), user_id: userId }).eq('code', accessCode);
        }

        const { data: note, error: noteError } = await supabase.from('notes').select('*').eq('id', codeData.note_id).single();
        if (noteError) throw noteError;

        return res.json({ title: note.title, viewToken: accessCode, noteId: note.id });
      } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    try {
      // Check if code exists
      const codeData = db.prepare('SELECT * FROM access_codes WHERE code = ?').get(accessCode) as any;
      
      if (!codeData) {
        console.log(`Access denied: Code ${accessCode} not found`);
        return res.status(403).json({ error: 'Invalid access code' });
      }
      
      // If code is already used, check if it belongs to this user
      if (codeData.is_used === 1) {
        if (codeData.user_id !== userId) {
          console.log(`Access denied: Code ${accessCode} already used by another user (${codeData.user_id})`);
          return res.status(403).json({ error: 'This code has already been used by another device' });
        }
        console.log(`Access granted (re-entry): code=${accessCode}, userId=${userId}`);
      } else {
        // Mark code as used by this user
        db.prepare('UPDATE access_codes SET is_used = 1, used_at = CURRENT_TIMESTAMP, user_id = ? WHERE code = ?')
          .run(userId, accessCode);
        console.log(`Access granted (first time): code=${accessCode}, userId=${userId}`);
      }
      
      const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(codeData.note_id) as any;
      
      res.json({ 
        title: note.title, 
        viewToken: accessCode,
        noteId: note.id
      });
    } catch (err) {
      console.error('Access error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Serve PDF with "view token" (the used code) and userId verification
  app.get('/api/notes/view/:token', async (req, res) => {
    const token = req.params.token;
    const userId = req.query.userId as string;

    console.log(`PDF View attempt: token=${token}, userId=${userId}`);

    if (!userId) {
      console.log('PDF View denied: No userId provided');
      return res.status(400).send('User ID is required');
    }

    let codeData: any;
    let note: any;

    if (supabase) {
      try {
        const { data, error } = await supabase.from('access_codes').select('*, notes(*)').eq('code', token).eq('is_used', 1).single();
        if (error || !data) throw new Error('Unauthorized');
        codeData = data;
        note = data.notes;
      } catch (err) {
        return res.status(403).send('Unauthorized access');
      }
    } else {
      codeData = db.prepare('SELECT * FROM access_codes WHERE code = ? AND is_used = 1').get(token) as any;
      if (!codeData) return res.status(403).send('Unauthorized access');
      note = db.prepare('SELECT * FROM notes WHERE id = ?').get(codeData.note_id) as any;
    }
    
    if (codeData.user_id !== userId) {
      console.log(`PDF View denied: userId mismatch. Expected ${codeData.user_id}, got ${userId}`);
      return res.status(403).send('Access denied: Code tied to another device');
    }
    
    if (!note) return res.status(404).send('Note not found');

    if (supabase && note.file_path.startsWith('supabase://')) {
      try {
        const fileName = note.file_path.replace('supabase://', '');
        const { data, error } = await supabase.storage.from('notes').download(fileName);
        if (error) throw error;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *;");
        
        return res.send(Buffer.from(await data.arrayBuffer()));
      } catch (err) {
        return res.status(500).send('Error loading PDF');
      }
    }

    const filePath = path.resolve(note.file_path);
    if (!fs.existsSync(filePath)) {
      console.log(`PDF View denied: File not found at ${filePath}`);
      return res.status(404).send('File not found on server');
    }

    // Set headers to allow display in iframe and ensure PDF type
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    
    // Explicitly allow framing
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *;");
    
    res.sendFile(filePath);
  });

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
