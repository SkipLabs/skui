import { ptr, Opt, Utils} from "#std/sk_types";

interface Exports {
  SKIP_I18N_text: (txtPtr: ptr, optCat: Opt<ptr>) => ptr;
  SKIP_I18N_raw: (txtPtr: ptr) => ptr;
  SKIP_I18N_format: (formatPtr: ptr, parameters: ptr) => ptr;
  SKIP_I18N_textVector: () => ptr;
  SKIP_I18N_pushText: (vector: ptr, txtPtr: ptr) => void;
}


enum I18N {
  RAW,
  LOCALE,
  FORMAT
}

export interface Text {
  toJSON: () => object;
}

export class Raw implements Text {
  text: string;

  constructor(text: string, category?: string) {
    this.text = text;
  }

  toJSON: () => object = () => {
    return {
      type: "text",
      fields: {
        type: I18N.RAW,
        value: this.text,
      }
    }
  };
}

export class Locale implements Text {
  text: string;
  category: Opt<string>;

  constructor(text: string, category?: string) {
    this.text = text;
    this.category = category ? category : null;
  }

  toJSON: () => object = () => {
    return {
      type: "text",
      fields: {
        type: I18N.LOCALE,
        value: this.text,
        category: this.category,
      }
    }
  };
}

export const l = (text: string, category?: string) => {
  return new Locale(text, category)
}

export const f = (format: Text | string, parameters: Array<Text | string>) => {
  return new Format(format, parameters)
}

export const check : (value: Text | string) => Text = (value: Text | string) => {
  if (value instanceof Text) {
    return value as Text
  } else {
    return new Raw(value as string)
  }
}

export class Format implements Text {
  format: Text | string;
  parameters: Array<Text | string>;

  constructor(format: Text | string, parameters: Array<Text | string>) {
    this.format = format;
    this.parameters = parameters;
  }

  toJSON: () => object = () => {
    return {
      type: "text",
      fields: {
        type: I18N.FORMAT,
        pattern: check(this.format),
        parameters: this.parameters.map(check)
      }
    }
  };
}

export class SkuiUtils {
  utils: Utils;
  exports: Exports;

  constructor(utils: Utils, exports: any) {
    this.utils = utils;
    this.exports = exports as Exports;
  }


  text = (strTxt: string, strCat: Opt<string>) => {
    const skText = this.utils.exportString(strTxt);
    const skCategory = strCat ? this.utils.exportString(strCat) : null;
    return this.exports.SKIP_I18N_text(skText, skCategory);
  }
  raw = (strTxt: string) => {
    const skText = this.utils.exportString(strTxt);
    return this.exports.SKIP_I18N_raw(skText);
  }
  format = (format: ptr, params: Array<ptr>) => {
    const vector = this.exports.SKIP_I18N_textVector();
    params.forEach(ptr => this.exports.SKIP_I18N_pushText(vector, ptr));
    return this.exports.SKIP_I18N_format(format, vector);
  }
  exportLocale = (text: string | Text) => {
    const verified = check(text);
    if (verified instanceof Raw) {
      return this.raw(verified.text);
    } else if (verified instanceof Locale) {
      return this.text(verified.text, verified.category);
    } else {
      const f = verified as Format;
      return this.format(
        this.exportLocale(f.format),
        f.parameters.map(this.exportLocale)
      );
    }
  }
}