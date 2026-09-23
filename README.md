# Telegram Task Reminder Bot

A lightweight task management and automated reminder Telegram bot built with Node.js and Telegraf framework. Designed to help students record academic deadlines and automatically receive deadline alerts directly on Telegram.

## Features

- **Automated Deadline Reminders**: Runs a background cron scheduler to automatically notify users when a task deadline arrives.
- **Multi-User Isolation**: Tasks are bound to specific Telegram chat IDs, ensuring personal reminders remain private per user.
- **Command-Based Task Entry**: Quickly log assignments with specific deadlines and descriptions via `/tambah`.
- **Assignment Overview**: View all pending tasks with auto-generated 4-digit unique IDs via `/list`.
- **Status Toggling**: Mark assignments as completed using `/selesai <id>`.
- **Local Persistence**: Stores task records locally in JSON format without database setup overhead.
- **Environment Isolation**: Securely manages bot credentials using `dotenv`.

## Prerequisites

- Node.js: Version 18.0.0 or higher.
- Telegram Account: To generate a bot token via `@BotFather`.

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

### Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `/start` | Display welcome guide and command manual | `/start` |
| `/tambah` | Add a new task with a deadline | `/tambah 2026-09-20 Tugas Sistem Operasi` |
| `/list` | List all unfinished assignments | `/list` |
| `/selesai` | Mark a task as completed by its ID | `/selesai 9184` |

---

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Library**: Telegraf.js
- **Scheduler**:node-cron
- **Configuration**: Dotenv
- **Storage**: Local JSON File System

---

## License

This project is licensed under the [MIT License](LICENSE).
