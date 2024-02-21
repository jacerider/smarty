/**
 * @file
 * Smarty autocomplete.
 */
// import SmartySDK from 'smartystreets-javascript-sdk';

(function(document, Drupal, drupalSettings, once) {

  class Smarty {
    el;
    menu;

    constructor(el) {
      this.el = el;

      this.menu = document.createElement('div');
      this.menu.classList.add('smarty-autocomplete-menu');
      this.menu.style.display = 'none';
      this.el.parentNode.insertBefore(this.menu, this.el.nextSibling);

      this.bind();
    }

    bind() {
      const self = this;
      this.el.addEventListener('keyup', this.debounce(function(e) {
        self.lookup(e.target.value);
      }));
    }

    debounce(func, timeout = 300) {
      let timer;
      return (...args)=>{
        clearTimeout(timer);
        timer = setTimeout(()=>{
          func.apply(this, args);
        }, timeout);
      };
    };

    async lookup(lookupValue) {
      if (!lookupValue) {
        return;
      }

      console.log('debounce', lookupValue, autoComplete);
      return;
      const SmartySDK = require("smartystreets-javascript-sdk");
      const SmartyCore = SmartySDK.core;
      const Lookup = SmartySDK.usAutocompletePro.Lookup;
      const credentials = new SmartyCore.SharedCredentials(drupalSettings.smarty.key);
      let clientBuilder = new SmartyCore.ClientBuilder(credentials).withLicenses([
        "us-autocomplete-pro-cloud"
      ]);
      let client = clientBuilder.buildUsAutocompleteProClient();
      let lookup = new Lookup(lookupValue);

      await handleRequest(lookup, "Simple Lookup");

      async function handleRequest(lookup, lookupType) {
        try {
          const results = await client.send(lookup);
          console.log('results', results);
        } catch (err) {
          console.log('error', err);
        }
      }
    }
  }

  Drupal.behaviors.smartyAutocomlete = {
    attach: function(context) {
      console.log('hit');
        // once('smarty.autocomplete', '.smarty-autocomplete', context).forEach(initAutocomplete);
      once("smarty.autocomplete", ".smarty-autocomplete", context).forEach(function (el) {
        new Smarty(el);
      });
    }
  };

})(document, Drupal, drupalSettings, once);
