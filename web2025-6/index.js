const express = require('express');
const { program } = require('commander');
const fs = require('fs');
const path = require('path');

program
  .requiredOption('-h, --host <host>', 'адреса сервера (обовʼязково)')
  .requiredOption('-p, --port <port>', 'порт сервера (обовʼязково)')
  .requiredOption('-c, --cache <path>', 'шлях до кеш-директорії (обовʼязково)');

program.parse(process.argv);

const { host, port, cache } = program.opts();

if (!fs.existsSync(cache)) {
  console.error(`❌ Кеш-директорія "${cache}" не існує.`);
  process.exit(1);
}

const app = express();

app.get('/', (req, res) => {
  res.send('✅ Сервер працює!');
});

app.listen(port, host, () => {
  console.log(`🚀 Сервер запущено на http://${host}:${port}`);
  console.log(`📂 Кеш-директорія: ${cache}`);
});
