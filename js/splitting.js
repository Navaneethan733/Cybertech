(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.Splitting = factory());
}(this, (function() {
    'use strict';

    var root = document;
    var createText = root.createTextNode.bind(root);

    
    function setProperty(el, varName, value) {
        el.style.setProperty(varName, value);
    }

    
    function appendChild(el, child) {
        return el.appendChild(child);
    }

    
    function createElement(parent, key, text, whitespace) {
        var el = root.createElement('span');
        key && (el.className = key);
        if (text) {
            !whitespace && el.setAttribute("data-" + key, text);
            el.textContent = text;
        }
        return (parent && appendChild(parent, el)) || el;
    }

    
    function getData(el, key) {
        return el.getAttribute("data-" + key)
    }

    
    function $(e, parent) {
        return !e || e.length == 0 ? 
            [] :
            e.nodeName ? 
            [e] : 
            [].slice.call(e[0].nodeName ? e : (parent || root).querySelectorAll(e));
    }

    
    function Array2D(len) {
        var a = [];
        for (; len--;) {
            a[len] = [];
        }
        return a;
    }

    
    function each(items, consumer) {
        items && items.some(consumer);
    }

    
    function selectFrom(obj) {
        return function(key) {
            return obj[key];
        }
    }

    
    function index(element, key, items) {
        var prefix = '--' + key;
        var cssVar = prefix + "-index";

        each(items, function(items, i) {
            if (Array.isArray(items)) {
                each(items, function(item) {
                    setProperty(item, cssVar, i);
                });
            } else {
                setProperty(items, cssVar, i);
            }
        });

        setProperty(element, prefix + "-total", items.length);
    }

    
    var plugins = {};

    
    function resolvePlugins(by, parent, deps) {
        
        var index = deps.indexOf(by);
        if (index == -1) {
            
            deps.unshift(by);

            
            var plugin = plugins[by];
            if (!plugin) {
                throw new Error("plugin not loaded: " + by);
            }
            each(plugin.depends, function(p) {
                resolvePlugins(p, by, deps);
            });
        } else {
            
            
            var indexOfParent = deps.indexOf(parent);
            deps.splice(index, 1);
            deps.splice(indexOfParent, 0, by);
        }
        return deps;
    }

    
    function createPlugin(by, depends, key, split) {
        return {
            by: by,
            depends: depends,
            key: key,
            split: split
        }
    }

    
    function resolve(by) {
        return resolvePlugins(by, 0, []).map(selectFrom(plugins));
    }

    
    function add(opts) {
        plugins[opts.by] = opts;
    }

    
    function splitText(el, key, splitOn, includePrevious, preserveWhitespace) {
        
        el.normalize();

        
        var elements = [];
        var F = document.createDocumentFragment();

        if (includePrevious) {
            elements.push(el.previousSibling);
        }

        var allElements = [];
        $(el.childNodes).some(function(next) {
            if (next.tagName && !next.hasChildNodes()) {
                
                allElements.push(next);
                return;
            }
            
            if (next.childNodes && next.childNodes.length) {
                allElements.push(next);
                elements.push.apply(elements, splitText(next, key, splitOn, includePrevious, preserveWhitespace));
                return;
            }

            
            
            var wholeText = next.wholeText || '';
            var contents = wholeText.trim();

            
            if (contents.length) {
                
                if (wholeText[0] === ' ') {
                    allElements.push(createText(' '));
                }
                
                each(contents.split(splitOn), function(splitText, i) {
                    if (i && preserveWhitespace) {
                        allElements.push(createElement(F, "whitespace", " ", preserveWhitespace));
                    }
                    var splitEl = createElement(F, key, splitText);
                    elements.push(splitEl);
                    allElements.push(splitEl);
                });
                
                if (wholeText[wholeText.length - 1] === ' ') {
                    allElements.push(createText(' '));
                }
            }
        });

        each(allElements, function(el) {
            appendChild(F, el);
        });

        
        el.innerHTML = "";
        appendChild(el, F);
        return elements;
    }

    
    var _ = 0;

    function copy(dest, src) {
        for (var k in src) {
            dest[k] = src[k];
        }
        return dest;
    }

    var WORDS = 'words';

    var wordPlugin = createPlugin(
        
        WORDS,
        
        _,
        
        'word',
        
        function(el) {
            return splitText(el, 'word', /\s+/, 0, 1)
        }
    );

    var CHARS = "chars";

    var charPlugin = createPlugin(
        
        CHARS,
        
        [WORDS],
        
        "char",
        
        function(el, options, ctx) {
            var results = [];

            each(ctx[WORDS], function(word, i) {
                results.push.apply(results, splitText(word, "char", "", options.whitespace && i));
            });

            return results;
        }
    );

    
    function Splitting(opts) {
        opts = opts || {};
        var key = opts.key;

        return $(opts.target || '[data-splitting]').map(function(el) {
            var ctx = el['🍌'];
            if (!opts.force && ctx) {
                return ctx;
            }

            ctx = el['🍌'] = {
                el: el
            };
            var by = opts.by || getData(el, 'splitting');
            if (!by || by == 'true') {
                by = CHARS;
            }
            var items = resolve(by);
            var opts2 = copy({}, opts);
            each(items, function(plugin) {
                if (plugin.split) {
                    var pluginBy = plugin.by;
                    var key2 = (key ? '-' + key : '') + plugin.key;
                    var results = plugin.split(el, opts2, ctx);
                    key2 && index(el, key2, results);
                    ctx[pluginBy] = results;
                    el.classList.add(pluginBy);
                }
            });

            el.classList.add('splitting');
            return ctx;
        })
    }

    
    function html(opts) {
        opts = opts || {};
        var parent = opts.target = createElement();
        parent.innerHTML = opts.content;
        Splitting(opts);
        return parent.outerHTML
    }

    Splitting.html = html;
    Splitting.add = add;

    
    function detectGrid(el, options, side) {
        var items = $(options.matching || el.children, el);
        var c = {};

        each(items, function(w) {
            var val = Math.round(w[side]);
            (c[val] || (c[val] = [])).push(w);
        });

        return Object.keys(c).map(Number).sort(byNumber).map(selectFrom(c));
    }

    
    function byNumber(a, b) {
        return a - b;
    }

    var linePlugin = createPlugin(
        
        'lines',
        
        [WORDS],
        
        'line',
        
        function(el, options, ctx) {
            return detectGrid(el, {
                matching: ctx[WORDS]
            }, 'offsetTop')
        }
    );

    var itemPlugin = createPlugin(
        
        'items',
        
        _,
        
        'item',
        
        function(el, options) {
            return $(options.matching || el.children, el)
        }
    );

    var rowPlugin = createPlugin(
        
        'rows',
        
        _,
        
        'row',
        
        function(el, options) {
            return detectGrid(el, options, "offsetTop");
        }
    );

    var columnPlugin = createPlugin(
        
        'cols',
        
        _,
        
        "col",
        
        function(el, options) {
            return detectGrid(el, options, "offsetLeft");
        }
    );

    var gridPlugin = createPlugin(
        
        'grid',
        
        ['rows', 'cols']
    );

    var LAYOUT = "layout";

    var layoutPlugin = createPlugin(
        
        LAYOUT,
        
        _,
        
        _,
        
        function(el, opts) {
            
            var rows = opts.rows = +(opts.rows || getData(el, 'rows') || 1);
            var columns = opts.columns = +(opts.columns || getData(el, 'columns') || 1);

            
            opts.image = opts.image || getData(el, 'image') || el.currentSrc || el.src;
            if (opts.image) {
                var img = $("img", el)[0];
                opts.image = img && (img.currentSrc || img.src);
            }

            
            if (opts.image) {
                setProperty(el, "background-image", "url(" + opts.image + ")");
            }

            var totalCells = rows * columns;
            var elements = [];

            var container = createElement(_, "cell-grid");
            while (totalCells--) {
                
                var cell = createElement(container, "cell");
                createElement(cell, "cell-inner");
                elements.push(cell);
            }

            
            appendChild(el, container);

            return elements;
        }
    );

    var cellRowPlugin = createPlugin(
        
        "cellRows",
        
        [LAYOUT],
        
        "row",
        
        function(el, opts, ctx) {
            var rowCount = opts.rows;
            var result = Array2D(rowCount);

            each(ctx[LAYOUT], function(cell, i, src) {
                result[Math.floor(i / (src.length / rowCount))].push(cell);
            });

            return result;
        }
    );

    var cellColumnPlugin = createPlugin(
        
        "cellColumns",
        
        [LAYOUT],
        
        "col",
        
        function(el, opts, ctx) {
            var columnCount = opts.columns;
            var result = Array2D(columnCount);

            each(ctx[LAYOUT], function(cell, i) {
                result[i % columnCount].push(cell);
            });

            return result;
        }
    );

    var cellPlugin = createPlugin(
        
        "cells",
        
        ['cellRows', 'cellColumns'],
        
        "cell",
        
        function(el, opt, ctx) {
            
            return ctx[LAYOUT];
        }
    );

    
    
    add(wordPlugin);
    add(charPlugin);
    add(linePlugin);
    
    add(itemPlugin);
    add(rowPlugin);
    add(columnPlugin);
    add(gridPlugin);
    
    add(layoutPlugin);
    add(cellRowPlugin);
    add(cellColumnPlugin);
    add(cellPlugin);

    return Splitting;

})));