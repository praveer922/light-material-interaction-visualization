// Listen for user input
// Get references to the select element and dynamic content div
var material_type = document.getElementById("material_type");
var dynamicContent = document.getElementById("dynamicContent");

// Add an event listener to the material_type element
material_type.addEventListener("change", function () {
    // Hide all option content divs
    document.getElementById("diffuseForm").style.display = "none";
    document.getElementById("metalForm").style.display = "none";
    document.getElementById("transparentForm").style.display = "none";
  
    // Get the selected option value
    var selectedOption = material_type.value;
  
    // Show the content div corresponding to the selected option
    document.getElementById(selectedOption + "Form").style.display = "block";
  });



document.addEventListener("DOMContentLoaded", function() {
    const materialForm = document.getElementById("materialForm");

    materialForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the form from actually submitting

        const formData = {};

        // Iterate over form elements
        for (const element of materialForm.elements) {
            if (element.name) {
                if (element.type === "radio" || element.type === "checkbox") {
                    // Handle radio buttons and checkboxes
                    if (element.checked) {
                        formData[element.name] = element.value;
                    }
                } else {
                    // Handle other input elements and selects
                    formData[element.name] = element.value;
                }
            }
        }

        processUserInput(formData)
    });
});