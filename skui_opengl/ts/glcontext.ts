
import {int, float, ptr, Environment, Utils} from "#skui_base/types";
import { Loading } from "#skui_opengl/glloading";

export interface Env extends Environment {
  window: () => Window; 
  canvas: () => HTMLCanvasElement;
  render: () => void;
  setGlContext: (id: int) => void;
}

const uniforms = [
  "u_box",
  "u_center",
  "u_color",
  "u_color1",
  "u_color2",
  "u_end",
  "u_matrix",
  "u_radius",
  "u_sigma",
  "u_smooth",
  "u_start",
  "u_step",
  "u_texture",
  "u_texture1",
  "u_texture2",
  "u_thickness",
  "u_stop_colors",
  "u_stop_offsets",
  "u_progress",
  "u_precision",
  "u_size1",
  "u_size2",
  "u_bColor",
  "u_size",
  "u_pxRange"
];

const attributes = [
  "a_position"
];


class State {
  viewport: Array<number>;
  color: Array<number>;
  texture: boolean;
  blend: boolean;
  blending: () => void;

  constructor(viewport: Array<number>, color: Array<number>, texture: boolean, blend: boolean, blending: () => void) {
    this.viewport = viewport;
    this.color = color;
    this.texture = texture;
    this.blend = blend;
    this.blending = blending;
  }

  copy = () => {
    return new State(
      this.viewport,
      this.color,
      this.texture,
      this.blend,
      this.blending
    )
  };
}

const nothing = () => {};

const getContext = (canvas: HTMLCanvasElement) => {
  let gl = canvas.getContext("webgl2", { alpha: false, depth: false, antialias: false });
  if (!gl) {
    return Promise.reject(new Error("WebGl2 must be supported"));
  }
  return Promise.resolve(gl);
}

export function init(env: Env) {
  Factory.init(env);
}

class Data {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;

  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
  }
}

export class Factory {
  utils: Utils | null;
  private nextId : int = 0;
  private contexts: Map<int, Context> = new Map();
  private env: Env;
  private loading: Loading;

  private constructor() {}

  static init(environment: Environment): Promise<Factory> {
    let env = environment as Env;
    let canvas = env.canvas();
    return getContext(canvas).then(gl => {
      let factory = new Factory();
      factory.loading = new Loading(canvas, gl, env.window().setInterval);
      factory.loading.start();
      factory.env = env;
      factory.utils = null;
      return factory;
    });
  }

  createContext = () => {
    let id = this.nextId + 1;
    this.nextId++;
    let canvas: HTMLCanvasElement;
    let glPr: Promise<WebGL2RenderingContext>;
    let loading = this.loading.isActive();
    if (loading) {
      canvas = this.loading.canvas;
      glPr = Promise.resolve(this.loading.gl);
    } else {
      canvas = this.env.canvas();
      glPr = getContext(canvas);
    }
    return glPr.then(gl => {
      let context = new Context(id, canvas, gl, this.env, this.onLost, loading ? this.onMainBinding : nothing);
      this.contexts.set(id, context);
      context.start(this.onRestore);
      return context;
    })
  }
  onRestore = (ev: Event) => {
    ev.preventDefault();
    this.createContext().catch(
      err => this.env.window().alert("Context cannot be restored: " + err)
    )
  };
  onLost = (context: Context, ev?: Event) => {
    if (ev) {
      ev.preventDefault();
    }
    this.contexts.delete(context.id);
    context.stop(this.onRestore);
  };
  onMainBinding = () => {
    this.loading.stop();
  }
  doOnContext = <T>(ctxId: int, fn: (glCtx: Context) => T) => {
    let context = this.utils ? this.contexts.get(ctxId) : null;
    return context ? fn(context) : null;
  };

