import { createElement, Component } from "./framework.js";
import { TimeLine, Animation } from "./animation.js";
import Carousel from "./Carousel.js";
import Button from "./Button.js";
import List from "./List.js";

function main() {
  let source = [
    { img: "./t.jpg", url: location.origin + "#1", title: "1" },
    { img: "./t2.jpg", url: location.origin + "#2", title: "2" },
    { img: "./drink.jpeg", url: location.origin + "#3", title: "3" },
    { img: "./p4.png", url: location.origin + "#4", title: "4" },
  ];
  let a = <Carousel id="a" source={source} onClick={(e) => alert(e.detail.src)} onChange={(e) => console.log(e.detail)}></Carousel>;
  a.mountTo(document.body);
  window.a = a;

  let b = <Button>i m a button</Button>;
  b.mountTo(document.body);

  let l = (
    <List data={source}>
      {({ img, url, title }) => (
        <li>
          <img height="80" width="80" src={img} />
          <a target="_blank" href={url}>
            {title}
          </a>
        </li>
      )}
    </List>
  );
  l.mountTo(document.body);
}
main();
