const fs = require("fs");
const cors = require("cors");
const express = require("express");
const path = require("path");

// FIXED: Point to the correct server-data directory
const userJson = path.join(__dirname, "..", "server-data", "users.json");
const toursJson = path.join(__dirname, "..", "server-data", "tours.json");

// Enhanced file existence check with better error messages
if (!fs.existsSync(userJson)) {
  console.error(`❌ User file not found: ${userJson}`);
  console.log("💡 Expected location: server-data/users.json");

  // Create server-data directory if it doesn't exist
  const serverDataDir = path.join(__dirname, "..", "server-data");
  if (!fs.existsSync(serverDataDir)) {
    fs.mkdirSync(serverDataDir, { recursive: true });
    console.log("📁 Created server-data directory");
  }

  // Create default users.json
  const defaultUsers = {
    users: [
      {
        login: "admin",
        password: "admin123",
        email: "admin@example.com",
      },
      {
        login: "user",
        password: "user123",
        email: "user@example.com",
      },
    ],
  };

  fs.writeFileSync(userJson, JSON.stringify(defaultUsers, null, 2));
  console.log("✅ Created users.json in server-data directory");
}

if (!fs.existsSync(toursJson)) {
  console.error(`❌ Tours file not found: ${toursJson}`);
  console.log("💡 Expected location: server-data/tours.json");

  // Check if tours.json exists in root and copy it
  const rootToursJson = path.join(__dirname, "..", "tours.json");
  if (fs.existsSync(rootToursJson)) {
    console.log(
      "📋 Found tours.json in root directory, copying to server-data..."
    );
    const toursContent = fs.readFileSync(rootToursJson, "utf-8");
    fs.writeFileSync(toursJson, toursContent);
    console.log("✅ Copied tours.json to server-data directory");
  } else {
    console.error("❌ tours.json not found in root directory either");
    console.log("💡 Please ensure tours.json exists in server-data directory");
    process.exit(1);
  }
}

const app = express();
const port = 3000;

// CORS logic
app.use(cors());
// Add parser for post body
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Route logic
app.get("/", (req, res) => {
  res.json({
    message: "Tour Management API Server",
    status: "running",
    endpoints: ["/auth", "/register", "/tours", "/tour/:id"],
  });
});

//************************ REGISTER ****************************
app.post("/register", (req, res) => {
  try {
    console.log("📝 Registration attempt:", {
      login: req.body?.login,
      email: req.body?.email,
    });

    const jsonFileData = fs.readFileSync(userJson, "utf-8");
    let parseJsonData = JSON.parse(jsonFileData);

    if (req.body?.login) {
      const isUserExist = parseJsonData.users.find(
        (user) => user.login === req.body?.login
      );

      if (!isUserExist) {
        parseJsonData.users.push({
          login: req.body.login,
          password: req.body.password,
          email: req.body.email || "",
        });

        const json = JSON.stringify(parseJsonData, null, 2);
        fs.writeFileSync(userJson, json, "utf-8");

        console.log("✅ User registered successfully:", req.body.login);
        res.json({ success: true, message: "User registered successfully" });
      } else {
        console.log("⚠️ User already exists:", req.body.login);
        res.status(400).json({ error: "Пользователь уже зарегистрирован" });
      }
    } else {
      console.log("❌ Missing login in registration request");
      res.status(400).json({ error: "не найдено свойство login" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Ошибка сервера при регистрации" });
  }
});

//************************ AUTH ****************************
app.post("/auth", (req, res) => {
  try {
    console.log("🔐 Authentication attempt:", { login: req.body?.login });

    if (req.body?.login && req.body.password) {
      const jsonFileData = fs.readFileSync(userJson, "utf-8");
      const parseJsonData = JSON.parse(jsonFileData);

      if (Array.isArray(parseJsonData?.users)) {
        const isUserExist = parseJsonData?.users.find(
          (user) =>
            user.login === req.body?.login &&
            user.password === req.body?.password
        );

        if (isUserExist) {
          console.log("✅ Authentication successful:", req.body.login);
          // Don't send password back to client
          const { password, ...userResponse } = isUserExist;
          res.json(userResponse);
        } else {
          console.log("❌ Authentication failed:", req.body.login);
          res.status(401).json({ error: "Неверный логин или пароль" });
        }
      } else {
        console.error("❌ Invalid user data structure");
        res
          .status(500)
          .json({ error: "Ошибка структуры данных пользователей" });
      }
    } else {
      console.log("❌ Missing credentials in auth request");
      res.status(400).json({ error: "не найдено свойство login или password" });
    }
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Ошибка сервера при авторизации" });
  }
});

//************************ TOURS ****************************
app.get("/tours", (req, res) => {
  try {
    console.log("📋 Fetching tours list");
    const jsonFileData = fs.readFileSync(toursJson, "utf-8");
    const toursData = JSON.parse(jsonFileData);

    console.log(`✅ Returning ${toursData.tours?.length || 0} tours`);
    res.json(toursData);
  } catch (error) {
    console.error("Tours error:", error);
    res.status(500).json({ error: "Ошибка загрузки туров" });
  }
});

//************************ GET TOUR BY ID ****************************
app.get("/tour/:id", (req, res) => {
  try {
    const paramId = req.params.id;
    console.log("🔍 Fetching tour by ID:", paramId);

    const jsonFileData = fs.readFileSync(toursJson, "utf-8");
    const parseJsonData = JSON.parse(jsonFileData);

    const item = parseJsonData.tours.find((tour) => tour.id === paramId);
    if (item) {
      console.log("✅ Tour found:", item.name);
      res.json(item);
    } else {
      console.log("❌ Tour not found for ID:", paramId);
      res.status(404).json({ error: `Тур не найден по id: ${paramId}` });
    }
  } catch (error) {
    console.error("Tour by ID error:", error);
    res.status(500).json({ error: "Ошибка загрузки тура" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// 404 handler
app.use((req, res) => {
  console.log("❌ 404 - Route not found:", req.path);
  res.status(404).json({ error: "Маршрут не найден" });
});

// Run and listen server
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`📁 Users file: ${userJson}`);
  console.log(`📁 Tours file: ${toursJson}`);
  console.log(`🌐 API available at: http://localhost:${port}`);
  console.log(`📖 API documentation:`);
  console.log(`   GET  /           - Server info`);
  console.log(`   POST /auth       - User authentication`);
  console.log(`   POST /register   - User registration`);
  console.log(`   GET  /tours      - Get all tours`);
  console.log(`   GET  /tour/:id   - Get tour by ID`);
});