  activateTextureAt = (texture: int, location: int, index: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.activateTextureAt(texture, location, index));
  activeTexture = (index: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.activeTexture(index));
  createTexture:(ctxId: int) => int | null = (ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.createTexture());
  deleteTexture = (texture: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.deleteTexture(texture));
  bindTexture2D = (texture: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.bindTexture2D(texture));
  setTexture2DMinFilter =(value: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.setTexture2DMinFilter(value));
  setTexture2DMagFilter = (value: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.setTexture2DMagFilter(value));
  setTexture2DWrapS = (value: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.setTexture2DWrapS(value));
  setTexture2DWrapT = (value: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.setTexture2DWrapT(value));
  //////////////////////// SHADERS ///////////////////////////////
  createFragmentShader:(ctxId: int) => int | null = (ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.createFragmentShader());
  createVertexShader:(ctxId: int) => int | null = (ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.createVertexShader());
  compileShader = (shader: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.compileShader(shader));
  isCompiled:(shader: int, ctxId: int) => boolean = (shader: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.isCompiled(shader));
  deleteShader =(shader: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.deleteShader(shader));
  //////////////////////// PROGRAMS ///////////////////////////////
  createProgram:(ctxId: int) => int | null = (ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.createProgram());
  deleteProgram = (program: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.deleteProgram(program));
  attachShader = (program: int, shader: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.attachShader(program, shader));
  detachShader = (program: int, shader: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.detachShader(program, shader));
  linkProgram = (program: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.linkProgram(program));
  useProgram =(program: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.useProgram(program));
  isLinked: (program: int, ctxId: int) => boolean | null = (program: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.isLinked(program));
  //////////////////////// BUFFERS ///////////////////////////////
  createBuffer:(ctxId: int) => int | null = (ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.createBuffer());
  deleteBuffer = (buffer: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.deleteBuffer(buffer));
  bindArrayBuffer = (buffer: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.bindArrayBuffer(buffer));
  createVertexArray: (ctxId: int) => int | null = (ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.createVertexArray());
  deleteVertexArray = (array: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.deleteVertexArray(array));
  bindVertexArray = (array: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.bindVertexArray(array));
  enableVertexAttributeArray = (location: int, ctxId: int) =>
    this.doOnContext(ctxId, ctx => ctx.enableVertexAttributeArray(location));
  vertexFloatAttributePointer = (
    location: int,
    size: int,
    normalized: boolean,
    offset: int,
    ctxId: int
  ) => 
    this.doOnContext(ctxId, ctx => ctx.vertexFloatAttributePointer(location, size, normalized, offset));
  /////////////////////////// UNIFORMS ///////////////////////////
  uniformMatrix4fv = (
    location: int,
    transpose: boolean,
    v1: float,
    v2: float,
    v3: float,
    v4: float,
    v5: float,
    v6: float,
    v7: float,
    v8: float,
    v9: float,
    v10: float,
    v11: float,
    v12: float,
    v13: float,
    v14: float,
    v15: float,
    v16: float,
    ctxId: int
  ) => 
    this.doOnContext(ctxId, ctx => ctx.uniformMatrix4fv(location, transpose, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16));
  uniform1i =(location: int, v0: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.uniform1i(location, v0));
  uniform1f =(location: int, v0: number, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.uniform1f(location, v0));
  uniform2f =(location: int, v0: number, v1: number, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.uniform2f(location, v0, v1));
  uniform4f =(location: int, v0: number, v1: number, v2: number, v3: number, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.uniform4f(location, v0, v1, v2, v3));
  /////////////////////////// DRAW ///////////////////////////
  drawTriangleStrip =(first: int, count: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.drawTriangleStrip(first, count));
  drawTriangles =(first: int, count: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.drawTriangles(first, count));
  /////////////////////////// LOCATIONS ///////////////////////////
  getAttributeLocation =(program: int, index: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.getAttributeLocation(program, index));
  getUniformLocation =(program: int, index: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.getUniformLocation(program, index));
  /////////////////////////// FRAME BUFFERS //////////////////////////////
  bindMainFrameBuffer =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.bindMainFrameBuffer());
  bindTextureFrameBuffer =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.bindTextureFrameBuffer());
  framebufferTexture2DColor =(texture: int, level: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.framebufferTexture2DColor(texture, level));
  deleteFramebuffer =(buffer: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.deleteFramebuffer(buffer));
  /////////////////////////// STATE //////////////////////////////
  viewport =(x: int, y: int, width: int, height: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.viewport(x, y, width, height));
  clearColor =(r: number, g: int, b: int, a: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.clearColor(r, g, b, a));
  srcAlphaBlendSrcColor =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.srcAlphaBlendSrcColor());
  srcAlphaBlendOneMinus =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.srcAlphaBlendOneMinus());
  oneBlendOneMinus =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.oneBlendOneMinus());
  straitAlphaBlending =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.straitAlphaBlending());
  disableBlend =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.disableBlend());
  enableBlend =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.enableBlend());
  save =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.save());
  restore =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.restore());
  //////////////////////// UTILS ///////////////////////////////
  flush =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.flush());
  clear =(ctxId: int) => this.doOnContext(ctxId, ctx => ctx.clear());
  copyTexture =(
    toPaste: int,
    srcX: int, srcY: int,
    srcWidth: int, srcHeight: int,
    target: int, dstX: int, dstY: int,
    width: int, height: int,
    reverted: boolean,
    ctxId: int
  ) => this.doOnContext(ctxId, ctx => ctx.copyTexture(toPaste, srcX, srcY, srcWidth, srcHeight, target, dstX, dstY, width, height, reverted));
  uniform4fv =(location: int, count: int, valuesPtr: ptr, ctxId: int) => this.doOnContext(ctxId, ctx => {
    ctx.uniform4fv(location, this.utils!.getFloats32(valuesPtr, count * 4))
  });
  uniform1fv =(location: int, count: int, valuesPtr: ptr, ctxId: int) => {
    this.doOnContext(ctxId, ctx => ctx.uniform1fv(location, this.utils!.getFloats32(valuesPtr, count)));
  }
  setTexture2DRGBASubImage =(
    level: int,
    x: int,
    y: int,
    width: int,
    height: int,
    dataPtr: ptr,
    ctxId: int
  ) => this.doOnContext(ctxId, ctx =>  {
    let pixels: Uint8ClampedArray | null = null;
    if (dataPtr !== undefined && dataPtr !== null && this.utils != null) {
      pixels = this.utils.getBytesFromBuffer(dataPtr, width * height * 4);
    };
    ctx.setTexture2DRGBASubImage(level, x, y, width, height, pixels);
  });
  setTexture2DRGBAImage =(
    level: int,
    width: int,
    height: int,
    dataPtr: ptr | null | undefined,
    ctxId: int
  ) => this.doOnContext(ctxId, ctx => {
    let pixels: Uint8ClampedArray | null = null;
    if (dataPtr !== undefined && dataPtr !== null && this.utils != null) {
      pixels = this.utils.getBytesFromBuffer(dataPtr, width * height * 4);
    };
    ctx.setTexture2DRGBAImage(level, width, height, pixels);
  });
  shaderSource =(shader: int, source: ptr, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.shaderSource(shader, this.utils!.importString(source)));
  getShaderInfoLog =(shader: int, ctxId: int) => this.doOnContext(ctxId, ctx => {
    let message = ctx.getShaderInfoLog(shader);
    return message ? this.utils!.exportString(message) : null;
  });
  staticDrawData = (dataPtr: ptr, len: int, ctxId: int) => this.doOnContext(ctxId, ctx => ctx.staticDrawData(this.utils!.getFloats32(dataPtr, len)));
  getProgramInfoLog = (program: int, ctxId: int) => this.doOnContext(ctxId, ctx => {
    let message = ctx.getProgramInfoLog(program);
    return message ? this.utils!.exportString(message) : null;
  });
}

