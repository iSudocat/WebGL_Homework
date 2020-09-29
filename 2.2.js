var gl;
var vertices = [
  vec3(-0.5, 0.0, 0.0),
  vec3(0.5, 0.0, 0.0),
  vec3(0.0, Math.sqrt(3.0) / 2.0, 0.0),
  vec3(0.0, 0.5 / Math.sqrt(3.0), Math.sqrt(2.0 / 3.0))
];
var points;
var program;

var tessellation = 4;

$(function () {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  } else {
    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    draw();
  }

  $('#tessellation').on('input', function () {
    tessellation = $(this).val();
    draw();
  });

});


function draw() {
  points = [];

  divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], tessellation);

  // Load the data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  const viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0, 0, 0.35, 0.5, 0.5, 0.25, 0, 0, 1);
  var ViewLocation = gl.getUniformLocation(program, "u_ViewMatrix");
  gl.uniformMatrix4fv(ViewLocation, false, viewMatrix.elements);

  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

function triangle(a, b, c) {
  points.push(a, b, c);
}

function tetra(a, b, c, d) {
  triangle(a, c, b);
  triangle(a, c, d);
  triangle(a, b, d);
  triangle(b, c, d);
}

function divideTetra(a, b, c, d, count) {

  if (count === 0) {
    tetra(a, b, c, d);

  } else {

    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var ad = mix(a, d, 0.5);
    var bc = mix(b, c, 0.5);
    var bd = mix(b, d, 0.5);
    var cd = mix(c, d, 0.5);

    count--;

    divideTetra(a, ab, ac, ad, count);
    divideTetra(ab, b, bc, bd, count);
    divideTetra(ac, bc, c, cd, count);
    divideTetra(ad, bd, cd, d, count);
  }
}

