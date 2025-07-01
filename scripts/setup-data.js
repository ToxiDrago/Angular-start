const fs = require("fs");
const path = require("path");

const serverDataDir = path.join(__dirname, "..", "server-data");
const userJsonPath = path.join(serverDataDir, "users.json");
const toursJsonPath = path.join(serverDataDir, "tours.json");

console.log("🔧 Setting up server data files...");

if (!fs.existsSync(serverDataDir)) {
  fs.mkdirSync(serverDataDir, { recursive: true });
  console.log("📁 Created server-data directory");
}

if (!fs.existsSync(userJsonPath)) {
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

  fs.writeFileSync(userJsonPath, JSON.stringify(defaultUsers, null, 2));
  console.log("✅ Created users.json");
} else {
  console.log("✅ users.json already exists");
}

if (!fs.existsSync(toursJsonPath)) {
  const rootToursPath = path.join(__dirname, "..", "tours.json");

  if (fs.existsSync(rootToursPath)) {
    const toursContent = fs.readFileSync(rootToursPath, "utf-8");
    fs.writeFileSync(toursJsonPath, toursContent);
    console.log("✅ Copied tours.json from root to server-data");
  } else {
    // Create minimal tours.json
    const defaultTours = {
      tours: [
        {
          id: "1",
          name: "Sample Tour",
          description: "A sample tour for testing",
          tourOperator: "Test Operator",
          price: "€1,000",
          img: "placeholder.jpg",
          type: "single",
        },
      ],
    };

    fs.writeFileSync(toursJsonPath, JSON.stringify(defaultTours, null, 2));
    console.log("✅ Created default tours.json");
  }
} else {
  console.log("✅ tours.json already exists");
}

console.log("🎉 Server data setup complete!");
console.log(`📁 Data directory: ${serverDataDir}`);
console.log(`📄 Files created:`);
console.log(`   - ${userJsonPath}`);
console.log(`   - ${toursJsonPath}`);
