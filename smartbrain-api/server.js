const express = require("express");
var bcrypt = require("bcryptjs");

const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

//DB
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "",
    password: "",
    database: "smartbrain",
  },
});

app.use(bodyParser.json());
app.use(cors());

// Get users
// app.get("/", (req, res) => {
//   res.send(database.users);
// });

//Sign in
// Sign in
app.post("/signin", (req, res) => {
  const { email, password } = req.body;

  // Fetch the hashed password from the database based on the provided email
  knex
    .select("email", "hash")
    .from("login")
    .where({ email: email })
    .first()
    .then((loginData) => {
      if (!loginData) {
        return res.status(400).json("Invalid credentials");
      }

      const isValidPassword = bcrypt.compareSync(password, loginData.hash);
      if (!isValidPassword) {
        return res.status(400).json("Invalid credentials");
      }
      res.json("success");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("Error signing in");
    });
});

//Register
app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  knex.transaction((trx) => {
    knex("login")
      .transacting(trx)
      .insert({
        hash: hash,
        email: email,
      })
      .returning("email")
      .then((loginEmail) => {
        return knex("users")
          .transacting(trx)
          .insert({
            email: loginEmail[0]["email"],
            name: name,
            joined: new Date(),
          })
          .returning("*");
      })
      .then((user) => {
        trx.commit();
        res.json(user[0]);
      })
      .catch((err) => {
        trx.rollback();
        res.status(400).json("Unable to register");
      });
  });
});

// bcrypt.hash(password, saltRounds, (err, hash) => {
//   if (err) {
//     return res.status(400).json("Unable to register");
//   }
// });

//Profile, ID
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;

  knex("users")
    .where({ id: id })
    .first()
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).json("No such user");
      }
    })
    .catch((err) => {
      res.status(400).json("Error fetching profile");
    });
});

//Image
app.put("/image", (req, res) => {
  const { id } = req.body;

  // Fetch current entries value
  knex("users")
    .where({ id: id })
    .select("entries")
    .first()
    .then((user) => {
      if (!user) {
        throw new Error("User not found");
      }

      let currentEntries = parseInt(user.entries, 10) || 0;
      currentEntries++;

      return knex("users")
        .where({ id: id })
        .update({ entries: currentEntries.toString() })
        .returning("entries");
    })
    .then((updatedEntries) => {
      res.json(updatedEntries[0]);
    })
    .catch((err) => {
      res
        .status(400)
        .json({ error: "Error updating entries", details: err.message });
    });
});

//App listen
app.listen(3001, () => {
  console.log("App is running on 3001");
});
