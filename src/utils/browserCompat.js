/**
 * Browser compatibility utilities and polyfills
 * This module provides JavaScript polyfills and utilities for cross-browser compatibility
 */

// Polyfill for Array.from (IE11 support)
if (!Array.from) {
  Array.from = function(arrayLike, mapFn, thisArg) {
    var items = Object(arrayLike);
    if (arrayLike == null) {
      throw new TypeError('Array.from requires an array-like object - not null or undefined');
    }
    
    var len = parseInt(items.length) || 0;
    var A = typeof this === 'function' ? Object(new this(len)) : new Array(len);
    
    for (var i = 0; i < len; i++) {
      var value = items[i];
      A[i] = mapFn ? mapFn.call(thisArg, value, i) : value;
    }
    
    A.length = len;
    return A;
  };
}

// Polyfill for Object.assign (IE11 support)
if (typeof Object.assign !== 'function') {
  Object.assign = function(target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    const to = Object(target);
    
    for (let index = 1; index < arguments.length; index++) {
      const nextSource = arguments[index];

      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Safe polyfills that check for existing implementation
export const PolyfillUtils = {
  // Array includes polyfill
  arrayIncludes: function(array, searchElement, fromIndex) {
    if (Array.prototype.includes) {
      return array.includes(searchElement, fromIndex);
    }
    
    if (array == null) {
      throw new TypeError('"this" is null or not defined');
    }

    const o = Object(array);
    const len = parseInt(o.length) || 0;
    
    if (len === 0) {
      return false;
    }

    const n = fromIndex | 0;
    let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    while (k < len) {
      if (o[k] === searchElement) {
        return true;
      }
      k++;
    }
    
    return false;
  },

  // String includes polyfill
  stringIncludes: function(string, search, start) {
    if (String.prototype.includes) {
      return string.includes(search, start);
    }
    
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > string.length) {
      return false;
    } else {
      return string.indexOf(search, start) !== -1;
    }
  },

  // String startsWith polyfill
  stringStartsWith: function(string, searchString, position) {
    if (String.prototype.startsWith) {
      return string.startsWith(searchString, position);
    }
    
    position = position || 0;
    return string.substr(position, searchString.length) === searchString;
  },

  // String endsWith polyfill
  stringEndsWith: function(string, searchString, length) {
    if (String.prototype.endsWith) {
      return string.endsWith(searchString, length);
    }
    
    if (length === undefined || length > string.length) {
      length = string.length;
    }
    return string.substring(length - searchString.length, length) === searchString;
  }
};

// Polyfill for Promise (IE11 support)
if (typeof window !== 'undefined' && typeof window.Promise === 'undefined') {
  // In a real application, you would include a Promise polyfill library
  console.warn('Promise polyfill needed for IE11 support');
}

// Browser detection utility
export const BrowserUtils = {
  // Detect if browser supports certain features
  supports: {
    flexbox: typeof CSS !== 'undefined' && CSS.supports && CSS.supports('display', 'flex'),
    grid: typeof CSS !== 'undefined' && CSS.supports && CSS.supports('display', 'grid'),
    customProperties: typeof CSS !== 'undefined' && CSS.supports && CSS.supports('--custom-prop', 'value'),
    backdropFilter: typeof CSS !== 'undefined' && CSS.supports && CSS.supports('backdrop-filter', 'blur(10px)'),
    webp: (() => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      } catch (e) {
        return false;
      }
    })()
  },

  // Get browser information
  getBrowser: () => {
    if (typeof navigator === 'undefined') return 'Unknown';
    
    const userAgent = navigator.userAgent;
    
    if (userAgent.indexOf('Chrome') > -1) {
      return 'Chrome';
    } else if (userAgent.indexOf('Firefox') > -1) {
      return 'Firefox';
    } else if (userAgent.indexOf('Safari') > -1) {
      return 'Safari';
    } else if (userAgent.indexOf('Edge') > -1) {
      return 'Edge';
    } else if (userAgent.indexOf('Trident') > -1) {
      return 'IE';
    }
    
    return 'Unknown';
  },

  // Check if browser is mobile
  isMobile: () => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Add classes to body based on browser and feature support
  addBrowserClasses: () => {
    if (typeof document === 'undefined') return;
    
    const body = document.body;
    if (!body) return;
    
    const browser = BrowserUtils.getBrowser().toLowerCase();
    
    body.classList.add(`browser-${browser}`);
    
    if (BrowserUtils.isMobile()) {
      body.classList.add('mobile');
    }
    
    // Add feature support classes
    if (BrowserUtils.supports.flexbox) {
      body.classList.add('flexbox-support');
    } else {
      body.classList.add('no-flexbox');
    }
    
    if (BrowserUtils.supports.customProperties) {
      body.classList.add('custom-properties-support');
    } else {
      body.classList.add('no-custom-properties');
    }
    
    if (BrowserUtils.supports.backdropFilter) {
      body.classList.add('backdrop-filter-support');
    } else {
      body.classList.add('no-backdrop-filter');
    }
  }
};

// DOM utilities for cross-browser compatibility
export const DOMUtils = {
  // Cross-browser event listener
  addEventListener: (element, event, handler) => {
    if (element.addEventListener) {
      element.addEventListener(event, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event, handler);
    }
  },

  // Cross-browser event removal
  removeEventListener: (element, event, handler) => {
    if (element.removeEventListener) {
      element.removeEventListener(event, handler, false);
    } else if (element.detachEvent) {
      element.detachEvent('on' + event, handler);
    }
  },

  // Get element's computed style
  getComputedStyle: (element, property) => {
    if (window.getComputedStyle) {
      return window.getComputedStyle(element)[property];
    } else if (element.currentStyle) {
      return element.currentStyle[property];
    }
  },

  // Safe querySelector with fallback
  querySelector: (selector, context = document) => {
    if (context.querySelector) {
      return context.querySelector(selector);
    } else {
      // Fallback for very old browsers
      return context.getElementById(selector.replace('#', ''));
    }
  }
};

// Initialize browser compatibility features when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      BrowserUtils.addBrowserClasses();
    });
  } else {
    BrowserUtils.addBrowserClasses();
  }
}

export default BrowserUtils;
