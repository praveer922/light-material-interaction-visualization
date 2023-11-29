let contentsBounds = document.body.getBoundingClientRect();
let width = 800;
let height = 500;
let ratio = contentsBounds.width / width;
width *= ratio;
height *= ratio;
let alpha = 0.2

functionPlot({
    target: "#bsdf",
    grid: true,
    width,
    height,
    xAxis: { domain: [-90, 90]},
    yAxis: { domain: [-1, 9] },
    data: [
      { 
        fn: '(a^2)/(PI*((cos(x*PI/180))^4) * ((a^2)+((tan(x*PI/180))^2))^2)',
        scope: { a: alpha }
      }
    ]
  });