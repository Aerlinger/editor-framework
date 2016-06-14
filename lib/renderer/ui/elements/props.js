'use strict';

let Props = {};
module.exports = Props;

// ==========================
// internal
// ==========================

const Chroma = require('chroma-js');
const PropElement = require('./prop');

function parseString (txt) { return txt; }
function parseBoolean (txt) {
  if ( txt === 'false' ) {
    return false;
  }
  return txt !== null;
}
function parseColor (txt) {
  return Chroma(txt).rgba();
}
function parseArray (txt) {
  return JSON.parse(txt);
}

// ==========================
// export
// ==========================

// string
Props.string = {
  value: parseString,

  attrs: {
    multiline: parseBoolean,
  },

  template ( attrs ) {
    let tmpl;
    if ( attrs.multiline ) {
      tmpl = `
        <ui-text-area class="flex-1" resize-v></ui-text-area>
      `;
    } else {
      tmpl = `
        <ui-input class="flex-1"></ui-input>
      `;
    }
    return tmpl;
  },

  ready () {
    if ( this.attrs.multiline ) {
      this.autoHeight = true;
    }
    this._input = this.children[0];
    this._input.value = this.value;

    this.installStandardEvents(this._input);
  },

  inputValue () {
    return this._input.value;
  },

  attrsChanged ( newAttrs, oldAttrs ) {
    if ( newAttrs.multiline !== oldAttrs.multiline ) {
      this.regen();
      return;
    }
  },

  valueChanged ( newValue ) {
    this._input.value = newValue;
  },
};

// number
Props.number = {
  value: parseFloat,

  attrs: {
    min: parseFloat,
    max: parseFloat,
    step: parseFloat,
    precision: parseInt,
  },

  template ( attrs ) {
    let tmpl;
    if ( attrs.min !== undefined && attrs.max !== undefined ) {
      tmpl = `
        <ui-slider class="flex-1"></ui-slider>
      `;
    } else {
      tmpl = `
        <ui-num-input class="flex-1"></ui-num-input>
      `;
    }
    return tmpl;
  },

  ready () {
    this.slidable = true;
    this._input = this.children[0];

    this._input.min = this.attrs.min;
    this._input.max = this.attrs.max;
    this._input.step = this.attrs.step;
    this._input.precision = this.attrs.precision;

    this._input.value = this.value;

    this.installStandardEvents(this._input);
    this.installSlideEvents(
      this,
      dx => {
        this._input.value = this._input.value + dx;
      },
      null,
      () => {
        this._input.value = this._value;
      }
    );
  },

  inputValue () {
    return this._input.value;
  },

  attrsChanged ( newAttrs, oldAttrs ) {
    let useSliderNew = false;
    let useSliderOld = false;

    if ( newAttrs.min !== undefined && newAttrs.max !== undefined ) {
      useSliderNew = true;
    }

    if ( oldAttrs.min !== undefined && oldAttrs.max !== undefined ) {
      useSliderOld = true;
    }

    if ( useSliderNew !== useSliderOld ) {
      this.regen();
      return;
    }

    this._input.min = newAttrs.min;
    this._input.max = newAttrs.max;
    this._input.step = newAttrs.step;
    this._input.precision = newAttrs.precision;
  },

  valueChanged ( newValue ) {
    this._input.value = newValue;
  },
};

// boolean
Props.boolean = {
  value: txt => {
    if ( txt === 'false' || txt === '0' ) {
      return false;
    }
    if ( txt === 'true' ) {
      return true;
    }
    return txt !== null;
  },

  template: `
    <ui-checkbox class="flex-1"></ui-checkbox>
  `,

  ready () {
    this._input = this.children[0];
    this._input.value = this.value;

    this.installStandardEvents(this._input);
  },

  inputValue () {
    return this._input.value;
  },

  valueChanged ( newValue ) {
    this._input.value = newValue;
  },
};

// object
Props.object = {
  value: txt => {
    return JSON.parse(txt);
  },

  template: `
    <div class="child"></div>
  `,

  ready () {
    this.foldable = true;
    this._childWrapper = this.querySelector('.child');

    let obj = this.value;
    for ( let name in obj ) {
      let childVal = obj[name];
      let childProp = new PropElement( name, childVal, null, null,  this.indent+1 );
      this._childWrapper.appendChild(childProp);
    }
  },

  valueChanged () {
    // TODO: diff newValue, oldValue
    this.regen();
  },

  addProp (el) {
    this._childWrapper.appendChild(el);
  },
};

