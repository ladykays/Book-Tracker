import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import pool from "./db/db.js";

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//render stars
app.locals.renderStars = (rating) => {
  let stars = "";
  for (let i = 5; i >= 1; i--) { //count down from 5 so the filled stars are first
    stars += i <= rating ? '<i class="bi bi-star-fill text-xl text-amber-400"></i>' : '<i class="bi bi-star text-xl"></i>'
  }
  return stars;
};

//Fetch image from API
async function fetchImage(url) {
  try {
    const response = await fetch(url, { method: "HEAD"});
    if (response.ok) {
      return url;
    } else {
      throw new Error(`Image not accessible. Status: ${response.status}`);
    }
  } catch (err) {
      throw new Error(`Image fetch failed: ${err.message}`);
  }
}

app.get("/", async(req, res) => {
  try {
    const result = await pool.query(
      "SELECT book.title, book.author, book.rating, book.notes, image.cover_url  FROM book JOIN image ON book.isbn=image.isbn;"
    );
    console.log("Books: ", result.rows);

    let myBooks = [];

    result.rows.map((myBook) => {
      myBooks.push({
        title: myBook.title, 
        author: myBook.author, 
        rating: myBook.rating, 
        notes: myBook.notes, 
        cover_url: myBook.cover_url 
      });
    });
    console.log("MY BOOKS: ", myBooks);
    
    if (myBooks.length > 0) {
      res.render("index.ejs", { 
        books: myBooks,
        renderStars: app.locals.renderStars,
      });
    } else {
      res.render("noBooks.ejs");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/", async(req, res) => {
  //Object that contains all the input from the front end
  const newBook = {
    title: req.body.title,
    author: req.body.author,
    rating: req.body.rating,
    isbn: req.body.isbn,
    notes: req.body.notes,
  };

  //variables for the API
  const key = "ISBN"; //can be any one of ISBN, OCLC, LCCN, OLID and ID (case-insensitive)
  const value = newBook.isbn; //value of the chosen key which comes from the front end as isbn
  const size = "M"; //can be one of S, M and L for small, medium and large respectively

  try {
    //Get the image url from the ISBN 
    const cover_url = await fetchImage(`https://covers.openlibrary.org/b/${key}/${value}-${size}.jpg`)
    console.log("Cover url: ", cover_url);

    //Add user submission to the book table in the database
    const addBook = await pool.query(
      "INSERT INTO book (title, author, rating, notes, isbn) VALUES($1, $2, $3, $4, $5) RETURNING *;", [newBook.title, newBook.author, newBook.rating, newBook.notes, newBook.isbn] 
    )
    console.log("Submission: ", addBook.rows);
    
    //Add cover_url and isbn to the image table
    const add_cover_url = await pool.query(
      "INSERT INTO image (isbn, cover_url) VALUES($1, $2) RETURNING cover_url;", [newBook.isbn, cover_url]
    )
    console.log("Cover URL: ", add_cover_url.rows);
    
  } catch (err) {
    console.log(err);
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});