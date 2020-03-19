const express = require('express');
const app = express(); 
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser');
const PORT = 8080; 


// The body-parser library will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the 'body' key 
app.use(bodyParser.urlencoded({extended: true})); 

// Will parse the Cookie header and populate req.cookies with an object keyed by the cookie names
app.use(cookieParser());

// sets the ejs dependency as the templating engine
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

class User {
  constructor(userRandomId, userEmail, userPassword) {
    this.id = userRandomId,
    this.email = userEmail,
    this.password = userPassword
  }
}

const userDatabase = {
};

// generate a random number, convert it to an alphanumeric string using base 36. End result is a random alphanumeric string of 6 characters
function generateRandomString() {
  let randomArr = Math.random().toString(36).slice(2).split('');
  randomArr.length = 6;
  return randomArr.join('');
}

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { user: user }; 
  res.render('urls_register', templateVars);
});

const emailChecker = (em) => {
  for (let id in userDatabase) {
    if (userDatabase[id].email === em) {
      return true;
    }
  }
  return false;
};



app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.sendStatus(400);
  } else if (emailChecker(req.body.email)) {
    res.sendStatus(400);
  } else {
  let userRandomId = generateRandomString();
  userDatabase[userRandomId] = new User(userRandomId,req.body.email, req.body.password);
  res.cookie('user_id', userRandomId);
  res.redirect('/urls'); 
  }
});

// middleware routing functions
app.get('/', (req, res) => {
  res.send('Hello!');
});

// when sending variables to an esj template, we need to send them in an object format so the template can access the data via the object key
// esj automatically looks inside the 'view' directory for any files with the .esj extension. Here we are passing the templateVars object to the urls_index template
app.get('/urls', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, user: user }; 
  res.render('urls_index', templateVars); 
});

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.get('/urls/new', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { user: user };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updatedURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); // sends the urlDatabase object to client as JSON
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// the listen method activates the app express server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
