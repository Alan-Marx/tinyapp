const express = require('express');
const app = express(); // app is now a server
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true})); // The body-parser library will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body.

app.set('view engine', 'ejs'); // sets the ejs dependency as the templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase }; // when sending variables to an esj template, we need to send them in an object format so the template can access the data via the object key
  res.render('urls_index', templateVars); // esj automatically looks inside the 'view' directory for any files with the .esj extension. Here we are passing the templateVars object to the urls_index template
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); // sends the urlDatabase object to client as JSON
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});