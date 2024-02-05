// prettier-ignore
import type {int, ptr, Links, Utils, ToWasmManager, Environment} from "#std/sk_types.js";
import { Factory } from "#skui_opengl/skui_glcontext.js";

interface Exported {
  SKIP_SKUIGL_performFrame: (
    cid: int,
    width: int,
    height: int,
    ratio: int,
  ) => void;
  SKIP_SKUIGL_setWindowContext: (wId: int, cid: int) => void;
}

interface ToWasm {
  SKIP_GL_activateTextureAt: (
    texture: int,
    location: int,
    index: int,
    ctxId: int,
  ) => void;
  SKIP_GL_activeTexture: (index: int, ctxId: int) => void;
  SKIP_GL_createTexture: (ctxId: int) => int | null;
  SKIP_GL_deleteTexture: (texture: int, ctxId: int) => void;
  SKIP_GL_bindTexture2D: (texture: int, ctxId: int) => void;
  SKIP_GL_setTexture2DMinFilter: (value: number, ctxId: int) => void;
  SKIP_GL_setTexture2DMagFilter: (value: number, ctxId: int) => void;
  SKIP_GL_setTexture2DWrapS: (value: number, ctxId: int) => void;
  SKIP_GL_setTexture2DWrapT: (value: number, ctxId: int) => void;
  //////////////////////// SHADERS ///////////////////////////////
  SKIP_GL_createFragmentShader: (ctxId: int) => int | null;
  SKIP_GL_createVertexShader: (ctxId: int) => int | null;
  SKIP_GL_compileShader: (shader: int, ctxId: int) => void;
  SKIP_GL_isCompiled: (shader: int, ctxId: int) => void;
  SKIP_GL_deleteShader: (shader: int, ctxId: int) => void;
  //////////////////////// PROGRAMS ///////////////////////////////
  SKIP_GL_createProgram: (ctxId: int) => int | null;
  SKIP_GL_deleteProgram: (program: int, ctxId: int) => void;
  SKIP_GL_attachShader: (program: int, shader: int, ctxId: int) => void;
  SKIP_GL_detachShader: (program: int, shader: int, ctxId: int) => void;
  SKIP_GL_linkProgram: (program: int, ctxId: int) => void;
  SKIP_GL_useProgram: (program: int, ctxId: int) => void;
  SKIP_GL_isLinked: (program: int, ctxId: int) => boolean | null;
  //////////////////////// BUFFERS ///////////////////////////////
  SKIP_GL_createBuffer: (ctxId: int) => int | null;
  SKIP_GL_deleteBuffer: (buffer: int, ctxId: int) => void;
  SKIP_GL_bindArrayBuffer: (buffer: int, ctxId: int) => void;
  SKIP_GL_createVertexArray: (ctxId: int) => int | null;
  SKIP_GL_deleteVertexArray: (array: number, ctxId: int) => void;
  SKIP_GL_bindVertexArray: (array: number, ctxId: int) => void;
  SKIP_GL_enableVertexAttributeArray: (location: int, ctxId: int) => void;
  SKIP_GL_vertexFloatAttributePointer: (
    location: int,
    size: int,
    normalized: boolean,
    offset: int,
    ctxId: int,
  ) => void;
  /////////////////////////// UNIFORMS ///////////////////////////
  SKIP_GL_uniformMatrix4fv: (
    location: int,
    transpose: boolean,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v5: number,
    v6: number,
    v7: number,
    v8: number,
    v9: number,
    v10: number,
    v11: number,
    v12: number,
    v13: number,
    v14: number,
    v15: number,
    v16: number,
    ctxId: int,
  ) => void;
  SKIP_GL_uniform1i: (location: int, v0: number, ctxId: int) => void;
  SKIP_GL_uniform1f: (location: int, v0: number, ctxId: int) => void;
  SKIP_GL_uniform2f: (
    location: int,
    v0: number,
    v1: number,
    ctxId: int,
  ) => void;
  SKIP_GL_uniform4f: (
    location: int,
    v0: number,
    v1: number,
    v2: number,
    v3: number,
    ctxId: int,
  ) => void;
  /////////////////////////// DRAW ///////////////////////////
  SKIP_GL_drawTriangleStrip: (first: int, count: int, ctxId: int) => void;
  SKIP_GL_drawTriangles: (first: int, count: int, ctxId: int) => void;
  /////////////////////////// LOCATIONS ///////////////////////////
  SKIP_GL_getAttributeLocation: (
    program: int,
    index: int,
    ctxId: int,
  ) => int | null;
  SKIP_GL_getUniformLocation: (
    program: int,
    index: int,
    ctxId: int,
  ) => int | null;
  /////////////////////////// FRAME BUFFERS //////////////////////////////
  SKIP_GL_bindMainFrameBuffer: (ctxId: int) => void;
  SKIP_GL_bindTextureFrameBuffer: (ctxId: int) => void;
  SKIP_GL_framebufferTexture2DColor: (
    texture: int,
    level: int,
    ctxId: int,
  ) => void;
  SKIP_GL_deleteFramebuffer: (buffer: int, ctxId: int) => void;
  /////////////////////////// STATE //////////////////////////////
  SKIP_GL_viewport: (
    x: int,
    y: int,
    width: int,
    height: int,
    ctxId: int,
  ) => void;
  SKIP_GL_clearColor: (r: number, g: int, b: int, a: int, ctxId: int) => void;
  SKIP_GL_srcAlphaBlendSrcColor: (ctxId: int) => void;
  SKIP_GL_srcAlphaBlendOneMinus: (ctxId: int) => void;
  SKIP_GL_oneBlendOneMinus: (ctxId: int) => void;
  SKIP_GL_straitAlphaBlending: (ctxId: int) => void;
  SKIP_GL_disableBlend: (ctxId: int) => void;
  SKIP_GL_enableBlend: (ctxId: int) => void;
  SKIP_GL_save: (ctxId: int) => void;
  SKIP_GL_restore: (ctxId: int) => void;
  //////////////////////// UTILS ///////////////////////////////
  SKIP_GL_flush: (ctxId: int) => void;
  SKIP_GL_clear: (ctxId: int) => void;
  SKIP_GL_copyTexture: (
    toPaste: int,
    srcX: int,
    srcY: int,
    srcWidth: int,
    srcHeight: int,
    target: int,
    dstX: int,
    dstY: int,
    width: int,
    height: int,
    reverted: boolean,
    ctxId: int,
  ) => void;
  SKIP_GL_uniform4fv: (
    location: int,
    count: int,
    valuesPtr: ptr,
    ctxId: int,
  ) => void;
  SKIP_GL_uniform1fv: (
    location: int,
    count: int,
    valuesPtr: ptr,
    ctxId: int,
  ) => void;
  SKIP_GL_setTexture2DRGBASubImage: (
    level: int,
    x: int,
    y: int,
    width: int,
    height: int,
    dataPtr: ptr,
    ctxId: int,
  ) => void;
  SKIP_GL_setTexture2DRGBAImage: (
    level: int,
    width: int,
    height: int,
    dataPtr: ptr | null | undefined,
    ctxId: int,
  ) => void;
  SKIP_GL_shaderSource: (shader: int, source: ptr, ctxId: int) => void;
  SKIP_GL_getShaderInfoLog: (shader: int, ctxId: int) => ptr | null;
  SKIP_GL_staticDrawData: (dataPtr: ptr, len: int, ctxId: int) => void;
  SKIP_GL_getProgramInfoLog: (program: int, ctxId: int) => ptr | null;
}

