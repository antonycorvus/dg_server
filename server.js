const io = require("socket.io")(3000, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST", "DELETE"],
        path: "/control"
    },
});

const fs = require('fs');
const path = require('path');

const userFilePath = path.join(__dirname, "userData.txt");
let userList = [];

io.on("connection", (socket) =>{
    console.log("a user connected");

    fs.readFile(userFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
          // Chuyển đổi dữ liệu sang mảng đối tượng
          userList = JSON.parse(data);
          // Gửi danh sách người dùng về máy khách
          io.emit("userList", userList);
        }
      });

    socket.on("addUser", (user) => {
        userList.push(user);
        saveUserList();
        io.emit("userList", userList);
    });

    socket.on("removeUser", (index) => {
        userList.splice(index, 1);
        saveUserList();
        io.emit("userList", userList);
    });

    // Emit initial user list
    io.emit("userList", userList);
        
    socket.on("updateUserList", () => {
        io.emit("userList", userList);
    });

});

function saveUserList() {
    fs.writeFile(userFilePath, JSON.stringify(userList), (err) => {
      if (err) {
        console.error("Error saving user list:", err);
        io.emit("Error when saving user list");
      } else {
        console.log("User list saved to file");
        io.emit("save success");
      }
    });
  }

console.log("server started");