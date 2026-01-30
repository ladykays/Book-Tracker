import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import pool from "./db/db.js";
import expressEjsLayouts from "express-ejs-layouts";

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(expressEjsLayouts);
app.set('layout', 'layout'); //specifies layout file
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//render stars
app.locals.renderStars = (rating) => {
  let stars = "";
  for (let i = 1; i <= 5; i++) { //count down from 5 so the filled stars are first
    stars += i <= rating ? '<i class="bi bi-star-fill text-xl text-amber-400"></i>' : '<i class="bi bi-star text-xl text-gray-300"></i>'
  }
  return stars;
};

// Automatically create tables when app starts
async function initDatabase() {
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS book (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        rating INTEGER CHECK (rating >= 0 AND rating <= 5),
        notes TEXT,
        isbn VARCHAR(13) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS image (
        id SERIAL PRIMARY KEY,
        isbn VARCHAR(13) REFERENCES book(isbn) ON DELETE CASCADE,
        cover_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database tables ready!');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
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
    const sortBy = req.query.sort || 'recent';
    const result = await pool.query(
      "SELECT book.id, book.title, book.author, book.rating, book.notes, book.isbn, image.cover_url, book.created_at  FROM book JOIN image ON book.isbn=image.isbn;"
    );
    console.log("Books: ", result.rows);

    console.log("Books with dates:", result.rows.map(b => ({ 
      title: b.title, 
      created_at: b.created_at,
      has_date: !!b.created_at 
    })));

    let myBooks = [];

    result.rows.map((myBook) => {
      myBooks.push({
        id: myBook.id,
        title: myBook.title, 
        author: myBook.author, 
        rating: myBook.rating, 
        notes: myBook.notes, 
        isbn: myBook.isbn,
        cover_url: myBook.cover_url,
        created_at: myBook.created_at
      });
    });
    console.log("MY BOOKS: ", myBooks);
    
    if (myBooks.length > 0) {
      res.render("index", { 
        books: myBooks,
        renderStars: app.locals.renderStars,
        currentSort: sortBy,
      });
    } else {
      res.render("noBooks");
    }
  } catch (err) {
    console.log(err);
  }
});

/* app.get("/add-book-form", (req, res) => {
  res.render("addBookForm.ejs")
}) */

/* app.get("/recent", async(req, res) => {
  try {
    result = await pool.query("SELECT * FROM book");
    console.log("Recent: ", result.rows)
  } catch (err) {
    console.log(err);
  }
}); */

app.get("/edit/:id", async(req, res) => {
  try {
    const bookId = req.params.id;

    //Get book with it's cover image
    const result = await pool.query(
      `SELECT  * FROM book
      JOIN image ON book.isbn = image.isbn
      WHERE book.id = $1
      `, [bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Book not found");
    };

    res.render("editBookForm", {book: result.rows[0]});
  } catch (err) {
    console.log("Error fetching book for edit", err);
    res.status(500).send("Error loading book");
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
  //const ratingNum = parseInt(rating) || 0;

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
    
    // Redirect to home page after successful submission
    res.redirect("/");

  } catch (err) {
    console.log("Error adding book:", err);
    // Render the form again with error message
    res.render("addBookForm.ejs", { 
      error: "Failed to add book. Please try again.",
      ...newBook 
    });
  }
});

app.post("/edit", async(req, res) => {
  const {title, author, rating, isbn, notes, id} = req.body;

   // Basic validation
  if (!title || !author || !id) {
    return res.status(400).send("Title, author, and ID are required");
  }
  
  // Convert rating to number
  const ratingNum = parseInt(rating) || 0;

  try {
    //get current ISBN from database
    const currentBookEntry = await pool.query(
      "SELECT isbn FROM book WHERE id = $1", [id]
    );

    if (currentBookEntry.rows.length === 0) {
      return res.status(404).send("Book not found");
    };

    const originalIsbn = currentBookEntry.rows[0].isbn;

    // Update book
    const result = await pool.query(
      "UPDATE book SET title = $1, author = $2, rating = $3, isbn = $4, notes = $5 WHERE id = $6 ", 
      [title, author, ratingNum, isbn, notes, id] 
    );

    //update image table if ISBN changes
    if (originalIsbn !== isbn) {
      try {
        //try to fetch new cover image
        const key = "ISBN";
        const size = "M";
        const cover_url = await fetchImage(`https://covers.openlibrary.org/b/${key}/${isbn}-${size}.jpg`);

        //update with new cover
        await pool.query(
          "UPDATE image SET isbn = $1, cover_url = $2 WHERE isbn = $3",
          [isbn, cover_url, originalIsbn]
        );
      } catch (err) {
        console.log("Could not fetch new book cover, updating ISBN only", err);
        await pool.query(
          "UPDATE image SET isbn = $1 WHERE isbn = $2", [isbn, originalIsbn]
        );
      }
      
    };
    res.redirect("/");
  } catch(err) {
    console.log("Error editing book:", err);
    res.status(500).send("Error updating book");
  }
});

app.post("/delete", async(req, res) => {
  const itemForDeletion = req.body.id;
  console.log("Delete item ID: ", itemForDeletion);

  try {
    //get ISBN for book to be deleted
    const bookResult = await pool.query("SELECT isbn FROM book WHERE id = $1;", [itemForDeletion]);

    if (bookResult.rows.length === 0) {
      return res.status(404).send("Book not found");
    };

    const isbn = bookResult.rows[0].isbn;

    //delete item from image table first
    await pool.query("DELETE FROM image WHERE isbn = $1", [isbn]);

    //delete book from book table
    await pool.query("DELETE FROM book WHERE id = $1;", [itemForDeletion]);

    console.log("Book deleted successfully");
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).send("Error deleting book: " + err.message);
  }
  
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await initDatabase() //initialize databse on startup
});
