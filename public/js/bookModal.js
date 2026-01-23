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
      modal.classList.remove('block');
      modal.classList.add('hidden');
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

    // Make functions available globally
    window.openBookModal = openBookModal;
    window.closeBookModal = closeBookModal;
  });