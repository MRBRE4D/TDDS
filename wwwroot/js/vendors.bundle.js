var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var mithril = { exports: {} };
(function(module) {
  (function() {
    function Vnode(tag, key, attrs0, children, text, dom) {
      return { tag, key, attrs: attrs0, children, text, dom, domSize: void 0, state: void 0, events: void 0, instance: void 0 };
    }
    Vnode.normalize = function(node) {
      if (Array.isArray(node)) return Vnode("[", void 0, void 0, Vnode.normalizeChildren(node), void 0, void 0);
      if (node == null || typeof node === "boolean") return null;
      if (typeof node === "object") return node;
      return Vnode("#", void 0, void 0, String(node), void 0, void 0);
    };
    Vnode.normalizeChildren = function(input) {
      var children = [];
      if (input.length) {
        var isKeyed = input[0] != null && input[0].key != null;
        for (var i = 1; i < input.length; i++) {
          if ((input[i] != null && input[i].key != null) !== isKeyed) {
            throw new TypeError(
              isKeyed && (input[i] != null || typeof input[i] === "boolean") ? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole." : "In fragments, vnodes must either all have keys or none have keys."
            );
          }
        }
        for (var i = 0; i < input.length; i++) {
          children[i] = Vnode.normalize(input[i]);
        }
      }
      return children;
    };
    var hyperscriptVnode = function() {
      var attrs1 = arguments[this], start = this + 1, children0;
      if (attrs1 == null) {
        attrs1 = {};
      } else if (typeof attrs1 !== "object" || attrs1.tag != null || Array.isArray(attrs1)) {
        attrs1 = {};
        start = this;
      }
      if (arguments.length === start + 1) {
        children0 = arguments[start];
        if (!Array.isArray(children0)) children0 = [children0];
      } else {
        children0 = [];
        while (start < arguments.length) children0.push(arguments[start++]);
      }
      return Vnode("", attrs1.key, attrs1, children0);
    };
    var hasOwn = {}.hasOwnProperty;
    var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
    var selectorCache = {};
    function isEmpty(object) {
      for (var key in object) if (hasOwn.call(object, key)) return false;
      return true;
    }
    function compileSelector(selector) {
      var match, tag = "div", classes = [], attrs = {};
      while (match = selectorParser.exec(selector)) {
        var type = match[1], value = match[2];
        if (type === "" && value !== "") tag = value;
        else if (type === "#") attrs.id = value;
        else if (type === ".") classes.push(value);
        else if (match[3][0] === "[") {
          var attrValue = match[6];
          if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
          if (match[4] === "class") classes.push(attrValue);
          else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
        }
      }
      if (classes.length > 0) attrs.className = classes.join(" ");
      return selectorCache[selector] = { tag, attrs };
    }
    function execSelector(state, vnode) {
      var attrs = vnode.attrs;
      var hasClass = hasOwn.call(attrs, "class");
      var className = hasClass ? attrs.class : attrs.className;
      vnode.tag = state.tag;
      vnode.attrs = {};
      if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
        var newAttrs = {};
        for (var key in attrs) {
          if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key];
        }
        attrs = newAttrs;
      }
      for (var key in state.attrs) {
        if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)) {
          attrs[key] = state.attrs[key];
        }
      }
      if (className != null || state.attrs.className != null) attrs.className = className != null ? state.attrs.className != null ? String(state.attrs.className) + " " + String(className) : className : state.attrs.className != null ? state.attrs.className : null;
      if (hasClass) attrs.class = null;
      for (var key in attrs) {
        if (hasOwn.call(attrs, key) && key !== "key") {
          vnode.attrs = attrs;
          break;
        }
      }
      return vnode;
    }
    function hyperscript(selector) {
      if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
        throw Error("The selector must be either a string or a component.");
      }
      var vnode = hyperscriptVnode.apply(1, arguments);
      if (typeof selector === "string") {
        vnode.children = Vnode.normalizeChildren(vnode.children);
        if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode);
      }
      vnode.tag = selector;
      return vnode;
    }
    hyperscript.trust = function(html) {
      if (html == null) html = "";
      return Vnode("<", void 0, void 0, html, void 0, void 0);
    };
    hyperscript.fragment = function() {
      var vnode2 = hyperscriptVnode.apply(0, arguments);
      vnode2.tag = "[";
      vnode2.children = Vnode.normalizeChildren(vnode2.children);
      return vnode2;
    };
    var PromisePolyfill = function(executor) {
      if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with 'new'.");
      if (typeof executor !== "function") throw new TypeError("executor must be a function.");
      var self2 = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
      var instance = self2._instance = { resolvers, rejectors };
      var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
      function handler(list, shouldAbsorb) {
        return function execute(value) {
          var then;
          try {
            if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
              if (value === self2) throw new TypeError("Promise can't be resolved with itself.");
              executeOnce(then.bind(value));
            } else {
              callAsync(function() {
                if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value);
                for (var i = 0; i < list.length; i++) list[i](value);
                resolvers.length = 0, rejectors.length = 0;
                instance.state = shouldAbsorb;
                instance.retry = function() {
                  execute(value);
                };
              });
            }
          } catch (e) {
            rejectCurrent(e);
          }
        };
      }
      function executeOnce(then) {
        var runs = 0;
        function run(fn) {
          return function(value) {
            if (runs++ > 0) return;
            fn(value);
          };
        }
        var onerror = run(rejectCurrent);
        try {
          then(run(resolveCurrent), onerror);
        } catch (e) {
          onerror(e);
        }
      }
      executeOnce(executor);
    };
    PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
      var self2 = this, instance = self2._instance;
      function handle(callback, list, next, state) {
        list.push(function(value) {
          if (typeof callback !== "function") next(value);
          else try {
            resolveNext(callback(value));
          } catch (e) {
            if (rejectNext) rejectNext(e);
          }
        });
        if (typeof instance.retry === "function" && state === instance.state) instance.retry();
      }
      var resolveNext, rejectNext;
      var promise = new PromisePolyfill(function(resolve, reject) {
        resolveNext = resolve, rejectNext = reject;
      });
      handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
      return promise;
    };
    PromisePolyfill.prototype.catch = function(onRejection) {
      return this.then(null, onRejection);
    };
    PromisePolyfill.prototype.finally = function(callback) {
      return this.then(
        function(value) {
          return PromisePolyfill.resolve(callback()).then(function() {
            return value;
          });
        },
        function(reason) {
          return PromisePolyfill.resolve(callback()).then(function() {
            return PromisePolyfill.reject(reason);
          });
        }
      );
    };
    PromisePolyfill.resolve = function(value) {
      if (value instanceof PromisePolyfill) return value;
      return new PromisePolyfill(function(resolve) {
        resolve(value);
      });
    };
    PromisePolyfill.reject = function(value) {
      return new PromisePolyfill(function(resolve, reject) {
        reject(value);
      });
    };
    PromisePolyfill.all = function(list) {
      return new PromisePolyfill(function(resolve, reject) {
        var total = list.length, count = 0, values = [];
        if (list.length === 0) resolve([]);
        else for (var i = 0; i < list.length; i++) {
          (function(i2) {
            function consume(value) {
              count++;
              values[i2] = value;
              if (count === total) resolve(values);
            }
            if (list[i2] != null && (typeof list[i2] === "object" || typeof list[i2] === "function") && typeof list[i2].then === "function") {
              list[i2].then(consume, reject);
            } else consume(list[i2]);
          })(i);
        }
      });
    };
    PromisePolyfill.race = function(list) {
      return new PromisePolyfill(function(resolve, reject) {
        for (var i = 0; i < list.length; i++) {
          list[i].then(resolve, reject);
        }
      });
    };
    if (typeof window !== "undefined") {
      if (typeof window.Promise === "undefined") {
        window.Promise = PromisePolyfill;
      } else if (!window.Promise.prototype.finally) {
        window.Promise.prototype.finally = PromisePolyfill.prototype.finally;
      }
      var PromisePolyfill = window.Promise;
    } else if (typeof commonjsGlobal !== "undefined") {
      if (typeof commonjsGlobal.Promise === "undefined") {
        commonjsGlobal.Promise = PromisePolyfill;
      } else if (!commonjsGlobal.Promise.prototype.finally) {
        commonjsGlobal.Promise.prototype.finally = PromisePolyfill.prototype.finally;
      }
      var PromisePolyfill = commonjsGlobal.Promise;
    } else ;
    var _13 = function($window) {
      var $doc = $window && $window.document;
      var currentRedraw;
      var nameSpace = {
        svg: "http://www.w3.org/2000/svg",
        math: "http://www.w3.org/1998/Math/MathML"
      };
      function getNameSpace(vnode3) {
        return vnode3.attrs && vnode3.attrs.xmlns || nameSpace[vnode3.tag];
      }
      function checkState(vnode3, original) {
        if (vnode3.state !== original) throw new Error("'vnode.state' must not be modified.");
      }
      function callHook(vnode3) {
        var original = vnode3.state;
        try {
          return this.apply(original, arguments);
        } finally {
          checkState(vnode3, original);
        }
      }
      function activeElement() {
        try {
          return $doc.activeElement;
        } catch (e) {
          return null;
        }
      }
      function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
        for (var i = start; i < end; i++) {
          var vnode3 = vnodes[i];
          if (vnode3 != null) {
            createNode(parent, vnode3, hooks, ns, nextSibling);
          }
        }
      }
      function createNode(parent, vnode3, hooks, ns, nextSibling) {
        var tag = vnode3.tag;
        if (typeof tag === "string") {
          vnode3.state = {};
          if (vnode3.attrs != null) initLifecycle(vnode3.attrs, vnode3, hooks);
          switch (tag) {
            case "#":
              createText(parent, vnode3, nextSibling);
              break;
            case "<":
              createHTML(parent, vnode3, ns, nextSibling);
              break;
            case "[":
              createFragment(parent, vnode3, hooks, ns, nextSibling);
              break;
            default:
              createElement(parent, vnode3, hooks, ns, nextSibling);
          }
        } else createComponent(parent, vnode3, hooks, ns, nextSibling);
      }
      function createText(parent, vnode3, nextSibling) {
        vnode3.dom = $doc.createTextNode(vnode3.children);
        insertNode(parent, vnode3.dom, nextSibling);
      }
      var possibleParents = { caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup" };
      function createHTML(parent, vnode3, ns, nextSibling) {
        var match0 = vnode3.children.match(/^\s*?<(\w+)/im) || [];
        var temp = $doc.createElement(possibleParents[match0[1]] || "div");
        if (ns === "http://www.w3.org/2000/svg") {
          temp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + vnode3.children + "</svg>";
          temp = temp.firstChild;
        } else {
          temp.innerHTML = vnode3.children;
        }
        vnode3.dom = temp.firstChild;
        vnode3.domSize = temp.childNodes.length;
        vnode3.instance = [];
        var fragment = $doc.createDocumentFragment();
        var child;
        while (child = temp.firstChild) {
          vnode3.instance.push(child);
          fragment.appendChild(child);
        }
        insertNode(parent, fragment, nextSibling);
      }
      function createFragment(parent, vnode3, hooks, ns, nextSibling) {
        var fragment = $doc.createDocumentFragment();
        if (vnode3.children != null) {
          var children2 = vnode3.children;
          createNodes(fragment, children2, 0, children2.length, hooks, null, ns);
        }
        vnode3.dom = fragment.firstChild;
        vnode3.domSize = fragment.childNodes.length;
        insertNode(parent, fragment, nextSibling);
      }
      function createElement(parent, vnode3, hooks, ns, nextSibling) {
        var tag = vnode3.tag;
        var attrs2 = vnode3.attrs;
        var is = attrs2 && attrs2.is;
        ns = getNameSpace(vnode3) || ns;
        var element = ns ? is ? $doc.createElementNS(ns, tag, { is }) : $doc.createElementNS(ns, tag) : is ? $doc.createElement(tag, { is }) : $doc.createElement(tag);
        vnode3.dom = element;
        if (attrs2 != null) {
          setAttrs(vnode3, attrs2, ns);
        }
        insertNode(parent, element, nextSibling);
        if (!maybeSetContentEditable(vnode3)) {
          if (vnode3.children != null) {
            var children2 = vnode3.children;
            createNodes(element, children2, 0, children2.length, hooks, null, ns);
            if (vnode3.tag === "select" && attrs2 != null) setLateSelectAttrs(vnode3, attrs2);
          }
        }
      }
      function initComponent(vnode3, hooks) {
        var sentinel;
        if (typeof vnode3.tag.view === "function") {
          vnode3.state = Object.create(vnode3.tag);
          sentinel = vnode3.state.view;
          if (sentinel.$$reentrantLock$$ != null) return;
          sentinel.$$reentrantLock$$ = true;
        } else {
          vnode3.state = void 0;
          sentinel = vnode3.tag;
          if (sentinel.$$reentrantLock$$ != null) return;
          sentinel.$$reentrantLock$$ = true;
          vnode3.state = vnode3.tag.prototype != null && typeof vnode3.tag.prototype.view === "function" ? new vnode3.tag(vnode3) : vnode3.tag(vnode3);
        }
        initLifecycle(vnode3.state, vnode3, hooks);
        if (vnode3.attrs != null) initLifecycle(vnode3.attrs, vnode3, hooks);
        vnode3.instance = Vnode.normalize(callHook.call(vnode3.state.view, vnode3));
        if (vnode3.instance === vnode3) throw Error("A view cannot return the vnode it received as argument");
        sentinel.$$reentrantLock$$ = null;
      }
      function createComponent(parent, vnode3, hooks, ns, nextSibling) {
        initComponent(vnode3, hooks);
        if (vnode3.instance != null) {
          createNode(parent, vnode3.instance, hooks, ns, nextSibling);
          vnode3.dom = vnode3.instance.dom;
          vnode3.domSize = vnode3.dom != null ? vnode3.instance.domSize : 0;
        } else {
          vnode3.domSize = 0;
        }
      }
      function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
        if (old === vnodes || old == null && vnodes == null) return;
        else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns);
        else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length);
        else {
          var isOldKeyed = old[0] != null && old[0].key != null;
          var isKeyed0 = vnodes[0] != null && vnodes[0].key != null;
          var start = 0, oldStart = 0;
          if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++;
          if (!isKeyed0) while (start < vnodes.length && vnodes[start] == null) start++;
          if (isOldKeyed !== isKeyed0) {
            removeNodes(parent, old, oldStart, old.length);
            createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
          } else if (!isKeyed0) {
            var commonLength = old.length < vnodes.length ? old.length : vnodes.length;
            start = start < oldStart ? start : oldStart;
            for (; start < commonLength; start++) {
              o = old[start];
              v = vnodes[start];
              if (o === v || o == null && v == null) continue;
              else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling));
              else if (v == null) removeNode(parent, o);
              else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns);
            }
            if (old.length > commonLength) removeNodes(parent, old, start, old.length);
            if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
          } else {
            var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling;
            while (oldEnd >= oldStart && end >= start) {
              oe = old[oldEnd];
              ve = vnodes[end];
              if (oe.key !== ve.key) break;
              if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
              if (ve.dom != null) nextSibling = ve.dom;
              oldEnd--, end--;
            }
            while (oldEnd >= oldStart && end >= start) {
              o = old[oldStart];
              v = vnodes[start];
              if (o.key !== v.key) break;
              oldStart++, start++;
              if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns);
            }
            while (oldEnd >= oldStart && end >= start) {
              if (start === end) break;
              if (o.key !== ve.key || oe.key !== v.key) break;
              topSibling = getNextSibling(old, oldStart, nextSibling);
              moveNodes(parent, oe, topSibling);
              if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns);
              if (++start <= --end) moveNodes(parent, o, nextSibling);
              if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns);
              if (ve.dom != null) nextSibling = ve.dom;
              oldStart++;
              oldEnd--;
              oe = old[oldEnd];
              ve = vnodes[end];
              o = old[oldStart];
              v = vnodes[start];
            }
            while (oldEnd >= oldStart && end >= start) {
              if (oe.key !== ve.key) break;
              if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
              if (ve.dom != null) nextSibling = ve.dom;
              oldEnd--, end--;
              oe = old[oldEnd];
              ve = vnodes[end];
            }
            if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1);
            else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
            else {
              var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li = 0, i = 0, pos = 2147483647, matched = 0, map, lisIndices;
              for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1;
              for (i = end; i >= start; i--) {
                if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1);
                ve = vnodes[i];
                var oldIndex = map[ve.key];
                if (oldIndex != null) {
                  pos = oldIndex < pos ? oldIndex : -1;
                  oldIndices[i - start] = oldIndex;
                  oe = old[oldIndex];
                  old[oldIndex] = null;
                  if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
                  if (ve.dom != null) nextSibling = ve.dom;
                  matched++;
                }
              }
              nextSibling = originalNextSibling;
              if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1);
              if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
              else {
                if (pos === -1) {
                  lisIndices = makeLisIndices(oldIndices);
                  li = lisIndices.length - 1;
                  for (i = end; i >= start; i--) {
                    v = vnodes[i];
                    if (oldIndices[i - start] === -1) createNode(parent, v, hooks, ns, nextSibling);
                    else {
                      if (lisIndices[li] === i - start) li--;
                      else moveNodes(parent, v, nextSibling);
                    }
                    if (v.dom != null) nextSibling = vnodes[i].dom;
                  }
                } else {
                  for (i = end; i >= start; i--) {
                    v = vnodes[i];
                    if (oldIndices[i - start] === -1) createNode(parent, v, hooks, ns, nextSibling);
                    if (v.dom != null) nextSibling = vnodes[i].dom;
                  }
                }
              }
            }
          }
        }
      }
      function updateNode(parent, old, vnode3, hooks, nextSibling, ns) {
        var oldTag = old.tag, tag = vnode3.tag;
        if (oldTag === tag) {
          vnode3.state = old.state;
          vnode3.events = old.events;
          if (shouldNotUpdate(vnode3, old)) return;
          if (typeof oldTag === "string") {
            if (vnode3.attrs != null) {
              updateLifecycle(vnode3.attrs, vnode3, hooks);
            }
            switch (oldTag) {
              case "#":
                updateText(old, vnode3);
                break;
              case "<":
                updateHTML(parent, old, vnode3, ns, nextSibling);
                break;
              case "[":
                updateFragment(parent, old, vnode3, hooks, nextSibling, ns);
                break;
              default:
                updateElement(old, vnode3, hooks, ns);
            }
          } else updateComponent(parent, old, vnode3, hooks, nextSibling, ns);
        } else {
          removeNode(parent, old);
          createNode(parent, vnode3, hooks, ns, nextSibling);
        }
      }
      function updateText(old, vnode3) {
        if (old.children.toString() !== vnode3.children.toString()) {
          old.dom.nodeValue = vnode3.children;
        }
        vnode3.dom = old.dom;
      }
      function updateHTML(parent, old, vnode3, ns, nextSibling) {
        if (old.children !== vnode3.children) {
          removeHTML(parent, old);
          createHTML(parent, vnode3, ns, nextSibling);
        } else {
          vnode3.dom = old.dom;
          vnode3.domSize = old.domSize;
          vnode3.instance = old.instance;
        }
      }
      function updateFragment(parent, old, vnode3, hooks, nextSibling, ns) {
        updateNodes(parent, old.children, vnode3.children, hooks, nextSibling, ns);
        var domSize = 0, children2 = vnode3.children;
        vnode3.dom = null;
        if (children2 != null) {
          for (var i = 0; i < children2.length; i++) {
            var child = children2[i];
            if (child != null && child.dom != null) {
              if (vnode3.dom == null) vnode3.dom = child.dom;
              domSize += child.domSize || 1;
            }
          }
          if (domSize !== 1) vnode3.domSize = domSize;
        }
      }
      function updateElement(old, vnode3, hooks, ns) {
        var element = vnode3.dom = old.dom;
        ns = getNameSpace(vnode3) || ns;
        if (vnode3.tag === "textarea") {
          if (vnode3.attrs == null) vnode3.attrs = {};
        }
        updateAttrs(vnode3, old.attrs, vnode3.attrs, ns);
        if (!maybeSetContentEditable(vnode3)) {
          updateNodes(element, old.children, vnode3.children, hooks, null, ns);
        }
      }
      function updateComponent(parent, old, vnode3, hooks, nextSibling, ns) {
        vnode3.instance = Vnode.normalize(callHook.call(vnode3.state.view, vnode3));
        if (vnode3.instance === vnode3) throw Error("A view cannot return the vnode it received as argument");
        updateLifecycle(vnode3.state, vnode3, hooks);
        if (vnode3.attrs != null) updateLifecycle(vnode3.attrs, vnode3, hooks);
        if (vnode3.instance != null) {
          if (old.instance == null) createNode(parent, vnode3.instance, hooks, ns, nextSibling);
          else updateNode(parent, old.instance, vnode3.instance, hooks, nextSibling, ns);
          vnode3.dom = vnode3.instance.dom;
          vnode3.domSize = vnode3.instance.domSize;
        } else if (old.instance != null) {
          removeNode(parent, old.instance);
          vnode3.dom = void 0;
          vnode3.domSize = 0;
        } else {
          vnode3.dom = old.dom;
          vnode3.domSize = old.domSize;
        }
      }
      function getKeyMap(vnodes, start, end) {
        var map = /* @__PURE__ */ Object.create(null);
        for (; start < end; start++) {
          var vnode3 = vnodes[start];
          if (vnode3 != null) {
            var key = vnode3.key;
            if (key != null) map[key] = start;
          }
        }
        return map;
      }
      var lisTemp = [];
      function makeLisIndices(a) {
        var result = [0];
        var u = 0, v = 0, i = 0;
        var il = lisTemp.length = a.length;
        for (var i = 0; i < il; i++) lisTemp[i] = a[i];
        for (var i = 0; i < il; ++i) {
          if (a[i] === -1) continue;
          var j = result[result.length - 1];
          if (a[j] < a[i]) {
            lisTemp[i] = j;
            result.push(i);
            continue;
          }
          u = 0;
          v = result.length - 1;
          while (u < v) {
            var c = (u >>> 1) + (v >>> 1) + (u & v & 1);
            if (a[result[c]] < a[i]) {
              u = c + 1;
            } else {
              v = c;
            }
          }
          if (a[i] < a[result[u]]) {
            if (u > 0) lisTemp[i] = result[u - 1];
            result[u] = i;
          }
        }
        u = result.length;
        v = result[u - 1];
        while (u-- > 0) {
          result[u] = v;
          v = lisTemp[v];
        }
        lisTemp.length = 0;
        return result;
      }
      function getNextSibling(vnodes, i, nextSibling) {
        for (; i < vnodes.length; i++) {
          if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom;
        }
        return nextSibling;
      }
      function moveNodes(parent, vnode3, nextSibling) {
        var frag = $doc.createDocumentFragment();
        moveChildToFrag(parent, frag, vnode3);
        insertNode(parent, frag, nextSibling);
      }
      function moveChildToFrag(parent, frag, vnode3) {
        while (vnode3.dom != null && vnode3.dom.parentNode === parent) {
          if (typeof vnode3.tag !== "string") {
            vnode3 = vnode3.instance;
            if (vnode3 != null) continue;
          } else if (vnode3.tag === "<") {
            for (var i = 0; i < vnode3.instance.length; i++) {
              frag.appendChild(vnode3.instance[i]);
            }
          } else if (vnode3.tag !== "[") {
            frag.appendChild(vnode3.dom);
          } else if (vnode3.children.length === 1) {
            vnode3 = vnode3.children[0];
            if (vnode3 != null) continue;
          } else {
            for (var i = 0; i < vnode3.children.length; i++) {
              var child = vnode3.children[i];
              if (child != null) moveChildToFrag(parent, frag, child);
            }
          }
          break;
        }
      }
      function insertNode(parent, dom, nextSibling) {
        if (nextSibling != null) parent.insertBefore(dom, nextSibling);
        else parent.appendChild(dom);
      }
      function maybeSetContentEditable(vnode3) {
        if (vnode3.attrs == null || vnode3.attrs.contenteditable == null && // attribute
        vnode3.attrs.contentEditable == null) return false;
        var children2 = vnode3.children;
        if (children2 != null && children2.length === 1 && children2[0].tag === "<") {
          var content = children2[0].children;
          if (vnode3.dom.innerHTML !== content) vnode3.dom.innerHTML = content;
        } else if (children2 != null && children2.length !== 0) throw new Error("Child node of a contenteditable must be trusted.");
        return true;
      }
      function removeNodes(parent, vnodes, start, end) {
        for (var i = start; i < end; i++) {
          var vnode3 = vnodes[i];
          if (vnode3 != null) removeNode(parent, vnode3);
        }
      }
      function removeNode(parent, vnode3) {
        var mask = 0;
        var original = vnode3.state;
        var stateResult, attrsResult;
        if (typeof vnode3.tag !== "string" && typeof vnode3.state.onbeforeremove === "function") {
          var result = callHook.call(vnode3.state.onbeforeremove, vnode3);
          if (result != null && typeof result.then === "function") {
            mask = 1;
            stateResult = result;
          }
        }
        if (vnode3.attrs && typeof vnode3.attrs.onbeforeremove === "function") {
          var result = callHook.call(vnode3.attrs.onbeforeremove, vnode3);
          if (result != null && typeof result.then === "function") {
            mask |= 2;
            attrsResult = result;
          }
        }
        checkState(vnode3, original);
        if (!mask) {
          onremove(vnode3);
          removeChild(parent, vnode3);
        } else {
          if (stateResult != null) {
            var next = function() {
              if (mask & 1) {
                mask &= 2;
                if (!mask) reallyRemove();
              }
            };
            stateResult.then(next, next);
          }
          if (attrsResult != null) {
            var next = function() {
              if (mask & 2) {
                mask &= 1;
                if (!mask) reallyRemove();
              }
            };
            attrsResult.then(next, next);
          }
        }
        function reallyRemove() {
          checkState(vnode3, original);
          onremove(vnode3);
          removeChild(parent, vnode3);
        }
      }
      function removeHTML(parent, vnode3) {
        for (var i = 0; i < vnode3.instance.length; i++) {
          parent.removeChild(vnode3.instance[i]);
        }
      }
      function removeChild(parent, vnode3) {
        while (vnode3.dom != null && vnode3.dom.parentNode === parent) {
          if (typeof vnode3.tag !== "string") {
            vnode3 = vnode3.instance;
            if (vnode3 != null) continue;
          } else if (vnode3.tag === "<") {
            removeHTML(parent, vnode3);
          } else {
            if (vnode3.tag !== "[") {
              parent.removeChild(vnode3.dom);
              if (!Array.isArray(vnode3.children)) break;
            }
            if (vnode3.children.length === 1) {
              vnode3 = vnode3.children[0];
              if (vnode3 != null) continue;
            } else {
              for (var i = 0; i < vnode3.children.length; i++) {
                var child = vnode3.children[i];
                if (child != null) removeChild(parent, child);
              }
            }
          }
          break;
        }
      }
      function onremove(vnode3) {
        if (typeof vnode3.tag !== "string" && typeof vnode3.state.onremove === "function") callHook.call(vnode3.state.onremove, vnode3);
        if (vnode3.attrs && typeof vnode3.attrs.onremove === "function") callHook.call(vnode3.attrs.onremove, vnode3);
        if (typeof vnode3.tag !== "string") {
          if (vnode3.instance != null) onremove(vnode3.instance);
        } else {
          var children2 = vnode3.children;
          if (Array.isArray(children2)) {
            for (var i = 0; i < children2.length; i++) {
              var child = children2[i];
              if (child != null) onremove(child);
            }
          }
        }
      }
      function setAttrs(vnode3, attrs2, ns) {
        if (vnode3.tag === "input" && attrs2.type != null) vnode3.dom.setAttribute("type", attrs2.type);
        var isFileInput = attrs2 != null && vnode3.tag === "input" && attrs2.type === "file";
        for (var key in attrs2) {
          setAttr(vnode3, key, null, attrs2[key], ns, isFileInput);
        }
      }
      function setAttr(vnode3, key, old, value, ns, isFileInput) {
        if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || old === value && !isFormAttribute(vnode3, key) && typeof value !== "object" || key === "type" && vnode3.tag === "input") return;
        if (key[0] === "o" && key[1] === "n") return updateEvent(vnode3, key, value);
        if (key.slice(0, 6) === "xlink:") vnode3.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
        else if (key === "style") updateStyle(vnode3.dom, old, value);
        else if (hasPropertyKey(vnode3, key, ns)) {
          if (key === "value") {
            if ((vnode3.tag === "input" || vnode3.tag === "textarea") && vnode3.dom.value === "" + value && (isFileInput || vnode3.dom === activeElement())) return;
            if (vnode3.tag === "select" && old !== null && vnode3.dom.value === "" + value) return;
            if (vnode3.tag === "option" && old !== null && vnode3.dom.value === "" + value) return;
            if (isFileInput && "" + value !== "") {
              console.error("`value` is read-only on file inputs!");
              return;
            }
          }
          vnode3.dom[key] = value;
        } else {
          if (typeof value === "boolean") {
            if (value) vnode3.dom.setAttribute(key, "");
            else vnode3.dom.removeAttribute(key);
          } else vnode3.dom.setAttribute(key === "className" ? "class" : key, value);
        }
      }
      function removeAttr(vnode3, key, old, ns) {
        if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return;
        if (key[0] === "o" && key[1] === "n") updateEvent(vnode3, key, void 0);
        else if (key === "style") updateStyle(vnode3.dom, old, null);
        else if (hasPropertyKey(vnode3, key, ns) && key !== "className" && key !== "title" && !(key === "value" && (vnode3.tag === "option" || vnode3.tag === "select" && vnode3.dom.selectedIndex === -1 && vnode3.dom === activeElement())) && !(vnode3.tag === "input" && key === "type")) {
          vnode3.dom[key] = null;
        } else {
          var nsLastIndex = key.indexOf(":");
          if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1);
          if (old !== false) vnode3.dom.removeAttribute(key === "className" ? "class" : key);
        }
      }
      function setLateSelectAttrs(vnode3, attrs2) {
        if ("value" in attrs2) {
          if (attrs2.value === null) {
            if (vnode3.dom.selectedIndex !== -1) vnode3.dom.value = null;
          } else {
            var normalized = "" + attrs2.value;
            if (vnode3.dom.value !== normalized || vnode3.dom.selectedIndex === -1) {
              vnode3.dom.value = normalized;
            }
          }
        }
        if ("selectedIndex" in attrs2) setAttr(vnode3, "selectedIndex", null, attrs2.selectedIndex, void 0);
      }
      function updateAttrs(vnode3, old, attrs2, ns) {
        if (old && old === attrs2) {
          console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major");
        }
        if (attrs2 != null) {
          if (vnode3.tag === "input" && attrs2.type != null) vnode3.dom.setAttribute("type", attrs2.type);
          var isFileInput = vnode3.tag === "input" && attrs2.type === "file";
          for (var key in attrs2) {
            setAttr(vnode3, key, old && old[key], attrs2[key], ns, isFileInput);
          }
        }
        var val;
        if (old != null) {
          for (var key in old) {
            if ((val = old[key]) != null && (attrs2 == null || attrs2[key] == null)) {
              removeAttr(vnode3, key, val, ns);
            }
          }
        }
      }
      function isFormAttribute(vnode3, attr) {
        return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode3.dom === activeElement() || vnode3.tag === "option" && vnode3.dom.parentNode === $doc.activeElement;
      }
      function isLifecycleMethod(attr) {
        return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate";
      }
      function hasPropertyKey(vnode3, key, ns) {
        return ns === void 0 && // If it's a custom element, just keep it.
        (vnode3.tag.indexOf("-") > -1 || vnode3.attrs != null && vnode3.attrs.is || // If it's a normal element, let's try to avoid a few browser bugs.
        key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height") && key in vnode3.dom;
      }
      var uppercaseRegex = /[A-Z]/g;
      function toLowerCase(capital) {
        return "-" + capital.toLowerCase();
      }
      function normalizeKey(key) {
        return key[0] === "-" && key[1] === "-" ? key : key === "cssFloat" ? "float" : key.replace(uppercaseRegex, toLowerCase);
      }
      function updateStyle(element, old, style) {
        if (old === style) ;
        else if (style == null) {
          element.style.cssText = "";
        } else if (typeof style !== "object") {
          element.style.cssText = style;
        } else if (old == null || typeof old !== "object") {
          element.style.cssText = "";
          for (var key in style) {
            var value = style[key];
            if (value != null) element.style.setProperty(normalizeKey(key), String(value));
          }
        } else {
          for (var key in style) {
            var value = style[key];
            if (value != null && (value = String(value)) !== String(old[key])) {
              element.style.setProperty(normalizeKey(key), value);
            }
          }
          for (var key in old) {
            if (old[key] != null && style[key] == null) {
              element.style.removeProperty(normalizeKey(key));
            }
          }
        }
      }
      function EventDict() {
        this._ = currentRedraw;
      }
      EventDict.prototype = /* @__PURE__ */ Object.create(null);
      EventDict.prototype.handleEvent = function(ev) {
        var handler0 = this["on" + ev.type];
        var result;
        if (typeof handler0 === "function") result = handler0.call(ev.currentTarget, ev);
        else if (typeof handler0.handleEvent === "function") handler0.handleEvent(ev);
        if (this._ && ev.redraw !== false) (0, this._)();
        if (result === false) {
          ev.preventDefault();
          ev.stopPropagation();
        }
      };
      function updateEvent(vnode3, key, value) {
        if (vnode3.events != null) {
          vnode3.events._ = currentRedraw;
          if (vnode3.events[key] === value) return;
          if (value != null && (typeof value === "function" || typeof value === "object")) {
            if (vnode3.events[key] == null) vnode3.dom.addEventListener(key.slice(2), vnode3.events, false);
            vnode3.events[key] = value;
          } else {
            if (vnode3.events[key] != null) vnode3.dom.removeEventListener(key.slice(2), vnode3.events, false);
            vnode3.events[key] = void 0;
          }
        } else if (value != null && (typeof value === "function" || typeof value === "object")) {
          vnode3.events = new EventDict();
          vnode3.dom.addEventListener(key.slice(2), vnode3.events, false);
          vnode3.events[key] = value;
        }
      }
      function initLifecycle(source, vnode3, hooks) {
        if (typeof source.oninit === "function") callHook.call(source.oninit, vnode3);
        if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode3));
      }
      function updateLifecycle(source, vnode3, hooks) {
        if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode3));
      }
      function shouldNotUpdate(vnode3, old) {
        do {
          if (vnode3.attrs != null && typeof vnode3.attrs.onbeforeupdate === "function") {
            var force = callHook.call(vnode3.attrs.onbeforeupdate, vnode3, old);
            if (force !== void 0 && !force) break;
          }
          if (typeof vnode3.tag !== "string" && typeof vnode3.state.onbeforeupdate === "function") {
            var force = callHook.call(vnode3.state.onbeforeupdate, vnode3, old);
            if (force !== void 0 && !force) break;
          }
          return false;
        } while (false);
        vnode3.dom = old.dom;
        vnode3.domSize = old.domSize;
        vnode3.instance = old.instance;
        vnode3.attrs = old.attrs;
        vnode3.children = old.children;
        vnode3.text = old.text;
        return true;
      }
      var currentDOM;
      return function(dom, vnodes, redraw) {
        if (!dom) throw new TypeError("DOM element being rendered to does not exist.");
        if (currentDOM != null && dom.contains(currentDOM)) {
          throw new TypeError("Node is currently being rendered to and thus is locked.");
        }
        var prevRedraw = currentRedraw;
        var prevDOM = currentDOM;
        var hooks = [];
        var active = activeElement();
        var namespace = dom.namespaceURI;
        currentDOM = dom;
        currentRedraw = typeof redraw === "function" ? redraw : void 0;
        try {
          if (dom.vnodes == null) dom.textContent = "";
          vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
          updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? void 0 : namespace);
          dom.vnodes = vnodes;
          if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus();
          for (var i = 0; i < hooks.length; i++) hooks[i]();
        } finally {
          currentRedraw = prevRedraw;
          currentDOM = prevDOM;
        }
      };
    };
    var render = _13(typeof window !== "undefined" ? window : null);
    var _16 = function(render0, schedule, console2) {
      var subscriptions = [];
      var pending = false;
      var offset = -1;
      function sync() {
        for (offset = 0; offset < subscriptions.length; offset += 2) {
          try {
            render0(subscriptions[offset], Vnode(subscriptions[offset + 1]), redraw);
          } catch (e) {
            console2.error(e);
          }
        }
        offset = -1;
      }
      function redraw() {
        if (!pending) {
          pending = true;
          schedule(function() {
            pending = false;
            sync();
          });
        }
      }
      redraw.sync = sync;
      function mount(root, component) {
        if (component != null && component.view == null && typeof component !== "function") {
          throw new TypeError("m.mount expects a component, not a vnode.");
        }
        var index = subscriptions.indexOf(root);
        if (index >= 0) {
          subscriptions.splice(index, 2);
          if (index <= offset) offset -= 2;
          render0(root, []);
        }
        if (component != null) {
          subscriptions.push(root, component);
          render0(root, Vnode(component), redraw);
        }
      }
      return { mount, redraw };
    };
    var mountRedraw0 = _16(render, typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : null, typeof console !== "undefined" ? console : null);
    var buildQueryString = function(object) {
      if (Object.prototype.toString.call(object) !== "[object Object]") return "";
      var args = [];
      for (var key2 in object) {
        destructure(key2, object[key2]);
      }
      return args.join("&");
      function destructure(key22, value1) {
        if (Array.isArray(value1)) {
          for (var i = 0; i < value1.length; i++) {
            destructure(key22 + "[" + i + "]", value1[i]);
          }
        } else if (Object.prototype.toString.call(value1) === "[object Object]") {
          for (var i in value1) {
            destructure(key22 + "[" + i + "]", value1[i]);
          }
        } else args.push(encodeURIComponent(key22) + (value1 != null && value1 !== "" ? "=" + encodeURIComponent(value1) : ""));
      }
    };
    var assign = Object.assign || function(target, source) {
      for (var key3 in source) {
        if (hasOwn.call(source, key3)) target[key3] = source[key3];
      }
    };
    var buildPathname = function(template, params) {
      if (/:([^\/\.-]+)(\.{3})?:/.test(template)) {
        throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.");
      }
      if (params == null) return template;
      var queryIndex = template.indexOf("?");
      var hashIndex = template.indexOf("#");
      var queryEnd = hashIndex < 0 ? template.length : hashIndex;
      var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
      var path = template.slice(0, pathEnd);
      var query = {};
      assign(query, params);
      var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m4, key1, variadic) {
        delete query[key1];
        if (params[key1] == null) return m4;
        return variadic ? params[key1] : encodeURIComponent(String(params[key1]));
      });
      var newQueryIndex = resolved.indexOf("?");
      var newHashIndex = resolved.indexOf("#");
      var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
      var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
      var result0 = resolved.slice(0, newPathEnd);
      if (queryIndex >= 0) result0 += template.slice(queryIndex, queryEnd);
      if (newQueryIndex >= 0) result0 += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd);
      var querystring = buildQueryString(query);
      if (querystring) result0 += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring;
      if (hashIndex >= 0) result0 += template.slice(hashIndex);
      if (newHashIndex >= 0) result0 += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex);
      return result0;
    };
    var _19 = function($window, Promise3, oncompletion) {
      var callbackCount = 0;
      function PromiseProxy(executor) {
        return new Promise3(executor);
      }
      PromiseProxy.prototype = Promise3.prototype;
      PromiseProxy.__proto__ = Promise3;
      function makeRequest(factory) {
        return function(url, args) {
          if (typeof url !== "string") {
            args = url;
            url = url.url;
          } else if (args == null) args = {};
          var promise1 = new Promise3(function(resolve, reject) {
            factory(buildPathname(url, args.params), args, function(data) {
              if (typeof args.type === "function") {
                if (Array.isArray(data)) {
                  for (var i = 0; i < data.length; i++) {
                    data[i] = new args.type(data[i]);
                  }
                } else data = new args.type(data);
              }
              resolve(data);
            }, reject);
          });
          if (args.background === true) return promise1;
          var count = 0;
          function complete() {
            if (--count === 0 && typeof oncompletion === "function") oncompletion();
          }
          return wrap(promise1);
          function wrap(promise12) {
            var then1 = promise12.then;
            promise12.constructor = PromiseProxy;
            promise12.then = function() {
              count++;
              var next0 = then1.apply(promise12, arguments);
              next0.then(complete, function(e) {
                complete();
                if (count === 0) throw e;
              });
              return wrap(next0);
            };
            return promise12;
          }
        };
      }
      function hasHeader(args, name) {
        for (var key0 in args.headers) {
          if (hasOwn.call(args.headers, key0) && key0.toLowerCase() === name) return true;
        }
        return false;
      }
      return {
        request: makeRequest(function(url, args, resolve, reject) {
          var method = args.method != null ? args.method.toUpperCase() : "GET";
          var body = args.body;
          var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData || body instanceof $window.URLSearchParams);
          var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json");
          var xhr = new $window.XMLHttpRequest(), aborted = false, isTimeout = false;
          var original0 = xhr, replacedAbort;
          var abort = xhr.abort;
          xhr.abort = function() {
            aborted = true;
            abort.call(this);
          };
          xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : void 0, typeof args.password === "string" ? args.password : void 0);
          if (assumeJSON && body != null && !hasHeader(args, "content-type")) {
            xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
          }
          if (typeof args.deserialize !== "function" && !hasHeader(args, "accept")) {
            xhr.setRequestHeader("Accept", "application/json, text/*");
          }
          if (args.withCredentials) xhr.withCredentials = args.withCredentials;
          if (args.timeout) xhr.timeout = args.timeout;
          xhr.responseType = responseType;
          for (var key0 in args.headers) {
            if (hasOwn.call(args.headers, key0)) {
              xhr.setRequestHeader(key0, args.headers[key0]);
            }
          }
          xhr.onreadystatechange = function(ev) {
            if (aborted) return;
            if (ev.target.readyState === 4) {
              try {
                var success = ev.target.status >= 200 && ev.target.status < 300 || ev.target.status === 304 || /^file:\/\//i.test(url);
                var response = ev.target.response, message;
                if (responseType === "json") {
                  if (!ev.target.responseType && typeof args.extract !== "function") {
                    try {
                      response = JSON.parse(ev.target.responseText);
                    } catch (e) {
                      response = null;
                    }
                  }
                } else if (!responseType || responseType === "text") {
                  if (response == null) response = ev.target.responseText;
                }
                if (typeof args.extract === "function") {
                  response = args.extract(ev.target, args);
                  success = true;
                } else if (typeof args.deserialize === "function") {
                  response = args.deserialize(response);
                }
                if (success) resolve(response);
                else {
                  var completeErrorResponse = function() {
                    try {
                      message = ev.target.responseText;
                    } catch (e) {
                      message = response;
                    }
                    var error = new Error(message);
                    error.code = ev.target.status;
                    error.response = response;
                    reject(error);
                  };
                  if (xhr.status === 0) {
                    setTimeout(function() {
                      if (isTimeout) return;
                      completeErrorResponse();
                    });
                  } else completeErrorResponse();
                }
              } catch (e) {
                reject(e);
              }
            }
          };
          xhr.ontimeout = function(ev) {
            isTimeout = true;
            var error = new Error("Request timed out");
            error.code = ev.target.status;
            reject(error);
          };
          if (typeof args.config === "function") {
            xhr = args.config(xhr, args, url) || xhr;
            if (xhr !== original0) {
              replacedAbort = xhr.abort;
              xhr.abort = function() {
                aborted = true;
                replacedAbort.call(this);
              };
            }
          }
          if (body == null) xhr.send();
          else if (typeof args.serialize === "function") xhr.send(args.serialize(body));
          else if (body instanceof $window.FormData || body instanceof $window.URLSearchParams) xhr.send(body);
          else xhr.send(JSON.stringify(body));
        }),
        jsonp: makeRequest(function(url, args, resolve, reject) {
          var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
          var script = $window.document.createElement("script");
          $window[callbackName] = function(data) {
            delete $window[callbackName];
            script.parentNode.removeChild(script);
            resolve(data);
          };
          script.onerror = function() {
            delete $window[callbackName];
            script.parentNode.removeChild(script);
            reject(new Error("JSONP request failed"));
          };
          script.src = url + (url.indexOf("?") < 0 ? "?" : "&") + encodeURIComponent(args.callbackKey || "callback") + "=" + encodeURIComponent(callbackName);
          $window.document.documentElement.appendChild(script);
        })
      };
    };
    var request = _19(typeof window !== "undefined" ? window : null, PromisePolyfill, mountRedraw0.redraw);
    var mountRedraw = mountRedraw0;
    var m2 = function m3() {
      return hyperscript.apply(this, arguments);
    };
    m2.m = hyperscript;
    m2.trust = hyperscript.trust;
    m2.fragment = hyperscript.fragment;
    m2.Fragment = "[";
    m2.mount = mountRedraw.mount;
    var m6 = hyperscript;
    var Promise2 = PromisePolyfill;
    function decodeURIComponentSave0(str) {
      try {
        return decodeURIComponent(str);
      } catch (err) {
        return str;
      }
    }
    var parseQueryString = function(string) {
      if (string === "" || string == null) return {};
      if (string.charAt(0) === "?") string = string.slice(1);
      var entries = string.split("&"), counters = {}, data0 = {};
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i].split("=");
        var key5 = decodeURIComponentSave0(entry[0]);
        var value2 = entry.length === 2 ? decodeURIComponentSave0(entry[1]) : "";
        if (value2 === "true") value2 = true;
        else if (value2 === "false") value2 = false;
        var levels = key5.split(/\]\[?|\[/);
        var cursor = data0;
        if (key5.indexOf("[") > -1) levels.pop();
        for (var j0 = 0; j0 < levels.length; j0++) {
          var level = levels[j0], nextLevel = levels[j0 + 1];
          var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
          if (level === "") {
            var key5 = levels.slice(0, j0).join();
            if (counters[key5] == null) {
              counters[key5] = Array.isArray(cursor) ? cursor.length : 0;
            }
            level = counters[key5]++;
          } else if (level === "__proto__") break;
          if (j0 === levels.length - 1) cursor[level] = value2;
          else {
            var desc = Object.getOwnPropertyDescriptor(cursor, level);
            if (desc != null) desc = desc.value;
            if (desc == null) cursor[level] = desc = isNumber ? [] : {};
            cursor = desc;
          }
        }
      }
      return data0;
    };
    var parsePathname = function(url) {
      var queryIndex0 = url.indexOf("?");
      var hashIndex0 = url.indexOf("#");
      var queryEnd0 = hashIndex0 < 0 ? url.length : hashIndex0;
      var pathEnd0 = queryIndex0 < 0 ? queryEnd0 : queryIndex0;
      var path1 = url.slice(0, pathEnd0).replace(/\/{2,}/g, "/");
      if (!path1) path1 = "/";
      else {
        if (path1[0] !== "/") path1 = "/" + path1;
        if (path1.length > 1 && path1[path1.length - 1] === "/") path1 = path1.slice(0, -1);
      }
      return {
        path: path1,
        params: queryIndex0 < 0 ? {} : parseQueryString(url.slice(queryIndex0 + 1, queryEnd0))
      };
    };
    var compileTemplate = function(template) {
      var templateData = parsePathname(template);
      var templateKeys = Object.keys(templateData.params);
      var keys = [];
      var regexp = new RegExp("^" + templateData.path.replace(
        // I escape literal text so people can use things like `:file.:ext` or
        // `:lang-:locale` in routes. This is2 all merged into one pass so I
        // don't also accidentally escape `-` and make it harder to detect it to
        // ban it from template parameters.
        /:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
        function(m7, key6, extra) {
          if (key6 == null) return "\\" + m7;
          keys.push({ k: key6, r: extra === "..." });
          if (extra === "...") return "(.*)";
          if (extra === ".") return "([^/]+)\\.";
          return "([^/]+)" + (extra || "");
        }
      ) + "$");
      return function(data1) {
        for (var i = 0; i < templateKeys.length; i++) {
          if (templateData.params[templateKeys[i]] !== data1.params[templateKeys[i]]) return false;
        }
        if (!keys.length) return regexp.test(data1.path);
        var values = regexp.exec(data1.path);
        if (values == null) return false;
        for (var i = 0; i < keys.length; i++) {
          data1.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1]);
        }
        return true;
      };
    };
    var magic = new RegExp("^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$");
    var censor = function(attrs4, extras) {
      var result2 = {};
      if (extras != null) {
        for (var key7 in attrs4) {
          if (hasOwn.call(attrs4, key7) && !magic.test(key7) && extras.indexOf(key7) < 0) {
            result2[key7] = attrs4[key7];
          }
        }
      } else {
        for (var key7 in attrs4) {
          if (hasOwn.call(attrs4, key7) && !magic.test(key7)) {
            result2[key7] = attrs4[key7];
          }
        }
      }
      return result2;
    };
    var sentinel0 = {};
    function decodeURIComponentSave(component) {
      try {
        return decodeURIComponent(component);
      } catch (e) {
        return component;
      }
    }
    var _28 = function($window, mountRedraw00) {
      var callAsync0 = $window == null ? null : typeof $window.setImmediate === "function" ? $window.setImmediate : $window.setTimeout;
      var p = Promise2.resolve();
      var scheduled = false;
      var ready = false;
      var state = 0;
      var compiled, fallbackRoute;
      var currentResolver = sentinel0, component, attrs3, currentPath, lastUpdate;
      var RouterRoot = {
        onbeforeupdate: function() {
          state = state ? 2 : 1;
          return !(!state || sentinel0 === currentResolver);
        },
        onremove: function() {
          $window.removeEventListener("popstate", fireAsync, false);
          $window.removeEventListener("hashchange", resolveRoute, false);
        },
        view: function() {
          if (!state || sentinel0 === currentResolver) return;
          var vnode5 = [Vnode(component, attrs3.key, attrs3)];
          if (currentResolver) vnode5 = currentResolver.render(vnode5[0]);
          return vnode5;
        }
      };
      var SKIP = route.SKIP = {};
      function resolveRoute() {
        scheduled = false;
        var prefix = $window.location.hash;
        if (route.prefix[0] !== "#") {
          prefix = $window.location.search + prefix;
          if (route.prefix[0] !== "?") {
            prefix = $window.location.pathname + prefix;
            if (prefix[0] !== "/") prefix = "/" + prefix;
          }
        }
        var path0 = prefix.concat().replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponentSave).slice(route.prefix.length);
        var data = parsePathname(path0);
        assign(data.params, $window.history.state);
        function reject(e) {
          console.error(e);
          setPath(fallbackRoute, null, { replace: true });
        }
        loop(0);
        function loop(i) {
          for (; i < compiled.length; i++) {
            if (compiled[i].check(data)) {
              var payload = compiled[i].component;
              var matchedRoute = compiled[i].route;
              var localComp = payload;
              var update = lastUpdate = function(comp) {
                if (update !== lastUpdate) return;
                if (comp === SKIP) return loop(i + 1);
                component = comp != null && (typeof comp.view === "function" || typeof comp === "function") ? comp : "div";
                attrs3 = data.params, currentPath = path0, lastUpdate = null;
                currentResolver = payload.render ? payload : null;
                if (state === 2) mountRedraw00.redraw();
                else {
                  state = 2;
                  mountRedraw00.redraw.sync();
                }
              };
              if (payload.view || typeof payload === "function") {
                payload = {};
                update(localComp);
              } else if (payload.onmatch) {
                p.then(function() {
                  return payload.onmatch(data.params, path0, matchedRoute);
                }).then(update, path0 === fallbackRoute ? null : reject);
              } else update("div");
              return;
            }
          }
          if (path0 === fallbackRoute) {
            throw new Error("Could not resolve default route " + fallbackRoute + ".");
          }
          setPath(fallbackRoute, null, { replace: true });
        }
      }
      function fireAsync() {
        if (!scheduled) {
          scheduled = true;
          callAsync0(resolveRoute);
        }
      }
      function setPath(path0, data, options) {
        path0 = buildPathname(path0, data);
        if (ready) {
          fireAsync();
          var state2 = options ? options.state : null;
          var title = options ? options.title : null;
          if (options && options.replace) $window.history.replaceState(state2, title, route.prefix + path0);
          else $window.history.pushState(state2, title, route.prefix + path0);
        } else {
          $window.location.href = route.prefix + path0;
        }
      }
      function route(root, defaultRoute, routes) {
        if (!root) throw new TypeError("DOM element being rendered to does not exist.");
        compiled = Object.keys(routes).map(function(route2) {
          if (route2[0] !== "/") throw new SyntaxError("Routes must start with a '/'.");
          if (/:([^\/\.-]+)(\.{3})?:/.test(route2)) {
            throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.");
          }
          return {
            route: route2,
            component: routes[route2],
            check: compileTemplate(route2)
          };
        });
        fallbackRoute = defaultRoute;
        if (defaultRoute != null) {
          var defaultData = parsePathname(defaultRoute);
          if (!compiled.some(function(i) {
            return i.check(defaultData);
          })) {
            throw new ReferenceError("Default route doesn't match any known routes.");
          }
        }
        if (typeof $window.history.pushState === "function") {
          $window.addEventListener("popstate", fireAsync, false);
        } else if (route.prefix[0] === "#") {
          $window.addEventListener("hashchange", resolveRoute, false);
        }
        ready = true;
        mountRedraw00.mount(root, RouterRoot);
        resolveRoute();
      }
      route.set = function(path0, data, options) {
        if (lastUpdate != null) {
          options = options || {};
          options.replace = true;
        }
        lastUpdate = null;
        setPath(path0, data, options);
      };
      route.get = function() {
        return currentPath;
      };
      route.prefix = "#!";
      route.Link = {
        view: function(vnode5) {
          var child0 = m6(
            vnode5.attrs.selector || "a",
            censor(vnode5.attrs, ["options", "params", "selector", "onclick"]),
            vnode5.children
          );
          var options, onclick, href;
          if (child0.attrs.disabled = Boolean(child0.attrs.disabled)) {
            child0.attrs.href = null;
            child0.attrs["aria-disabled"] = "true";
          } else {
            options = vnode5.attrs.options;
            onclick = vnode5.attrs.onclick;
            href = buildPathname(child0.attrs.href, vnode5.attrs.params);
            child0.attrs.href = route.prefix + href;
            child0.attrs.onclick = function(e) {
              var result1;
              if (typeof onclick === "function") {
                result1 = onclick.call(e.currentTarget, e);
              } else if (onclick == null || typeof onclick !== "object") ;
              else if (typeof onclick.handleEvent === "function") {
                onclick.handleEvent(e);
              }
              if (
                // Skip if `onclick` prevented default
                result1 !== false && !e.defaultPrevented && // Ignore everything but left clicks
                (e.button === 0 || e.which === 0 || e.which === 1) && // Let the browser handle0 `target=_blank`, etc.
                (!e.currentTarget.target || e.currentTarget.target === "_self") && // No modifier keys
                !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
              ) {
                e.preventDefault();
                e.redraw = false;
                route.set(href, null, options);
              }
            };
          }
          return child0;
        }
      };
      route.param = function(key4) {
        return attrs3 && key4 != null ? attrs3[key4] : attrs3;
      };
      return route;
    };
    m2.route = _28(typeof window !== "undefined" ? window : null, mountRedraw);
    m2.render = render;
    m2.redraw = mountRedraw.redraw;
    m2.request = request.request;
    m2.jsonp = request.jsonp;
    m2.parseQueryString = parseQueryString;
    m2.buildQueryString = buildQueryString;
    m2.parsePathname = parsePathname;
    m2.buildPathname = buildPathname;
    m2.vnode = Vnode;
    m2.PromisePolyfill = PromisePolyfill;
    m2.censor = censor;
    module["exports"] = m2;
  })();
})(mithril);
var mithrilExports = mithril.exports;
const m = /* @__PURE__ */ getDefaultExportFromCjs(mithrilExports);
export {
  m
};
