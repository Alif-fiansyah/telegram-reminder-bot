# Telegram Task Reminder Bot

A lightweight task management and automated reminder Telegram bot built with Node.js and Telegraf framework. Designed to help students record academic deadlines, interact with responsive inline buttons, and automatically receive deadline alerts directly on Telegram.

## Features

- **Automated Deadline Reminders**: Runs a background cron scheduler to automatically notify users when a task deadline arrives.
- **Interactive Inline Buttons**: Easily mark tasks as done or delete them in one tap directly from the chat list using Telegram inline keyboards.
- **Multi-User Isolation**: Tasks are bound to specific Telegram chat IDs, ensuring personal reminders remain private per user.
- **Command-Based Task Entry**: Quickly log assignments with specific deadlines and descriptions via `/tambah`.
- **Assignment Overview**: View all pending tasks with auto-generated 4-digit unique IDs via `/list`.
- **Status Toggling & Deletion**: Mark assignments as completed or remove unwanted tasks either via inline buttons or `/selesai <id>`.
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
| `[ Selesai ✅ ]` |Tap inline button below task message to mark done | `One-tap button interaction` |
| `[ Hapus 🗑️ ]` | Tap inline button below task message to delete task | `One-tap button interaction` |
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