interface Webgl extends Environment {
  start: (wId: int) => Promise<int>;
  imageAsTexture: (ctx: int, image: HTMLImageElement) => int;
}

export class LinksImpl implements Links {
  private factory: Factory;
  private env: Environment;

  constructor(factory: Factory, env: Environment) {
    this.factory = factory;
    this.env = env;
  }

  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.factory.utils = utils;
    this.factory.render = exported.SKIP_SKUIGL_performFrame;
    this.factory.setGlContext = exported.SKIP_SKUIGL_setWindowContext;
    let env = this.env as Webgl;
    env.start = (wId: int) =>
      this.factory.createContext(wId).then((ctx) => ctx.id);
    env.imageAsTexture = this.factory.imageAsTexture;
  };
}

class Manager implements ToWasmManager {
  private factory: Factory;
  private env: Environment;

  constructor(factory: Factory, env: Environment) {
    this.factory = factory;
    this.env = env;
  }

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.factory, this.env);
    //////////////////////// TEXTURES ///////////////////////////////
    toWasm.SKIP_GL_activateTextureAt = (
      texture: int,
      location: int,
      index: int,
      ctxId: int,
    ) => this.factory.activateTextureAt(texture, location, index, ctxId);
    toWasm.SKIP_GL_activeTexture = (index: int, ctxId: int) =>
      this.factory.activeTexture(index, ctxId);
    toWasm.SKIP_GL_createTexture = (ctxId: int) =>
      this.factory.createTexture(ctxId);
    toWasm.SKIP_GL_deleteTexture = (texture: int, ctxId: int) =>
      this.factory.deleteTexture(texture, ctxId);
    toWasm.SKIP_GL_bindTexture2D = (texture: int, ctxId: int) =>
      this.factory.bindTexture2D(texture, ctxId);
    toWasm.SKIP_GL_setTexture2DMinFilter = (value: number, ctxId: int) =>
      this.factory.setTexture2DMinFilter(value, ctxId);
    toWasm.SKIP_GL_setTexture2DMagFilter = (value: number, ctxId: int) =>
      this.factory.setTexture2DMagFilter(value, ctxId);
    toWasm.SKIP_GL_setTexture2DWrapS = (value: number, ctxId: int) =>
      this.factory.setTexture2DWrapS(value, ctxId);
    toWasm.SKIP_GL_setTexture2DWrapT = (value: number, ctxId: int) =>
      this.factory.setTexture2DWrapT(value, ctxId);
    //////////////////////// SHADERS ///////////////////////////////
    toWasm.SKIP_GL_createFragmentShader = (ctxId: int) =>
      this.factory.createFragmentShader(ctxId);
    toWasm.SKIP_GL_createVertexShader = (ctxId: int) =>
      this.factory.createVertexShader(ctxId);
    toWasm.SKIP_GL_compileShader = (shader: int, ctxId: int) =>
      this.factory.compileShader(shader, ctxId);
    toWasm.SKIP_GL_isCompiled = (shader: int, ctxId: int) =>
      this.factory.isCompiled(shader, ctxId);
    toWasm.SKIP_GL_deleteShader = (shader: int, ctxId: int) =>
      this.factory.deleteShader(shader, ctxId);
    //////////////////////// PROGRAMS ///////////////////////////////
    toWasm.SKIP_GL_createProgram = (ctxId: int) =>
      this.factory.createProgram(ctxId);
    toWasm.SKIP_GL_deleteProgram = (program: int, ctxId: int) =>
      this.factory.deleteProgram(program, ctxId);
    toWasm.SKIP_GL_attachShader = (program: int, shader: int, ctxId: int) =>
      this.factory.attachShader(program, shader, ctxId);
    toWasm.SKIP_GL_detachShader = (program: int, shader: int, ctxId: int) =>
      this.factory.detachShader(program, shader, ctxId);
    toWasm.SKIP_GL_linkProgram = (program: int, ctxId: int) =>
      this.factory.linkProgram(program, ctxId);
    toWasm.SKIP_GL_useProgram = (program: int, ctxId: int) =>
      this.factory.useProgram(program, ctxId);
    toWasm.SKIP_GL_isLinked = (program: int, ctxId: int) =>
      this.factory.isLinked(program, ctxId);
    //////////////////////// BUFFERS ///////////////////////////////
    toWasm.SKIP_GL_createBuffer = (ctxId: int) =>
      this.factory.createBuffer(ctxId);
    toWasm.SKIP_GL_deleteBuffer = (buffer: int, ctxId: int) =>
      this.factory.deleteBuffer(buffer, ctxId);
    toWasm.SKIP_GL_bindArrayBuffer = (buffer: int, ctxId: int) =>
      this.factory.bindArrayBuffer(buffer, ctxId);
    toWasm.SKIP_GL_createVertexArray = (ctxId: int) =>
      this.factory.createVertexArray(ctxId);
    toWasm.SKIP_GL_deleteVertexArray = (array: number, ctxId: int) =>
      this.factory.deleteVertexArray(array, ctxId);
    toWasm.SKIP_GL_bindVertexArray = (array: number, ctxId: int) =>
      this.factory.bindVertexArray(array, ctxId);
    toWasm.SKIP_GL_enableVertexAttributeArray = (location: int, ctxId: int) =>
      this.factory.enableVertexAttributeArray(location, ctxId);
    toWasm.SKIP_GL_vertexFloatAttributePointer = (
      location: int,
      size: int,
      normalized: boolean,
      offset: int,
      ctxId: int,
    ) =>
      this.factory.vertexFloatAttributePointer(
        location,
        size,
        normalized,
        offset,
        ctxId,
      );
    /////////////////////////// UNIFORMS ///////////////////////////
    toWasm.SKIP_GL_uniformMatrix4fv = (
      location: int,
      transpose: boolean,
      v1: number,
      v2: number,
      v3: number,
      v4: number,
      v5: number,
      v6: number,
      v7: number,
      v8: number,
      v9: number,
      v10: number,
      v11: number,
      v12: number,
      v13: number,
      v14: number,
      v15: number,
      v16: number,
      ctxId: int,
    ) =>
      this.factory.uniformMatrix4fv(
        location,
        transpose,
        v1,
        v2,
        v3,
        v4,
        v5,
        v6,
        v7,
        v8,
        v9,
        v10,
        v11,
        v12,
        v13,
        v14,
        v15,
        v16,
        ctxId,
      );
    toWasm.SKIP_GL_uniform1i = (location: int, v0: int, ctxId: int) =>
      this.factory.uniform1i(location, v0, ctxId);
    toWasm.SKIP_GL_uniform1f = (location: int, v0: number, ctxId: int) =>
      this.factory.uniform1f(location, v0, ctxId);
    toWasm.SKIP_GL_uniform2f = (
      location: int,
      v0: number,
      v1: number,
      ctxId: int,
    ) => this.factory.uniform2f(location, v0, v1, ctxId);
    toWasm.SKIP_GL_uniform4f = (
      location: int,
      v0: number,
      v1: number,
      v2: number,
      v3: number,
      ctxId: int,
    ) => this.factory.uniform4f(location, v0, v1, v2, v3, ctxId);
    /////////////////////////// DRAW ///////////////////////////
    toWasm.SKIP_GL_drawTriangleStrip = (first: int, count: int, ctxId: int) =>
      this.factory.drawTriangleStrip(first, count, ctxId);
    toWasm.SKIP_GL_drawTriangles = (first: int, count: int, ctxId: int) =>
      this.factory.drawTriangles(first, count, ctxId);
    /////////////////////////// LOCATIONS ///////////////////////////
    toWasm.SKIP_GL_getAttributeLocation = (
      program: int,
      index: int,
      ctxId: int,
    ) => this.factory.getAttributeLocation(program, index, ctxId);
    toWasm.SKIP_GL_getUniformLocation = (
      program: int,
      index: int,
      ctxId: int,
    ) => this.factory.getUniformLocation(program, index, ctxId);
    /////////////////////////// FRAME BUFFERS //////////////////////////////
    toWasm.SKIP_GL_bindMainFrameBuffer = (ctxId: int) =>
      this.factory.bindMainFrameBuffer(ctxId);
    toWasm.SKIP_GL_bindTextureFrameBuffer = (ctxId: int) =>
      this.factory.bindTextureFrameBuffer(ctxId);
    toWasm.SKIP_GL_framebufferTexture2DColor = (
      texture: int,
      level: int,
      ctxId: int,
    ) => this.factory.framebufferTexture2DColor(texture, level, ctxId);
    toWasm.SKIP_GL_deleteFramebuffer = (buffer: int, ctxId: int) =>
      this.factory.deleteFramebuffer(buffer, ctxId);
    /////////////////////////// STATE //////////////////////////////
    toWasm.SKIP_GL_viewport = (
      x: int,
      y: int,
      width: int,
      height: int,
      ctxId: int,
    ) => this.factory.viewport(x, y, width, height, ctxId);
    toWasm.SKIP_GL_clearColor = (
      r: number,
      g: int,
      b: int,
      a: int,
      ctxId: int,
    ) => this.factory.clearColor(r, g, b, a, ctxId);
    toWasm.SKIP_GL_srcAlphaBlendSrcColor = (ctxId: int) =>
      this.factory.srcAlphaBlendSrcColor(ctxId);
    toWasm.SKIP_GL_srcAlphaBlendOneMinus = (ctxId: int) =>
      this.factory.srcAlphaBlendOneMinus(ctxId);
    toWasm.SKIP_GL_oneBlendOneMinus = (ctxId: int) =>
      this.factory.oneBlendOneMinus(ctxId);
    toWasm.SKIP_GL_straitAlphaBlending = (ctxId: int) =>
      this.factory.straitAlphaBlending(ctxId);
    toWasm.SKIP_GL_disableBlend = (ctxId: int) =>
      this.factory.disableBlend(ctxId);
    toWasm.SKIP_GL_enableBlend = (ctxId: int) =>
      this.factory.enableBlend(ctxId);
    toWasm.SKIP_GL_save = (ctxId: int) => this.factory.save(ctxId);
    toWasm.SKIP_GL_restore = (ctxId: int) => this.factory.restore(ctxId);
    //////////////////////// UTILS ///////////////////////////////
    toWasm.SKIP_GL_flush = (ctxId: int) => this.factory.flush(ctxId);
    toWasm.SKIP_GL_clear = (ctxId: int) => this.factory.clear(ctxId);
    toWasm.SKIP_GL_copyTexture = (
      toPaste: int,
      srcX: int,
      srcY: int,
      srcWidth: int,
      srcHeight: int,
      target: int,
      dstX: int,
      dstY: int,
      width: int,
      height: int,
      reverted: boolean,
      ctxId: int,
    ) =>
      this.factory.copyTexture(
        toPaste,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        target,
        dstX,
        dstY,
        width,
        height,
        reverted,
        ctxId,
      );
    toWasm.SKIP_GL_uniform4fv = (
      location: int,
      count: int,
      valuesPtr: ptr,
      ctxId: int,
    ) => this.factory.uniform4fv(location, count, valuesPtr, ctxId);
    toWasm.SKIP_GL_uniform1fv = (
      location: int,
      count: int,
      valuesPtr: ptr,
      ctxId: int,
    ) => this.factory.uniform1fv(location, count, valuesPtr, ctxId);
    toWasm.SKIP_GL_setTexture2DRGBASubImage = (
      level: int,
      x: int,
      y: int,
      width: int,
      height: int,
      dataPtr: ptr,
      ctxId: int,
    ) =>
      this.factory.setTexture2DRGBASubImage(
        level,
        x,
        y,
        width,
        height,
        dataPtr,
        ctxId,
      );
    toWasm.SKIP_GL_setTexture2DRGBAImage = (
      level: int,
      width: int,
      height: int,
      dataPtr: ptr | null | undefined,
      ctxId: int,
    ) =>
      this.factory.setTexture2DRGBAImage(level, width, height, dataPtr, ctxId);
    toWasm.SKIP_GL_shaderSource = (shader: int, source: int, ctxId: int) =>
      this.factory.shaderSource(shader, source, ctxId);
    toWasm.SKIP_GL_getShaderInfoLog = (shader: int, ctxId: int) =>
      this.factory.getShaderInfoLog(shader, ctxId);
    toWasm.SKIP_GL_staticDrawData = (dataPtr: ptr, len: int, ctxId: int) =>
      this.factory.staticDrawData(dataPtr, len, ctxId);
    toWasm.SKIP_GL_getProgramInfoLog = (program: int, ctxId: int) =>
      this.factory.getProgramInfoLog(program, ctxId);
    return links;
  };
}

