const express = require("express");
var bcrypt = require("bcryptjs");

const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

const database = {
  users: [
    {
      id: "1",
      name: "john",
      email: "john@gmail.com",
      password: "cookies",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "2",
      name: "jane",
      email: "jane@gmail.com",
      password: "bananas",
      entries: 0,
      joined: new Date(),
    },
  ],
};

//

app.get("/", (req, res) => {
  res.send(database.users);
});

//Sign in

app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  const user = database.users.find((user) => user.email === email);

  if (user) {
    const isValid = bcrypt.compare(password, user.password);
    if (isValid) {
      return res.json("success");
    }
  }
  return res.status(400).json("error logging in!");
});

//Register

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  console.log(hash);

  database.users.push({
    id: 3,
    name: name,
    email: email,
    password: hash,
    entries: 0,
    joined: new Date(),
  });
  res.json(database.users[database.users.length - 1]);
});

//Profile, ID

app.get("/profile/:id", (req, res) => {
  let found = false;
  const { id } = req.params;
  const user = database.users.find((user) => user.id === id);

  if (user) {
    found = true;
    return res.json(user);
  } else {
    return res.json("No such user");
  }
});

//Image

app.put("/image", (req, res) => {
  let found = false;
  const { id } = req.body;
  const user = database.users.find((user) => user.id === id);

  if (user) {
    found = true;
    user.entries++;
    return res.json(user.entries);
  } else {
    return res.json("No such user");
  }
});

//App listen

app.listen(3001, () => {
  console.log("App is running on 3001");
});
