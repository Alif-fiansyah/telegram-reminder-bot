import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

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

// Helper: format tanggal hari ini (YYYY-MM-DD)
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Command /start
bot.start((ctx) => {
  ctx.reply(
    'Halo! Aku bot pengingat tugas kuliah.\n\n' +
    'Perintah yang bisa kamu pakai:\n' +
    '1. /tambah <deadline> <nama tugas>\n' +
    '   Contoh: /tambah 2026-09-25 Laporan Praktikum Jarkom\n' +
    '2. /list - Melihat daftar tugas aktifmu\n' +
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
  const chatId = ctx.chat.id;
  const tasks = loadTasks();

  const newTask = {
    id: Date.now().toString().slice(-4),
    chatId: chatId, // Isolasi per chat/user
    name: taskName,
    deadline: deadline,
    done: false,
    notified: false // Flag agar reminder tidak spam berkali-kali
  };

  tasks.push(newTask);
  saveTasks(tasks);

  ctx.reply(`[OK] Tugas berhasil dicatat!\nID: ${newTask.id}\nTugas: ${newTask.name}\nDeadline: ${newTask.deadline}`);
});

// Command /list
bot.command('list', (ctx) => {
  const chatId = ctx.chat.id;
  // Hanya ambil tugas milik user yang sedang chat
  const tasks = loadTasks().filter((t) => t.chatId === chatId && !t.done);

  if (tasks.length === 0) {
    return ctx.reply('Belum ada tugas yang tercatat! Santai dulu.');
  }

  let replyText = '📌 *Daftar Tugas Belum Selesai:*\n========================\n';
  tasks.forEach((t) => {
    replyText += `• [ID: \`${t.id}\`] 📅 *${t.deadline}*\n  📝 ${t.name}\n\n`;
  });

  ctx.replyWithMarkdown(replyText);
});

// Command /selesai <id>
bot.command('selesai', (ctx) => {
  const args = ctx.message.text.split(' ');
  const taskId = args[1];
  const chatId = ctx.chat.id;

  if (!taskId) return ctx.reply('Sebutkan ID tugasnya. Contoh: /selesai 1234');

  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === taskId && t.chatId === chatId);

  if (!task) return ctx.reply('ID tugas tidak ditemukan atau bukan milikmu.');

  task.done = true;
  saveTasks(tasks);

  ctx.reply(`Mantap! Tugas "${task.name}" sudah ditandai selesai ✅`);
});

// ==========================================
// BACKGROUND WORKER: Pengingat Otomatis (Cron)
// Dijalankan setiap hari pukul 08.00 pagi WIB
// ==========================================
cron.schedule('0 8 * * *', () => {
  const tasks = loadTasks();
  const today = getTodayString();

  tasks.forEach((task) => {
    // Ingatkan jika belum selesai dan deadline-nya hari ini
    if (!task.done && task.deadline === today && !task.notified) {
      bot.telegram.sendMessage(
        task.chatId,
        `⚠️ *PENGINGAT DEADLINE HARI INI!*\n\nTugas: *${task.name}*\nDeadline: Hari ini (${task.deadline})\n\nSegera tuntaskan dan ketik:\n/selesai ${task.id}`,
        { parse_mode: 'Markdown' }
      ).catch((err) => console.error(`Gagal mengirim reminder ke ${task.chatId}:`, err));

      task.notified = true;
    }
  });

  saveTasks(tasks);
});

// Jalankan Bot
bot.launch();
console.log('Bot Telegram aktif dengan Cron Scheduler (Auto-reminder jam 08.00)...');

// Handle shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));