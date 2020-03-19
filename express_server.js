const express = require('express');
const app = express(); 
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser');
const PORT = 8080; 

// The body-parser library will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the 'body' key 
app.use(bodyParser.urlencoded({extended: true})); 

// Will parse the Cookie header and populate req.cookies with an object keyed by the cookie names
app.use(cookieParser());

// sets the ejs dependency as the templating engine when sending variables to an esj template, we need to send them in an object format so the template can access the data via the object key
// esj automatically looks inside the 'view' directory for any files with the .esj extension. Here we are passing the templateVars object to the urls_index template
app.set('view engine', 'ejs');

//////////////////// Databases & Classes ////////////////////

// Each new long url will have a short url/key assigned to it and will have an object inside the urlDatabase corresponding to this key, containing the associated long url and the user id of the user who created it
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "tqc0o4" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "tqc0o4" }
};
const userDatabase = {
};
// the userDatabase will be filled up by objects of the following class. The keys for each user object will be the same value as their id property 
class User {
  constructor(userRandomId, userEmail, userPassword) {
    this.id = userRandomId,
    this.email = userEmail,
    this.password = userPassword
  }
}

///////////////////////// Functions /////////////////////

// generate a random number, convert it to an alphanumeric string using base 36. End result is a random alphanumeric string of 6 characters
function generateRandomString() {
  let randomArr = Math.random().toString(36).slice(2).split('');
  randomArr.length = 6;
  return randomArr.join('');
}
// this function returns true if the email provided to it as an argument corresponds to an email in one of the user objects inside the user database, meaning that a user already exists for the email provided
const emailChecker = (em) => {
  for (let id in userDatabase) {
    if (userDatabase[id].email === em) {
      return true;
    }
  }
  return false;
};
// this function takes in a user id and returns an object containing all the url objects with a matching user id. 
const urlsForUser= (id) => {
  const userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};
// this function returns true if a long url has already been used by a user before
const longURLChecker = (userUrls, longUrl) => {
  for (let url in userUrls) {
    if (userUrls[url].longURL === longUrl) {
      return true;
    }
  } 
  return false;
};

//////////////////////// Route Handlers /////////////////////

// The user variable, which is either a user object or undefined, is passed on to the template so that the headers partial can know how to display the navigation bar
app.get('/register', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { user }; 
  res.render('urls_register', templateVars);
});

// as long as an email and password are provided and the email has not already been registered, a new user object is added to the user database and the client is given a user id cookie
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

// the user variable is again passed on to the template so that the header partial can know what to display, and is also used to send the index template an object consisting of the url objects whose user id values match the user id value of the user.
// This allows the /urls page to only display the url objects in the url database that belong to the user. If a valid user is not signed in, the /urls page will ask them to register or login
app.get('/urls', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  if (user) {
    const userUrls = urlsForUser(user.id);
    let templateVars = { urls: userUrls, user }; 
    res.render('urls_index', templateVars); 
  } else {
    let templateVars = { user };
    res.render('urls_index', templateVars);
  }
});

// a user can create a new url object (and accompanying short url for the inputted long url), as long as they have not already used that long url before
app.post('/urls', (req, res) => {
  const userUrls = urlsForUser(req.cookies["user_id"]);
  if(!longURLChecker(userUrls, req.body.longURL)) {
    let newShortURL = generateRandomString();
    urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.redirect('/urls');
  }
});

// only users who are logged in can access this page and create new short url objects in the url database. 
app.get('/urls/new', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { user };
  if (user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// 
app.get('/login', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let templateVars = { user }; 
  res.render('urls_login', templateVars);
});

//if the email passed into the login page corresponds to an email of a user object in the user database, and the password for that account corresponds to the password entered into the login page, then the user is given a cookie with the user id value of their user account
app.post('/login', (req, res) => {
  if (emailChecker(req.body.email)) {
    for (let id in userDatabase) {
      if (userDatabase[id].email === req.body.email && userDatabase[id].password === req.body.password) {
        res.cookie('user_id', id);
        res.redirect('/urls');
      } 
    }
  } else {
    res.sendStatus(403);
    }
});

// a user who clicks the logout button will have their cookie with the user id value cleared
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


app.get('/urls/:shortURL', (req, res) => {
  let user = userDatabase[req.cookies["user_id"]];
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user: user, urlDatabase };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// only the user that created an url object can edit said object
app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies["user_ud"]) {
    urlDatabase[req.params.shortURL].longURL = req.body.updatedURL;
    res.redirect('/urls');
  } else {
    res.sendStatus(400);
  }
});

// only the user that created an url object can delete said object
app.post('/urls/:shortURL/delete', (req, res) => {
  if(urlDatabase[req.params.shortURL].userID === req.cookies["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.sendStatus(400);
  }
});




app.get('/', (req, res) => {
  res.send('Hello!');
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
