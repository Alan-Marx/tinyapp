// this function returns true if the email provided to it as an argument corresponds to an email in one of the user objects inside the user database, meaning that a user already exists for the email provided.
const emailChecker = (em, database) => {
  for (let id in database) {
    if (database[id].email === em) {
      return true;
    }
  }
  return false;
};

// generates a random number, converts it to an alphanumeric string using base 36. End result is a random alphanumeric string of 6 characters to be used as a userID.
const generateRandomString = () => {
  let randomArr = Math.random().toString(36).slice(2).split('');
  randomArr.length = 6;
  return randomArr.join('');
};

// this function takes in a user id and url database and returns an object containing all the url objects with a matching user id.
const urlsForUser = (id, database) => {
  const userUrls = {};
  for (let url in database) {
    if (database[url].userID === id) {
      userUrls[url] = database[url];
    }
  }
  return userUrls;
};

// this function returns true if a long url has already been used by a user before.
const longURLChecker = (userUrls, longUrl) => {
  for (let url in userUrls) {
    if (userUrls[url].longURL === longUrl) {
      return true;
    }
  }
  return false;
};

module.exports = { 
  emailChecker, 
  generateRandomString, 
  urlsForUser,
  longURLChecker
};