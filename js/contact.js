// Placeholder. Replace SIGNAL_URL with the real Signal link.
var SIGNAL_URL = "[signal]";

(function () {
  var signal = document.querySelector("[data-signal]");
  if (signal) {
    signal.setAttribute("href", SIGNAL_URL);
  }

  function lang() {
    return document.documentElement.getAttribute("data-lang") === "es" ? "es" : "en";
  }

  function mailtoHref() {
    var current = lang();
    var local = ["levico", "security"].join("+");
    var host = ["mail", "grokbot", "com"].join(".");
    var address = local + String.fromCharCode(64) + host;
    var subject = current === "es" ? "Consulta de seguridad" : "Security inquiry";
    var body = current === "es"
      ? "Contame tu situación y qué servicio te interesa.\n\nSituación:\n\nServicio de interés:\n\n"
      : "Tell me your situation and which service you're interested in.\n\nSituation:\n\nService of interest:\n\n";
    return "mailto:" + address + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  var mail = document.querySelector("[data-mail]");
  if (mail) {
    mail.addEventListener("click", function () {
      window.location.href = mailtoHref();
    });
  }

  var form = document.querySelector(".inquiry");
  if (!form) return;

  var service = form.querySelector("select[name='service']");
  var language = form.querySelector("input[name='language']");
  var submit = form.querySelector("[type='submit']");
  var success = form.querySelector("[data-success]");
  var failure = form.querySelector("[data-error]");
  var fallbacks = form.querySelectorAll("a.fallback");

  function syncLanguage() {
    var current = lang();
    if (language) language.value = current;
    if (service) {
      var options = service.querySelectorAll("option[data-en]");
      for (var i = 0; i < options.length; i++) {
        var label = options[i].getAttribute(current === "es" ? "data-es" : "data-en");
        if (label) options[i].textContent = label;
      }
    }
    var href = mailtoHref();
    for (var j = 0; j < fallbacks.length; j++) {
      fallbacks[j].setAttribute("href", href);
    }
  }

  syncLanguage();

  var switcher = document.querySelector(".lang-switch");
  if (switcher) {
    switcher.addEventListener("click", function () {
      syncLanguage();
    });
  }

  function show(el) {
    if (!el) return;
    el.hidden = false;
    el.focus();
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  function setSending(sending) {
    if (!submit) return;
    submit.disabled = sending;
    if (sending) submit.setAttribute("aria-busy", "true");
    else submit.removeAttribute("aria-busy");
  }

  form.addEventListener("submit", function (event) {
    if (!window.fetch || !window.FormData) return;
    event.preventDefault();
    syncLanguage();
    setSending(true);
    hide(success);
    hide(failure);

    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, 20000) : 0;
    var options = {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    };
    if (controller) options.signal = controller.signal;

    fetch(form.action, options).then(function (response) {
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      syncLanguage();
      show(success);
    }).catch(function () {
      show(failure);
    }).then(function () {
      if (timer) window.clearTimeout(timer);
      setSending(false);
    });
  });
})();
