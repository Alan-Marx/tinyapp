// this function returns true if the email provided to it as an argument corresponds to an email in one of the user objects inside the user database, meaning that a user already exists for the email provided
const emailChecker = (em, database) => {
  for (let id in database) {
    if (database[id].email === em) {
      return true;
    }
  }
  return false;
};

module.exports = { emailChecker };