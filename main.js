const canvas = document.querySelector("#gl-canvas");

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const gl = canvas.getContext("webgl");
let yRotation = 0;
let xRotation = 0;
let mouseX = 0;
let mouseY = 0;
document.addEventListener("mousemove", function (event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

if (gl === null) {
  document.querySelector("#gl-canvas").style.display = "none";
  document.querySelector("#fallback").style.display = "block";
} else {
  main();
}

function main() {
  const textureShader = getTextureShader();
  const card = initTextured(textureShader, {
    pos: {
      x: 0,
      y: 500,
      z: 0,
      w: 100,
      h: 100,
      d: 0.15,
    },
    textureName: "card.png",
  });

  const colorShader = getColorShader();
  const lLink = initRect(colorShader, {
    pos: {
      x: 50,
      y: 300,
      w: 200,
      h: 100,
    },
    color: [0, 0, 1.0, 0.35],
  });
  const rLink = initRect(colorShader, {
    pos: {
      x: 500,
      y: 300,
      w: 200,
      h: 100,
    },
    color: [0, 0, 1.0, 0.35],
  });

  const scene = {
    textured: [card],
    rect: { objs: [], program: colorShader },
  };

  const render = () => {
    drawScene(scene);
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}

function drawScene(scene) {
  document.body.style.cursor = "default";

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const ndcX = (mouseX / canvas.width) * 2 - 1;
  const ndcY = (mouseY / canvas.height) * 2 - 1;
  const mouse = vec4.fromValues(ndcX, ndcY, 0, 0);

  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = canvas.width / canvas.height;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  //mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = mat4.create();

  //mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -10.0]);

  if (mouseX < canvas.width && mouseY < canvas.height) {
    // yRotation = (2 * (mouseX - canvas.width / 2)) / canvas.width;
    // xRotation = (mouseY - canvas.height / 2) / canvas.height;
  }
  mat4.rotate(modelViewMatrix, modelViewMatrix, xRotation, [1, 0, 0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, yRotation, [0, 1, 0]);

  const cardWidth = 448;
  const cardHeight = 256;

  const rect = scene.rect;

  gl.useProgram(rect.program);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  for (let obj of rect.objs) {
    obj.draw(projectionMatrix, modelViewMatrix);
  }
}

// const h = 0.15;
// const w = 2.5 * h;
// const x = 42 / cardWidth + w / 2;
// const y = 42 / cardHeight + h / 2;
// mat4.translate(rectMatrix, modelViewMatrix, [
//   -wCard + w + x,
//   hCard - h - y,
//   0.05,
// ]);
// mat4.scale(rectMatrix, rectMatrix, [w, h, 1.0]);
// const points = [
//   vec4.fromValues(1.0, 1.0, 0.0, 0.0),
//   vec4.fromValues(-1.0, 1.0, 0.0, 0.0),
//   vec4.fromValues(1.0, -1.0, 0.0, 0.0),
//   vec4.fromValues(-1.0, -1.0, 0.0, 0.0),
// ].map((point) => {
//   const m = mat4.create();
//   mat4.multiply(m, projectionMatrix, rectMatrix);
//   const translated = vec3.create();
//   mat4.multiply(translated, m, point);
//   return vec3.fromValues(
//     (translated[0] / aspect) * 2.0 - 1.0,
//     (translated[1] / aspect) * 2.0 - 1.0,
//     translated[2]
//   );
// });

// const h = 0.15;
// const w = 2.5 * h;
// const x = 10 / cardWidth + w / 2;
// const y = 42 / cardHeight + h / 2;
// const rectMatrix = mat4.create();
// mat4.translate(rectMatrix, modelViewMatrix, [
//   wCard - w - x,
//   hCard - h - y,
//   0.05,
// ]);
// mat4.scale(rectMatrix, rectMatrix, [w, h, 1.0]);

function convertPos(pos) {
  return {
    x: convertX(pos.x),
    y: convertY(pos.y),
    w: convertWidth(pos.w),
    h: convertHeight(pos.h),
  };
}

function convertX(x) {
  return (2 * x - canvas.width) / canvas.width;
}

function convertY(y) {
  return (2 * y - canvas.height) / canvas.height;
}

function convertWidth(w) {
  return 2 * (w / canvas.width);
}

function convertHeight(h) {
  return 2 * (h / canvas.height);
}

function enableAttribute(program, buffer, stride, attrib) {
  const aLocation = gl.getAttribLocation(program, attrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    aLocation,
    stride,
    gl.FLOAT,
    false, // normalize
    0, // stride
    0 // offset
  );
  gl.enableVertexAttribArray(aLocation);
}

function getTextureShader() {
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  const fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  return initShaderProgram(vsSource, fsSource);
}

function getTexturedBuffers() {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // prettier-ignore
  const indices = [
     0,  1,  2,      0,  2,  3,    // front
     4,  5,  6,      4,  6,  7,    // back
     8,  9,  10,     8,  10, 11,   // top
     12, 13, 14,     12, 14, 15,   // bottom
     16, 17, 18,     16, 18, 19,   // right
     20, 21, 22,     20, 22, 23,   // left
  ];
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  const textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  const textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    // Bottom
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    // Right
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    // Left
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  ];
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),
    gl.STATIC_DRAW
  );

  return {
    position: positionBuffer,
    indices: indexBuffer,
    textureCoord: textureBuffer,
  };
}

function getTexturedObj() {
  const texture = loadTexture("card.png");
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  return {
    program,
    buffers,
    texture,
  };
}

// const scaleFactor = 0.25;
// const wCard = 1.75 * (1 + scaleFactor);
// const hCard = 1.0 * (1 + scaleFactor);
function initTextured() {}

function drawTextured() {
  const vertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  const textureCoord = gl.getAttribLocation(program, "aTextureCoord");

  const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  const uSampler = gl.getUniformLocation(program, "uSampler");

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  gl.vertexAttribPointer(
    vertexPosition,
    3,
    gl.FLOAT,
    false, // normalize
    0, // stride
    0 // offset
  );
  gl.enableVertexAttribArray(vertexPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  gl.vertexAttribPointer(
    textureCoord,
    2,
    gl.FLOAT,
    false, // normalize
    0, // stride
    0 // offset
  );
  gl.enableVertexAttribArray(textureCoord);

  gl.useProgram(program);

  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, cardMatrix);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(uSampler, 0);

  const offset = 0;
  const vertexCount = 4;
  gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

function getColorShader() {
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  return initShaderProgram(vsSource, fsSource);
}

function getRectPositions(screenPos) {
  const pos = convertPos(screenPos);
  const yNew = -1 * pos.y;
  return [
    pos.x,
    yNew,
    pos.x,
    yNew - pos.h,
    pos.x + pos.w,
    yNew,
    pos.x + pos.w,
    yNew - pos.h,
  ];
}

function bindRectPositions(screenPos) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = getRectPositions(screenPos);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
}

function bindSolidRectColor(color) {
  const colorBuffer = gl.createBuffer();
  const colors = [...color, ...color, ...color, ...color];
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  return colorBuffer;
}

function initRect(program, rect) {
  const positionBuffer = bindRectPositions(rect.pos);
  const colorBuffer = bindSolidRectColor(rect.color);

  const draw = (projectionMatrix, modelViewMatrix) => {
    drawRect(
      rect,
      positionBuffer,
      colorBuffer,
      program,
      projectionMatrix,
      modelViewMatrix
    );
  };

  return { draw };
}

function drawRect(
  rect,
  positionBuffer,
  colorBuffer,
  program,
  projectionMatrix,
  modelViewMatrix
) {
  enableAttribute(program, positionBuffer, 2, "aVertexPosition");
  enableAttribute(program, colorBuffer, 4, "aVertexColor");

  const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");

  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

  const plane = getRectPositions(rect.pos);
  if (pnpoly(plane, convertX(mouseX), -1 * convertY(mouseY))) {
    document.body.style.cursor = "pointer";
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

// from https://wrfranklin.org/Research/Short_Notes/pnpoly.html#The%20Method
function pnpoly(verts, testx, testy) {
  let c = false;
  const nvert = verts.length / 2;

  for (let i = 0, j = nvert - 1; i < nvert; j = i++) {
    const xi = verts[2 * i];
    const yi = verts[2 * i + 1];
    const xj = verts[2 * j];
    const yj = verts[2 * j + 1];

    const denom = yj - yi;
    const intersectX = ((xj - xi) * (testy - yi)) / denom + xi;

    if (
      Math.abs(testx - intersectX) < 0.05 &&
      ((yi >= testy && yj <= testy) || (yi <= testy && yj >= testy))
    ) {
      return 1; // ON EDGE
    }

    const intersect =
      yi > testy !== yj > testy &&
      testx < ((xj - xi) * (testy - yi)) / (yj - yi) + xi;

    if (intersect) c = !c;
  }

  return c;
}

function initShaderProgram(vsSource, fsSource) {
  const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
}

function loadShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function loadTexture(url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1.75;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 0, 0]);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );

    const isPowerOf2 = (value) => (value & (value - 1)) === 0;

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}
