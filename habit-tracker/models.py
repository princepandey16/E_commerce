from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Iterable, Set

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Habit(db.Model):
	__tablename__ = "habit"

	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(120), nullable=False, index=True)
	description = db.Column(db.Text, default="")
	created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
	archived = db.Column(db.Boolean, default=False, nullable=False)


class Checkin(db.Model):
	__tablename__ = "checkin"

	id = db.Column(db.Integer, primary_key=True)
	habit_id = db.Column(db.Integer, db.ForeignKey("habit.id"), nullable=False, index=True)
	date = db.Column(db.Date, nullable=False, index=True)
	created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

	habit = db.relationship(
		"Habit",
		backref=db.backref("checkins", lazy="dynamic", cascade="all, delete-orphan"),
	)

	__table_args__ = (
		db.UniqueConstraint("habit_id", "date", name="uix_checkin_habit_date"),
	)


def compute_streak(checkin_dates: Iterable[date]) -> int:
	"""Compute the current daily streak length.

	A streak is the number of consecutive days ending today (if checked-in today) or
	yesterday (if not yet checked-in today) that have check-ins.
	"""
	date_set: Set[date] = set(checkin_dates)
	if not date_set:
		return 0

	today = date.today()
	anchor = today if today in date_set else today - timedelta(days=1)
	if anchor not in date_set:
		return 0

	streak = 0
	cursor = anchor
	while cursor in date_set:
		streak += 1
		cursor -= timedelta(days=1)
	return streak