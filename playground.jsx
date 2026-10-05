const { useState, useEffect, useRef } = React;

// Har hook ke example pages. Example N ki file: components/<hook>/ExampleN.jsx
// (jismein `export default function App()` ho).
// Naya example: file banao (jaise components/useState/Example5.jsx) aur yahan uska title jodo.
// Naya hook: folder + Example1.jsx banao aur yahan ek line jodo.
// Order = interviews mein kitna poocha jaata hai
const HOOKS = [
  { name: "useState", examples: ["Counter", "Text input", "Functional update", "Array (todo list)"] },
  { name: "useEffect", examples: ["Cleanup order", "Run once (load data)", "Timer with cleanup", "Dependency array"] },
  { name: "useContext", examples: ["Theme", "Login (data + functions)", "Default & nearest value", "Avoid prop drilling"] },
  { name: "useRef", examples: ["Render count & focus", "Previous value", "Stopwatch (interval id)", "Ref vs state"] },
  { name: "useMemo", examples: ["Cached calculation", "Filter a list", "Same object reference", "Sort a list"] },
  { name: "useCallback", examples: ["New vs same function", "With React.memo child", "As effect dependency", "Stale value trap"] },
  { name: "useReducer", examples: ["Counter", "Todo list", "Form state", "Shopping cart"] },
  { name: "useLayoutEffect", examples: ["Order vs useEffect", "Measure an element", "Scroll to bottom", "No flicker"] },
  { name: "useImperativeHandle", examples: ["Focus & clear input", "Child counter", "Open / close modal", "Validate a form"] },
  { name: "useId", examples: ["Two fields", "Many fields, one id", "aria-describedby", "Checkbox list"] },
  { name: "useCustomHook", examples: ["useCounter", "useToggle", "useInput", "useDebounce"] },
];

// Har example ek page: { name: "useState-2", hookName, number, title, file }
const PAGES = HOOKS.flatMap((h) =>
  h.examples.map((title, i) => ({
    name: `${h.name}-${i + 1}`,
    hookName: h.name,
    number: i + 1,
    title,
    file: `components/${h.name}/Example${i + 1}.jsx`,
  }))
);

// ---------- main.jsx: har section ki apni, read-only (disk par nahi, yahin banti hai) ----------

const MAIN_FILE = "main.jsx";

// Andar har section ki main.jsx alag rakhne ke liye: "main.jsx#useState"
function mainPath(hook) {
  return `${MAIN_FILE}#${hook.name}`;
}

// User ko dikhne wala naam: har section ki hook file "App.jsx" dikhti hai,
// "main.jsx#useState" → "main.jsx"
function displayName(path) {
  if (PAGES.some((p) => p.file === path)) return "App.jsx";
  return path.split("#")[0];
}

function mainTemplate(hook) {
  return `import { createRoot } from 'react-dom/client';
import App from './${hook.file}';

createRoot(document.getElementById('root')).render(
  <App />
);
`;
}

// Hook file ki shuru ki comment lines: editor mein lock rehti hain
const HOOK_FILE_HEADER = "// This file must have `export default function App()`\n// (main.jsx imports and renders it).\n";
const HOOK_FILE_HEADER_LINES = 2;

function missingAppError(file) {
  return `${file} has no \`export default function App()\`.

main.jsx imports and renders this App function, so the file must have:

export default function App() {
  return <h1>Hello</h1>;
}`;
}

// ---------- Edited code browser mein save rehta hai (Reset se hat jaata hai) ----------

const STORAGE_PREFIX = "hooks-playground:file:";

function loadSaved(path) {
  try { return localStorage.getItem(STORAGE_PREFIX + path); } catch (e) { return null; }
}
function saveCode(path, code) {
  try { localStorage.setItem(STORAGE_PREFIX + path, code); } catch (e) {}
}
function clearSaved(path) {
  try { localStorage.removeItem(STORAGE_PREFIX + path); } catch (e) {}
}

// ---------- import / export ko browser mein chalana ----------

function toDataUrl(code) {
  return "data:text/javascript;charset=utf-8," + encodeURIComponent(code);
}

// `import { useState } from "react"` ke liye: window.React ko module bana deta hai
function globalModule(globalName, value) {
  const names = Object.keys(value).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k) && k !== "default");
  return toDataUrl(
    `const m = window.${globalName};\nexport default m;\nexport const { ${names.join(", ")} } = m;`
  );
}

const BUILTIN_MODULES = {
  react: globalModule("React", React),
  "react-dom": globalModule("ReactDOM", ReactDOM),
  "react-dom/client": globalModule("ReactDOM", ReactDOM),
};

// "./components/X.jsx" ko importer file ke folder ke hisaab se path banata hai
function resolvePath(spec, importer) {
  return new URL(spec, "file:///" + importer).pathname.slice(1);
}

// ---------- Debugger: har statement se pehle __dbg(line, variables) call daalta hai ----------