export class Context {
  id: int;
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private gVariables: Map<number, any>;
  private gKept: Set<number>;
  private gToDelete: Set<number>;
  private gVariableCount = 1;
  private gStates: Array<State>;
  private gState: State;
  private frameBuffer: WebGLFramebuffer | null = null;
  private textureBuffer: WebGLFramebuffer | null = null;
  private env: Env;
  private lostCall: (context: Context, ev?: Event) => void;
  private onMainBinding: () => void;
  private animationFrameRequest: int;
  

  constructor(
    id: int, canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, 
    env: Env, lostCall: (context: Context, ev?: Event) => void, 
    onMainBinding: () => void
  ) {
    this.id = id;
    this.canvas = canvas;
    this.onMainBinding = onMainBinding;
    this.env = env;
    this.gl = gl;
    this.gVariables = new Map();
    this.gKept = new Set();
    this.gToDelete = new Set();
    this.lostCall = lostCall;
    this.gStates = [];
    this.gState = new State(
      [0, 0, canvas.width, canvas.height],
      [1, 1, 1, 1],
      true,
      false,
      nothing
    );
  };
  start = (restoreCall: (ev?: Event) => void) => {
    this.canvas.addEventListener('webglcontextlost', this.onLost);
    this.canvas.addEventListener('webglcontextrestored', restoreCall);
    this.env.setGlContext(this.id);
    this.animationFrameRequest = requestAnimationFrame(this.onAnimationFrame);
  }
  stop = (restoreCall: (ev?: Event) => void) => {
    cancelAnimationFrame(this.animationFrameRequest);
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    this.canvas.removeEventListener('webglcontextrestored', restoreCall);
  }
  onLost = (ev?: Event) => {
    this.lostCall(this, ev)
  }
  onAnimationFrame = () => {
    if (!this.gl.isContextLost()) {
      if (this.env.render) {
        this.env.render();
      }
      this.animationFrameRequest = requestAnimationFrame(this.onAnimationFrame)
    }
  }
  getGlObject = (id: int, check: boolean = false) => {
    let obj = this.gVariables[id];
    if (check) {
      console.log([id, obj]);
    }
    return obj
  };
  removeGlObject = (id: int) => {
    let obj = this.gVariables[id];
    delete this.gVariables[id];
    return obj
  };
  glValue = (value: int) => {
    switch (value) {
      case 1: return this.gl.NEAREST;
      case 2: return this.gl.NEAREST_MIPMAP_NEAREST;
      case 3: return this.gl.LINEAR_MIPMAP_NEAREST;
      case 4: return this.gl.NEAREST_MIPMAP_LINEAR;
      case 5: return this.gl.LINEAR_MIPMAP_LINEAR;
      case 6: return this.gl.REPEAT;
      case 7: return this.gl.CLAMP_TO_EDGE;
      case 8: return this.gl.MIRRORED_REPEAT;
      case 0:
      default: return this.gl.LINEAR;
    }
  };
  create = <T>(fn: (gl: WebGL2RenderingContext) => T) => {
    let id = this.gVariableCount;
    this.gVariables[id] = fn(this.gl);
    this.gVariableCount++;
    return id;
  };
  //////////////////////// TEXTURES ///////////////////////////////
  activateTextureAt = (texture: int, location: int, index: int) => {
    this.gl.activeTexture(this.gl.TEXTURE0 + index);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.getGlObject(texture));
    this.gl.uniform1i(this.getGlObject(location), index);
  };
  activeTexture = (index: int) => {
    this.gl.activeTexture(this.gl.TEXTURE0 + index);
  };
  createTexture = () => {
    return this.create(gl => gl.createTexture());
  };
  deleteTexture = (texture: int) => {
    if (this.gKept.has(texture)) {
      this.gToDelete.add(texture);
      return;
    };
    this.env.window().setTimeout(() => {
      let glObject = this.removeGlObject(texture);
      this.gl.deleteTexture(glObject);
    }, 0);
  };
  bindTexture2D = (texture: int) => {
    let glObject = texture != 0 ? this.getGlObject(texture) : null;
    this.gl.bindTexture(this.gl.TEXTURE_2D, glObject);
  };
  setTexture2DMinFilter = (value: int) => {
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.glValue(value));
  };
  setTexture2DMagFilter = (value: int) => {
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.glValue(value));
  };
  setTexture2DWrapS = (value: int) => {
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.glValue(value));
  };
  setTexture2DWrapT = (value: int) => {
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.glValue(value));
  };
  setTexture2DRGBASubImage = (
    level: int,
    x: int,
    y: int,
    width: int,
    height: int,
    pixels: Uint8ClampedArray | null,
  ) => {
    this.gl.texSubImage2D(this.gl.TEXTURE_2D, level, x, y, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
  };
  setTexture2DRGBAImage = (
    level: int,
    width: int,
    height: int,
    pixels: Uint8ClampedArray | null,
  ) => {
    this.gl.texImage2D(this.gl.TEXTURE_2D, level, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
  };
  //////////////////////// SHADERS ///////////////////////////////
  createFragmentShader = () => {
    return this.create(gl => gl.createShader(gl.FRAGMENT_SHADER));
  };
  createVertexShader = () => {
    return this.create(gl => gl.createShader(gl.VERTEX_SHADER));
  };
  shaderSource = (shader: int, source: string) => {
    this.gl.shaderSource(this.getGlObject(shader), source);
  };
  compileShader = (shader: int) => {
    this.gl.compileShader(this.getGlObject(shader));
  };
  isCompiled = (shader: int) => {
    return this.gl.getShaderParameter(this.getGlObject(shader), this.gl.COMPILE_STATUS);
  };
  deleteShader = (shader: int) => {
    this.gl.deleteShader(this.removeGlObject(shader));
  };
  getShaderInfoLog = (shader: int) => {
    return this.gl.getShaderInfoLog(this.getGlObject(shader));
  };
  //////////////////////// PROGRAMS ///////////////////////////////
  createProgram = () => {
    return this.create(gl => gl.createProgram());
  };
  deleteProgram = (program: int) => {
    this.gl.deleteProgram(this.removeGlObject(program));
  };
  attachShader = (program: int, shader: int) => {
    this.gl.attachShader(this.getGlObject(program), this.getGlObject(shader));
  };
  detachShader = (program: int, shader: int) => {
    this.gl.detachShader(this.getGlObject(program), this.getGlObject(shader));
  };
  linkProgram = (program: int) => {
    this.gl.linkProgram(this.getGlObject(program));
  };
  useProgram = (program: int) => {
    this.gl.useProgram(this.getGlObject(program));
  };
  isLinked = (program: int) => {
    return this.gl.getProgramParameter(this.getGlObject(program), this.gl.LINK_STATUS) as boolean;
  };
  getProgramInfoLog = (program: int) => {
    return this.gl.getProgramInfoLog(this.getGlObject(program));
  };
  //////////////////////// BUFFERS ///////////////////////////////
  createBuffer = () => {
    return this.create(gl => gl.createBuffer());
  };
  deleteBuffer = (buffer: int) => {
    this.gl.deleteBuffer(this.removeGlObject(buffer));
  };
  bindArrayBuffer = (buffer: int) => {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.getGlObject(buffer));
  }
  staticDrawData = (data: Float32Array) => {
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
  };
  createVertexArray = () => {
    return this.create(gl => gl.createVertexArray());
  };
  deleteVertexArray = function (array: int) {
    this.gl.deleteVertexArray(this.removeGlObject(array));
  };
  bindVertexArray = (array: int) => {
    this.gl.bindVertexArray(this.getGlObject(array));
  };
  enableVertexAttributeArray = (location: int) => {
    this.gl.enableVertexAttribArray(this.getGlObject(location));
  };
  vertexFloatAttributePointer = (
    location: int,
    size: int,
    normalized: boolean,
    offset: int,
  ) => {
    this.gl.vertexAttribPointer(this.getGlObject(location), size, this.gl.FLOAT, normalized, 0, offset);
  }
  /////////////////////////// UNIFORMS ///////////////////////////
  uniformMatrix4fv = (
    location: int,
    transpose: boolean,
    v1: float,
    v2: float,
    v3: float,
    v4: float,
    v5: float,
    v6: float,
    v7: float,
    v8: float,
    v9: float,
    v10: float,
    v11: float,
    v12: float,
    v13: float,
    v14: float,
    v15: float,
    v16: float,
  ) => {
    let f32s = new Float32Array([
      v1, v2, v3, v4, v5, v6, v7, v8,
      v9, v10, v11, v12, v13, v14, v15, v16,
    ]);
    this.gl.uniformMatrix4fv(this.getGlObject(location), transpose, f32s);
  };
  uniform1i = (location: int, v0: int) => {
    this.gl.uniform1i(this.getGlObject(location), v0);
  };
  uniform1f = (location: int, v0: float) => {
    this.gl.uniform1f(this.getGlObject(location), v0);
  };
  uniform2f = (location: int, v0: float, v1: float) => {
    this.gl.uniform2f(this.getGlObject(location), v0, v1);
  };
  uniform4f = (location: int, v0: float, v1: float, v2: float, v3: float) => {
    this.gl.uniform4f(this.getGlObject(location), v0, v1, v2, v3);
  };
  uniform4fv = (location: int, data: Float32Array) => {
    this.gl.uniform4fv(this.getGlObject(location), data);
  };
  uniform1fv = (location: int, data: Float32Array) => {
    this.gl.uniform1fv(this.getGlObject(location), data);
  };
  /////////////////////////// DRAW ///////////////////////////
  drawTriangleStrip = (first: int, count: int) => {
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, first, count);
  };
  drawTriangles = (first: int, count: int) => {
    this.gl.drawArrays(this.gl.TRIANGLES, first, count);
  };
  /////////////////////////// LOCATIONS ///////////////////////////
  getAttributeLocation = (program: int, index: int) => {
    return this.create(gl => gl.getAttribLocation(this.getGlObject(program), attributes[index]));
  };
  getUniformLocation = (program: int, index: int) => {
    return this.create(gl => gl.getUniformLocation(this.getGlObject(program), uniforms[index]));
  };
  /////////////////////////// FRAME BUFFERS //////////////////////////////
  bindMainFrameBuffer = () => {
    this.onMainBinding();
    if (this.frameBuffer != null) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.frameBuffer = null;
    }
  };
  bindTextureFrameBuffer = () => {
    if (this.textureBuffer == null) {
      this.textureBuffer = this.gl.createFramebuffer();
    }
    if (this.frameBuffer == null) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.textureBuffer);
      this.frameBuffer = this.textureBuffer;
    }
  };
  framebufferTexture2DColor = (texture: int, level: int) => {
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.getGlObject(texture), level);
  };
  deleteFramebuffer = (buffer: int) => {
    this.gl.deleteFramebuffer(this.removeGlObject(buffer));
  };
  //////////////////////// STATE ///////////////////////////////
  viewport = (x: int, y: int, width: int, height: int) => {
    this.gState.viewport = [x, y, width, height];
    this.gl.viewport(x, y, width, height);
  };
  clearColor = (r: int, g: int, b: int, a: int) => {
    this.gState.color = [r, g, b, a];
    this.gl.clearColor(r, g, b, a);
  };
  srcAlphaBlendSrcColor = () => {
    this.gState.blending = this.srcAlphaBlendSrcColor;
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.SRC_COLOR);
  };
  srcAlphaBlendOneMinus = () => {
    this.gState.blending = this.srcAlphaBlendOneMinus;
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }
  oneBlendOneMinus = () => {
    this.gState.blending = this.oneBlendOneMinus;
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
  };
  straitAlphaBlending = () => {
    this.gState.blending = this.straitAlphaBlending;
    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA)
  };
  disableBlend = () => {
    this.gState.blend = false;
    this.gl.disable(this.gl.BLEND);
  };
  enableBlend = () => {
    this.gState.blend = true;
    this.gl.enable(this.gl.BLEND);
  };
  save = () => {
    this.gStates.push(this.gState);
    this.gState = this.gState.copy();
  };
  restore = () => {
    this.gState = this.gStates.pop()!;
    if (this.gState.blend) {
      this.gl.enable(this.gl.BLEND);
    }
    else {
      this.gl.disable(this.gl.BLEND);
    };
    this.gState.blending();
    this.gl.viewport(
      this.gState.viewport[0],
      this.gState.viewport[1],
      this.gState.viewport[2],
      this.gState.viewport[3]);
    this.gl.clearColor(
      this.gState.color[0],
      this.gState.color[1],
      this.gState.color[2],
      this.gState.color[3]);
  };
  clearState = () => {
    this.gState.viewport = [0, 0, this.canvas.width, this.canvas.height];
    this.gState.color = [1, 1, 1, 1];
  }
  //////////////////////// UTILS ///////////////////////////////
  flush = () => this.gl.flush();
  clear = () => {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  };
  copyTexture = (
    toPaste: int,
    srcX: int, srcY: int,
    srcWidth: int, srcHeight: int,
    target: int, dstX: int, dstY: int,
    width: int, height: int,
    reverted: boolean,
  ) => {
    var pixels = this.readPixels(toPaste, srcX, srcY, width, height);
    if (reverted) {
      let src = new Uint32Array(pixels.buffer);
      let buffer = new Uint32Array(width * height);
      for (let line = 0; line < height; line++) {
        let srcIndex = line * width;
        let dstIndex = ((height - 1) - line) * width;
        buffer.set(src.subarray(srcIndex, width), dstIndex);
      }
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.getGlObject(target));
      let reverted = new Uint8ClampedArray(buffer.buffer);
      this.setTexture2DRGBASubImage(0, dstX, dstY, width, height, reverted)
    } else {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.getGlObject(target));
      this.setTexture2DRGBASubImage(0, dstX, dstY, width, height, pixels)
    }
    this.gl.bindTexture(this.gl.FRAMEBUFFER, null);
  };
  readPixels = (texture: int, x: int, y: int, width: int, height: int) => {
    var pixels = new Uint8ClampedArray(width * height * 4);
    // read texture pixels
    // make a framebuffer
    let fb = this.gl.createFramebuffer();
    // make this the current frame buffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);
    // attach the texture to the framebuffer.
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D, this.getGlObject(texture), 0);
    this.gl.readPixels(x, y, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
    // Unbind the framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    this.gl.deleteFramebuffer(fb);
    return pixels;
  }
  keepTexture = (txt: int) => {
    this.gKept.add(txt);
  }

  releaseTexture = (txt: int) => {
    this.gKept.delete(txt);
    if (this.gToDelete.has(txt)) {
      this.gToDelete.delete(txt);
      this.deleteTexture(txt);
    }
  }

  textureFromImage = (image: HTMLImageElement) => {
    let tex = this.createTexture();
    this.bindTexture2D(tex);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return tex;
  }
}