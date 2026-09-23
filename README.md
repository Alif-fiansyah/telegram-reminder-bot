# Telegram Task Reminder Bot

A production-ready, lightweight task management and automated reminder Telegram bot built with Node.js, Telegraf framework, and SQLite. Designed to help students record deadlines using natural language, interact with dynamic inline buttons, receive automated deadline notifications, and export task recaps to spreadsheet files.

## Features

- **Relational Persistence (SQLite)**: Powered by `better-sqlite3` for fast, ACID-compliant local database operations without the overhead of external database servers.
- **Smart Natural Date Parsing**: Supports natural language deadlines like `besok`, `lusa`, relative offsets (`3hari`, `2minggu`), alongside traditional ISO dates (`YYYY-MM-DD`).
- **Interactive Inline Buttons**: Update task statuses or remove entries in one tap directly within Telegram chat messages.
- **Automated Deadline Reminders**: Background cron worker runs daily to push notifications for tasks reaching their deadline.
- **CSV Data Export**: Easily export all pending and completed assignments into a structured CSV file via `/export`.
- **Multi-User Isolation**: Automatic user and chat scoping ensuring private task isolation per Telegram user.
- **Environment Isolation**: Securely manages bot authentication tokens with `dotenv`.

## Prerequisites

- Node.js: Version 18.0.0 or higher.
- Telegram Account: To obtain a bot token via `@BotFather`.

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone [https://github.com/Alif-fiansyah/telegram-reminder-bot.git](https://github.com/Alif-fiansyah/telegram-reminder-bot.git)
   cd telegram-reminder-bot

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   ```

4. **Run the bot:**
   ```bash
   node index.js
   ```

---

## Usage Examples

### Commands & Interactions

| Command / Action | Description | Example / Usage |
| :--- | :--- | :--- |
| `/start` | Display welcome guide and command instructions | `/start` |
| `/tambah` | Add tasks using natural dates or ISO format | `/tambah besok Laporan Jarkom`<br>`/tambah 3hari Kuis OS`<br>`/tambah 2026-09-30 UTS` |
| `/list` | Show pending tasks sorted by closest deadline | `/list` |
| `[ Selesai ✅ ]` | Mark task as finished directly from message button | Single tap |
| `[ Hapus 🗑️ ]` | Remove task entry from database | Single tap |
| `/export` | Generate and download assignments history as a CSV file | `/export` |
| `/selesai <id>` | Alternative manual command to complete tasks | `/selesai 4821` |

---

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Telegraf.js
- **Database**: SQLite
- **Date Handling**: Day.js
- **Scheduler**:node-cron
- **Configuration**: Dotenv
  
---

## License

This project is licensed under the [MIT License](LICENSE).
