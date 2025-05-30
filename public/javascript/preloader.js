document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader");
    const images = document.images;
    let loadedImages = 0;

    const totalImages = images.length;
    if (totalImages === 0) {
      preloader.style.display = "none";
      return;
    }

    for (let i = 0; i < totalImages; i++) {
      const img = images[i];
      if (img.complete) {
        incrementLoader();
      } else {
        img.addEventListener("load", incrementLoader, false);
        img.addEventListener("error", incrementLoader, false); // prevent hanging on broken images
      }
    }

    function incrementLoader() {
      loadedImages++;
      if (loadedImages === totalImages) {
        setTimeout(() => {
          preloader.style.opacity = "0";
          preloader.style.pointerEvents = "none";
          setTimeout(() => {
            preloader.style.display = "none";
          }, 500); // fade out duration
        }, 300); // small delay after all images load
      }
    }
});