// array
Props.array = {
  value: txt => {
    return JSON.parse(txt);
  },

  template: `
    <div class="child"></div>
  `,

  ready () {
    this.foldable = true;
    this._childWrapper = this.querySelector('.child');

    let obj = this.value;
    for ( let name in obj ) {
      let childVal = obj[name];
      let childProp = new PropElement( name, childVal, null, null,  this.indent+1 );
      this._childWrapper.appendChild(childProp);
    }
  },

  valueChanged () {
    // TODO: diff newValue, oldValue
    this.regen();
  },
};

// enum
Props.enum = {
  value: parseInt,

  template: `
    <ui-select class="flex-1"></ui-select>
  `,

  ready () {
    this._input = this.children[0];
    this._input.value = this.value;

    this.installStandardEvents(this._input);
  },

  inputValue () {
    return this._input.value;
  },

  valueChanged (newValue) {
    this._input.value = newValue;
  },

  addItem ( value, text ) {
    this._input.addItem( value, text );
  },
};

// color
Props.color = {
  value: parseColor,

  template: `
    <ui-color class="flex-1"></ui-color>
  `,

  ready () {
    this._input = this.children[0];
    this._input.value = this.value;

    this.installStandardEvents(this._input);
  },

  inputValue () {
    return this._input.value;
  },

  valueChanged (newValue) {
    this._input.value = newValue;
  },
};

// vec2
Props.vec2 = {
  value: parseArray,

  template: `
    <ui-prop name="X" id="x-comp" slidable class="fixed-label red flex-1">
      <ui-num-input class="flex-1"></ui-num-input>
    </ui-prop>
    <ui-prop name="Y" id="x-comp" slidable class="fixed-label green flex-1">
      <ui-num-input id="y-comp" class="flex-1"></ui-num-input>
    </ui-prop>
  `,

  ready () {
    // x-comp
    this._propX = this.querySelector('#x-comp');
    this._inputX = this._propX.children[0];
    this._inputX.value = this.value[0];

    this.installStandardEvents(this._inputX);
    this.installSlideEvents(
      this._propX,
      dx => {
        this._inputX.value = this._inputX.value + dx;
      },
      null,
      () => {
        this._inputX.value = this._value[0];
      }
    );

    // y-comp
    this._propY = this.querySelector('#y-comp');
    this._inputY = this._propX.children[0];
    this._inputY.value = this.value[1];

    this.installStandardEvents(this._inputY);
    this.installSlideEvents(
      this._propY,
      dx => {
        this._inputY.value = this._inputY.value + dx;
      },
      null,
      () => {
        this._inputY.value = this._value[1];
      }
    );
  },

  inputValue () {
    return [this._inputX.value, this._inputY.value];
  },

  valueChanged (newValue) {
    this._inputX.value = newValue[0];
    this._inputY.value = newValue[1];
  },
};

// vec3
Props.vec3 = {
  value: parseArray,

  template: `
    <ui-prop name="X" id="x-comp" slidable class="fixed-label red flex-1">
      <ui-num-input class="flex-1"></ui-num-input>
    </ui-prop>
    <ui-prop name="Y" id="y-comp" slidable class="fixed-label green flex-1">
      <ui-num-input class="flex-1"></ui-num-input>
    </ui-prop>
    <ui-prop name="Z" id="z-comp" slidable class="fixed-label blue flex-1">
      <ui-num-input class="flex-1"></ui-num-input>
    </ui-prop>
  `,

  ready () {
    // x-comp
    this._propX = this.querySelector('#x-comp');
    this._inputX = this._propX.children[0];
    this._inputX.value = this.value[0];

    this.installStandardEvents(this._inputX);
    this.installSlideEvents(
      this._propX,
      dx => {
        this._inputX.value = this._inputX.value + dx;
      },
      null,
      () => {
        this._inputX.value = this._value[0];
      }
    );

    // y-comp
    this._propY = this.querySelector('#y-comp');
    this._inputY = this._propY.children[0];
    this._inputY.value = this.value[1];

    this.installStandardEvents(this._inputY);
    this.installSlideEvents(
      this._propY,
      dx => {
        this._inputY.value = this._inputY.value + dx;
      },
      null,
      () => {
        this._inputY.value = this._value[1];
      }
    );

    // z-comp
    this._propZ = this.querySelector('#z-comp');
    this._inputZ = this._propZ.children[0];
    this._inputZ.value = this.value[2];

    this.installStandardEvents(this._inputZ);
    this.installSlideEvents(
      this._propZ,
      dx => {
        this._inputZ.value = this._inputZ.value + dx;
      },
      null,
      () => {
        this._inputZ.value = this._value[1];
      }
    );
  },

  inputValue () {
    return [this._inputX.value, this._inputY.value, this._inputZ.value];
  },

  valueChanged (newValue) {
    this._inputX.value = newValue[0];
    this._inputY.value = newValue[1];
    this._inputZ.value = newValue[2];
  },
};