// Har step par: kaunsi line chal rahi hai + us waqt dikhne wale variables ki values
function debugPlugin({ types: t }) {
  function snapshot(path) {
    const props = [];
    const bindings = path.scope.getAllBindings();
    for (const name of Object.keys(bindings)) {
      const kind = bindings[name].kind;
      // imports (useState) aur function declarations (App) skip
      if (kind === "module" || kind === "hoisted" || name.startsWith("_")) continue;
      props.push(t.objectProperty(t.stringLiteral(name), t.arrowFunctionExpression([], t.identifier(name))));
    }
    return t.objectExpression(props);
  }

  function dbgCall(line, path) {
    return t.callExpression(t.identifier("__dbg"), [t.numericLiteral(line), snapshot(path)]);
  }

  return {
    visitor: {
      Statement(path) {
        const node = path.node;
        if (node._dbg || !node.loc) return;
        if (!path.parentPath.isBlockStatement() && !path.parentPath.isProgram()) return;
        if (path.isDeclaration() && !path.isVariableDeclaration()) return; // import/export/function
        const stmt = t.expressionStatement(dbgCall(node.loc.start.line, path));
        stmt._dbg = true;
        path.insertBefore(stmt);
      },
      // return ( ... ) ke andar ke elements: <p>, <button>, <> ... har ek alag step
      "JSXElement|JSXFragment"(path) {
        const node = path.node;
        if (node._dbg || !node.loc) return;
        node._dbg = true;
        if (path.parentPath.isJSXAttribute() || path.parentPath.isJSXExpressionContainer()) return;
        const seq = t.sequenceExpression([dbgCall(node.loc.start.line, path), node]);
        if (path.parentPath.isJSXElement() || path.parentPath.isJSXFragment()) {
          // child element: <p>..</p>  →  {(__dbg(...), <p>..</p>)}
          const container = t.jsxExpressionContainer(seq);
          container._dbg = true;
          path.replaceWith(container);
        } else {
          path.replaceWith(seq);
        }
      },
      // JSX ke andar {console.log(...)}, {count} jaise expressions
      JSXExpressionContainer(path) {
        const node = path.node;
        if (node._dbg || !node.loc || t.isJSXEmptyExpression(node.expression)) return;
        node._dbg = true;
        if (path.parentPath.isJSXAttribute()) return; // onClick={...} element ki line mein aa jaata hai
        const line = node.loc.start.line;
        const owner = path.parentPath.node;
        // <p>You clicked {count} times</p>: line pehle hi <p> ke step mein hai
        if (t.isJSXElement(owner) && owner.loc && owner.loc.start.line === line) return;
        path.get("expression").replaceWith(t.sequenceExpression([dbgCall(line, path), node.expression]));
      },
      // useEffect(() => {...}) → useEffect(__dbgEffect(() => {...}, "useEffect")):
      // isse cleanup ka store hona aur React ka use call karna bhi steps mein dikhta hai
      CallExpression(path) {
        const node = path.node;
        const callee = node.callee;
        const name = t.isIdentifier(callee)
          ? callee.name
          : t.isMemberExpression(callee) && t.isIdentifier(callee.property) ? callee.property.name : null;
        if (node._dbg || !["useEffect", "useLayoutEffect", "useInsertionEffect"].includes(name)) return;
        if (!node.arguments.length || t.isSpreadElement(node.arguments[0])) return;
        node._dbg = true;
        node.arguments[0] = t.callExpression(t.identifier("__dbgEffect"), [node.arguments[0], t.stringLiteral(name)]);
      },
      // onClick={() => setCount(count + 1)} jaise one-line arrow functions
      ArrowFunctionExpression(path) {
        const body = path.node.body;
        if (t.isBlockStatement(body) || !body.loc) return;
        path.get("body").replaceWith(t.sequenceExpression([dbgCall(body.loc.start.line, path), body]));
      },
    },
  };
}

// Debug mode mein do iframes chalte hain:
//   - visible preview: user ka har interaction (click, typing, keys, mouse, focus...) React tak
//     pahunchne se pehle rok kar parent ko bhejta hai (INTERCEPT_BRIDGE). Wo asli mein tab chalta hai
//     jab debugger us interaction ke Commit step tak pahunch jaaye.
//   - shadow (chhupa hua): wahi interaction pehle yahan chalta hai aur har step record hota hai (DEBUG_BRIDGE)

// Dono iframes mein: element ka raasta (body se child indexes), aur event ko dobara banana/chalana
const EVENT_HELPERS = `
function __path(el) {
  var path = [];
  while (el && el !== document.body && el.parentElement) {
    path.unshift(Array.prototype.indexOf.call(el.parentElement.children, el));
    el = el.parentElement;
  }
  return path;
}
function __find(path) {
  var el = document.body;
  for (var i = 0; el && i < path.length; i++) el = el.children[path[i]];
  return el;
}
function __setValue(el, value) {
  var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
    : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  var desc = Object.getOwnPropertyDescriptor(proto, "value");
  if (desc && desc.set) desc.set.call(el, value); // native setter, taaki React ko naya value dikhe
}
// Roke gaye event ko (snapshot se) dobara bana kar chalao
function __replay(d) {
  var el = __find(d.path);
  if (!el) return;
  var t = d.type;
  if (t === "click") { el.click(); return; }
  if (t === "input" || t === "change") {
    if (d.value != null && "value" in el && el.type !== "checkbox" && el.type !== "radio") __setValue(el, d.value);
    el.dispatchEvent(new Event(t, { bubbles: true }));
    return;
  }
  if (t === "submit") { el.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); return; }
  var init = { bubbles: true, cancelable: true, composed: true };
  for (var k in d.init) init[k] = d.init[k];
  if (d.relatedPath) init.relatedTarget = __find(d.relatedPath);
  var Ctor = (d.ctor && typeof window[d.ctor] === "function") ? window[d.ctor] : Event;
  var ev;
  try { ev = new Ctor(t, init); } catch (e) { ev = new Event(t, init); }
  if (d.keyCode != null) {
    try {
      Object.defineProperty(ev, "keyCode", { get: function () { return d.keyCode; } });
      Object.defineProperty(ev, "which", { get: function () { return d.keyCode; } });
    } catch (e) {}
  }
  el.dispatchEvent(ev);
}
`;

const INTERCEPT_BRIDGE = `
(function () {
  ${EVENT_HELPERS}
  var applying = false;

  // React jin events ko sunta hai (onClick, onChange, onKeyDown, onMouseEnter, onFocus, ...)
  var TYPES = ["click", "dblclick", "contextmenu", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove",
    "pointerdown", "pointerup", "pointerover", "pointerout", "pointermove",
    "keydown", "keyup", "input", "change", "submit", "focusin", "focusout", "wheel"];
  // Inka default kaam (checkbox tick, form submit) bhi rokna hai, baad mein chalega
  var BLOCK_DEFAULT = { click: true, contextmenu: true, submit: true };
  var FIELDS = ["clientX", "clientY", "screenX", "screenY", "button", "buttons", "detail",
    "ctrlKey", "shiftKey", "altKey", "metaKey", "key", "code", "location", "repeat",
    "deltaX", "deltaY", "deltaZ", "deltaMode", "pointerId", "pointerType", "isPrimary",
    "width", "height", "pressure", "data", "inputType"];

  function describe(e) {
    var el = e.target || {};
    var tag = el.tagName ? el.tagName.toLowerCase() : "window";
    if (e.type === "keydown" || e.type === "keyup") return e.type + ' "' + e.key + '" on <' + tag + ">";
    var text = tag === "input" || tag === "textarea" || tag === "select" ? el.value : el.textContent;
    text = String(text || "").trim().slice(0, 30);
    return e.type + " on <" + tag + ">" + (text ? ' "' + text + '"' : "");
  }

  function snapshot(e) {
    var d = { type: e.type, path: __path(e.target), label: describe(e), ctor: e.constructor.name, init: {} };
    FIELDS.forEach(function (k) {
      if (k in e && typeof e[k] !== "function" && typeof e[k] !== "object") d.init[k] = e[k];
    });
    if (e.relatedTarget && e.relatedTarget.nodeType === 1) d.relatedPath = __path(e.relatedTarget);
    if (e.type === "keydown" || e.type === "keyup") d.keyCode = e.keyCode;
    if (e.target && "value" in e.target && typeof e.target.value === "string") d.value = e.target.value;
    d.blocked = !!BLOCK_DEFAULT[e.type];
    return d;
  }

  TYPES.forEach(function (type) {
    window.addEventListener(type, function (e) {
      if (applying || !e.isTrusted) return; // apne dobara chalaye events ko mat roko
      // Preview mein focus ho tab bhi F10 = Next step
      if (type === "keydown" && e.key === "F10") {
        e.preventDefault();
        e.stopImmediatePropagation();
        parent.postMessage({ source: "hooks-debug-key" }, "*");
        return;
      }
      if (BLOCK_DEFAULT[type]) e.preventDefault();
      e.stopImmediatePropagation(); // React tak nahi pahunchega
      parent.postMessage({ source: "hooks-intercept", event: snapshot(e) }, "*");
    }, true);
  });

  // Debugger is interaction ke Commit tak pahunch gaya: ab asli mein chalao
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.source !== "hooks-apply") return;
    applying = true;
    try { __replay(d.event); } finally { applying = false; }
  });
})();
`;

