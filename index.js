const express = require("express")
const session = require('express-session')
const md5 = require('md5');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express()

var PORT = process.env.port || 3000

// Connect to SQLite database
const dbPath = path.join(__dirname, 'db.db');
const db = new sqlite3.Database(dbPath);

  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  //Create the demo user if the user does not exist.
  db.run(`
INSERT INTO users (username, password)
SELECT 'user1', 'password'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'user1'
);`);

// Session Setup
app.use(session(
{
  // It holds the secret key for session
  secret: 'Your_Secret_Key',
  // Forces the session to be saved
  // back to the session store
  resave: true,
  // Forces a session that is "uninitialized"
  // to be saved to the store
  saveUninitialized: true
}))

/*
  Creates a session if needed, and returns a string describing what happened.
*/
function session_start(req)
{
  // req.session.key = value
  if (!req.session.name)
  {
      // Generate unique session name
      const timestamp = Date.now();
      const randomHash = md5(Math.random().toString());
      req.session.name = `${timestamp}-${randomHash}`;
      return "Created session: " + req.session.name;
  }
  else
  {
      return "The current session is :" + req.session.name;
  }
}

function is_session_set()
{
  if (!req.session.name)
  {
    return false;
  }
  else
  {
    return true;
  }
}

app.get("/session", function(req, res)
{
  var szOut = "The current session is :" + req.session.name;
  if( req.session.username )
  {
    szOut += "\nThe current username is :" + req.session.username;
  }
  return res.send(szOut);
})

app.get("/logout", function(req, res)
{
  var szOut = "Session Destroyed.<a href='/'>Continue</a>.";
  req.session.destroy(function(error)
  {
    console.log("Session Destroyed")
  })
  return res.send(szOut);
})

// Logon endpoint
app.get("/logon", function(req, res)
{
    var szSessionResult = session_start(req);
    const { username, password, redirect } = req.query;

    // Check if username and password are provided
    if (!username || !password)
    {
        return res.status(400).send('Username and password are required.');
    }

    // Query the database for the provided username and password
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err)
        {
            console.error(err.message);
            return res.status(500).send('Internal Server Error.');
        }
        // If user exists, set session and redirect
        if (row)
        {
            req.session.username = username;
            if( redirect )
            {
              return res.redirect(redirect || '/');
            }
            else
            {
              return res.send(`Login successful. <a href='/'>Continue</a>.`);
            }
        }
        else
        {
            return res.status(401).send('Invalid username or password.');
        }
    });
});

// Handle application errors - these can only happen from above
app.use(function(err, req, res, next)
{
    console.error(err.stack);
    res.status(500).send('Internal Server Error.');
});

// serve static files from the public directory
app.use(express.static('public'));

// Handle 404 - Not Found
app.use(function(req, res, next)
{
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});


app.listen(PORT, function(error)
{
  if(error) throw error
  console.log("Server created Successfully on PORT :", PORT)
})
