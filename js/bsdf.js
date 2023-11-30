function microfacetD(x, a) {
  return Math.pow(a, 2)/(Math.PI * Math.pow(Math.cos(x), 4)*Math.pow(Math.pow(a, 2)+Math.pow(Math.tan(x),2),2));
}

function drawMicrofacetBSDF(roughness) {
  let bsdfElement = document.getElementById("bsdf");
  bsdfElement.innerHTML = '';
  let bounds = bsdfElement.getBoundingClientRect();
  let width = bounds.width;
  let height = bounds.height;

  const alpha = roughness;  // Set alpha to the value of roughness

  const highest_y = microfacetD(0, alpha);

  functionPlot({
    target: "#bsdf",
    grid: true,
    disableZoom: true,
    disablePan: true,
    width,
    height,
    xAxis: { domain: [-89, 89] },
    yAxis: { domain: [0, highest_y+1] },
    data: [
      {
        fn: `(${alpha}^2)/(PI*((cos(x*PI/180))^4) * ((${alpha}^2)+((tan(x*PI/180))^2))^2)`,
        color: 'red'
      },
      {
        fn: `(1/(PI*(${alpha}^2)*(cos(x*PI/180)^4)))*exp((-(tan(x*PI/180))^2)/((${alpha})^2))`,
        color: 'green'
      }
    ]
  });
}

function drawDiffuseBSDF() {
  let bsdfElement = document.getElementById("bsdf");
  bsdfElement.innerHTML = '';
  let bounds = bsdfElement.getBoundingClientRect();
  let width = bounds.width;
  let height = bounds.height;

  functionPlot({
    target: "#bsdf",
    grid: true,
    disableZoom: true,
    disablePan: true,
    width,
    height,
    xAxis: { domain: [-89, 89] },
    yAxis: { domain: [0, 1] },
    data: [
      {
        fn: `1/PI`,
        color: 'blue'
      }
    ]
  });
}
