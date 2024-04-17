const express = require("express")
const session = require('express-session')
const md5 = require('md5');
const app = express()

var PORT = process.env.port || 3000

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
app.get("/", function(req, res)
{
  // req.session.key = value
  if (!req.session.name)
  {
      // Generate unique session name
      const timestamp = Date.now();
      const randomHash = md5(Math.random().toString());
      req.session.name = `${timestamp}-${randomHash}`;
      return res.send("Session Set")
  }
  else
  {
      res.send("The current session is :" + req.session.name);
  }
})

app.get("/session", function(req, res)
{
  res.send("The current session is :" + req.session.name);
})

app.get("/logout", function(req, res)
{
   req.session.destroy(function(error)
   {
      console.log("Session Destroyed")
  })
  return res.send("Session Destroyed");
})

app.listen(PORT, function(error)
{
  if(error) throw error
  console.log("Server created Successfully on PORT :", PORT)
})
