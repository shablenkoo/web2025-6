const { swaggerUi, swaggerSpec } = require('./swagger');

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

/**
 * @swagger
 * /notes/{name}:
 *   get:
 *     summary: Отримати нотатку за імʼям
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Імʼя нотатки
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Текст нотатки
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Нотатку не знайдено
 */
app.get('/notes/:name', (req, res) => {
  const filePath = path.join(cache, req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  res.send(content);
});

/**
 * @swagger
 * /notes/{name}:
 *   put:
 *     summary: Замінити текст нотатки
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Імʼя нотатки
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Нотатку оновлено
 *       404:
 *         description: Нотатку не знайдено
 */
app.put('/notes/:name', (req, res) => {
  const filePath = path.join(cache, req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }
  fs.writeFileSync(filePath, req.body.text || '');
  res.sendStatus(200);
});

/**
 * @swagger
 * /notes/{name}:
 *   delete:
 *     summary: Видалити нотатку
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Імʼя нотатки
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Нотатку видалено
 *       404:
 *         description: Нотатку не знайдено
 */
app.delete('/notes/:name', (req, res) => {
  const filePath = path.join(cache, req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }
  fs.unlinkSync(filePath);
  res.sendStatus(200);
});

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Отримати список всіх нотаток
 *     responses:
 *       200:
 *         description: Список нотаток
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   text:
 *                     type: string
 */
app.get('/notes', (req, res) => {
  const notes = fs.readdirSync(cache).map(name => {
    const text = fs.readFileSync(path.join(cache, name), 'utf-8');
    return { name, text };
  });
  res.status(200).json(notes);
});

/**
 * @swagger
 * /write:
 *   post:
 *     summary: Додати нову нотатку через форму
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               note_name:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Нотатку створено
 *       400:
 *         description: Нотатка з таким імʼям вже існує
 */
app.post('/write', upload.none(), (req, res) => {
  const { note_name, note } = req.body;
  const filePath = path.join(cache, note_name);
  if (fs.existsSync(filePath)) {
    return res.sendStatus(400);
  }

  fs.writeFileSync(filePath, note);
  res.sendStatus(201);
});

/**
 * @swagger
 * /UploadForm.html:
 *   get:
 *     summary: Отримати HTML-форму для завантаження нотатки
 *     responses:
 *       200:
 *         description: HTML сторінка форми
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

// Swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start server
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});

