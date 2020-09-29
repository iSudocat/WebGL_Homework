var gl;
var vertices;
var points;
var program;

var tessellation = 4;
var rotation = 0;

var vec_triangle = [
  vec2(-Math.sqrt(3.0) / 2.0, -0.5),
  vec2(Math.sqrt(3.0) / 2.0, -0.5),
  vec2(0, 1)
];

vertices = vec_triangle;

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

  $('#rotation').on('input', function () {
    rotation = $(this).val();
    draw();
  });

  $('#tessellation').on('input', function () {
    tessellation = $(this).val();
    draw();
  });

});


function draw() {
  points = [];

  for (var i = 0; i < vertices.length; i += 3) {
    divideTriangle(vertices[i + 0], vertices[i + 1], vertices[i + 2], tessellation);
  }

  // Load the data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, points.length);
}

function twist(p) {
  //  x' = x cos(d0) - y sin(d0)
  //  y' = x sin(d0) + y cos(d0)
  var x = p[0];
  var y = p[1];
  var d = Math.sqrt(x * x + y * y);
  var sin = Math.sin(d * (rotation * Math.PI / 180.0));
  var cos = Math.cos(d * (rotation * Math.PI / 180.0));
  return [x * cos - y * sin, x * sin + y * cos];
}

function divideTriangle(a, b, c, count) {

  if (count === 0) {
    a = twist(a);
    b = twist(b);
    c = twist(c);

    points.push(a, b, b, c, c, a);

  } else {
    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var bc = mix(b, c, 0.5);

    count--;

    divideTriangle(a, ab, ac, count);
    divideTriangle(b, bc, ab, count);
    divideTriangle(c, ac, bc, count);
    divideTriangle(ab, ac, bc, count);
  }

}