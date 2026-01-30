document.addEventListener("DOMContentLoaded", () => {
  // Initialize modal elements
  const modal = document.getElementById("addBookModal");
  const addBookModalContent = document.getElementById("addBookModalContent");

  if (!modal) return;

  function openAddBookModal() {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    createStarButtons();
  };

  function closeAddBookModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  //Close modal when overlay is clicked
  modal.addEventListener("click", (e) => {
    if (e.target !== modal) {
      closeAddBookModal();
    }
  });

  //Close modal when escape key is pressed
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeAddBookModal();
    }
  });

  // Prevent modal content clicks from closing modal
  if (addBookModalContent) {
    addBookModalContent.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Function to create star buttons
  function createStarButtons() {
    const starContainer = document.getElementById("starRatingInput");
    if (!starContainer) return; 

    starContainer.innerHTML = "";


    for (let i = 1; i <= 5; i++) {
      const starButton = document.createElement("button");
      starButton.type = "button";
      starButton.className = "star-btn text-2xl";
      starButton.innerHTML = '<i class = "bi bi-star text-gray-300"></i>';
      starButton.addEventListener("click", () => setRating(i));

      starContainer.appendChild(starButton);
    }

    // Reset rating when creating new buttons
    if (ratingInput) {
      ratingInput.value = 0;
    }
  };

  // Function to set rating
  function setRating(rating) {
    const stars = document.querySelectorAll("#starRatingInput .star-btn");
    const ratingInput = document.getElementById("ratingValue")
    
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

  // Make functions available globally
  window.openAddBookModal = openAddBookModal;
  window.closeAddBookModal = closeAddBookModal;
  window.createStarButtons = createStarButtons;
  window.setRating = setRating;

  createStarButtons();
});
