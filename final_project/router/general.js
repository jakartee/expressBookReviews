const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if(username && password) {
    if(isValid(username)) {
      users.push({ username, password });

      return res.status(200).json({message: "User registered successfully!"});
    } else {
      return res.status(409).json({message: "Username already exists!"});
    }
  } else {
    return res.status(400).json({message: "Specify your username and password!"});
  }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  const getBooks = () => new Promise((resolve) => resolve(books));

  try {
    const books = await getBooks();

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "An unexpected error has occurred" });
  }
});

// Get book details based on author
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const getBooksByISBN = (_ISBN) => {
    return new Promise((resolve, reject) => {
      const existedBook = books[_ISBN];
      
      if (existedBook) {
        resolve(existedBook);
      } else {
        reject(new Error(`Book with ISBN "${_ISBN}" not found!`));
      }
    });
  }
  
  getBooksByISBN(isbn).then((book) =>{
    res.json(book);
  }).catch((err)=> {
      res.status(404).json({error: err.message})
  });
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const getAuthor = (_author) => {
    return new Promise((resolve, reject) => {
      const existedAuthor = Object.values(books).find((book) => book.author === _author);
      
      if (existedAuthor) {
        resolve({
          title: existedAuthor.title,
          reviews: existedAuthor.reviews
        });
      } else {
        reject(new Error(`Author "${_author}" not found!`));
      }
    });
  }
  
  getAuthor(author).then((_author) =>{
    res.json(_author);
  }).catch((err)=> {
      res.status(404).json({error: err.message})
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const getTitle = (_title) => {
    return new Promise((resolve, reject) => {
      const existedTitle = Object.values(books).find((book) => book.title === _title);
      
      if (existedTitle) {
        resolve({
          author: existedTitle.author,
          reviews: existedTitle.reviews
        });
      } else {
        reject(new Error(`Title "${_title}" not found!`));
      }
    });
  }
  
  getTitle(title).then((_title) =>{
    res.json(_title);
  }).catch((err)=> {
      res.status(404).json({error: err.message})
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const getReviewByIsbn = (_isbn) => {
    return new Promise((resolve, reject) => {
      const existedReview = books[_isbn];
      
      if (existedReview) {
        resolve({
          reviews: existedReview.reviews
        });
      } else {
        reject(new Error(`ISBN "${_isbn}" not found!`));
      }
    });
  }
  
  getReviewByIsbn(isbn).then((_title) =>{
    res.json(_title);
  }).catch((err)=> {
      res.status(404).json({error: err.message})
  });
});

module.exports.general = public_users;
