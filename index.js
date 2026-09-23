import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import dayjs from 'dayjs';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// ==========================================
// 1. INISIALISASI DATABASE (SQLite)
// ==========================================
const db = new Database('database.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    chat_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    deadline TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    notified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Helper: Smart Date Parser
function parseSmartDate(input) {
  const cleanInput = input.toLowerCase().trim();
  const now = dayjs();

  if (cleanInput === 'hari-ini' || cleanInput === 'today') {
    return now.format('YYYY-MM-DD');
  }
  if (cleanInput === 'besok' || cleanInput === 'tomorrow') {
    return now.add(1, 'day').format('YYYY-MM-DD');
  }
  if (cleanInput === 'lusa') {
    return now.add(2, 'day').format('YYYY-MM-DD');
  }

  // Format: 3hari / 5hari / 2minggu
  const matchRelative = cleanInput.match(/^(\d+)(hari|minggu)$/);
  if (matchRelative) {
    const amount = parseInt(matchRelative[1], 10);
    const unit = matchRelative[2] === 'hari' ? 'day' : 'week';
    return now.add(amount, unit).format('YYYY-MM-DD');
  }

  // Cek jika formatnya sudah YYYY-MM-DD atau valid date string
  const parsed = dayjs(input);
  if (parsed.isValid() && input.length >= 8) {
    return parsed.format('YYYY-MM-DD');
  }

  return null;
}

// ==========================================
// 2. COMMANDS & HANDLERS
// ==========================================

// Command /start
bot.start((ctx) => {
  ctx.reply(
    '👋 Halo! Aku bot pengingat tugas kuliah (SQLite + Smart Date Edition).\n\n' +
    '📌 *Panduan Perintah:*\n' +
    '1. `/tambah <deadline> <nama tugas>`\n' +
    '   Contoh Natural: `/tambah besok Praktikum Jarkom`\n' +
    '   Contoh Relatif: `/tambah 3hari Laporan Akhir`\n' +
    '   Contoh Tanggal: `/tambah 2026-09-30 Ujian Tengah Semester`\n\n' +
    '2. `/list` - Melihat daftar tugas aktif dengan tombol aksi\n' +
    '3. `/export` - Mengunduh rekapan semua tugas dalam format CSV spreadsheet\n' +
    '4. `/selesai <id>` - Tandai tugas selesai via teks',
    { parse_mode: 'Markdown' }
  );
});

// Command /tambah <deadline> <nama tugas>
bot.command('tambah', (ctx) => {
  const parts = ctx.message.text.split(' ');
  if (parts.length < 3) {
    return ctx.reply(
      '⚠️ *Format salah!*\n\nContoh:\n• `/tambah besok Kuis Jaringan`\n• `/tambah 2026-09-28 Revisi Makalah`',
      { parse_mode: 'Markdown' }
    );
  }

  const rawDeadline = parts[1];
  const taskName = parts.slice(2).join(' ');
  const deadline = parseSmartDate(rawDeadline);

  if (!deadline) {
    return ctx.reply(
      '❌ Tanggal tidak valid! Gunakan kata kunci seperti `besok`, `lusa`, `3hari`, atau format `YYYY-MM-DD`.'
    );
  }

  const taskId = Math.floor(1000 + Math.random() * 9000).toString();
  const chatId = ctx.chat.id;

  const stmt = db.prepare(`
    INSERT INTO tasks (id, chat_id, name, deadline, done, notified)
    VALUES (?, ?, ?, ?, 0, 0)
  `);
  stmt.run(taskId, chatId, taskName, deadline);

  ctx.reply(
    `✅ *Tugas Berhasil Dicatat!*\n\n🔑 *ID:* \`${taskId}\`\n📝 *Tugas:* ${taskName}\n📅 *Deadline:* ${deadline}`,
    { parse_mode: 'Markdown' }
  );
});

// Command /list
bot.command('list', (ctx) => {
  const chatId = ctx.chat.id;
  const stmt = db.prepare('SELECT * FROM tasks WHERE chat_id = ? AND done = 0 ORDER BY deadline ASC');
  const tasks = stmt.all(chatId);

  if (tasks.length === 0) {
    return ctx.reply('🎉 Tidak ada tugas aktif. Waktunya santai!');
  }

  ctx.reply('📌 *Daftar Tugas Aktif Kamu:*', { parse_mode: 'Markdown' });

  tasks.forEach((t) => {
    ctx.reply(
      `📅 *Deadline:* ${t.deadline}\n📝 *Tugas:* ${t.name}\n🔑 *ID:* \`${t.id}\``,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('Selesai ✅', `done_${t.id}`),
          Markup.button.callback('Hapus 🗑️', `del_${t.id}`)
        ])
      }
    );
  });
});

