// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Function to set star rating
  function setRating(rating) {
    const stars = document.querySelectorAll("#editStarRatingInput .star-btn");
    const ratingInput = document.getElementById("editRating");

    // Update visual stars
    stars.forEach((star, index) => {
      const starIcon = star.querySelector("i");
      if (index < rating) {
        starIcon.className = "bi bi-star-fill text-amber-400";
      } else {
        starIcon.className = "bi bi-star text-gray-300";
      }
    });

    // Update hidden input
    ratingInput.value = rating;
  }

  // Function to create star buttons
  function createStarButtons() {
    const starContainer = document.getElementById("editStarRatingInput");
    starContainer.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "star-btn text-2xl";
      button.innerHTML = '<i class="bi bi-star text-gray-300"></i>';
      button.onclick = () => setRating(i);

      starContainer.appendChild(button);
    }
  }

  // Function to close edit modal
  function closeEditModal() {
    const modal = document.getElementById("editBookContainer");
    modal.classList.remove("flex");
    modal.classList.add("hidden");
  }

  // Function to open edit modal and populate data
  function openEditModal(book) {
    // Populate form fields
    document.getElementById("editBookId").value = book.id;
    document.getElementById("editTitle").value = book.title;
    document.getElementById("editAuthor").value = book.author;
    document.getElementById("editNotes").value = book.notes || "";
    //document.getElementById("editRating").value = book.rating || 0;
    document.getElementById("editBookCover").src = book.cover_url;
    document.getElementById('editIsbn').value = book.isbn;
    
    const ratingInput = document.getElementById("editRating");
    if (ratingInput) {
      ratingInput.value = book.rating || 0;
    }

    // Create star buttons if not already created
    createStarButtons();

    // Set initial rating
    setRating(book.rating || 0);

    // Show modal
    const modal = document.getElementById("editBookContainer");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  // Make functions available globally
  window.setRating = setRating;
  window.closeEditModal = closeEditModal;
  window.openEditModal = openEditModal;
  window.createStarButtons = createStarButtons;

  // Initialize star buttons when DOM is loaded
  document.addEventListener("DOMContentLoaded", createStarButtons);
});
