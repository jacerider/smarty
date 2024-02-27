/**
 * @file
 * Smarty autocomplete.
 */
// import SmartySDK from 'smartystreets-javascript-sdk';

(function(document, Drupal, drupalSettings, once) {

  const autoComplete = require("@tarekraafat/autocomplete.js");
  const SmartySDK = require("smartystreets-javascript-sdk");

  class Smarty {
    el;
    wrapper;
    line2;
    line3;
    city;
    state;
    zipcode;
    autocomplete;
    selected;
    settings;

    constructor(el) {
      var self = this;
      this.el = el;
      this.wrapper = el.closest('.smarty-element');
      this.line2 = this.wrapper.querySelector('.smarty-address-line2');
      this.line3 = this.wrapper.querySelector('.smarty-address-line3');
      this.city = this.wrapper.querySelector('.smarty-locality');
      this.state = this.wrapper.querySelector('.smarty-administrative-area');
      this.zipcode = this.wrapper.querySelector('.smarty-postal-code');
      this.selected = null;
      this.settings = drupalSettings.smarty;

      this.toggle(true);
      this.autocomplete = new autoComplete({
        selector: function () {return el;},
        name: 'smarty',
        data: {
          src: function (lookupValue) {
            return self.lookup(lookupValue);
          },
          cache: false,
          keys: ['streetLine'],
        },
        threshold: 1,
        debounce: 300,
        searchEngine: function (query, record) {
          var nRecord = String(record).toLowerCase();
          var _match = nRecord.indexOf(query);
          if (~_match) {
            query = record.substring(_match, _match + query.length);
            _match = record.replace(query, self.mark(query, true)) || record;
            return _match;
          }
          return record;
        },
        resultsList: {
          element: function (list, data) {
            const empty = data.results.length === 0;
            self.toggle(!empty);
            if (!empty) {
              const info = document.createElement("p");
              info.innerHTML = `Please select your address.`;
              list.prepend(info);
            }
          },
          noResults: true,
          maxResults: 15,
          tabSelect: true
        },
        resultItem: {
          element: (item, data) => {
            const title = [
              data.match,
              data.value.secondary,
              data.value.city,
              data.value.state,
              data.value.zipcode
            ].filter(function (n) {
              return n;
            }).join(', ');
            const suffix = data.value.entries > 1 ? ` (+${data.value.entries} entries)` : '';
            // Modify Results Item Style
            item.style = "display: flex; justify-content: space-between;";
            // Modify Results Item Content
            item.innerHTML = `
            <span class="first">
              ${title}
            </span>
            <span class="second">
              ${suffix}
            </span>`;
          },
          highlight: true,
        }
      });

      this.autocomplete.input.addEventListener("selection", function (event) {
        const feedback = event.detail;
        self.select(feedback);
      });
      this.autocomplete.input.addEventListener('results', function (event) {
        self.onResults(event);
      });
    }

    onResults(event) {
      setTimeout(() => {
        this.autocomplete.goTo(0);
      });
    }

    toggle(disable) {
      if (typeof this.settings.disable_complete === 'boolean' && this.settings.disable_complete === true) {
        var self = this;
        ['line2', 'line3', 'city', 'state', 'zipcode'].forEach(function (field) {
          if (self[field]) {
            self[field].disabled = disable;
            if (disable) {
              self[field].closest('.js-form-wrapper').classList.add('smarty-disabled');
            }
            else {
              self[field].closest('.js-form-wrapper').classList.remove('smarty-disabled');
            }
          }
        });
      }
    }

    select(feedback) {
      var self = this;
      const inputEvent = new Event('input');
      const changeEvent = new Event('change');

      let selection = feedback.selection.value[feedback.selection.key];
      if (feedback.selection.value.secondary) {
        selection += ' ' + feedback.selection.value.secondary;
      }
      if (feedback.selection.value.entries > 1) {
        selection += ' ';
      }
      this.autocomplete.input.value = selection;

      if (feedback.selection.value.entries > 1) {
        setTimeout(function () {
          self.selected = feedback.selection.value;
          self.autocomplete.start();
        });
      }
      if (this.city) {
        this.city.value = feedback.selection.value.city;
        this.city.dispatchEvent(inputEvent);
        this.city.dispatchEvent(changeEvent);
      }
      if (this.state) {
        this.state.value = feedback.selection.value.state;
        this.state.dispatchEvent(inputEvent);
        this.state.dispatchEvent(changeEvent);
      }
      if (this.state) {
        this.zipcode.value = feedback.selection.value.zipcode;
        this.zipcode.dispatchEvent(inputEvent);
        this.zipcode.dispatchEvent(changeEvent);
      }
    }

    async lookup(lookupValue) {
      if (!lookupValue) {
        return [];
      }

      // return [
      //   {
      //     streetLine: '12821 Main St',
      //     city: 'Springfield',
      //     state: 'IL',
      //     zipcode: '62701',
      //     secondary: '',
      //     entries: 0,
      //   },
      //   {
      //     streetLine: '1 Baer Dr',
      //     city: 'Springfield',
      //     state: 'IL',
      //     zipcode: '62701',
      //     secondary: '#',
      //     entries: 2,
      //   },
      //   {
      //     streetLine: '1 Baer Dr # A',
      //     city: 'Springfield',
      //     state: 'IL',
      //     zipcode: '62701',
      //     secondary: '#',
      //     entries: 0,
      //   },
      // ];

      const SmartyCore = SmartySDK.core;
      const Lookup = SmartySDK.usAutocompletePro.Lookup;
      const credentials = new SmartyCore.SharedCredentials(this.settings.key);
      let clientBuilder = new SmartyCore.ClientBuilder(credentials).withLicenses([
        "us-autocomplete-pro-cloud"
      ]);
      let client = clientBuilder.buildUsAutocompleteProClient();
      let lookup = new Lookup(lookupValue);

      if (this.selected) {
        let selected = [
          this.selected.streetLine + ' # (' + this.selected.entries + ')',
          this.selected.city,
          this.selected.state,
          this.selected.zipcode
        ].filter(function (n) {
          return n;
        }).join(' ');
        lookup.selected = selected;
        this.selected = null;
      }
      const results = await client.send(lookup);
      return results.result;
    }

    mark(value, cls) {
      return this.create("mark", this._objectSpread2({
        innerHTML: value
      }, typeof cls === "string" && {
        "class": cls
      })).outerHTML;
    };

    create(tag, options) {
      var el = typeof tag === "string" ? document.createElement(tag) : tag;
      for (var key in options) {
        var val = options[key];
        if (key === "inside") {
          val.append(el);
        } else if (key === "dest") {
          select$1(val[0]).insertAdjacentElement(val[1], el);
        } else if (key === "around") {
          var ref = val;
          ref.parentNode.insertBefore(el, ref);
          el.append(ref);
          if (ref.getAttribute("autofocus") != null) ref.focus();
        } else if (key in el) {
          el[key] = val;
        } else {
          el.setAttribute(key, val);
        }
      }
      return el;
    };

    _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? this.ownKeys(Object(source), !0).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }

      return target;
    }

    ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }

      return keys;
    }
  }

  Drupal.behaviors.smartyAutocomlete = {
    attach: function(context) {
      once("smarty.autocomplete", ".smarty-autocomplete", context).forEach(function (el) {
        new Smarty(el);
      });
    }
  };

})(document, Drupal, drupalSettings, once);
