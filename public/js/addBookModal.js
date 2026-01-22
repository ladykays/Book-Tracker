document.addEventListener("DOMContentLoaded", () => {
  // Initialize modal elements
  const modal = document.getElementById("addBookModal");
  const addBookModalContent = document.getElementById("addBookModalContent");

  if (!modal) return;

  window.openAddBookModal = () => {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };

  window.closeAddBookModal = () => {
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
});
