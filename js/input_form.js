document.addEventListener("DOMContentLoaded", function() {
    const materialForm = document.getElementById("materialForm");
    

    materialForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the form from actually submitting

        const materialSelect = document.getElementById("material");
        const selectedValue = materialSelect.value;

        processUserInput(selectedValue)
    });

    const histogramForm = document.getElementById("histogramForm");

    histogramForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the form from actually submitting

        processPixelArray();
    });
});