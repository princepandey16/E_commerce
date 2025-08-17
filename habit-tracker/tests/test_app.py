from __future__ import annotations

import os
from datetime import date, timedelta

import pytest

from app import create_app
from models import Checkin, Habit, db


@pytest.fixture()
def app(tmp_path):
	# Use a temp DB per test session
	test_db = tmp_path / "test.db"
	app = create_app()
	app.config.update(
		TESTING=True,
		SQLALCHEMY_DATABASE_URI=f"sqlite:///{test_db}",
		WTF_CSRF_ENABLED=False,
	)
	with app.app_context():
		db.drop_all()
		db.create_all()
		yield app


@pytest.fixture()
def client(app):
	return app.test_client()


def test_create_and_toggle(client, app):
	# Create a habit
	resp = client.post("/habits", data={"name": "Test Habit", "description": ""}, follow_redirects=True)
	assert resp.status_code == 200
	with app.app_context():
		habit = Habit.query.filter_by(name="Test Habit").first()
		assert habit is not None

	# Toggle today
	resp = client.post(f"/habits/{habit.id}/toggle", follow_redirects=True)
	assert resp.status_code == 200
	with app.app_context():
		ci = Checkin.query.filter_by(habit_id=habit.id, date=date.today()).first()
		assert ci is not None

	# Toggle again to remove
	resp = client.post(f"/habits/{habit.id}/toggle", follow_redirects=True)
	assert resp.status_code == 200
	with app.app_context():
		ci = Checkin.query.filter_by(habit_id=habit.id, date=date.today()).first()
		assert ci is None


def test_streaks_progress(client, app):
	# Create habit
	client.post("/habits", data={"name": "Streaker"}, follow_redirects=True)
	with app.app_context():
		habit = Habit.query.filter_by(name="Streaker").first()
		assert habit is not None
		# Add two consecutive checkins: yesterday and today
		y = date.today() - timedelta(days=1)
		for d in [y, date.today()]:
			db.session.add(Checkin(habit_id=habit.id, date=d))
		db.session.commit()

	resp = client.get("/")
	assert resp.status_code == 200