const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../js/main.js"), "utf8");

function setup({
  endpoint = "",
  fetch,
  name = "Test Dentist",
  savedPlan = null,
  message = "",
  hasForm = true,
} = {}) {
  function element() {
    return {
      listeners: {},
      attributes: {},
      dataset: {},
      children: [],
      firstChild: {},
      classList: { toggle() {} },
      addEventListener(k, fn) {
        this.listeners[k] = fn;
      },
      setAttribute(k, v) {
        this.attributes[k] = v;
      },
      getAttribute(k) {
        return this.attributes[k];
      },
      replaceChildren(...children) {
        this.children = children;
      },
      append(...children) {
        this.children.push(...children);
      },
      focus() {
        this.focused = true;
      },
      textContent: "",
      disabled: false,
    };
  }
  const submit = element(),
    note = element(),
    form = element();
  form.elements = {
    name: element(),
    interest: { value: "Interview Prep" },
    message: { value: message },
  };
  form.querySelector = () => submit;
  form.reportValidity = () => true;
  form.reset = () => {
    form.wasReset = true;
  };
  const elements = {
    "contact-form": hasForm ? form : null,
    "form-note": note,
    "nav-links": element(),
    year: element(),
    "form-explainer": element(),
  };
  const document = {
    ...element(),
    getElementById: (id) => elements[id],
    querySelector: () => element(),
    querySelectorAll: () => [],
    createElement: element,
    createTextNode: (text) => ({ textContent: text }),
  };
  const context = {
    window: {
      TD_CONFIG: { email: "consultation@example.com", formEndpoint: endpoint },
    },
    document,
    location: { href: "" },
    sessionStorage: { getItem: () => savedPlan },
    fetch,
    FormData: class {
      [Symbol.iterator]() {
        return Object.entries({
          name,
          email: "dentist@example.com",
          phone: "+1 555 0100",
          country: "Example",
          interest: "Bench Test Prep",
          message: "Crown & cavity practice\nNext month",
        }).values();
      }
    },
    AbortSignal,
    Date,
    encodeURIComponent,
  };
  vm.runInNewContext(source, context);
  return {
    submit,
    note,
    form,
    context,
    send: () => form.listeners.submit({ preventDefault() {} }),
  };
}
test("email mode prepares an encoded draft without claiming it was sent", async () => {
  const app = setup();
  await app.send();
  const url = new URL(app.context.location.href);
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, "consultation@example.com");
  assert.equal(
    url.searchParams.get("subject"),
    "Consultation request: Bench Test Prep",
  );
  assert.match(
    url.searchParams.get("body"),
    /Crown & cavity practice\nNext month/,
  );
  assert.match(app.note.textContent, /press Send/);
  assert.equal(app.form.wasReset, undefined);
});
test("endpoint success sends the chosen program and clears the form", async () => {
  let payload;
  const app = setup({
    endpoint: "https://example.test/forms",
    fetch: async (_url, init) => {
      payload = JSON.parse(init.body);
      return { ok: true };
    },
  });
  await app.send();
  assert.equal(payload.interest, "Bench Test Prep");
  assert.equal(app.form.wasReset, true);
  assert.equal(app.submit.disabled, false);
  assert.match(app.note.textContent, /has been sent/);
});
test("endpoint failure keeps entered data and provides an email fallback", async () => {
  const app = setup({
    endpoint: "https://example.test/forms",
    fetch: async () => ({ ok: false }),
  });
  await app.send();
  assert.equal(app.form.wasReset, undefined);
  assert.equal(app.submit.disabled, false);
  assert.equal(app.note.className, "form-note err");
  assert.match(app.note.children[1].href, /^mailto:/);
  assert.equal(app.context.location.href, "");
});
test("a whitespace-only name is rejected before transmission", async () => {
  const app = setup({ name: "   " });
  await app.send();
  assert.equal(app.context.location.href, "");
  assert.equal(app.form.elements.name.focused, true);
});
test("repeated clicks do not submit concurrent requests", async () => {
  let resolve,
    calls = 0;
  const app = setup({
    endpoint: "https://example.test/forms",
    fetch: () => {
      calls++;
      return new Promise((r) => (resolve = r));
    },
  });
  const pending = app.send();
  await app.send();
  assert.equal(calls, 1);
  resolve({ ok: true });
  await pending;
});
test("the guide page initializes without a consultation form", () => {
  assert.doesNotThrow(() => setup({ hasForm: false }));
});
test("planner results fill an empty consultation message", () => {
  const app = setup({ savedPlan: "My planner results: invited to interview" });
  assert.equal(
    app.form.elements.message.value,
    "My planner results: invited to interview",
  );
});
test("planner restoration preserves an existing message", () => {
  const app = setup({
    savedPlan: "My planner results",
    message: "My own question",
  });
  assert.equal(app.form.elements.message.value, "My own question");
});
