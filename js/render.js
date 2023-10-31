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

}

