/* ==========================================================================
   Stackly Wellness — Auth helpers (demo roles)
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "stackly_wellness_user";

  function saveUser(user) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) { /* ignore */ }
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function clearUser() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  window.StacklyAuth = {
    saveUser: saveUser,
    getUser: getUser,
    clearUser: clearUser,
  };

  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = loginForm.querySelector("#login-name");
      var email = loginForm.querySelector("#login-email");
      var password = loginForm.querySelector("#login-password");
      var roleSelect = loginForm.querySelector("#login-role");
      var valid = true;

      function mark(field, ok) {
        var group = field && field.closest(".form-group");
        if (group) group.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      }

      var nameOk = name && name.value.trim().length > 1;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var passwordOk = password.value.length >= 6;

      mark(name, nameOk);
      mark(email, emailOk);
      mark(password, passwordOk);
      if (!valid) return;

      var emailVal = email.value.trim().toLowerCase();
      var role = (roleSelect && roleSelect.value) || "client";
      if (emailVal.indexOf("admin") !== -1) role = "admin";

      saveUser({
        name: name.value.trim(),
        email: emailVal,
        role: role,
        membership: "Bloom",
      });

      var success = loginForm.querySelector(".form-success");
      if (success) success.classList.add("is-visible");

      setTimeout(function () {
        window.location.href = role === "admin" ? "admin.html" : "client.html";
      }, 600);
    });
  }

  var registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = registerForm.querySelector("#reg-name");
      var email = registerForm.querySelector("#reg-email");
      var password = registerForm.querySelector("#reg-password");
      var confirm = registerForm.querySelector("#reg-confirm");
      var valid = true;

      function mark(field, ok) {
        var group = field.closest(".form-group");
        if (group) group.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      }

      mark(name, name.value.trim().length > 1);
      mark(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
      mark(password, password.value.length >= 6);
      mark(confirm, confirm.value === password.value && confirm.value.length >= 6);

      if (!valid) return;

      try {
        localStorage.setItem(
          "stackly_wellness_pending",
          JSON.stringify({
            name: name.value.trim(),
            email: email.value.trim().toLowerCase(),
          })
        );
      } catch (err) { /* ignore */ }

      var success = registerForm.querySelector(".form-success");
      if (success) success.classList.add("is-visible");

      setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
    });
  }

  document.querySelectorAll("[data-logout]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      clearUser();
      window.location.href = "login.html";
    });
  });
})();
