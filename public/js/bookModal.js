// Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Store current book data globally
    let currentBookData = null;

    //Function to render stars
    function renderStars(rating) {
      let stars = "";
      for (let i = 1; i <= 5; i++) {
        stars += i <= rating 
          ? '<i class="bi bi-star-fill text-2xl text-amber-400"></i>' 
          : '<i class="bi bi-star text-2xl text-gray-300"></i>';
      }
      return stars;
    }

    // Function to open book details modal
    function openBookModal(book) {
      // store book data
      currentBookData = book;
      
      const modal = document.getElementById('bookModalContainer');
      const dateOptions = {
        year: 'numeric', //shows full year
        month: 'long', //shows full month name
        day: 'numeric', //shows day as number
      }
      
      // Populate modal with book data
      document.getElementById('modalBookCover').src = book.cover_url;
      document.getElementById('modalBookTitle').textContent = book.title;
      document.getElementById('modalBookAuthor').textContent = book.author;
      document.getElementById('modalBookISBN').textContent = `ISBN: ${book.isbn}`;
      document.getElementById('modalBookNotes').textContent = book.notes;
      document.getElementById('modalBookCreatedAt').textContent = `Added: ${new Date(book.created_at).toLocaleDateString('en-US', dateOptions)}`; // Format date as "Month Day, Year"

      // Store book ID for delete
      document.getElementById('deleteBookId').value = book.id;

      // Render stars 
      document.getElementById('modalBookRating').innerHTML = renderStars(book.rating); 
      
      // Display the modal
      modal.classList.remove('hidden');
      modal.classList.add('block');
    }

    // Function to open edit book modal
    function openEditBookModal(book) {
      if (!currentBookData) {
        console.error('No book data available');
        return;
      }

      // Close the view modal first
      closeBookModal();

      // Open edit modal
      if (typeof window.openEditModal === 'function') {
        window.openEditModal(currentBookData);
      } else {
        console.error('openEditModal function not found');
      }
    }

    // Function to close book details modal
    function closeBookModal() {
      const modal = document.getElementById('bookModalContainer');
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    };

    //Function to delete book
    function deleteBook() {
      if (!currentBookData) return;
      console.log("Book deleted!");

      // Get the form and book ID
      const deleteForm = document.getElementById('deleteForm');
      const bookId = document.getElementById('deleteBookId').value;
  
      console.log("Attempting to delete book ID:", bookId);
      if (confirm("Are you sure you want to delete this book?")) {
        deleteForm.submit();
      }
    };

    // Event listener for book cards
    document.addEventListener('click', function(e) {
      const card = e.target.closest('[data-book]'); 
      if (card) {
        try {
          const bookData = JSON.parse(card.dataset.book);
          openBookModal(bookData);
        } catch (error) {
          console.error('Error parsing book data:', error);
        }
      }
    });

    // Make functions available globally
    window.openBookModal = openBookModal;
    window.closeBookModal = closeBookModal;
    window.deleteBook = deleteBook;
    window.openEditBookModal = openEditBookModal;
  });