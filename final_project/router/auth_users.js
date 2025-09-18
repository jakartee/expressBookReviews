const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => !users.some(user => user.username === username);

const authenticatedUser = (username,password)=>{
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if(username && password){
    if(authenticatedUser(username, password)) {
      const token = jwt.sign({username:username}, 'my-secret-key', { expiresIn: '15m' });

      req.session.authorization = {
        token, username
      }

      return res.status(200).json({message: "User logged in successfully!", token: token});
    } else {
      return res.status(401).json({message: "Username or password is incorrect!"});
    }
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if(books[isbn]){
    if(books[isbn].reviews[username]){
      books[isbn].reviews[username] = review;

      return res.status(200).json({ message: "Review modified successfully!" });
    } else {
      books[isbn].reviews[username] = review;

      return res.status(200).json({ message: "Review added successfully!" });
    }
  }
  else{
    return res.status(404).json({ message: `Book with "${isbn}" not found!`});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if(books[isbn]){
    if(books[isbn].reviews[username]){
      delete books[isbn].reviews[username];

      return res.status(200).json({ message: "Review deleted successfully!" });
    } else {
      return res.status(404).json({message: `Review for ISBN "${isbn} not found!"` });
    }
  } else{
    return res.status(404).json({ message: `Book with "${isbn}" not found!`});
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
