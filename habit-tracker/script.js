/* Habit Tracker - localStorage powered */

const STORAGE_KEY = 'habit-tracker:v1';

function getStartOfWeek(date) {
	const d = new Date(date);
	const day = (d.getDay() + 6) % 7; // Monday start
	d.setHours(0,0,0,0);
	d.setDate(d.getDate() - day);
	return d;
}

function formatDateISO(date) {
	const d = new Date(date);
	d.setHours(0,0,0,0);
	return d.toISOString().slice(0,10);
}

function addDays(date, days) {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

function loadState() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { habits: [], weekOffset: 0 };
		const parsed = JSON.parse(raw);
		return { habits: Array.isArray(parsed.habits) ? parsed.habits : [], weekOffset: Number(parsed.weekOffset) || 0 };
	} catch (e) {
		console.error('Failed to load state', e);
		return { habits: [], weekOffset: 0 };
	}
}

function saveState(state) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createHabit(name) {
	return {
		id: crypto.randomUUID(),
		name,
		checks: {}, // dateISO -> true
		createdAt: Date.now(),
		archived: false,
	};
}

function computeStreak(habit) {
	// count consecutive days up to today where done==true
	let streak = 0;
	const todayISO = formatDateISO(new Date());
	for (let i = 0; i < 3650; i++) { // up to 10 years
		const dayISO = formatDateISO(addDays(todayISO, -i));
		if (habit.checks[dayISO]) streak++;
		else break;
	}
	return streak;
}

function render() {
	const state = loadState();
	const weekStart = getStartOfWeek(addDays(new Date(), state.weekOffset * 7));
	const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

	const weekLabel = document.getElementById('week-label');
	const startISO = formatDateISO(weekDates[0]);
	const endISO = formatDateISO(weekDates[6]);
	weekLabel.textContent = `${startISO} → ${endISO}`;

	const gridBody = document.getElementById('grid-body');
	gridBody.innerHTML = '';

	for (const habit of state.habits.filter(h => !h.archived)) {
		const row = document.createElement('div');
		row.className = 'grid-row';

		// habit col
		const habitCell = document.createElement('div');
		habitCell.className = 'cell habit-col';
		const nameInput = document.createElement('input');
		nameInput.className = 'habit-name-input';
		nameInput.value = habit.name;
		nameInput.placeholder = 'Habit name';
		nameInput.addEventListener('change', () => {
			const s = loadState();
			const h = s.habits.find(x => x.id === habit.id);
			if (h) { h.name = nameInput.value.trim() || h.name; saveState(s); }
		});
		const actions = document.createElement('div');
		actions.className = 'habit-actions';
		const archiveBtn = document.createElement('button');
		archiveBtn.textContent = 'Archive';
		archiveBtn.addEventListener('click', () => {
			const s = loadState();
			const h = s.habits.find(x => x.id === habit.id);
			if (h) { h.archived = true; saveState(s); render(); }
		});
		const deleteBtn = document.createElement('button');
		deleteBtn.textContent = 'Delete';
		deleteBtn.addEventListener('click', () => {
			const s = loadState();
			s.habits = s.habits.filter(x => x.id !== habit.id);
			saveState(s);
			render();
		});
		actions.appendChild(archiveBtn);
		actions.appendChild(deleteBtn);
		habitCell.appendChild(nameInput);
		habitCell.appendChild(actions);
		row.appendChild(habitCell);

		// day toggles
		for (const date of weekDates) {
			const dateISO = formatDateISO(date);
			const cell = document.createElement('div');
			cell.className = 'cell';
			const btn = document.createElement('button');
			btn.className = 'day-toggle';
			btn.textContent = habit.checks[dateISO] ? '✓' : '';
			if (habit.checks[dateISO]) btn.classList.add('done');
			btn.addEventListener('click', () => {
				const s = loadState();
				const h = s.habits.find(x => x.id === habit.id);
				if (!h) return;
				if (h.checks[dateISO]) delete h.checks[dateISO]; else h.checks[dateISO] = true;
				saveState(s);
				render();
			});
			cell.appendChild(btn);
			row.appendChild(cell);
		}

		// streak
		const streakCell = document.createElement('div');
		streakCell.className = 'cell streak-col';
		const streak = computeStreak(habit);
		const streakBadge = document.createElement('span');
		streakBadge.className = 'streak';
		streakBadge.textContent = `${streak}d`;
		streakCell.appendChild(streakBadge);
		row.appendChild(streakCell);

		gridBody.appendChild(row);
	}
}

function bindUI() {
	document.getElementById('add-habit-btn').addEventListener('click', () => {
		const input = document.getElementById('new-habit-input');
		const name = input.value.trim();
		if (!name) return;
		const state = loadState();
		state.habits.push(createHabit(name));
		saveState(state);
		input.value = '';
		render();
	});
	
	document.getElementById('new-habit-input').addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			document.getElementById('add-habit-btn').click();
		}
	});

	document.getElementById('prev-week').addEventListener('click', () => {
		const s = loadState();
		s.weekOffset -= 1;
		saveState(s);
		render();
	});
	document.getElementById('next-week').addEventListener('click', () => {
		const s = loadState();
		s.weekOffset += 1;
		saveState(s);
		render();
	});

	document.getElementById('export-btn').addEventListener('click', () => {
		const data = JSON.stringify(loadState(), null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'habit-tracker-export.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	});

	document.getElementById('import-input').addEventListener('change', async (e) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		try {
			const text = await file.text();
			const data = JSON.parse(text);
			if (!data || !Array.isArray(data.habits)) throw new Error('Invalid file');
			saveState({ habits: data.habits, weekOffset: Number(data.weekOffset) || 0 });
			render();
		} catch (err) {
			alert('Failed to import file. Please ensure it is a valid export.');
			console.error(err);
		} finally {
			e.target.value = '';
		}
	});
}

window.addEventListener('DOMContentLoaded', () => {
	bindUI();
	render();
});