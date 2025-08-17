# Habit Tracker (Flask + SQLite)

A minimal, local habit tracker you can run anywhere. Create habits, toggle daily check-ins, and see streaks.

## Quickstart

```bash
cd /workspace/habit-tracker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5000

## Tests

```bash
cd /workspace/habit-tracker
source .venv/bin/activate
pytest -q
```

## Project structure

- `app.py`: Flask app with routes and views
- `models.py`: Database models
- `templates/`: HTML templates
- `static/`: CSS
- `tests/`: Minimal tests using pytest
- `habit_tracker.db`: SQLite database (auto-created)