const fs = require("fs");
const cors = require("cors");
const express = require("express");
const { log } = require("console");

// user
const userJson = "./src/app/shared/mocks/users.json";

const app = express();
const port = 3000;

// cors logic
app.use(cors());
// add parser for post body
app.use(express.json());

// Функция для чтения данных из файла
function readUsersData() {
  try {
    const jsonFileData = fs.readFileSync(userJson, "utf-8");
    return JSON.parse(jsonFileData);
  } catch (error) {
    console.error("Ошибка чтения файла:", error);
    return { users: [] };
  }
}

// Функция для записи данных в файл
function writeUsersData(data) {
  try {
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(userJson, json, "utf-8");
    return true;
  } catch (error) {
    console.error("Ошибка записи файла:", error);
    return false;
  }
}

// route logic
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//************************ */ register****************************
app.post("/register", (req, res) => {
  try {
    if (!req.body?.login) {
      return res.status(400).json({ error: "не найдено свойство login" });
    }

    const parseJsonData = readUsersData();

    const isUserExist = parseJsonData.users.find(
      (user) => user.login === req.body.login
    );

    if (isUserExist) {
      return res
        .status(409)
        .json({ error: "Пользователь уже зарегистрирован" });
    }

    parseJsonData.users.push(req.body);

    if (writeUsersData(parseJsonData)) {
      res.json({ message: "ok" });
    } else {
      res.status(500).json({ error: "Ошибка сохранения данных" });
    }

    console.log("parseJsonData Registration", parseJsonData);
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

//************** */ auth**************************************
app.post("/auth", (req, res) => {
  try {
    log("req.body", req.body);

    if (!req.body?.login || !req.body?.password) {
      return res
        .status(400)
        .json({ error: "не найдено свойство login или password" });
    }

    const parseJsonData = readUsersData();
    console.log("parseJsonData auth", parseJsonData);

    if (!Array.isArray(parseJsonData?.users)) {
      return res.status(500).json({ error: "Ошибка структуры данных" });
    }

    // check psw and login
    const isUserExist = parseJsonData.users.find(
      (user) =>
        user.login === req.body.login && user.password === req.body.password
    );

    if (isUserExist) {
      // Возвращаем только безопасные данные (без пароля)
      const { password, ...userWithoutPassword } = isUserExist;
      res.json(userWithoutPassword);
    } else {
      res
        .status(401)
        .json({ error: "AUTH-Error", message: "Неверный логин или пароль" });
    }
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// run and listen serve
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
