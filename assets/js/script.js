const canvas = document.getElementById("backgroundCanvas");
// canvas size
let w, h;
let loop = null;

const setSize = () => {
  w = window.innerWidth > 800 ? 800 : window.innerWidth;
  h = window.innerHeight > 1000 ? 1000 : window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  if (loop !== null) {
    loop.glCanvas.style.left = `${window.innerWidth / 2 - w / 2}px`;
    loop.glCanvas.style.top = `${window.innerHeight / 2 - h / 2}px`;
    canvas.style.display = "none";
  }
};

window.addEventListener("resize", setSize);
setSize();

// load the image
// Create the image object
const logo = new Image();
// Set the source url of the image
logo.src = "/assets/logo.png";

// textbox size
const bw = 330;
const bh = 100;
// positioning variables
let x = 5;
let y = bh + 4;
let xMag = 150;
let yMag = 150;

loop = new V4.Loop(canvas, { webGl: true, backgroundColor: "#396082" });
setSize();

const start = async () => {
  // load the font
  const fg = new V4.FontGroup();
  await fg.loadFont("/assets/fonts/antiqua.ttf", "Black");

  // background logo renderer
  const logoRenderer = (state) => {
    let x = 0;
    let y = 0;
    for (let c = 0; c < w / 100; c++) {
      y = c % 2 == 0 ? 0 : -50;
      for (let r = 0; r < (h + 100) / 100; r++) {
        state.context.drawImage(logo, x, y, 100, 100);
        y += 100;
      }
      x += 100;
    }
  };

  loop.addToLoop(logoRenderer);

  // bouncing text renderer
  const tb = new V4.TextBox({
    font: fg.getFontVariant("Black"),
    fontSize: 60,
    position: { x: 300, y: 0 },
    size: { h: bh, w: bw },
    backgroundColor: "#396082",
    color: "black",
    horizontalAlign: "CENTER",
    verticalAlign: "CENTER",
  });
  tb.text("Rainflame");

  // load and set the shader
  const sr = new V4.Shader(loop.glCanvas);
  const shader = await sr.loadShader("/assets/vhsFilter.glsl");
  sr.useCanvasState(true);
  sr.setShader(shader);
  loop.addToLoop(sr);

  // // set the textbox and canvas colors to be a random blue shade
  // const randomBlue = () => {
  //   const blue = Math.floor(Math.random() * 180) + 75;
  //   tb.options({ backgroundColor: `rgb(0, 0, ${blue})` });
  //   loop.backgroundColor(`rgb(0, 0, ${255 - blue})`);
  // };

  // the renderer to bounce the textbox around the canvas
  const bounceRenderer = (state) => {
    if (x + bw >= w || x <= 0) {
      xMag *= -1;
      x += 5 * Math.sign(xMag); // give it a little boost to prevent sticking to side
    } else if (y >= h || y <= bh) {
      yMag *= -1;
      y += 5 * Math.sign(yMag);
    }
    x += xMag * state.deltaTime;
    y += yMag * state.deltaTime;

    tb.options({ position: { x, y } });
    tb.renderer(state);
  };

  // add the renderer to the loop and start it
  loop.addToLoop(bounceRenderer);
  loop.framesPerSecond(24);
  loop.startLoop();
};

// Add onload event handler
logo.onload = () => {
  start();
};
