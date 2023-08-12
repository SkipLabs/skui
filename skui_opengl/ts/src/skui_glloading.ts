
import {int} from "#std/sk_types";
import { Matrix } from "#skui_opengl/skui_matrix";

export class Loading {
  win: Window;
  program: WebGLProgram;
  positionLocation: GLint;
  matrixLocation: WebGLUniformLocation;
  color1Location: WebGLUniformLocation;
  color2Location: WebGLUniformLocation;
  stepLocation: WebGLUniformLocation;
  smoothLocation: WebGLUniformLocation;
  positionBuffer: WebGLBuffer | null;
  step: GLint;
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  interval: int | null;
  setInterval: (handler: TimerHandler, timeout: int) => int

  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, setInterval: (handler: TimerHandler, timeout: int) => int) {
    this.setInterval = setInterval;
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.step = 0;
    this.gl = gl;
    this.canvas = canvas;
    this.program = loadindProgram(gl)!;

    this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
    this.matrixLocation = gl.getUniformLocation(this.program, "u_matrix")!;
    this.color1Location = gl.getUniformLocation(this.program, 'u_color1')!;
    this.color2Location = gl.getUniformLocation(this.program, 'u_color2')!;
    this.stepLocation = gl.getUniformLocation(this.program, 'u_step')!;
    this.smoothLocation = gl.getUniformLocation(this.program, 'u_smooth')!;
  }
  draw = (x: number, y: number, width: number, height: number, color1: Iterable<GLfloat>, color2: Iterable<GLfloat>, cWidth: number, cHeight: number) => {
    let gl = this.gl;
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
    // this matrix will convert from pixels to clip space
    let matrix = new Matrix();
    matrix.setAsOrthographic(0, cWidth, cHeight, 0, -1, 1);
    // this matrix will translate our quad to dstX, dstY
    matrix.translate(x, y, 0);
    // this matrix will scale our 1 unit quad
    matrix.scale(width, height, 1);
    // Set the matrix.
    gl.uniformMatrix4fv(this.matrixLocation, false, matrix.data);
    gl.uniform4fv(this.color1Location, color1);
    gl.uniform4fv(this.color2Location, color2);
    gl.uniform1i(this.stepLocation, this.step);
    let len = Math.sqrt(width * width + height * height);
    gl.uniform1f(this.smoothLocation, 4.2 / len);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(this.positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  };
  stop = () => {
    if (this.interval != null) {
      if (this.positionBuffer != null) {
        this.gl.deleteBuffer(this.positionBuffer);
        this.positionBuffer = null;
      }
      clearInterval(this.interval);
      this.interval = null;
    };
  };
  loading = () => {
    if (this.interval == null) {
      return;
    }
    // Clear canvas
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    // Draw
    let size = 200;
    this.draw(
      (this.canvas.width - size) / 2.0,
      (this.canvas.height - size) / 2.0,
      size,
      size,
      [0.4, 1, 0.8, 1],
      [0.2, 0.6, 1.0, 1],
      this.canvas.width,
      this.canvas.height
    );
    requestAnimationFrame(this.loading);
  };
  update = () => {
    this.step = (this.step + 1) % 8;
  };
  start = () => {
    this.gl.enable(this.gl.BLEND);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA)
    this.interval = this.setInterval(this.update, 100);
    requestAnimationFrame(this.loading);
  };
  isActive = () => {
    return this.interval != null && !this.gl.isContextLost();
  };
}


const makeShader = (gl: WebGLRenderingContext, src: string, type: GLenum) => {
  var shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw Error("Error compiling shader: " + gl.getShaderInfoLog(shader));
  }
  return shader;
};

const loadindProgram = (gl: WebGLRenderingContext) => {
  // Compile shaders
  var vertexShader = makeShader(gl, progressVertexShader, gl.VERTEX_SHADER)!;
  var fragmentShader = makeShader(gl, progressFragmentShader, gl.FRAGMENT_SHADER)!;

  // Create program
  var glProgram = gl.createProgram()!;

  // Attach and link shaders to the program
  gl.attachShader(glProgram, vertexShader);
  gl.attachShader(glProgram, fragmentShader);
  gl.linkProgram(glProgram);
  if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program");
    return false;
  }
  return glProgram;
};

const progressVertexShader =
  "attribute vec4 a_position;\n\
uniform mat4 u_matrix;\n\
varying vec2 v_position;\n\
void main() {\n\
  vec4 position = u_matrix * a_position;\n\
  v_position = a_position.xy;\n\
  gl_Position = position;\n\
}"

const progressFragmentShader =
  "precision mediump float;\n\
uniform vec4 u_color1;\n\
uniform vec4 u_color2;\n\
uniform int u_step;\n\
uniform float u_smooth;\n\
varying vec2 v_position;\n\
\n\
vec2 center1 = vec2(0.5, 0.125);\n\
vec2 center2 = vec2(0.765, 0.235);\n\
vec2 center3 = vec2(0.875, 0.5);\n\
vec2 center4 = vec2(0.765, 0.765);\n\
vec2 center5 = vec2(0.5, 0.875);\n\
vec2 center6 = vec2(0.235, 0.765);\n\
vec2 center7 = vec2(0.125, 0.5);\n\
vec2 center8 = vec2(0.235, 0.235);\n\
\n\
vec2 draw_circle(vec2 coord, float radius, int step) {\n\
  float value = smoothstep(radius, radius - u_smooth, length(coord));\n\
  return vec2(\n\
    value,\n\
    float(value > 0.0 && step == u_step)\n\
  );\n\
}\n\
\n\
void main() {\n\
  vec2 coord = v_position;\n\
  vec2 circle = draw_circle(coord - center1, 0.125, 0) + \n\
    draw_circle(coord - center2, 0.125, 1) + \n\
    draw_circle(coord - center3, 0.125, 2) + \n\
    draw_circle(coord - center4, 0.125, 3) + \n\
    draw_circle(coord - center5, 0.125, 4) + \n\
    draw_circle(coord - center6, 0.125, 5) + \n\
    draw_circle(coord - center7, 0.125, 6) + \n\
    draw_circle(coord - center8, 0.125, 7);\n\
  gl_FragColor = circle.y * u_color2 + (1.0 - circle.y) * u_color1;\n\
  gl_FragColor.a = circle.x;\n\
}"