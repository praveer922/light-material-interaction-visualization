// Listen for user input
document.getElementById("myForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
  
    // Access the input field value
    var userInput = document.getElementById("textInput").value;
  
    // Call a function or perform actions with userInput
    processUserInput(userInput);
  });

  function processUserInput(input) {
    // TODO: for wenjian, do what you want with the user input here.
    console.log("User input: " + input);
  }


// Initialize WebGL context
const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  console.error('WebGL is not supported by your browser.');
} else {
  // WebGL code goes here
}