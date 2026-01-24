// Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
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

    // Function to open modal
    function openBookModal(book) {
      const modal = document.getElementById('bookModal');
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

      // Show the modal container
      document.getElementById('bookModalContainer').classList.remove('hidden');

      // Store book ID in the form
      document.getElementById('deleteBookId').value = book.id;
      
      
      // Render stars - ensure renderStars is available globally
      if (typeof renderStars === 'function') {
        document.getElementById('modalBookRating').innerHTML = renderStars(book.rating);
      }
      
      // Display the modal
      modal.classList.remove('hidden');
      modal.classList.add('block');
    }

    // Function to open edit book modal
    function openEditBookModal(book) {
      const modal = document.getElementById('editBookModal');
      
      // Populate modal with book data
      document.getElementById('modalBookCover').src = book.cover_url;
      document.getElementById('modalBookTitle').textContent = book.title;
      document.getElementById('modalBookAuthor').textContent = book.author;
      document.getElementById('modalBookNotes').textContent = book.notes;

      // Show the modal container
      document.getElementById('editBookContainer').classList.remove('hidden');

      // Store book ID in the form
      document.getElementById('editBookId').value = book.id;
      
      
      // Render stars - ensure renderStars is available globally
      if (typeof renderStars === 'function') {
        document.getElementById('modalBookRating').innerHTML = renderStars(book.rating);
      }
      
      // Display the modal
      modal.classList.remove('hidden');
      modal.classList.add('block');
    }

    // Function to close modal
    function closeBookModal() {
      const modal = document.getElementById('bookModalContainer');
      const editBookModal = document.getElementById('editBookContainer');
      modal.classList.remove('block');
      modal.classList.add('hidden');
      editBookModal.classList.remove('block');
      editBookModal.classList.add('hidden');
    };

    //Function to delete book
    function deleteBook() {
      console.log("Book deleted!");

      // Get the form and book ID
      const deleteForm = document.getElementById('deleteForm');
      const bookId = document.getElementById('deleteBookId').value;
  
      console.log("Attempting to delete book ID:", bookId);
      if (confirm("Are you sure you want to delete this book?")) {
        deleteForm.submit();
      }
    };

    //Function to edit book
    function editBook() {
      console.log("Editing book!");

      // Get the form and book ID
      const editForm = document.getElementById('editForm');
      //const bookId = document.getElementById('editBookId').value;
      openEditBookModal();
    }

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

    /* //Event listener for delete book
    document.addEventListener('click', function(e) {
    // For delete button clicks
    if (e.target.closest('[onclick*="deleteBook"]') || e.target.closest('#deleteForm button')) {
      e.preventDefault();
      deleteBook();
    }
  }); */

    // Make functions available globally
    window.openBookModal = openBookModal;
    window.closeBookModal = closeBookModal;
    window.deleteBook = deleteBook;
    window.openEditBookModal = openEditBookModal;
    window.editBook = editBook;
  });