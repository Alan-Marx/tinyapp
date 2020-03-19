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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "tqc0o4" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "tqc0o4" }
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

const emailChecker = (em) => {
  for (let id in userDatabase) {
    if (userDatabase[id].email === em) {
      return true;
    }
  }
  return false;
};

app.get('/login', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { user: user }; 
  res.render('urls_login', templateVars);
});


app.post('/login', (req, res) => {
  if (emailChecker(req.body.email)) {
    for (let id in userDatabase) {
      if (userDatabase[id].password === req.body.password) {
        res.cookie('user_id', id);
        res.redirect('/urls');
      } else {
        res.sendStatus(403);
      }
    }
  }
  res.sendStatus(403);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { user: user }; 
  res.render('urls_register', templateVars);
});

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

const urlsForUser= (id) => {
  const userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

app.get('/urls', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  if (user) {
    const userUrls = urlsForUser(user.id);
    let templateVars = { urls: userUrls, user: user }; 
    res.render('urls_index', templateVars); 
  } else {
    let templateVars = { user: user};
    res.render('urls_index', templateVars);
  }
});

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  res.redirect(`/urls/${newShortURL}`);
});

app.get('/urls/new', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { user: user };
  if (user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user: user, urlDatabase };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.updatedURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});



app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
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
