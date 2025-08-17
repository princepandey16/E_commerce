from __future__ import annotations

import os
from datetime import date, timedelta

from flask import Flask, flash, redirect, render_template, request, url_for

from models import Checkin, Habit, compute_streak, db



def create_app() -> Flask:
	app = Flask(__name__, template_folder="templates", static_folder="static")
	app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///habit_tracker.db"
	app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
	app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key-change-me")

	db.init_app(app)

	with app.app_context():
		db.create_all()

	# Routes
	@app.get("/")
	def index():
		habits = (
			Habit.query.filter_by(archived=False)
			.order_by(Habit.created_at.asc())
			.all()
		)
		# Precompute checkin sets and streaks
		habit_view_models = []
		for habit in habits:
			# Get all check-in dates for this habit
			checkin_dates = [c.date for c in habit.checkins.order_by(Checkin.date.asc()).all()]
			streak = compute_streak(checkin_dates)
			today_done = date.today() in set(checkin_dates)
			habit_view_models.append({
				"habit": habit,
				"streak": streak,
				"today_done": today_done,
			})

		return render_template("index.html", habits=habit_view_models, today=date.today())

	@app.post("/habits")
	def create_habit():
		name = (request.form.get("name") or "").strip()
		description = (request.form.get("description") or "").strip()
		if not name:
			flash("Name is required", "error")
			return redirect(url_for("index"))

		habit = Habit(name=name, description=description)
		db.session.add(habit)
		db.session.commit()
		flash("Habit created", "success")
		return redirect(url_for("index"))

	@app.post("/habits/<int:habit_id>/toggle")
	def toggle_today(habit_id: int):
		habit = Habit.query.get_or_404(habit_id)
		today = date.today()
		existing = Checkin.query.filter_by(habit_id=habit.id, date=today).first()
		if existing:
			db.session.delete(existing)
			db.session.commit()
			flash("Unchecked for today", "info")
		else:
			ci = Checkin(habit_id=habit.id, date=today)
			db.session.add(ci)
			db.session.commit()
			flash("Checked in for today!", "success")
		return redirect(url_for("index"))

	@app.get("/habits/<int:habit_id>")
	def habit_detail(habit_id: int):
		habit = Habit.query.get_or_404(habit_id)
		# Last 30 days view
		end = date.today()
		start = end - timedelta(days=29)
		all_checkins = Checkin.query.filter(
			Checkin.habit_id == habit.id,
			Checkin.date >= start,
			Checkin.date <= end,
		).order_by(Checkin.date.asc()).all()
		date_to_checked = {ci.date: True for ci in all_checkins}
		days = []
		cursor = start
		while cursor <= end:
			checked = date_to_checked.get(cursor, False)
			days.append({"date": cursor, "checked": checked})
			cursor += timedelta(days=1)

		streak = compute_streak([ci.date for ci in habit.checkins.order_by(Checkin.date.asc()).all()])
		checked_today = date_to_checked.get(date.today(), False)

		return render_template(
			"habit_detail.html",
			habit=habit,
			days=days,
			streak=streak,
			today=date.today(),
			checked_today=checked_today,
		)

	@app.post("/habits/<int:habit_id>/delete")
	def delete_habit(habit_id: int):
		habit = Habit.query.get_or_404(habit_id)
		db.session.delete(habit)
		db.session.commit()
		flash("Habit deleted", "info")
		return redirect(url_for("index"))

	@app.post("/habits/<int:habit_id>/archive")
	def archive_habit(habit_id: int):
		habit = Habit.query.get_or_404(habit_id)
		habit.archived = True
		db.session.commit()
		flash("Habit archived", "info")
		return redirect(url_for("index"))

	return app


if __name__ == "__main__":
	app = create_app()
	app.run(host="127.0.0.1", port=5000, debug=True)