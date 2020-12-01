var assert = require('assert');

import {parseHTML} from "../src/parser.js";

describe("add函数测试", function () {
  it("<a></a>", async function () {
    let tree = parseHTML("<a></a>");
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children[0].tagName, 'a');
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it("<a>132\n123</a>", async function () {
    let tree = parseHTML("<a>132\n123</a>");
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children[0].tagName, 'a');
    assert.strictEqual(tree[0].children[0].children.length, 1);
  });
  it("<a href=\"void\"></a>", async function () {
    let tree = parseHTML("<a href=\"void\"></a>");
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it("<a href id></a>", async function () {
    let tree = parseHTML("<a href id></a>");
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it("<a href =></a>", async function () {
    let tree = parseHTML("<a href =></a>");
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it("<a href=></a>", async function () {
    let tree = parseHTML("<a href=></a>");
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it("<a href=/>", async function () {
    let tree = parseHTML("<a href=/>");
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it("<a href />", async function () {
    let tree = parseHTML("<a href />");
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it("<a href=1></a>", async function () {
    let tree = parseHTML("<a href=1></a>");
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it('<a href="1"/>', async function () {
    let tree = parseHTML('<a href="1"/>');
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it('<a href="void" id ></a>', async function () {
    let tree = parseHTML('<a href="void" id ></a>');
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it('<a href=void id=\'i\'></a>', async function () {
    let tree = parseHTML('<a href=void id=\'i\'></a>');
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it('<DIV></DIV>', async function () {
    let tree = parseHTML('<DIV></DIV>');
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
  it('<div></ddiv>', async function () {
    assert.throws(function(){
      parseHTML('<div></ddiv>')
    }, {
      message: /Tag start end/
    });
  });
  it("<img/", async function () {
    let tree = parseHTML("<img/");
    assert.strictEqual(tree[0].children.length, 0);
  });
  it("<img / id/>", async function () {
    let tree = parseHTML("<img / id/>");
    console.log(tree[0].children[0]);
    assert.strictEqual(tree[0].children.length, 1);
  });
  it('<img id="1"', async function () {
    let tree = parseHTML('<img id="1"');
    console.log(tree[0].children[0]);
    assert.strictEqual(tree[0].children.length, 0);
  });
  it('<img id="1"src=2/>', async function () {
    let tree = parseHTML('<img id="1"src=2/>');
    console.log(tree[0].children[0]);
    assert.strictEqual(tree[0].children.length, 1);
  });
  it("<img width=1/>", async function () {
    let tree = parseHTML("<img width=1/>");
    
    assert.notStrictEqual(tree[0].children[0].attributes.length, 0);
    var o = tree[0].children[0].attributes.find(t=>t.name==='isSelfClosing');
    assert.strictEqual(o.value, true);
    o = tree[0].children[0].attributes.find(t=>t.name==='width');
    assert.strictEqual(o.value, '1');
  });
  it('<style>p {color:red;font-size:14px;/* 1 */}</style><p></p>', async function () {
    let tree = parseHTML('<style>p {color:red;font-size:14px;/* 1 */}</style><p></p>');
    //console.log(tree[0].children);
    assert.strictEqual(tree[0].children[1].computedStyle.color.value, 'red');
  });
  it('<style>div p {color:red;}div>p {color:red;}/* 1 */</style><div><p></p></div>', async function () {
    let tree = parseHTML('<style>div p {color:red;}div>p {color:red;}/* 1 */</style><div><p></p></div>');
    //console.log(tree[0].children);
    assert.strictEqual(tree[0].children[1].children[0].computedStyle.color.value, 'red');
  });
  it('<style>* {color:black}div {color:red} #d {color:white} .d {color:green} div.d#d {color:blue}</style><div class="d" id="d"/>', async function () {
    let tree = parseHTML('<style>* {color:black}div {color:red} #d {color:white} .d {color:green} div.d#d {color:blue}</style><div class="d" id="d"/>');
    console.log(tree[0].children[1]);
    assert.strictEqual(tree[0].children[1].computedStyle.color.value, 'blue');
  });
  
  it('<h2/>', async function () {
    let tree = parseHTML('<h2/>');
    console.log(tree[0].children[0]);
    assert.strictEqual(tree[0].children.length, 1);
  });
  it('<div></>', async function () {
    let tree = parseHTML('<div></>');
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 1);
  });
  it('<div></', async function () {
    let tree = parseHTML('<div></');
    //console.log(tree[0]);
    assert.strictEqual(tree[0].children.length, 1);
    assert.strictEqual(tree[0].children[0].children.length, 0);
  });
});