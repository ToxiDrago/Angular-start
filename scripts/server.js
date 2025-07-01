const fs = require("fs");
const cors = require("cors");
const express = require("express");
const path = require("path");

const userJson = path.join(__dirname, "..", "server-data", "users.json");
const toursJson = path.join(__dirname, "..", "server-data", "tours.json");

// Проверяем существование файлов
if (!fs.existsSync(userJson)) {
  console.error(`❌ User file not found: ${userJson}`);
  process.exit(1);
}

if (!fs.existsSync(toursJson)) {
  console.error(`❌ Tours file not found: ${toursJson}`);
  process.exit(1);
}

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Главная страница
app.get("/", (req, res) => {
  res.json({
    message: "Tour Management API Server",
    status: "running",
    endpoints: [
      "GET  /",
      "POST /auth",
      "POST /register",
      "GET  /tours",
      "GET  /tour/:id",
      "GET  /nearestTours?locationId=xxx",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Регистрация пользователя
app.post("/register", (req, res) => {
  try {
    console.log("📝 Registration attempt:", {
      login: req.body?.login,
      email: req.body?.email,
    });

    if (!req.body?.login) {
      return res.status(400).json({
        error: "Не найдено свойство login",
      });
    }

    const jsonFileData = fs.readFileSync(userJson, "utf-8");
    const parseJsonData = JSON.parse(jsonFileData);

    const isUserExist = parseJsonData.users.find(
      (user) => user.login === req.body.login
    );

    if (isUserExist) {
      return res.status(400).json({
        error: "Пользователь уже зарегистрирован",
      });
    }

    // Добавляем нового пользователя
    parseJsonData.users.push({
      login: req.body.login,
      password: req.body.password,
      email: req.body.email || "",
    });

    const json = JSON.stringify(parseJsonData, null, 2);
    fs.writeFileSync(userJson, json, "utf-8");

    console.log("✅ User registered successfully:", req.body.login);
    res.json({
      success: true,
      message: "Пользователь успешно зарегистрирован",
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      error: "Ошибка сервера при регистрации",
    });
  }
});

// Авторизация пользователя
app.post("/auth", (req, res) => {
  try {
    console.log("🔐 Authentication attempt:", {
      login: req.body?.login,
    });

    if (!req.body?.login || !req.body?.password) {
      return res.status(400).json({
        error: "Не найдено свойство login или password",
      });
    }

    const jsonFileData = fs.readFileSync(userJson, "utf-8");
    const parseJsonData = JSON.parse(jsonFileData);

    if (!Array.isArray(parseJsonData?.users)) {
      return res.status(500).json({
        error: "Ошибка структуры данных пользователей",
      });
    }

    const isUserExist = parseJsonData.users.find(
      (user) =>
        user.login === req.body.login && user.password === req.body.password
    );

    if (isUserExist) {
      console.log("✅ Authentication successful:", req.body.login);
      const { password, ...userResponse } = isUserExist;
      res.json(userResponse);
    } else {
      console.log("❌ Authentication failed:", req.body.login);
      res.status(401).json({
        error: "Неверный логин или пароль",
      });
    }
  } catch (error) {
    console.error("❌ Auth error:", error);
    res.status(500).json({
      error: "Ошибка сервера при авторизации",
    });
  }
});

// Получение всех туров
app.get("/tours", (req, res) => {
  try {
    console.log("📋 Fetching tours list");
    const jsonFileData = fs.readFileSync(toursJson, "utf-8");
    const toursData = JSON.parse(jsonFileData);

    console.log(`✅ Returning ${toursData.tours?.length || 0} tours`);
    res.json(toursData);
  } catch (error) {
    console.error("❌ Tours error:", error);
    res.status(500).json({
      error: "Ошибка загрузки туров",
    });
  }
});

// Получение тура по ID
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
      res.status(404).json({
        error: `Тур не найден по id: ${paramId}`,
      });
    }
  } catch (error) {
    console.error("❌ Tour by ID error:", error);
    res.status(500).json({
      error: "Ошибка загрузки тура",
    });
  }
});

// Получение ближайших туров по locationId
app.get("/nearestTours", (req, res) => {
  try {
    const locationId = req.query?.locationId;
    console.log("🗺️ Fetching nearest tours for locationId:", locationId);

    if (!locationId) {
      return res.status(400).json({
        error: "Не указан параметр locationId",
      });
    }

    const jsonFileData = fs.readFileSync(toursJson, "utf-8");
    const parseJsonData = JSON.parse(jsonFileData);

    const items = parseJsonData.tours.filter(
      (tour) => tour.locationId === locationId
    );

    console.log(
      `✅ Found ${items.length} nearest tours for locationId: ${locationId}`
    );
    res.json(items);
  } catch (error) {
    console.error("❌ Nearest tours error:", error);
    res.status(500).json({
      error: "Ошибка загрузки ближайших туров",
    });
  }
});

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error("💥 Unhandled error:", error);
  res.status(500).json({
    error: "Внутренняя ошибка сервера",
  });
});

// 404 обработчик
app.use((req, res) => {
  console.log("❌ 404 - Route not found:", req.path);
  res.status(404).json({
    error: "Маршрут не найден",
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`📁 Users file: ${userJson}`);
  console.log(`📁 Tours file: ${toursJson}`);
  console.log(`🌐 API available at: http://localhost:${port}`);
  console.log(`📖 API endpoints:`);
  console.log(`   GET  /           - Server info`);
  console.log(`   POST /auth       - User authentication`);
  console.log(`   POST /register   - User registration`);
  console.log(`   GET  /tours      - Get all tours`);
  console.log(`   GET  /tour/:id   - Get tour by ID`);
  console.log(`   GET  /nearestTours?locationId=xxx - Get nearest tours`);
});