// Command /export (Ekspor CSV file)
bot.command('export', async (ctx) => {
  const chatId = ctx.chat.id;
  const stmt = db.prepare('SELECT id, name, deadline, done, created_at FROM tasks WHERE chat_id = ? ORDER BY created_at DESC');
  const tasks = stmt.all(chatId);

  if (tasks.length === 0) {
    return ctx.reply('Belum ada data tugas untuk diekspor!');
  }

  // Format CSV
  let csvContent = 'ID,Nama Tugas,Deadline,Status,Tanggal Dibuat\n';
  tasks.forEach((t) => {
    const status = t.done ? 'SELESAI' : 'BELUM SELESAI';
    const escapedName = `"${t.name.replace(/"/g, '""')}"`;
    csvContent += `${t.id},${escapedName},${t.deadline},${status},${t.created_at}\n`;
  });

  const filePath = path.resolve(`rekap_tugas_${chatId}.csv`);
  fs.writeFileSync(filePath, csvContent, 'utf-8');

  try {
    await ctx.replyWithDocument({
      source: filePath,
      filename: `rekap_tugas_${dayjs().format('YYYYMMDD')}.csv`
    }, {
      caption: '📊 Berikut rekapan semua tugas kuliahmu dalam format spreadsheet (CSV).'
    });
  } catch (err) {
    ctx.reply('Gagal mengirim file ekspor.');
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Bersihkan file temp lokal
    }
  }
});

// Aksi tombol "Selesai ✅"
bot.action(/^done_(.+)$/, (ctx) => {
  const taskId = ctx.match[1];
  const chatId = ctx.chat.id;

  const stmt = db.prepare('UPDATE tasks SET done = 1 WHERE id = ? AND chat_id = ?');
  const result = stmt.run(taskId, chatId);

  if (result.changes === 0) {
    return ctx.answerCbQuery('Tugas tidak ditemukan!');
  }

  ctx.answerCbQuery('Tugas ditandai selesai!');
  ctx.editMessageText('✅ *Tugas telah diselesaikan! Bagus sekali.*', {
    parse_mode: 'Markdown'
  });
});

// Aksi tombol "Hapus 🗑️"
bot.action(/^del_(.+)$/, (ctx) => {
  const taskId = ctx.match[1];
  const chatId = ctx.chat.id;

  const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND chat_id = ?');
  const result = stmt.run(taskId, chatId);

  if (result.changes === 0) {
    return ctx.answerCbQuery('Tugas tidak ditemukan!');
  }

  ctx.answerCbQuery('Tugas dihapus!');
  ctx.editMessageText('🗑️ *Tugas telah dihapus dari database.*', {
    parse_mode: 'Markdown'
  });
});

// Command /selesai <id> (Manual)
bot.command('selesai', (ctx) => {
  const parts = ctx.message.text.split(' ');
  const taskId = parts[1];
  const chatId = ctx.chat.id;

  if (!taskId) return ctx.reply('Format: /selesai <id>');

  const stmt = db.prepare('UPDATE tasks SET done = 1 WHERE id = ? AND chat_id = ?');
  const result = stmt.run(taskId, chatId);

  if (result.changes === 0) {
    return ctx.reply('ID tugas tidak ditemukan.');
  }

  ctx.reply(`Mantap! Tugas ID ${taskId} berhasil ditandai selesai ✅`);
});

// ==========================================
// 3. BACKGROUND CRON NOTIFICATION
// ==========================================
cron.schedule('0 8 * * *', () => {
  const today = dayjs().format('YYYY-MM-DD');
  const stmt = db.prepare('SELECT * FROM tasks WHERE done = 0 AND deadline = ? AND notified = 0');
  const pendingTasks = stmt.all(today);

  const updateStmt = db.prepare('UPDATE tasks SET notified = 1 WHERE id = ?');

  pendingTasks.forEach((t) => {
    bot.telegram.sendMessage(
      t.chat_id,
      `⚠️ *PENGINGAT DEADLINE HARI INI!*\n\n📝 *Tugas:* ${t.name}\n📅 *Deadline:* ${t.deadline}\n\nTuntaskan sekarang dan klik tombol di bawah:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('Tandai Selesai ✅', `done_${t.id}`)
        ])
      }
    ).catch((err) => console.error(`Gagal mengirim reminder ke ${t.chat_id}:`, err));

    updateStmt.run(t.id);
  });
});

// Jalankan bot
bot.launch();
console.log('Bot Telegram aktif (SQLite + Smart Date + CSV Exporter + Cron Scheduler)...');

// Handle shutdown
process.once('SIGINT', () => {
  db.close();
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  db.close();
  bot.stop('SIGTERM');
});