// Shadow iframe mein: har step ko parent page (debugger) ko bhejta hai.
// window.__dbgStep = abhi tak ka aakhri step (console logs isse jude rehte hain).
const DEBUG_BRIDGE = `
window.__dbgStep = -1;
window.__dbg = (function () {
  ${EVENT_HELPERS}
  var count = 0, LIMIT = 3000;
  // Abhi chal raha interaction/timer. Iska step tabhi banta hai jab iski wajah se user ka code chale.
  var cause = null;

  function emit(msg) {
    if (count >= LIMIT) {
      if (count++ === LIMIT) parent.postMessage({ source: "hooks-debug", limit: LIMIT }, "*");
      return;
    }
    msg.source = "hooks-debug";
    msg.index = count;
    window.__dbgStep = count;
    count++;
    parent.postMessage(msg, "*");
  }

  var last = { line: null, vars: {} }; // aakhri code step (cleanup ke steps isi line/values ko dikhate hain)

  function record(msg) {
    if (cause && !cause.emitted) {
      cause.emitted = true;
      emit({ event: cause.label, id: cause.id, timer: cause.timer });
    }
    if (msg.line != null && !msg.cleanup) last = { line: msg.line, vars: msg.vars };
    emit(msg);
  }

  // useEffect / useLayoutEffect ka callback isse wrap hota hai (Babel). Callback ne function
  // return kiya = React ne cleanup store kiya; baad mein React use chalaye = cleanup call.
  window.__dbgEffect = function (create, hook) {
    if (typeof create !== "function") return create;
    return function () {
      var cleanup = create.apply(this, arguments);
      if (typeof cleanup !== "function") return cleanup;
      var stored = { line: last.line, vars: last.vars };
      record({ cleanup: "stored", hook: hook, line: stored.line, vars: stored.vars });
      return function () {
        record({ cleanup: "called", hook: hook, line: stored.line, vars: stored.vars });
        return cleanup.apply(this, arguments);
      };
    };
  };

  // Interaction se koi code nahi chala: parent ko batao (debugger nahi rukega)
  function finishCause(c) {
    if (c && !c.emitted && c.id != null) parent.postMessage({ source: "hooks-debug", silent: true, id: c.id }, "*");
    if (cause === c) cause = null;
  }

  // React har commit (DOM update) par DevTools hook ko call karta hai: wahi "Commit" step hai.
  // Ye render ke baad aur useEffect se pehle aata hai, bilkul asli React ke order mein.
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: false,
    supportsFiber: true,
    renderers: new Map(),
    inject: function () { return 1; },
    onCommitFiberRoot: function () { record({ commit: true }); },
    onCommitFiberUnmount: function () {},
    onPostCommitFiberRoot: function () {},
    checkDCE: function () {},
  };

  // Visible preview mein hua interaction yahan dobara chalao (aur record karo)
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.source !== "hooks-replay") return;
    if (cause) finishCause(cause); // pichla interaction ab khatam maano
    var c = { id: d.id, label: d.event.label };
    cause = c;
    try { __replay(d.event); } catch (err) { console.error(err); }
    // Kuch React updates (mouse move/over) thodi der baad render hote hain: tab tak intezaar
    setTimeout(function () { finishCause(c); }, 60);
  });

  // User ke setTimeout / setInterval callbacks bhi "⏱" cause ke saath dikhte hain.
  // React load hone ke baad lagta hai, taaki React ke apne timers par asar na ho.
  window.__wrapTimers = function () {
    ["setTimeout", "setInterval"].forEach(function (name) {
      var original = window[name];
      window[name] = function (fn) {
        if (typeof fn !== "function") return original.apply(window, arguments);
        var args = Array.prototype.slice.call(arguments);
        args[0] = function () {
          var prev = cause;
          cause = { label: "⏱ " + name + " callback", timer: true };
          try { return fn.apply(this, arguments); } finally { cause = prev; }
        };
        return original.apply(window, args);
      };
    });
  };

  function format(v) {
    if (v === undefined) return "undefined";
    if (typeof v === "function") return "ƒ " + (v.name || "anonymous") + "()";
    if (typeof v === "string") return JSON.stringify(v);
    if (v && v.$$typeof) return "<" + ((v.type && (v.type.name || v.type)) || "element") + " />";
    try {
      var s = JSON.stringify(v);
      return s && s.length > 120 ? s.slice(0, 117) + "..." : String(s);
    } catch (e) { return String(v); }
  }
  return function (line, getters) {
    if (count >= LIMIT) return emit({});
    var vars = {};
    for (var name in getters) {
      try { vars[name] = format(getters[name]()); } catch (e) { /* abhi declare nahi hua */ }
    }
    record({ line: line, vars: vars });
  };
})();
`;

