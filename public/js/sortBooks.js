document.addEventListener("DOMContentLoaded", function () {
  const sortButtons = document.querySelectorAll(".sort-btn");
  const booksContainer = document.getElementById("booksContainer");

  function sortBooks(sortType) {
    const bookCards = Array.from(document.querySelectorAll(".book-card"));

    if (bookCards.length === 0) return;

    bookCards.sort((a, b) => {
      const dateA = parseInt(a.getAttribute("data-created")) || 0;
      const dateB = parseInt(b.getAttribute("data-created"));
      const idA = parseInt(a.getAttribute("data-id"));
      const idB = parseInt(b.getAttribute("data-id"));

      switch (sortType) {
        case "recent":
          //Sort by most recent first(using data-created)
          if (dateB !== dateA) {
            return dateB - dateA; //newst first
          }
          // If dates are equal or null, sort by ID
          return idB - idA;

        case "rating":
          //Sort by highest rating first
          const ratingA = parseFloat(a.getAttribute("data-rating"));
          const ratingB = parseFloat(b.getAttribute("data-rating"));

          if (ratingB !== ratingA) {
            return ratingB - ratingA; //highest first
          }
          //If ratings are equal, sort most recent
          return dateB - dateA;

        case "title":
          //Sort alphabetically
          const titleA = a.getAttribute("data-title").toLocaleLowerCase();
          const titleB = b.getAttribute("data-title").toLocaleLowerCase();

          return titleA.localeCompare(titleB);

        default:
          return 0;
      }
    });

    // Clear and reappend sorted cards
    booksContainer.innerHTML = "";
    bookCards.forEach((card) => {
      booksContainer.appendChild(card);
    });
  }

  //Only set up sorting if there is books
  if (booksContainer && sortButtons.length > 0) {
    //Loop through each sort button adding a click event listener to each
    sortButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const sortType = this.getAttribute("data-sort"); //get the data-sort attribute value from the clicked button and assign it to sortType
        sortBooks(sortType); //call the sortBooks function with the sortType vaalue

        //Loop through all sort buttons to reset their styling
        sortButtons.forEach((btn) => {
          btn.classList.remove("bg-blue-100", "text-blue-700"); //remove active styling class
          btn.classList.add("hover:bg-gray-100"); //add default hover styling
        });
        this.classList.add("bg-blue-100", "text-blue-700"); //add active styling to currently clicked button
        this.classList.remove("hover:bg-gray-100"); //remove hover styling from active button
      });
    });

    // Initialize with recent sort on page load
    const activeButton = document.querySelector(
      '.sort-btn[data-sort="recent"]',
    );
    if (activeButton) {
      sortBooks("recent");
      activeButton.classList.add("bg-blue-100", "text-blue-700");
      activeButton.classList.remove("hover:bg-gray-100");
    }
  }
});
