CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  service TEXT,
  location TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  source TEXT,
  created_at TEXT NOT NULL
);