// Entry file se shuru karke har imported file ko compile karta hai,
// aur imports ko data: URLs se badal deta hai (taaki browser khud import kar sake).
// `appFile` mein `export default` na ho to saaf error deta hai. `debug` = appFile mein debugger lagao.
async function bundle(entry, getSource, appFile, debug) {
  const urls = {};
  const inProgress = new Set();

  async function load(path) {
    if (urls[path]) return urls[path];
    if (inProgress.has(path)) throw new Error(`Circular import: ${path}`);
    inProgress.add(path);

    const source = await getSource(path);
    const name = displayName(path);
    const specs = [];
    let hasDefaultExport = false;
    const compiled = Babel.transform(source, {
      filename: name,
      presets: ["react"],
      plugins: [
        ...(debug && path === appFile ? [debugPlugin] : []),
        () => ({
          visitor: {
            ExportDefaultDeclaration() {
              hasDefaultExport = true;
            },
            "ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration"(p) {
              // export { App as default }
              if ((p.node.specifiers || []).some((s) => s.exported && s.exported.name === "default")) {
                hasDefaultExport = true;
              }
              const src = p.node.source;
              if (!src) return;
              specs.push(src.value);
              src.value = `__HOOKS_IMPORT_${specs.length - 1}__`;
            },
          },
        }),
      ],
    }).code;

    if (path === appFile && !hasDefaultExport) throw new Error(missingAppError(name));

    let code = compiled;
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      let url;
      if (BUILTIN_MODULES[spec]) url = BUILTIN_MODULES[spec];
      else if (spec.startsWith(".") || spec.startsWith("/")) url = await load(resolvePath(spec, path));
      else throw new Error(`${name}: "${spec}" cannot be imported. Only "react" and your own files (./...) can be imported.`);
      code = code.replace(`__HOOKS_IMPORT_${i}__`, url);
    }

    inProgress.delete(path);
    urls[path] = toDataUrl(code + `\n//# sourceURL=${name}`);
    return urls[path];
  }

  return load(entry);
}

// Iframe ke andar console.log / error ko pakad kar parent page (Console panel) ko bhejta hai
const CONSOLE_BRIDGE = `
(function () {
  function format(value) {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.name + ": " + value.message;
    if (typeof value === "function") return value.toString();
    if (value === undefined) return "undefined";
    try { return JSON.stringify(value, null, 2); } catch (e) { return String(value); }
  }
  ["log", "info", "warn", "error"].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      // step = debugger ka wo step jisne ye log print kiya (debug off ho to undefined)
      parent.postMessage({ source: "hooks-preview", level: level, text: args.map(format).join(" "), step: window.__dbgStep }, "*");
      original.apply(console, args);
    };
  });
  window.addEventListener("error", function (e) {
    console.error(e.error || e.message);
  });
  window.addEventListener("unhandledrejection", function (e) {
    console.error(e.reason);
  });
})();
`;

// mode: "normal" | "visible-debug" (click rokta hai) | "shadow" (steps record karta hai)
// deferMount = App tab tak render na ho jab tak parent "hooks-mount" na bheje
// (Render UI first time: UI pehle render ke Commit step par dikhta hai)
async function buildPreview(hook, getSource, mode, deferMount) {
  const mainUrl = await bundle(mainPath(hook), getSource, hook.file, mode === "shadow");
  const bridge = mode === "shadow" ? DEBUG_BRIDGE : mode === "visible-debug" ? INTERCEPT_BRIDGE : "";
  const wrapTimers = mode === "shadow" ? "window.__wrapTimers();" : "";
  const start = `${wrapTimers} import(${JSON.stringify(mainUrl)}).catch((e) => console.error(e));`;
  const startScript = deferMount
    ? `window.addEventListener("message", function onMount(e) {
        if (!e.data || e.data.source !== "hooks-mount") return;
        window.removeEventListener("message", onMount);
        ${start}
      });`
    : start;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; }</style>
</head>
<body>
  <div id="root"></div>
  <script>${CONSOLE_BRIDGE}<\/script>
  ${bridge ? `<script>${bridge}<\/script>` : ""}
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script type="module">
    ${startScript}
  <\/script>
</body>
</html>`;
}

const ERROR_DOC = `<!DOCTYPE html><html><body style="font-family: system-ui, sans-serif; color: #b91c1c; padding: 16px;">
  The code could not run. See the error in the Console below.
