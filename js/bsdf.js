function drawBSDF(roughness) {
  let bsdfElement = document.getElementById("bsdf");
  let bounds = bsdfElement.getBoundingClientRect();
  let width = bounds.width;
  let height = bounds.height;

  const alpha = roughness;  // Set alpha to the value of roughness

  functionPlot({
    target: "#bsdf",
    grid: true,
    disableZoom: true,
    disablePan: true,
    width,
    height,
    xAxis: { domain: [-90, 90] },
    yAxis: { domain: [-1, 9] },
    data: [
      {
        fn: `(${alpha}^2)/(PI*((cos(x*PI/180))^4) * ((${alpha}^2)+((tan(x*PI/180))^2))^2)`,
        color: 'white'
      }
    ]
  });
}
