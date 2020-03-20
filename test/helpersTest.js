const { assert } = require('chai');

const { emailChecker } = require('../helper_functions');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('emailChecker', function() {
  it('should return true if email corresponds to valid user', function() {
    const expectedOutput = true;
    assert.equal(emailChecker("user@example.com", testUsers), expectedOutput);
  });
  it('should return false if email does not correspond to valid user', function() {
    const expectedOutput = false;
    assert.equal(emailChecker("alan@example.com", testUsers), expectedOutput);
  });
});