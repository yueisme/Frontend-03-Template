const images = require('images');

function render(viewport, element) {
  if (element.style) {
    let img     = images(element.style.width, element.style.height);
    let color   = element.style['background-color'] || 'rgb(0,0,0)';
    let matched = color.match(/rgb\( *(\d+) *, *(\d+) *, *(\d+)\)/);
    img.fill(Number(matched[1]), Number(matched[2]), Number(matched[3]));
    viewport.draw(img, element.style.left || 0, element.style.top || 0);
  }
  if (element.children) {
    for (let child of element.children) {
      render(viewport, child);
    }
  }
}

module.exports = render;