const express = require('express');
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const multer = require('multer');

const app = express();
const program = new Command();
const upload = multer();

program
  .requiredOption('-h, --host <host>', 'host')
  .requiredOption('-p, --port <port>', 'port')
  .requiredOption('-c, --cache <path>', 'cache directory');

program.parse(process.argv);

const { host, port, cache } = program.opts();

// Ensure cache directory exists
if (!fs.existsSync(cache)) {
  fs.mkdirSync(cache, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET /notes/:name
app.get('/notes/:name', (req, res) => {
  const filePath = path.join(cache, req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  res.send(content);
});

// PUT /notes/:name
app.put('/notes/:name', (req, res) => {
  const filePath = path.join(cache, req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }
  fs.writeFileSync(filePath, req.body.text || '');
  res.sendStatus(200);
});

// DELETE /notes/:name
app.delete('/notes/:name', (req, res) => {
  const filePath = path.join(cache, req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }
  fs.unlinkSync(filePath);
  res.sendStatus(200);
});

// GET /notes
app.get('/notes', (req, res) => {
  const notes = fs.readdirSync(cache).map(name => {
    const text = fs.readFileSync(path.join(cache, name), 'utf-8');
    return { name, text };
  });
  res.status(200).json(notes);
});

// POST /write
app.post('/write', upload.none(), (req, res) => {
  const { note_name, note } = req.body;
  const filePath = path.join(cache, note_name);

  if (fs.existsSync(filePath)) {
    return res.sendStatus(400); // Already exists
  }

  fs.writeFileSync(filePath, note);
  res.sendStatus(201); // Created
});

// GET /UploadForm.html
app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

// Start server
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});

