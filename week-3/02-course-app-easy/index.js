const express = require("express");
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let USER_COURSES = [];

let nextCourseId = 0;

function isAuth(username, password, users) {
	return users.find(
		({ username: username1, password: password1 }) =>
			username1 === username && password1 === password
	);
}

// Admin routes
app.post("/admin/signup", (req, res) => {
	// logic to sign up admin
	if (!req.body.username || !req.body.password) {
		return res
			.status(400)
			.json({ error: "username and password required" });
	}
	if (ADMINS.find((admin) => admin.username === req.body.username)) {
		return res.status(400).json({ error: "username already exists" });
	}
	ADMINS.push(req.body);
	return res.status(201).json({ message: "Admin created successfully" });
});

app.use("/admin", (req, res, next) => {
	const { username, password } = req.headers;
	if (!username || !password) {
		return res
			.status(400)
			.json({ error: "username and password required" });
	}
	if (!isAuth(username, password, ADMINS)) {
		return res.status(403).json({ error: "Invalid credentials" });
	}
	next();
});

app.post("/admin/login", (req, res) => {
	// logic to log in admin
	res.status(200).json({ message: "Logged in successfully" });
});

app.post("/admin/courses", (req, res) => {
	// logic to create a course
	const idx = COURSES.push({ ...req.body, id: nextCourseId }) - 1;
	nextCourseId++;
	res.status(200).json({
		message: "Course created successfully",
		courseId: COURSES[idx].id,
	});
});

app.put("/admin/courses/:courseId", (req, res) => {
	// logic to edit a course
	const idx = COURSES.findIndex(
		(course) => course.id === parseInt(req.params.courseId)
	);
	if (idx === -1) {
		return res.status(404).json({
			message: "Course not found",
		});
	}
	COURSES[idx] = { ...COURSES[idx], ...req.body };
	return res.status(200).json({
		message: "Course updated successfully",
	});
});

app.get("/admin/courses", (req, res) => {
	// logic to get all courses
	res.status(200).json({ courses: COURSES });
});

// User routes
app.post("/users/signup", (req, res) => {
	// logic to sign up user
	if (!req.body.username || !req.body.password) {
		res.status(400).json({ error: "username and password required" });
	}
	if (USERS.find((users) => users.username === req.body.username)) {
		res.status(400).json({ error: "username already exists" });
	}
	USERS.push(req.body);
	res.status(201).json({ message: "User created successfully" });
});

app.use("/users", (req, res, next) => {
	const { username, password } = req.headers;
	if (!username || !password) {
		return res
			.status(400)
			.json({ error: "username and password required" });
	}
	if (!isAuth(username, password, USERS)) {
		return res.status(403).json({ error: "Invalid credentials" });
	}
	next();
});

app.post("/users/login", (req, res) => {
	// logic to log in user
	return res.status(200).json({ error: "Logged in successfully" });
});

app.get("/users/courses", (req, res) => {
	// logic to list all courses
	return res
		.status(200)
		.json({ courses: COURSES.filter((course) => course.published) });
});

app.post("/users/courses/:courseId", (req, res) => {
	// logic to purchase a course
	const idx = COURSES.findIndex(
		(course) => course.id === parseInt(req.params.courseId)
	);
	if (idx === -1 || !COURSES[idx].published) {
		return res.status(404).json({
			message: "Course not found",
		});
	}
	if (
		USER_COURSES.some(
			(pair) =>
				pair.username === req.headers.username &&
				pair.courseId === parseInt(req.params.courseId)
		)
	) {
		return res.status(403).json({
			message: "Course already purchased",
		});
	}
	USER_COURSES.push({
		username: req.headers.username,
		courseId: parseInt(req.params.courseId),
	});
	return res.status(200).json({
		message: "Course purchased successfully",
	});
});

app.get("/users/purchasedCourses", (req, res) => {
	// logic to view purchased courses
	console.log(COURSES, USER_COURSES);
	return res.status(200).json({
		courses: COURSES.filter((course) =>
			USER_COURSES.some(
				(pair) =>
					pair.username === req.headers.username &&
					parseInt(pair.courseId) === course.id
			)
		),
	});
});

app.listen(3000, () => {
	console.log("Server is listening on port 3000");
});
