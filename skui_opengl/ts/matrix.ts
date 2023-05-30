
export class Matrix {
  data: Float32Array;

  constructor() {
    this.data = new Float32Array(16);
    this.setAsIdentity();
  }

  /**
   * Initialize an identity projection matrix
   **/
  setAsIdentity = () => {
    this.data[0] = 1;
    this.data[1] = 0;
    this.data[2] = 0;
    this.data[3] = 0;
    this.data[4] = 0;
    this.data[5] = 1;
    this.data[6] = 0;
    this.data[7] = 0;
    this.data[8] = 0;
    this.data[9] = 0;
    this.data[10] = 1;
    this.data[11] = 0;
    this.data[12] = 0;
    this.data[13] = 0;
    this.data[14] = 0;
    this.data[15] = 1;
  }

  /**
   * Initialize a 4-by-4 orthographic projection matrix
   * @param {number} left The x coordinate of the left side of the box.
   * @param {number} right The x coordinate of the right side of the box.
   * @param {number} bottom The y coordinate of the bottom side of the box.
   * @param {number} top The y coordinate of the top side of the box.
   * @param {number} near The negative z coordinate of the near depth of the box.
   * @param {number} far The negative z coordinate of the far depth of the box.
   */
  setAsOrthographic = (left: number, right: number, bottom: number, top: number, near: number, far: number) => {
    this.data[0] = 2 / (right - left);
    this.data[1] = 0;
    this.data[2] = 0;
    this.data[3] = 0;
    this.data[4] = 0;
    this.data[5] = 2 / (top - bottom);
    this.data[6] = 0;
    this.data[7] = 0;
    this.data[8] = 0;
    this.data[9] = 0;
    this.data[10] = 2 / (near - far);
    this.data[11] = 0;
    this.data[12] = (left + right) / (left - right);
    this.data[13] = (bottom + top) / (bottom - top);
    this.data[14] = (near + far) / (near - far);
    this.data[15] = 1;
  }

  /**
   * Translate according parameters.
   * @param {number} tx x translation.
   * @param {number} ty y translation.
   * @param {number} tz z translation.
   */
  translate = (tx: number, ty: number, tz: number) => {
    let x00 = this.data[0];
    let x01 = this.data[1];
    let x02 = this.data[2];
    let x03 = this.data[3];
    //
    let y00 = this.data[4];
    let y01 = this.data[5];
    let y02 = this.data[6];
    let y03 = this.data[7];
    //
    let z00 = this.data[8];
    let z01 = this.data[9];
    let z02 = this.data[10];
    let z03 = this.data[11];
    //
    let c00 = this.data[12];
    let c01 = this.data[13];
    let c02 = this.data[14];
    let c03 = this.data[15];
    this.data[12] = x00 * tx + y00 * ty + z00 * tz + c00;
    this.data[13] = x01 * tx + y01 * ty + z01 * tz + c01;
    this.data[14] = x02 * tx + y02 * ty + z02 * tz + c02;
    this.data[15] = x03 * tx + y03 * ty + z03 * tz + c03;
  }
  /**
   * Multiply according parameters.
   * @param {number} sx x scale.
   * @param {number} sy y scale.
   * @param {number} sz z scale.
   */
  scale = (sx: number, sy: number, sz: number) => {
    this.data[0] = sx * this.data[0];
    this.data[1] = sx * this.data[1];
    this.data[2] = sx * this.data[2];
    this.data[3] = sx * this.data[3];
    //
    this.data[4] = sy * this.data[4];
    this.data[5] = sy * this.data[5];
    this.data[6] = sy * this.data[6];
    this.data[7] = sy * this.data[7];
    //
    this.data[8] = sz * this.data[8];
    this.data[9] = sz * this.data[9];
    this.data[10] = sz * this.data[10];
    this.data[11] = sz * this.data[11];
  }
}