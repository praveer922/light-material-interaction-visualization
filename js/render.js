function processUserInput(formData) {
    // TODO: for wenjian, do what you want with the user input here. You will receive this from input_form.js
    console.log(formData);
}


// Initialize WebGL context
const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  console.error('WebGL is not supported by your browser.');
} else {
  // WebGL code goes here
}