class ToConsole implements ToWasmManager {
  objid = 0;
  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    //////////////////////// TEXTURES ///////////////////////////////
    toWasm.SKIP_GL_activateTextureAt = (
      texture: int,
      location: int,
      index: int,
      ctxId: int,
    ) =>
      console.log([
        "SKIP_GL_activateTextureAt texture",
        location,
        index,
        ctxId,
      ]);
    toWasm.SKIP_GL_activeTexture = (index: int, ctxId: int) =>
      console.log(["activeTexture", index, ctxId]);
    toWasm.SKIP_GL_createTexture = (ctxId: int) => {
      console.log(["createTexture", ctxId]);
      return ++this.objid;
    };
    toWasm.SKIP_GL_deleteTexture = (texture: int, ctxId: int) =>
      console.log(["deleteTexture", texture, ctxId]);
    toWasm.SKIP_GL_bindTexture2D = (texture: int, ctxId: int) =>
      console.log(["bindTexture2D", texture, ctxId]);
    toWasm.SKIP_GL_setTexture2DMinFilter = (value: number, ctxId: int) =>
      console.log(["setTexture2DMinFilter", value, ctxId]);
    toWasm.SKIP_GL_setTexture2DMagFilter = (value: number, ctxId: int) =>
      console.log(["setTexture2DMagFilter", value, ctxId]);
    toWasm.SKIP_GL_setTexture2DWrapS = (value: number, ctxId: int) =>
      console.log(["setTexture2DWrapS", value, ctxId]);
    toWasm.SKIP_GL_setTexture2DWrapT = (value: number, ctxId: int) =>
      console.log(["setTexture2DWrapT", value, ctxId]);
    //////////////////////// SHADERS ///////////////////////////////
    toWasm.SKIP_GL_createFragmentShader = (ctxId: int) => {
      console.log(["createFragmentShader", ctxId]);
      return ++this.objid;
    };
    toWasm.SKIP_GL_createVertexShader = (ctxId: int) => {
      console.log(["createVertexShader", ctxId]);
      return ++this.objid;
    };
    toWasm.SKIP_GL_compileShader = (shader: int, ctxId: int) =>
      console.log(["compileShader", shader, ctxId]);
    toWasm.SKIP_GL_isCompiled = (shader: int, ctxId: int) =>
      console.log(["isCompiled", shader, ctxId]);
    toWasm.SKIP_GL_deleteShader = (shader: int, ctxId: int) =>
      console.log(["deleteShader", shader, ctxId]);
    //////////////////////// PROGRAMS ///////////////////////////////
    toWasm.SKIP_GL_createProgram = (ctxId: int) => {
      console.log(["createProgram", ctxId]);
      return ++this.objid;
    };
    toWasm.SKIP_GL_deleteProgram = (program: int, ctxId: int) =>
      console.log(["deleteProgram", program, ctxId]);
    toWasm.SKIP_GL_attachShader = (program: int, shader: int, ctxId: int) =>
      console.log(["attachShader", program, shader, ctxId]);
    toWasm.SKIP_GL_detachShader = (program: int, shader: int, ctxId: int) =>
      console.log(["detachShader", program, shader, ctxId]);
    toWasm.SKIP_GL_linkProgram = (program: int, ctxId: int) =>
      console.log(["linkProgram", program, ctxId]);
    toWasm.SKIP_GL_useProgram = (program: int, ctxId: int) =>
      console.log(["useProgram", program, ctxId]);
    toWasm.SKIP_GL_isLinked = (program: int, ctxId: int) => {
      console.log(["isLinked", program, ctxId]);
      return true;
    };
    //////////////////////// BUFFERS ///////////////////////////////
    toWasm.SKIP_GL_createBuffer = (ctxId: int) => {
      console.log(["createBuffer", ctxId]);
      return ++this.objid;
    };
    toWasm.SKIP_GL_deleteBuffer = (buffer: int, ctxId: int) =>
      console.log(["deleteBuffer", buffer, ctxId]);
    toWasm.SKIP_GL_bindArrayBuffer = (buffer: int, ctxId: int) =>
      console.log(["bindArrayBuffer", buffer, ctxId]);
    toWasm.SKIP_GL_createVertexArray = (ctxId: int) => {
      console.log(["createVertexArray", ctxId]);
      return ++this.objid;
    };
    toWasm.SKIP_GL_deleteVertexArray = (array: number, ctxId: int) =>
      console.log(["deleteVertexArray", array, ctxId]);
    toWasm.SKIP_GL_bindVertexArray = (array: number, ctxId: int) =>
      console.log(["bindVertexArray", array, ctxId]);
    toWasm.SKIP_GL_enableVertexAttributeArray = (location: int, ctxId: int) =>
      console.log(["enableVertexAttributeArray", location, ctxId]);
    toWasm.SKIP_GL_vertexFloatAttributePointer = (
      location: int,
      size: int,
      normalized: boolean,
      offset: int,
      ctxId: int,
    ) =>
      console.log([
        "vertexFloatAttributePointer",
        location,
        size,
        normalized,
        offset,
        ctxId,
      ]);
    /////////////////////////// UNIFORMS ///////////////////////////
    toWasm.SKIP_GL_uniformMatrix4fv = (
      location: int,
      transpose: boolean,
      v1: number,
      v2: number,
      v3: number,
      v4: number,
      v5: number,
      v6: number,
      v7: number,
      v8: number,
      v9: number,
      v10: number,
      v11: number,
      v12: number,
      v13: number,
      v14: number,
      v15: number,
      v16: number,
      ctxId: int,
    ) =>
      console.log([
        "uniformMatrix4fv",
        location,
        transpose,
        v1,
        v2,
        v3,
        v4,
        v5,
        v6,
        v7,
        v8,
        v9,
        v10,
        v11,
        v12,
        v13,
        v14,
        v15,
        v16,
        ctxId,
      ]);
    toWasm.SKIP_GL_uniform1i = (location: int, v0: int, ctxId: int) =>
      console.log(["uniform1i", location, v0, ctxId]);
    toWasm.SKIP_GL_uniform1f = (location: int, v0: number, ctxId: int) =>
      console.log(["uniform1f", location, v0, ctxId]);
    toWasm.SKIP_GL_uniform2f = (
      location: int,
      v0: number,
      v1: number,
      ctxId: int,
    ) => console.log(["uniform2f", location, v0, v1, ctxId]);
    toWasm.SKIP_GL_uniform4f = (
      location: int,
      v0: number,
      v1: number,
      v2: number,
      v3: number,
      ctxId: int,
    ) => console.log(["uniform4f", location, v0, v1, v2, v3, ctxId]);
    /////////////////////////// DRAW ///////////////////////////
    toWasm.SKIP_GL_drawTriangleStrip = (first: int, count: int, ctxId: int) =>
      console.log(["drawTriangleStrip", first, count, ctxId]);
    toWasm.SKIP_GL_drawTriangles = (first: int, count: int, ctxId: int) =>
      console.log(["drawTriangles", first, count, ctxId]);
    /////////////////////////// LOCATIONS ///////////////////////////
    toWasm.SKIP_GL_getAttributeLocation = (
      program: int,
      index: int,
      ctxId: int,
    ) => {
      console.log(["getAttributeLocation", program, index, ctxId]);
      return index;
    };
    toWasm.SKIP_GL_getUniformLocation = (
      program: int,
      index: int,
      ctxId: int,
    ) => {
      console.log(["getUniformLocation", program, index, ctxId]);
      return index;
    };
    /////////////////////////// FRAME BUFFERS //////////////////////////////
    toWasm.SKIP_GL_bindMainFrameBuffer = (ctxId: int) =>
      console.log(["bindMainFrameBuffer", ctxId]);
    toWasm.SKIP_GL_bindTextureFrameBuffer = (ctxId: int) =>
      console.log(["bindTextureFrameBuffer", ctxId]);
    toWasm.SKIP_GL_framebufferTexture2DColor = (
      texture: int,
      level: int,
      ctxId: int,
    ) => console.log(["framebufferTexture2DColor", texture, level, ctxId]);
    toWasm.SKIP_GL_deleteFramebuffer = (buffer: int, ctxId: int) =>
      console.log(["deleteFramebuffer", buffer, ctxId]);
    /////////////////////////// STATE //////////////////////////////
    toWasm.SKIP_GL_viewport = (
      x: int,
      y: int,
      width: int,
      height: int,
      ctxId: int,
    ) => console.log(["viewport", x, y, width, height, ctxId]);
    toWasm.SKIP_GL_clearColor = (
      r: number,
      g: int,
      b: int,
      a: int,
      ctxId: int,
    ) => console.log(["clearColor", r, g, b, a, ctxId]);
    toWasm.SKIP_GL_srcAlphaBlendSrcColor = (ctxId: int) =>
      console.log(["srcAlphaBlendSrcColor", ctxId]);
    toWasm.SKIP_GL_srcAlphaBlendOneMinus = (ctxId: int) =>
      console.log(["srcAlphaBlendOneMinus", ctxId]);
    toWasm.SKIP_GL_oneBlendOneMinus = (ctxId: int) =>
      console.log(["oneBlendOneMinus", ctxId]);
    toWasm.SKIP_GL_straitAlphaBlending = (ctxId: int) =>
      console.log(["straitAlphaBlending", ctxId]);
    toWasm.SKIP_GL_disableBlend = (ctxId: int) =>
      console.log(["disableBlend", ctxId]);
    toWasm.SKIP_GL_enableBlend = (ctxId: int) =>
      console.log(["enableBlend", ctxId]);
    toWasm.SKIP_GL_save = (ctxId: int) => console.log(["save", ctxId]);
    toWasm.SKIP_GL_restore = (ctxId: int) => console.log(["restore", ctxId]);
    //////////////////////// UTILS ///////////////////////////////
    toWasm.SKIP_GL_flush = (ctxId: int) => console.log(["flush", ctxId]);
    toWasm.SKIP_GL_clear = (ctxId: int) => console.log(["clear", ctxId]);
    toWasm.SKIP_GL_copyTexture = (
      toPaste: int,
      srcX: int,
      srcY: int,
      srcWidth: int,
      srcHeight: int,
      target: int,
      dstX: int,
      dstY: int,
      width: int,
      height: int,
      reverted: boolean,
      ctxId: int,
    ) =>
      console.log([
        "copyTexture",
        toPaste,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        target,
        dstX,
        dstY,
        width,
        height,
        reverted,
        ctxId,
      ]);
    toWasm.SKIP_GL_uniform4fv = (
      location: int,
      count: int,
      valuesPtr: ptr,
      ctxId: int,
    ) => console.log(["uniform4fv", location, count, valuesPtr, ctxId]);
    toWasm.SKIP_GL_uniform1fv = (
      location: int,
      count: int,
      valuesPtr: ptr,
      ctxId: int,
    ) => console.log(["uniform1fv", location, count, valuesPtr, ctxId]);
    toWasm.SKIP_GL_setTexture2DRGBASubImage = (
      level: int,
      x: int,
      y: int,
      width: int,
      height: int,
      dataPtr: ptr,
      ctxId: int,
    ) =>
      console.log([
        "setTexture2DRGBASubImage",
        level,
        x,
        y,
        width,
        height,
        dataPtr,
        ctxId,
      ]);
    toWasm.SKIP_GL_setTexture2DRGBAImage = (
      level: int,
      width: int,
      height: int,
      dataPtr: ptr | null | undefined,
      ctxId: int,
    ) =>
      console.log([
        "setTexture2DRGBAImage",
        level,
        width,
        height,
        dataPtr,
        ctxId,
      ]);
    toWasm.SKIP_GL_shaderSource = (shader: int, source: int, ctxId: int) =>
      console.log(["shaderSource", shader, source, ctxId]);
    toWasm.SKIP_GL_staticDrawData = (dataPtr: ptr, len: int, ctxId: int) =>
      console.log(["staticDrawData", dataPtr, len, ctxId]);
    toWasm.SKIP_GL_getShaderInfoLog = (shader: int, ctxId: int) => {
      console.log(["getShaderInfoLog", shader, ctxId]);
      return null;
    };
    toWasm.SKIP_GL_getProgramInfoLog = (program: int, ctxId: int) => {
      console.log(["getProgramInfoLog", program, ctxId]);
      return null;
    };
    return null;
  };
}

/** @sk loader */
export function init(env?: Environment) {
  if (env) {
    return Factory.init(env).then((factory) => new Manager(factory, env));
  } else {
    return Promise.resolve(new ToConsole());
  }
}
