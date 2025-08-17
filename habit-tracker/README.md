# Habit Tracker

A minimal, fast, and pretty habit tracker that runs entirely in your browser, storing data in localStorage.

## Features
- Weekly grid with Monday start
- Add, rename, archive, and delete habits
- Toggle completion per day
- Current streak badge per habit
- Navigate weeks (past/future)
- Export/Import data as JSON

## Usage
Open `index.html` in your browser. No build step required.

## Data persistence
Data is stored in `localStorage` under key `habit-tracker:v1`.

## Import/Export
- Export: Click "Export" to download a JSON backup.
- Import: Click "Import" and select a previous export JSON file.

## License
MIT