</body></html>`;

// ---------- Code editor (CodeMirror) ----------

// Pehli `lockedLines` lines edit/delete nahi ho sakti, baaki file poori editable hai.
// Debugger: `highlightLine` (0-based, -1 = koi nahi) highlight hoti hai,
// `hoverValues` = { variable: value } jo hover karne par dikhti hai.
function CodeEditor({ value, readOnly, lockedLines, highlightLine, hoverValues, onChange, onRun }) {
  const hostRef = useRef(null);
  const editorRef = useRef(null);
  const highlightRef = useRef(null);
  const [tip, setTip] = useState(null);
  // Latest callbacks refs mein, taaki editor sirf ek baar banana pade
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  const lockedRef = useRef(lockedLines);
  const hoverRef = useRef(hoverValues);
  onChangeRef.current = onChange;
  onRunRef.current = onRun;
  lockedRef.current = lockedLines;
  hoverRef.current = hoverValues;

  function markLocked(editor) {
    for (let i = 0; i < editor.lineCount(); i++) {
      if (i < lockedRef.current) editor.addLineClass(i, "background", "cm-locked");
      else editor.removeLineClass(i, "background", "cm-locked");
    }
  }

  useEffect(() => {
    const editor = CodeMirror(hostRef.current, {
      value,
      mode: "jsx",
      theme: "dracula",
      lineNumbers: true,
      tabSize: 2,
      indentWithTabs: false,
      autoCloseBrackets: true,
      matchBrackets: true,
      extraKeys: {
        "Ctrl-Enter": () => onRunRef.current(),
        "Cmd-Enter": () => onRunRef.current(),
        Tab: (cm) => cm.replaceSelection("  "),
      },
    });

    // Locked lines ko chhoone wala change: locked hissa chhod kar baaki apply karo
    // (Ctrl+A + Delete se sirf locked lines ke neeche ka code saaf hota hai)
    editor.on("beforeChange", (cm, change) => {
      const locked = lockedRef.current;
      if (!locked || change.origin === "setValue" || change.from.line >= locked) return;
      const firstEditable = { line: locked, ch: 0 };
      if (CodeMirror.cmpPos(change.to, firstEditable) <= 0) change.cancel();
      else change.update(firstEditable, change.to, change.text);
    });

    editor.on("change", (cm, change) => {
      // setValue = Reset ya file switch, user ki typing nahi
      if (change.origin === "setValue") return;
      onChangeRef.current(cm.getValue());
    });

    // Debugger: variable par mouse le jaao to us step ki value dikhao
    const wrapper = editor.getWrapperElement();
    wrapper.addEventListener("mousemove", (e) => {
      const values = hoverRef.current;
      if (!values) return setTip(null);
      const pos = editor.coordsChar({ left: e.clientX, top: e.clientY }, "window");
      const word = editor.findWordAt(pos);
      const name = editor.getRange(word.anchor, word.head);
      const start = editor.charCoords(word.anchor, "window");
      const end = editor.charCoords(word.head, "window");
      const overWord = e.clientX >= start.left && e.clientX <= end.right && e.clientY >= start.top && e.clientY <= start.bottom;
      if (overWord && Object.prototype.hasOwnProperty.call(values, name)) {
        setTip({ x: e.clientX, y: e.clientY, text: `${name} = ${values[name]}` });
      } else {
        setTip(null);
      }
    });
    wrapper.addEventListener("mouseleave", () => setTip(null));

    // Debugger panel ka size badle to editor ko naye size ke hisaab se dobara draw karo
    const resizeObserver = new ResizeObserver(() => editor.refresh());
    resizeObserver.observe(hostRef.current);

    editorRef.current = editor;
    return () => {
      resizeObserver.disconnect();
      hostRef.current.innerHTML = "";
    };
  }, []);

  // Debugger: chalne wali line highlight
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (highlightRef.current) editor.removeLineClass(highlightRef.current, "background", "cm-debug-line");
    highlightRef.current = null;
    if (highlightLine >= 0 && highlightLine < editor.lineCount()) {
      highlightRef.current = editor.addLineClass(highlightLine, "background", "cm-debug-line");
      editor.scrollIntoView({ line: highlightLine, ch: 0 }, 80);
    }
  }, [highlightLine, value]);

  useEffect(() => {
    if (!hoverValues) setTip(null);
  }, [hoverValues]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.getValue() !== value) {
      editor.setValue(value);
      editor.clearHistory(); // Ctrl+Z se doosri file ka code wapas na aaye
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current) markLocked(editorRef.current);
  }, [value, lockedLines]);

  useEffect(() => {
    if (editorRef.current) editorRef.current.setOption("readOnly", readOnly);
  }, [readOnly]);

  return (
    <>
      <div className="editor-host" ref={hostRef} />
      {tip && (
        <div className="debug-tip" style={{ left: tip.x + 12, top: tip.y + 16 }}>
          {tip.text}
        </div>
      )}
    </>
  );
}

// ---------- Debugger panel ----------

// `line` (1-based) se shuru hone wala { ... } block, jaise `return () => { ... };`
function codeBlockAt(source, line) {
  const lines = source.split("\n");
  const out = [];
  let depth = 0;
  let opened = false;
  for (let i = line - 1; i < lines.length; i++) {
    out.push(lines[i]);
    for (const ch of lines[i]) {
      if (ch === "{") { depth++; opened = true; }
      else if (ch === "}") depth--;
    }
    if (opened && depth <= 0) break;
  }
  // sabse kam indentation hata do
  const indent = Math.min(...out.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
  return out.map((l) => l.slice(indent)).join("\n");
}

const PANEL_HEIGHT_KEY = "hooks-playground:debugPanelHeight";

const SPEEDS = [
  { label: "Slow", ms: 900 },
  { label: "Normal", ms: 450 },
  { label: "Fast", ms: 150 },
];

function DebugPanel({ steps, stepIndex, playing, speed, limitReached, started, source, onStep, onTogglePlay, onSpeed }) {
  const step = steps[stepIndex];
  const last = steps.length - 1;
  const vars = step ? Object.entries(step.vars) : [];
  const off = !started; // "Render UI" se pehle Next/Continue band

  // Panel ki height: upar wali patti ko drag karke badlo (browser mein yaad rehti hai)
  const [height, setHeight] = useState(() => {
    try { return Number(localStorage.getItem(PANEL_HEIGHT_KEY)) || 170; } catch (e) { return 170; }
  });

  function startResize(e) {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;
    const maxHeight = window.innerHeight * 0.75;
    let latest = startHeight;
    document.body.classList.add("resizing"); // drag ke waqt iframes mouse na pakdein

    function onMove(ev) {
      latest = Math.round(Math.min(maxHeight, Math.max(80, startHeight + (startY - ev.clientY))));
      setHeight(latest);
    }
    function onUp() {
      document.body.classList.remove("resizing");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      try { localStorage.setItem(PANEL_HEIGHT_KEY, String(latest)); } catch (err) {}
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <section className="debug-panel" style={{ height }}>
      <div className="debug-resize" onMouseDown={startResize} title="Drag to resize" />
      <div className="debug-controls">
        <button className="small" onClick={() => onStep(0)} disabled={off || stepIndex <= 0} title="First step">⏮</button>
        <button className="small" onClick={() => onStep(stepIndex - 1)} disabled={off || stepIndex <= 0} title="Previous step">◀</button>
        <button className="small play" onClick={onTogglePlay} disabled={off} title={playing ? "Pause" : "Continue: run the steps automatically"}>
          {playing ? "⏸ Pause" : "▶ Continue"}
        </button>
        <button className="small next" onClick={() => onStep(stepIndex + 1)} disabled={off || stepIndex >= last} title="Next step (F10)">
          Next ⤵
        </button>
        <button className="small" onClick={() => onStep(last)} disabled={off || stepIndex >= last} title="Last step">⏭</button>
        <span className="debug-status">
          {limitReached && "Step limit reached, later steps were not recorded"}
        </span>
        <select className="speed" value={speed} onChange={(e) => onSpeed(Number(e.target.value))}>
          {SPEEDS.map((s) => (
            <option key={s.ms} value={s.ms}>{s.label}</option>
          ))}
        </select>
      </div>
      <div className="debug-vars">
        {step && step.commit && (
          <span className="debug-event">🖼 Commit: React updates the screen (DOM) now. useEffect runs after this.</span>
        )}
        {step && step.cleanup === "stored" && (
          <div className="debug-event">
            🗄 React stored this cleanup function from {step.hook}. It runs before this effect runs again, or when
            the component is removed. It remembers the values below.
          </div>
        )}
        {step && step.cleanup === "called" && (
          <div className="debug-event">
            🗄 React calls the cleanup function it stored earlier ({step.hook}). It still has the old values below.
          </div>
        )}
        {step && step.cleanup && <pre className="debug-code">{codeBlockAt(source, step.line)}</pre>}
        {step && !step.event && !step.commit && vars.length === 0 && <span className="debug-empty">No variables at this step</span>}
        {!started && steps.length > 0 && (
          <span className="debug-empty">
            Press ▶ Render UI (first time) at the top to step through the first render, or click something in the preview.
          </span>
        )}
        {vars.map(([name, val]) => (
          <div key={name} className="debug-var">
            <span className="var-name">{name}</span> = <span className="var-value">{val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Console panel ----------

const NEWEST_FIRST_KEY = "hooks-playground:consoleNewestFirst";

// `visibleUpTo`: debug mode mein sirf wahi logs dikhte hain jin tak debugger pahunch chuka hai
function ConsolePanel({ logs, visibleUpTo, onClear }) {
  const bodyRef = useRef(null);
  const [newestFirst, setNewestFirst] = useState(() => {
    // Default: checked (sirf user ne uncheck kiya ho tab false)
    try { return localStorage.getItem(NEWEST_FIRST_KEY) !== "false"; } catch (e) { return true; }
  });

  function toggleOrder(checked) {
    setNewestFirst(checked);
    try { localStorage.setItem(NEWEST_FIRST_KEY, String(checked)); } catch (e) {}
  }

  // Naya log jahan aata hai (upar ya neeche), wahin scroll
  useEffect(() => {
    bodyRef.current.scrollTop = newestFirst ? 0 : bodyRef.current.scrollHeight;
  }, [logs, newestFirst, visibleUpTo]);

  const visible = visibleUpTo == null
    ? logs
    : logs.filter((log) => log.step == null || log.step <= visibleUpTo);
  const shown = newestFirst ? [...visible].reverse() : visible;

  return (
    <section className="console">
      <div className="pane-header">
        <span>Console</span>
        <div className="console-actions">
          <label className="order-toggle">
            <input type="checkbox" checked={newestFirst} onChange={(e) => toggleOrder(e.target.checked)} />
            Newest first
          </label>
          <button className="small" onClick={onClear}>Clear</button>
        </div>
      </div>
      <div className="console-body" ref={bodyRef}>
        {shown.map((log, i) => (
          <pre key={i} className={"log log-" + log.level}>{log.text}</pre>
        ))}
      </div>
    </section>
  );
}

// ---------- Main app ----------

function Playground() {
  // URL hash: "#useState/2" = useState ka Example 2 (refresh par wahi page khula rahe)
  const [selected, setSelected] = useState(() => {
    const index = HOOKS.findIndex((h) => h.name === window.location.hash.slice(1).split("/")[0]);
    return index === -1 ? 0 : index;
  });
  const [exampleIndex, setExampleIndex] = useState(() => {
    const n = Number(window.location.hash.split("/")[1]) - 1;
    const count = HOOKS[selected] ? HOOKS[selected].examples.length : 1;
    return n >= 0 && n < count ? n : 0;
  });
  const currentHook = HOOKS[selected];
  // Abhi khula page (example). Neeche ka sara code isi ko "hook" kehta hai.
  const hook = PAGES.find((p) => p.hookName === currentHook.name && p.number === exampleIndex + 1);
  const [activeFile, setActiveFile] = useState(hook.file);

  // files = { [path]: { original, code } }; ref = async code ke liye hamesha latest copy
  const [files, setFiles] = useState({});
  const filesRef = useRef({});
  const [srcDoc, setSrcDoc] = useState("");
  const [runId, setRunId] = useState(0);
  const [logs, setLogs] = useState([]);
  const iframeRef = useRef(null);
  const runCounter = useRef(0);

  // Debugger
  const [debug, setDebug] = useState(false);
  const debugRef = useRef(false);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(SPEEDS[1].ms);
  const [limitReached, setLimitReached] = useState(false);
  const stepsStaleRef = useRef(false);
  // Debug mode: chhupa hua iframe jahan click pehle chal kar steps record hote hain
  const [shadowDoc, setShadowDoc] = useState("");
  const shadowRef = useRef(null);
  // Preview mein roke gaye interactions, order mein: { id, event, status, index, commitIndex }
  //   status "waiting" = shadow ka jawab nahi aaya, "ready" = turant preview mein chalao,
  //   "steps" = isse code chala; debugger iske Commit step tak pahunche tab preview mein chalao
  const [pending, setPending] = useState([]);
  const pendingRef = useRef([]);
  const eventIdRef = useRef(0);
  function updatePending(fn) {
    pendingRef.current = fn(pendingRef.current);
    setPending(pendingRef.current);
  }
  const lastShadowMsgRef = useRef(0);
  // Debugger shuru hua? ("Render UI" dabaya ya preview mein click hua). Tab tak Next/Continue band.
  const [started, setStarted] = useState(false);
  const stepIndexRef = useRef(-1);
  stepIndexRef.current = stepIndex;
  const jumpFromRef = useRef(null); // click wala step: agla code step aate hi wahan jaao
  const causeRef = useRef(null); // aakhri click/typing, steps ke saath dikhta hai
  // Render UI (first time): preview tab dikhe jab debugger pehle Commit step par pahunche.
  // null = intezaar nahi, "waiting" = commit step abhi aaya nahi, number = commit step ka index
  const [mountWait, setMountWait] = useState(null);

  function clearSteps() {
    setSteps([]);
    setStepIndex(-1);
    setLimitReached(false);
    updatePending(() => []);
    setStarted(false);
    jumpFromRef.current = null;
    causeRef.current = null;
  }

  // "Render UI (first time)": kabhi bhi dabao. Debug off ho to on karta hai, App ko naye sire se
  // chalata hai, aur pehla step aate hi debugger pehli line par ruk jaata hai.
  const startOnFirstStepRef = useRef(false);
  function renderFirstTime() {
    startOnFirstStepRef.current = true;
    if (!debugRef.current) {
      debugRef.current = true;
      setDebug(true);
    }
    run(hook);
  }

  // Play mode: ek-ek step aage badho; aakhri step par ruk kar naye steps (button click) ka intezaar
  useEffect(() => {
    if (!debug || !playing || stepIndex >= steps.length - 1) return;
    const id = setTimeout(() => setStepIndex((i) => i + 1), speed);
    return () => clearTimeout(id);
  }, [debug, playing, stepIndex, steps.length, speed]);

  // Debugger pehle render ke Commit step par pahuncha: ab preview mein UI dikhao
  useEffect(() => {
    if (typeof mountWait !== "number" || stepIndex < mountWait) return;
    if (iframeRef.current) iframeRef.current.contentWindow.postMessage({ source: "hooks-mount" }, "*");
    setMountWait(null);
  }, [mountWait, stepIndex]);

  function applyToPreview(item) {
    if (iframeRef.current) iframeRef.current.contentWindow.postMessage({ source: "hooks-apply", event: item.event }, "*");
    updatePending((p) => p.filter((x) => x.id !== item.id));
  }

  // Queue ka pehla interaction preview mein kab chale:
  //   - "ready": turant
  //   - "steps": debugger iske Commit step par pahunche tab (UI update, bilkul React jaisa).
  //     Commit hi na hua ho (state nahi badli) to iske saare steps ke baad; tab shadow
  //     250ms tak shaant rahe, taaki baaki steps bhi aa jaayein.
  useEffect(() => {
    if (!debug || pending.length === 0) return;
    const first = pending[0];
    if (first.status === "waiting") return;
    if (first.status === "ready") return applyToPreview(first);
    const next = pending.find((p, i) => i > 0 && p.index != null);
    const lastStepOfEvent = (next ? next.index : steps.length) - 1;
    const hasCommit = first.commitIndex != null;
    if (stepIndex < (hasCommit ? first.commitIndex : lastStepOfEvent)) return;
    const wait = hasCommit ? 0 : Math.max(0, 250 - (Date.now() - lastShadowMsgRef.current));
    const id = setTimeout(() => applyToPreview(first), wait);
    return () => clearTimeout(id);
  }, [debug, pending, stepIndex, steps.length]);

  function toggleDebug() {
    startOnFirstStepRef.current = false;
    debugRef.current = !debug;
    setDebug(!debug);
    setPlaying(false);
    run(hook);
  }

  function updateFile(path, patch) {
    filesRef.current = { ...filesRef.current, [path]: { ...filesRef.current[path], ...patch } };
    setFiles(filesRef.current);
  }

  // File ka current code (edited ya original). Pehli baar server se laata hai,
  // main.jsx template se banti hai.
  async function getSource(path) {
    if (!filesRef.current[path]) {
      let original;
      const mainHook = PAGES.find((p) => mainPath(p) === path);
      if (mainHook) {
        original = mainTemplate(mainHook);
      } else {
        const res = await fetch("./" + path, { cache: "no-store" });
        if (!res.ok) throw new Error(`File not found: ${path} (HTTP ${res.status})`);
        original = await res.text();
      }
      const saved = mainHook ? null : loadSaved(path);
      if (!filesRef.current[path]) updateFile(path, { original, code: saved ?? original });
    }
    return filesRef.current[path].code;
  }

  async function run(hook) {
    const thisRun = ++runCounter.current;
    const debugging = debugRef.current;
    const deferMount = debugging && startOnFirstStepRef.current;
    let doc;
    let shadow = "";
    let error = null;
    try {
      doc = await buildPreview(hook, getSource, debugging ? "visible-debug" : "normal", deferMount);
      if (debugging) shadow = await buildPreview(hook, getSource, "shadow");
    } catch (err) {
      doc = ERROR_DOC;
      shadow = "";
      error = err.message;
    }
    if (thisRun !== runCounter.current) return; // beech mein naya run shuru ho gaya
    setLogs(error ? [{ level: "error", text: error }] : []);
    clearSteps();
    setMountWait(deferMount && !error ? "waiting" : null);
    stepsStaleRef.current = false;
    setPlaying(false); // Continue button ya preview mein click se hi steps chalenge
    setSrcDoc(doc);
    setShadowDoc(shadow);
    setRunId(thisRun); // naya iframe = component bilkul fresh start
  }

  // Section select hone par: uski file editor mein kholo aur App run karo
  useEffect(() => {
    setActiveFile(hook.file);
    getSource(hook.file).catch((err) => setLogs([{ level: "error", text: err.message }]));
    run(hook);
  }, [selected, exampleIndex]);

  // Iframe se aaye console messages Console panel mein daalo
  useEffect(() => {
    function onMessage(e) {
      if (!e.data) return;
      // Sirf current iframes ke messages (purane run ke nahi)
      const visible = iframeRef.current && iframeRef.current.contentWindow;
      const shadow = shadowRef.current && shadowRef.current.contentWindow;
      const fromVisible = !!visible && e.source === visible;
      const fromShadow = !!shadow && e.source === shadow;
      if (!fromVisible && !fromShadow) return;

      // Preview ke andar F10 dabaya (focus iframe mein hai)
      if (e.data.source === "hooks-debug-key") {
        nextStepRef.current();
        return;
      }

      // Visible preview mein koi interaction hua: pehle shadow mein chalao (steps record honge)
      if (e.data.source === "hooks-intercept") {
        if (!fromVisible) return;
        const ev = e.data.event;
        if (stepsStaleRef.current || !shadow) {
          // code edit ho chuka hai (Run nahi dabaya): debugger ke bina seedha chalao
          visible.postMessage({ source: "hooks-apply", event: ev }, "*");
          return;
        }
        const id = ++eventIdRef.current;
        updatePending((p) => [...p, { id, event: ev, status: "waiting" }]);
        shadow.postMessage({ source: "hooks-replay", id, event: ev }, "*");
        return;
      }

      if (e.data.source === "hooks-debug") {
        if (!fromShadow || stepsStaleRef.current) return; // code edit ho chuka hai, Run ka intezaar
        lastShadowMsgRef.current = Date.now();
        if (e.data.limit) return setLimitReached(true);
        const { event, line, vars, index, id, timer } = e.data;

        // Interaction se user ka koi code nahi chala: debugger nahi rukega.
        // Jiska default kaam roka tha (click, submit) wo preview mein chalega, baaki chhod do.
        if (e.data.silent) {
          updatePending((p) => {
            const item = p.find((x) => x.id === id);
            if (!item) return p;
            if (item.event.blocked) return p.map((x) => (x.id === id ? { ...x, status: "ready" } : x));
            return p.filter((x) => x.id !== id);
          });
          return;
        }

        // Commit: React ne naya UI screen (DOM) par lagaya
        if (e.data.commit) {
          setSteps((s) => [...s, { commit: true, vars: {}, cause: causeRef.current }]);
          setMountWait((m) => (m === "waiting" ? index : m));
          // Is commit se pehle wala, abhi tak bina commit ka interaction: preview isi step par update hoga
          updatePending((p) => {
            const i = p.findIndex((c) => c.status === "steps" && c.commitIndex == null && c.index < index);
            if (i === -1) return p;
            const next = p.slice();
            next[i] = { ...next[i], commitIndex: index };
            return next;
          });
          return;
        }

        setSteps((s) => [
          ...s,
          event
            ? { event, vars: {} }
            : { line, vars, cause: causeRef.current, cleanup: e.data.cleanup, hook: e.data.hook },
        ]);

        // "Render UI (first time)" dabaya tha: pehle step par ruko
        if (!event && index === 0 && startOnFirstStepRef.current) {
          startOnFirstStepRef.current = false;
          setStarted(true);
          setPlaying(false);
          setStepIndex(0);
          stepIndexRef.current = 0;
          return;
        }

        if (event) {
          causeRef.current = event;
          if (timer) return; // setTimeout/setInterval: step dikhega, par debugger wahan jump nahi karega
          // Pichla interaction abhi debugger mein chal raha ho to ye uske baad aayega (Next se)
          const busy = pendingRef.current.some((p) => p.id !== id && p.status === "steps");
          updatePending((p) => p.map((x) => (x.id === id ? { ...x, status: "steps", index } : x)));
          if (busy) return;
          // Interaction par rukna; agla step (jaise onChange/onClick wali line) aate hi wahan highlight
          setStarted(true);
          setStepIndex(index);
          stepIndexRef.current = index;
          jumpFromRef.current = index;
          setPlaying(false);
        } else if (jumpFromRef.current === index - 1 && stepIndexRef.current === index - 1) {
          jumpFromRef.current = null;
          setStepIndex(index);
          stepIndexRef.current = index;
        }
        return;
      }

      if (e.data.source !== "hooks-preview") return;
      // Debug mode mein logs shadow se aate hain (step ke saath), visible preview ke nahi
      if (debugRef.current ? !fromShadow : !fromVisible) return;
      if (fromShadow) lastShadowMsgRef.current = Date.now();
      const { level, text, step } = e.data;
      setLogs((l) => {
        // React (dev mode) wahi error 2-3 baar bhejta hai; ek hi baar dikhao
        if (level === "error" && l.some((log) => log.level === "error" && log.text === text)) return l;
        return [...l, { level, text, step }];
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function select(index) {
    setSelected(index);
    setExampleIndex(0);
    window.location.hash = HOOKS[index].name;
  }

  function selectExample(index) {
    setExampleIndex(index);
    window.location.hash = `${currentHook.name}/${index + 1}`;
  }

  const active = files[activeFile];
  const isMain = activeFile === mainPath(hook);
  const isModified = (path) => files[path] && files[path].code !== files[path].original;

  function handleChange(value) {
    if (isMain) return;
    // code badla: purane steps ki lines ab galat ho sakti hain, Run tak naye steps bhi nahi lenge
    clearSteps();
    stepsStaleRef.current = true;
    updateFile(activeFile, { code: value });
    if (value === filesRef.current[activeFile].original) clearSaved(activeFile);
    else saveCode(activeFile, value);
  }

  function reset() {
    if (!active) return;
    clearSaved(activeFile);
    updateFile(activeFile, { code: active.original });
    run(hook);
  }

  const tabs = [hook.file];
  const currentStep = debug ? steps[stepIndex] : null;

  function goToStep(index) {
    setPlaying(false);
    setStepIndex(Math.max(0, Math.min(index, steps.length - 1)));
  }

  // Next step: button, F10 (yahan ya preview ke andar)
  const nextStepRef = useRef(() => {});
  nextStepRef.current = () => {
    if (debug && started && stepIndex < steps.length - 1) goToStep(stepIndex + 1);
  };

  useEffect(() => {
    function onKey(e) {
      if (e.key !== "F10") return;
      e.preventDefault();
      nextStepRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="layout">
      <nav className="sidebar">
        <h1>React Hooks</h1>
        {HOOKS.map((h, index) => (
          <button
            key={h.name}
            className={index === selected ? "active" : ""}
            onClick={() => select(index)}
          >
            {h.name}
          </button>
        ))}
      </nav>

      <main className="main">
        <header className="toolbar">
          <div className="title">
            <strong>{currentHook.name}</strong>
            {isModified(activeFile) && <span className="badge">Modified</span>}
          </div>
          <div className="actions">
            <button
              className="secondary render-first"
              onClick={renderFirstTime}
              title="Render the App fresh and step through its first render"
            >
              ▶ Render UI (first time)
            </button>
            <button
              className={debug ? "secondary debug-on" : "secondary"}
              onClick={toggleDebug}
              title="See the code run step by step"
            >
              🐞 Debug {debug ? "On" : "Off"}
            </button>
            <button
              className="secondary"
              onClick={reset}
              disabled={!isModified(activeFile)}
              title={`Restore ${displayName(activeFile)} to its original code`}
            >
              ↺ Reset
            </button>
            <button className="primary" onClick={() => run(hook)} title="Ctrl + Enter">
              ▶ Run
            </button>
          </div>
        </header>

        {/* Is hook ke example pages */}
        <nav className="examples">
          {currentHook.examples.map((title, i) => {
            const page = PAGES.find((p) => p.hookName === currentHook.name && p.number === i + 1);
            return (
              <button
                key={title}
                className={i === exampleIndex ? "example active" : "example"}
                onClick={() => selectExample(i)}
              >
                <span className="example-number">{i + 1}</span>
                {title}
                {isModified(page.file) && <span className="dot" title="Modified">●</span>}
              </button>
            );
          })}
        </nav>

        <div className="workspace">
          <section className="editor-pane">
            <div className="tabs">
              {tabs.map((path) => (
                <button
                  key={path}
                  className={path === activeFile ? "tab active" : "tab"}
                  onClick={() => setActiveFile(path)}
                >
                  {displayName(path)}
                  {isModified(path) && <span className="dot" title="Modified">●</span>}
                </button>
              ))}
            </div>
            <div className="editor-wrap">
              <CodeEditor
                value={active ? active.code : ""}
                readOnly={!active || isMain}
                lockedLines={active && active.code.startsWith(HOOK_FILE_HEADER) ? HOOK_FILE_HEADER_LINES : 0}
                highlightLine={currentStep ? currentStep.line - 1 : -1}
                hoverValues={currentStep ? currentStep.vars : null}
                onChange={handleChange}
                onRun={() => run(hook)}
              />
            </div>
            {debug && (
              <DebugPanel
                steps={steps}
                stepIndex={stepIndex}
                playing={playing}
                speed={speed}
                limitReached={limitReached}
                onStep={goToStep}
                started={started}
                source={active ? active.code : ""}
                onTogglePlay={() => setPlaying(!playing)}
                onSpeed={setSpeed}
              />
            )}
          </section>

          <section className="right-pane">
            <div className="preview">
              <div className="pane-header">
                <span>Preview</span>
                {debug && (pending.some((p) => p.status === "steps") || mountWait !== null) && (
                  <span className="ui-paused">⏸ The UI updates at the Commit step</span>
                )}
              </div>
              <iframe
                key={runId}
                ref={iframeRef}
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
                srcDoc={srcDoc}
              />
              {/* Debug mode: click pehle yahan chalta hai aur steps record hote hain (dikhta nahi) */}
              {shadowDoc && (
                <iframe
                  key={"shadow-" + runId}
                  ref={shadowRef}
                  title="Debugger"
                  className="shadow-frame"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  srcDoc={shadowDoc}
                />
              )}
            </div>
            <ConsolePanel
              logs={logs}
              visibleUpTo={debug && !stepsStaleRef.current ? stepIndex : null}
              onClear={() => setLogs([])}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Playground />);
