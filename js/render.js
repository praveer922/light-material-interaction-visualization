function processUserInput(formData) {
  var filepath;

  switch (parseInt(formData)) {
    case 0:
        filepath = "assets/diffuse_cyan.png"
        break;
    case 1:
        filepath = "assets/diffuse_orange.png"
        break;
    case 2:
        filepath = "assets/diffuse_purple.png"
        break;
    case 3:
        filepath = "assets/conductor_al.png"
        break;
    case 4:
        filepath = "assets/conductor_au.png"
        break;
    case 5:
        filepath = "assets/conductor_cu.png"
        break;
    case 6:
        filepath = "assets/conductor_w.png"
        break;
    case 7:
        filepath = "assets/dielectric.png"
        break;
  }

  const img = document.getElementById("render_img");
  img.src = filepath;

  drawHistogram();
  updateSlider();

}

var pixelArray;

function drawHistogram() {
    const image = document.getElementById('render_img');
    const canvas = document.getElementById('hiddenCanvas');
    const context = canvas.getContext('2d');

    image.onload = function () {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, image.width, image.height);

      const imageData = context.getImageData(0, 0, image.width, image.height);
      pixelArray = imageData.data;
      processPixelArray();
    };

}

function processPixelArray() {
    const selectedChannel = document.getElementById("colorChannel").value;

    var pixels;

    if (selectedChannel == "grayscale") {
        const grayscaleFrequencies = Array.from({ length: 256 }, () => 0);

        for (let i = 0; i < pixelArray.length; i += 4) {
            // Calculate grayscale value (average of RGB channels)
            const grayscale = Math.round((pixelArray[i] + pixelArray[i + 1] + pixelArray[i + 2]) / 3);
            grayscaleFrequencies[grayscale]++;
        }
        pixels = grayscaleFrequencies;
    } else if (selectedChannel == "red") {
        const redFrequencies = Array.from({ length: 256 }, () => 0);

        for (let i = 0; i < pixelArray.length; i += 4) {
            // get red value
            const red = pixelArray[i];
            redFrequencies[red]++;
        }
        pixels = redFrequencies;
    } else if (selectedChannel == "green") {
        const greenFrequencies = Array.from({ length: 256 }, () => 0);

        for (let i = 0; i < pixelArray.length; i += 4) {
            // get green value
            const green = pixelArray[i+1];
            greenFrequencies[green]++;
        }
        pixels = greenFrequencies;
    } else if (selectedChannel == "blue") {
        const blueFrequencies = Array.from({ length: 256 }, () => 0);

        for (let i = 0; i < pixelArray.length; i += 4) {
            // get blue value
            const blue = pixelArray[i+2];
            blueFrequencies[blue]++;
        }
        pixels = blueFrequencies;
    }


    const svgWidth = document.getElementById("histogram").clientWidth;
    const svgHeight = document.getElementById("histogram").clientHeight;

    // Find the maximum value in pixels
    var maxValue = d3.max(pixels);
    maxValue = maxValue + 100;

    const svg = d3.select("#histogram");
    svg.selectAll('*').remove();

    // Add x-axis line
    var startPoint = { x: 15, y: svgHeight-15 };
    var endPoint = { x: svgWidth, y: svgHeight-15 };

    // Append the line to the SVG
    svg.append("path")
    .attr("d", `M ${startPoint.x},${startPoint.y} L ${endPoint.x},${endPoint.y}`) // Set the 'd' attribute directly
    .attr("stroke", "white") // Set the stroke color to white
    .attr("stroke-width", 1) // Set the stroke width
    .attr("fill", "none"); // Set fill to none if you only want the stroke

    // Add y-axis line
    startPoint = { x: 15, y: svgHeight-15 };
    endPoint = { x: 15, y: 0 };

    // Append the line to the SVG
    svg.append("path")
    .attr("d", `M ${startPoint.x},${startPoint.y} L ${endPoint.x},${endPoint.y}`) // Set the 'd' attribute directly
    .attr("stroke", "white") // Set the stroke color to white
    .attr("stroke-width", 1) // Set the stroke width
    .attr("fill", "none"); // Set fill to none if you only want the stroke

    svg.selectAll("rect")
      .data(pixels)
      .enter()
      .append("rect")
      .attr("x", (d, i) => (svgWidth/255)*i)
      .attr("y",d => (svgHeight-15) - (d/maxValue)*(svgHeight-15))
      .attr("width", svgWidth / pixels.length)
      .attr("height", d => (d/maxValue)*(svgHeight-15) )
      .attr("fill", "white");

    // x axis markers 
    for (let i = 0; i < 255; i+=15) {
        svg.append("path")
        .attr("d", `M ${((svgWidth/255)*i)+15},${svgHeight-15} L ${((svgWidth/255)*i)+15},${svgHeight-10}`) 
        .attr("stroke", "white") // Set the stroke color to white
        .attr("stroke-width", 1) // Set the stroke width
        .attr("fill", "none"); // Set fill to none if you only want the stroke

        svg.append("text")
        .attr("x", ((svgWidth/255)*i)+15) // X-coordinate of the text
        .attr("y", svgHeight-1) // Y-coordinate of the text
        .text(i)
        .attr("fill", "white") // Set text color to white
        .attr("font-size", "8px") // Set font size
        .attr("text-anchor", "middle"); // Align text to the center
    }

    // y axis markers
     for (let i = 2000; i < maxValue; i+=4000) {
        svg.append("path")
        .attr("d", `M ${15},${(i/maxValue)*(svgHeight-15)} L ${10},${(i/maxValue)*(svgHeight-15)}`) 
        .attr("stroke", "white") // Set the stroke color to white
        .attr("stroke-width", 1) // Set the stroke width
        .attr("fill", "none"); // Set fill to none if you only want the stroke

        svg.append("text")
        .attr("transform", `rotate(90) translate(${(i / maxValue) * (svgHeight - 15)}, 0)`)
        .text(Math.ceil((maxValue-i) / 100) * 100)
        .attr("fill", "white") // Set text color to white
        .attr("font-size", "7px") // Set font size
        .attr("text-anchor", "middle"); // Align text to the center
    }


    // set color of rects
    if (selectedChannel=="red") {
        svg.selectAll("rect").attr("fill", "red");
    } else if (selectedChannel=="green") {
        svg.selectAll("rect").attr("fill", "green");
    } else if (selectedChannel=="blue") {
        svg.selectAll("rect").attr("fill", "blue");
    }


}

function updateSliderText(value) {
    document.getElementById("sliderValue").innerText = `Roughness Value: ${value}`;

}

function updateSlider() {
    const roughnessValue = document.getElementById("slider").value;
    drawBSDF(roughnessValue);
}

