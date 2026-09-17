import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const DB_FILE = path.resolve('tasks.json');

// Helper: baca database lokal
function loadTasks() {
  if (!fs.existsSync(DB_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

// Helper: simpan database lokal
function saveTasks(tasks) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

// Command /start
bot.start((ctx) => {
  ctx.reply(
    'Halo! Aku bot pengingat tugas kuliah.\n\n' +
    'Perintah yang bisa kamu pakai:\n' +
    '1. /tambah <deadline> <nama tugas>\n' +
    '   Contoh: /tambah 2026-09-25 Laporan Praktikum Jarkom\n' +
    '2. /list - Melihat daftar semua tugas\n' +
    '3. /selesai <id> - Menandai tugas sudah beres'
  );
});

// Command /tambah <deadline> <nama tugas>
bot.command('tambah', (ctx) => {
  const text = ctx.message.text.split(' ');
  if (text.length < 3) {
    return ctx.reply('Format salah!\nContoh: /tambah 2026-09-25 Laporan Jarkom');
  }

  const deadline = text[1];
  const taskName = text.slice(2).join(' ');
  const tasks = loadTasks();

  const newTask = {
    id: Date.now().toString().slice(-4),
    name: taskName,
    deadline: deadline,
    done: false,
  };

  tasks.push(newTask);
  saveTasks(tasks);

  ctx.reply(`[OK] Tugas berhasil dicatat!\nID: ${newTask.id}\nTugas: ${newTask.name}\nDeadline: ${newTask.deadline}`);
});

// Command /list
bot.command('list', (ctx) => {
  const tasks = loadTasks().filter((t) => !t.done);

  if (tasks.length === 0) {
    return ctx.reply('Belum ada tugas yang tercatat! Santai dulu.');
  }

  let replyText = 'Daftar Tugas Kuliah Belum Selesai:\n========================\n';
  tasks.forEach((t) => {
    replyText += `ID [${t.id}] | ${t.deadline} : ${t.name}\n`;
  });

  ctx.reply(replyText);
});

// Command /selesai <id>
bot.command('selesai', (ctx) => {
  const args = ctx.message.text.split(' ');
  const taskId = args[1];

  if (!taskId) return ctx.reply('Sebutkan ID tugasnya. Contoh: /selesai 1234');

  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === taskId);

  if (!task) return ctx.reply('ID tugas tidak ditemukan.');

  task.done = true;
  saveTasks(tasks);

  ctx.reply(`Mantap! Tugas "${task.name}" sudah ditandai selesai.`);
});

// Jalankan Bot
bot.launch();
console.log('Bot Telegram aktif dan sedang mendengarkan pesan...');

// Handle shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
