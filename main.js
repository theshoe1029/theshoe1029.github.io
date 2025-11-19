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
  const cardWidth = 448;
  const cardHeight = 256;
  const cardX = (canvas.width - cardWidth) / 2;
  const cardY = (canvas.height + cardHeight) / 2;
  const card = initTextured(textureShader, {
    pos: {
      x: cardX,
      y: cardY,
      z: -0.01,
      w: cardWidth,
      h: cardHeight,
      d: 0.0025,
    },
    textureName: "card.png",
  });

  const colorShader = getColorShader();
  const linkW = 90;
  const linkH = 30;
  const lLink = initRect(colorShader, {
    pos: {
      x: cardX + 22,
      y: cardY - cardHeight + 25,
      w: linkW,
      h: linkH,
    },
    color: [0, 0, 1.0, 0.35],
  });
  const rLink = initRect(colorShader, {
    pos: {
      x: cardX + 343,
      y: cardY - cardHeight + 25,
      w: linkW,
      h: linkH,
    },
    color: [0, 0, 1.0, 0.35],
  });

  const scene = {
    textured: { objs: [card], program: textureShader },
    rect: { objs: [lLink], program: colorShader },
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

  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = 1;
  const zNear = 0.1;
  const zFar = 100;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -2]);

  if (mouseX < canvas.width && mouseY < canvas.height) {
    // yRotation = convertX(mouseX);
    // xRotation = convertY(mouseY);
  }
  mat4.rotate(modelViewMatrix, modelViewMatrix, xRotation, [1, 0, 0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, yRotation, [0, 1, 0]);

  const textured = scene.textured;

  gl.useProgram(textured.program);

  for (let obj of textured.objs) {
    obj.draw(projectionMatrix, modelViewMatrix);
  }

  const rect = scene.rect;

  gl.useProgram(rect.program);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  for (let obj of rect.objs) {
    obj.draw(projectionMatrix, modelViewMatrix);
  }
}

function convertPos(pos) {
  return {
    x: convertX(pos.x),
    y: -1 * convertY(pos.y),
    z: pos.z,
    w: convertWidth(pos.w),
    h: convertHeight(pos.h),
    d: pos.d,
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

function enableIndexedAttribute(program, buffer, indexBuffer, stride, attrib) {
  const aLocation = gl.getAttribLocation(program, attrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
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

function initTextured(program, obj) {
  const pos = convertPos(obj.pos);
  // prettier-ignore
  const positions = [
    // --- Front (+Z) ---
    pos.x,         pos.y,         pos.z + pos.d / 2,   // bottom-left
    pos.x + pos.w, pos.y,         pos.z + pos.d / 2,   // bottom-right
    pos.x + pos.w, pos.y + pos.h, pos.z + pos.d / 2,   // top-right
    pos.x,         pos.y + pos.h, pos.z + pos.d / 2,   // top-left

    // --- Back (-Z) ---
    pos.x + pos.w, pos.y,         pos.z - pos.d / 2,   // bottom-left
    pos.x,         pos.y,         pos.z - pos.d / 2,   // bottom-right
    pos.x,         pos.y + pos.h, pos.z - pos.d / 2,   // top-right
    pos.x + pos.w, pos.y + pos.h, pos.z - pos.d / 2,   // top-left

    // --- Top ---
    pos.x,         pos.y + pos.h, pos.z - pos.d / 2,
    pos.x + pos.w, pos.y + pos.h, pos.z - pos.d / 2,
    pos.x + pos.w, pos.y + pos.h, pos.z + pos.d / 2,
    pos.x,         pos.y + pos.h, pos.z + pos.d / 2,

    // --- Bottom ---
    pos.x,         pos.y,         pos.z - pos.d / 2,
    pos.x + pos.w, pos.y,         pos.z - pos.d / 2,
    pos.x + pos.w, pos.y,         pos.z + pos.d / 2,
    pos.x,         pos.y,         pos.z + pos.d / 2,

    // --- Right (+X side) ---
    pos.x + pos.w, pos.y,         pos.z - pos.d / 2,
    pos.x + pos.w, pos.y + pos.h, pos.z - pos.d / 2,
    pos.x + pos.w, pos.y + pos.h, pos.z + pos.d / 2,
    pos.x + pos.w, pos.y,         pos.z + pos.d / 2,

    // --- Left (-X side) ---
    pos.x,         pos.y,         pos.z - pos.d / 2,
    pos.x,         pos.y + pos.h, pos.z - pos.d / 2,
    pos.x,         pos.y + pos.h, pos.z + pos.d / 2,
    pos.x,         pos.y,         pos.z + pos.d / 2,
  ];

  const positionBuffer = bindFloats(positions);

  // prettier-ignore
  const indices = [
     0,  1,  2,      0,  2,  3,    // front
     4,  5,  6,      4,  6,  7,    // back
     8,  9,  10,     8,  10, 11,   // top
     12, 13, 14,     12, 14, 15,   // bottom
     16, 17, 18,     16, 18, 19,   // right
     20, 21, 22,     20, 22, 23,   // left
  ];
  const indexBuffer = bindInts(indices);

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
  const textureBuffer = bindFloats(textureCoordinates);

  const texture = loadTexture("card.png", pos.w, pos.h);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const draw = (projectionMatrix, modelViewMatrix) => {
    drawTextured(
      positionBuffer,
      indexBuffer,
      textureBuffer,
      texture,
      program,
      projectionMatrix,
      modelViewMatrix
    );
  };

  return { draw };
}

function drawTextured(
  positionBuffer,
  indexBuffer,
  textureBuffer,
  texture,
  program,
  projectionMatrix,
  modelViewMatrix
) {
  enableIndexedAttribute(
    program,
    positionBuffer,
    indexBuffer,
    3,
    "aVertexPosition"
  );
  enableAttribute(program, textureBuffer, 2, "aTextureCoord");

  const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");

  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const uSampler = gl.getUniformLocation(program, "uSampler");
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

function getRectPositions(screenPos) {
  const pos = convertPos(screenPos);
  return [
    pos.x,
    pos.y,
    pos.x,
    pos.y - pos.h,
    pos.x + pos.w,
    pos.y,
    pos.x + pos.w,
    pos.y - pos.h,
  ];
}

function getPlane(pos) {
  return [
    pos.x,
    pos.y,
    pos.x,
    pos.y - pos.h,
    pos.x + pos.w,
    pos.y,
    pos.x + pos.w,
    pos.y - pos.h,
  ];
}

function bindFloats(data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
}

function bindInts(data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
  return buffer;
}

function bindSolidRectColor(color) {
  const colorBuffer = gl.createBuffer();
  const colors = [...color, ...color, ...color, ...color];
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  return colorBuffer;
}

function initRect(program, rect) {
  const positionBuffer = bindFloats(getRectPositions(rect.pos));
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

  console.log(
    "start",
    unProject(mouseX, mouseY, 0, modelViewMatrix, projectionMatrix)
  );
  console.log(
    "end",
    unProject(mouseX, mouseY, 1, modelViewMatrix, projectionMatrix)
  );
  const plane = getPlane(rect.pos);
  // const unproject = mat4.create();
  // mat4.multiply(unproject, modelViewMatrix, projectionMatrix);
  // mat4.invert(unproject, unproject);
  // let plane2 = [];
  // for (let i = 0; i < plane.length / 2; i++) {
  //   const x = plane[2 * i];
  //   const y = plane[2 * i + 1];
  //   const point = vec4.fromValues(x, y, 0, 1.0);
  //   // vec4.transformMat4(point, point, modelViewMatrix);
  //   // vec4.transformMat4(point, point, projectionMatrix);
  //   vec4.transformMat4(point, point, unproject);
  //   plane2.push(point[0], point[1]);
  // }
  if (pnpoly(plane, mouseX, mouseY)) {
    document.body.style.cursor = "pointer";
  }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function unProject(winX, winY, winZ, modelViewMatrix, projectionMatrix) {
  const input = vec4.fromValues(winX, winY, winZ, 1);

  const unproject = mat4.create();
  mat4.multiply(unproject, modelViewMatrix, projectionMatrix);
  mat4.invert(unproject, unproject);

  input[0] = winX / canvas.width;
  input[1] = winY / canvas.height;

  input[0] = input[0] * 2 - 1;
  input[1] = input[1] * 2 - 1;
  input[2] = input[2] * 2 - 1;

  const result = vec4.create();
  mat4.multiply(result, unproject, input);

  result[0] /= result[3];
  result[1] /= result[3];
  result[2] /= result[3];

  return result;
}

// from https://wrfranklin.org/Research/Short_Notes/pnpoly.html#The%20Method
function pnpoly(verts, testx, testy) {
  let c = false;
  const nvert = verts.length / 2;
  //console.log(verts, testx, testy);

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

function loadTexture(url, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
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
