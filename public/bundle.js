
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	var body, div5, div1, div0, span, t0, div4, div3, div2, h1, t2, h30, t3, a0, t5, br0, t6, div95, div30, div29, div7, div6, h20, t8, br1, t9, br2, t10, div28, div11, div10, div8, img0, t11, div9, h40, t13, p0, t14, br3, t15, a1, t17, div15, div14, div12, img1, t18, div13, h41, t20, p1, t21, br4, t22, a2, t24, div19, div18, div16, img2, t25, div17, h42, t27, p2, t28, br5, t29, a3, t31, div23, div22, div20, img3, t32, div21, h43, t34, p3, t35, br6, t36, a4, t38, div27, div26, div24, img4, t39, div25, h44, t41, p4, t42, br7, t43, a5, t45, div37, div36, div35, div32, div31, h21, t47, br8, t48, br9, t49, div34, div33, h45, t50, a6, t52, t53, div75, div74, div39, div38, h22, t55, div40, t56, div73, div48, div47, div46, div42, div41, img5, t57, div45, div44, h46, t59, h60, t61, p5, t62, div43, a7, i0, t63, a8, i1, t64, a9, i2, t65, div56, div55, div54, div50, div49, img6, t66, div53, div52, h47, t68, h61, t70, p6, t71, div51, a10, i3, t72, a11, i4, t73, a12, i5, t74, div64, div63, div62, div58, div57, img7, t75, div61, div60, h48, t77, h62, t79, p7, t80, div59, a13, i6, t81, a14, i7, t82, a15, i8, t83, div72, div71, div70, div66, div65, img8, t84, div69, div68, h49, t86, h63, t88, p8, t89, div67, a16, i9, t90, a17, i10, t91, a18, i11, t92, div83, div82, div81, div77, div76, h23, t94, br10, t95, br11, t96, div80, div78, h31, t98, h410, t99, a19, t101, t102, div79, h32, t104, h411, t105, a20, t107, t108, div90, div89, div88, div85, div84, h24, t110, br12, t111, br13, t112, div87, div86, ul2, h412, li0, a21, t114, li5, t115, ul1, li1, a22, t117, li2, a23, t119, li4, details, summary, t121, ul0, li3, a24, t123, li6, a25, t125, t126, li7, a26, t128, hr, t129, div94, div93, div92, footer, div91, p9, t130, a27, t132, a28, t134, a29;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Cohort";
    			t2 = space();
    			h30 = element("h3");
    			t3 = text("Cohort is a code framework that helps artists & activitists use smartphones to run interesting events for groups of people. The project is administered by ");
    			a0 = element("a");
    			a0.textContent = "adelheid dance projects.";
    			t5 = space();
    			br0 = element("br");
    			t6 = space();
    			div95 = element("div");
    			div30 = element("div");
    			div29 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Cohort has been used on projects like:";
    			t8 = space();
    			br1 = element("br");
    			t9 = space();
    			br2 = element("br");
    			t10 = space();
    			div28 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div8 = element("div");
    			img0 = element("img");
    			t11 = space();
    			div9 = element("div");
    			h40 = element("h4");
    			h40.textContent = "LOT X";
    			t13 = space();
    			p0 = element("p");
    			t14 = text("An indoor+outdoor full-length contemporary dance work by adelheid dance projects\n\t\t\t\t\t\t");
    			br3 = element("br");
    			t15 = space();
    			a1 = element("a");
    			a1.textContent = "Visit Project Website";
    			t17 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div12 = element("div");
    			img1 = element("img");
    			t18 = space();
    			div13 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Café Sarajevo";
    			t20 = space();
    			p1 = element("p");
    			t21 = text("An immersive, participatory theatre work created by bluemouth inc.\n\t\t\t\t\t\t");
    			br4 = element("br");
    			t22 = space();
    			a2 = element("a");
    			a2.textContent = "Visit Project Website";
    			t24 = space();
    			div19 = element("div");
    			div18 = element("div");
    			div16 = element("div");
    			img2 = element("img");
    			t25 = space();
    			div17 = element("div");
    			h42 = element("h4");
    			h42.textContent = "Flux Delux";
    			t27 = space();
    			p2 = element("p");
    			t28 = text("A fully-accessible live multiplayer dance game created by Peggy Baker Dance Projects.\n\t\t\t\t\t\t");
    			br5 = element("br");
    			t29 = space();
    			a3 = element("a");
    			a3.textContent = "Visit Project Website";
    			t31 = space();
    			div23 = element("div");
    			div22 = element("div");
    			div20 = element("div");
    			img3 = element("img");
    			t32 = space();
    			div21 = element("div");
    			h43 = element("h4");
    			h43.textContent = "Overhear";
    			t34 = space();
    			p3 = element("p");
    			t35 = text("A multi-city 'pod-play' where audiences hear real-life stories while being guided around a city. Created by It's Not a Box Theatre\n\t\t\t\t\t\t");
    			br6 = element("br");
    			t36 = space();
    			a4 = element("a");
    			a4.textContent = "Visit Project Website";
    			t38 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div24 = element("div");
    			img4 = element("img");
    			t39 = space();
    			div25 = element("div");
    			h44 = element("h4");
    			h44.textContent = "Jacqueries";
    			t41 = space();
    			p4 = element("p");
    			t42 = text("A parkour-inspired immersive heist story created by Jacob Niedzwiecki.\n\t\t\t\t\t\t");
    			br7 = element("br");
    			t43 = space();
    			a5 = element("a");
    			a5.textContent = "Visit Project Website";
    			t45 = space();
    			div37 = element("div");
    			div36 = element("div");
    			div35 = element("div");
    			div32 = element("div");
    			div31 = element("div");
    			h21 = element("h2");
    			h21.textContent = "About Cohort";
    			t47 = space();
    			br8 = element("br");
    			t48 = space();
    			br9 = element("br");
    			t49 = space();
    			div34 = element("div");
    			div33 = element("div");
    			h45 = element("h4");
    			t50 = text("Cohort is maintained by ");
    			a6 = element("a");
    			a6.textContent = "Jacob Niedzwiecki";
    			t52 = text(" . It consists of a Node+Express server and client packages for iOS (ObjC & Swift), web (JS), and Unity (C#). Sound, video, and AR content can be cued on clients from QLab or the Cohort web platform. Features currently under development include push notifications, geolocation, and VR/360 video.");
    			t53 = space();
    			div75 = element("div");
    			div74 = element("div");
    			div39 = element("div");
    			div38 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Who's Who at Cohort";
    			t55 = space();
    			div40 = element("div");
    			t56 = space();
    			div73 = element("div");
    			div48 = element("div");
    			div47 = element("div");
    			div46 = element("div");
    			div42 = element("div");
    			div41 = element("div");
    			img5 = element("img");
    			t57 = space();
    			div45 = element("div");
    			div44 = element("div");
    			h46 = element("h4");
    			h46.textContent = "Jacob Niedzwiecki";
    			t59 = space();
    			h60 = element("h6");
    			h60.textContent = "Lead Developer";
    			t61 = space();
    			p5 = element("p");
    			t62 = space();
    			div43 = element("div");
    			a7 = element("a");
    			i0 = element("i");
    			t63 = space();
    			a8 = element("a");
    			i1 = element("i");
    			t64 = space();
    			a9 = element("a");
    			i2 = element("i");
    			t65 = space();
    			div56 = element("div");
    			div55 = element("div");
    			div54 = element("div");
    			div50 = element("div");
    			div49 = element("div");
    			img6 = element("img");
    			t66 = space();
    			div53 = element("div");
    			div52 = element("div");
    			h47 = element("h4");
    			h47.textContent = "Nabeel Kassam";
    			t68 = space();
    			h61 = element("h6");
    			h61.textContent = "Producer/Project Manager";
    			t70 = space();
    			p6 = element("p");
    			t71 = space();
    			div51 = element("div");
    			a10 = element("a");
    			i3 = element("i");
    			t72 = space();
    			a11 = element("a");
    			i4 = element("i");
    			t73 = space();
    			a12 = element("a");
    			i5 = element("i");
    			t74 = space();
    			div64 = element("div");
    			div63 = element("div");
    			div62 = element("div");
    			div58 = element("div");
    			div57 = element("div");
    			img7 = element("img");
    			t75 = space();
    			div61 = element("div");
    			div60 = element("div");
    			h48 = element("h4");
    			h48.textContent = "Luke Garwood";
    			t77 = space();
    			h62 = element("h6");
    			h62.textContent = "Assitant Developer";
    			t79 = space();
    			p7 = element("p");
    			t80 = space();
    			div59 = element("div");
    			a13 = element("a");
    			i6 = element("i");
    			t81 = space();
    			a14 = element("a");
    			i7 = element("i");
    			t82 = space();
    			a15 = element("a");
    			i8 = element("i");
    			t83 = space();
    			div72 = element("div");
    			div71 = element("div");
    			div70 = element("div");
    			div66 = element("div");
    			div65 = element("div");
    			img8 = element("img");
    			t84 = space();
    			div69 = element("div");
    			div68 = element("div");
    			h49 = element("h4");
    			h49.textContent = "Amanda Baker";
    			t86 = space();
    			h63 = element("h6");
    			h63.textContent = "Quality Assurance";
    			t88 = space();
    			p8 = element("p");
    			t89 = space();
    			div67 = element("div");
    			a16 = element("a");
    			i9 = element("i");
    			t90 = space();
    			a17 = element("a");
    			i10 = element("i");
    			t91 = space();
    			a18 = element("a");
    			i11 = element("i");
    			t92 = space();
    			div83 = element("div");
    			div82 = element("div");
    			div81 = element("div");
    			div77 = element("div");
    			div76 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Using Cohort";
    			t94 = space();
    			br10 = element("br");
    			t95 = space();
    			br11 = element("br");
    			t96 = space();
    			div80 = element("div");
    			div78 = element("div");
    			h31 = element("h3");
    			h31.textContent = "For people who code";
    			t98 = space();
    			h410 = element("h4");
    			t99 = text("If you're a technical kind of person, head over to our ");
    			a19 = element("a");
    			a19.textContent = "GitHub repository";
    			t101 = text(" to get started.");
    			t102 = space();
    			div79 = element("div");
    			h32 = element("h3");
    			h32.textContent = "For people who don't code";
    			t104 = space();
    			h411 = element("h4");
    			t105 = text("Reach out to us on ");
    			a20 = element("a");
    			a20.textContent = "Twitter";
    			t107 = text("! We're actively working to make Cohort more accessible to non-coders.");
    			t108 = space();
    			div90 = element("div");
    			div89 = element("div");
    			div88 = element("div");
    			div85 = element("div");
    			div84 = element("div");
    			h24 = element("h2");
    			h24.textContent = "Code Links and Documentation";
    			t110 = space();
    			br12 = element("br");
    			t111 = space();
    			br13 = element("br");
    			t112 = space();
    			div87 = element("div");
    			div86 = element("div");
    			ul2 = element("ul");
    			h412 = element("h4");
    			li0 = element("li");
    			a21 = element("a");
    			a21.textContent = "Cohort Server";
    			t114 = space();
    			li5 = element("li");
    			t115 = text("Cohort Unity Client:\n              \t\t\t\t\t");
    			ul1 = element("ul");
    			li1 = element("li");
    			a22 = element("a");
    			a22.textContent = "example project";
    			t117 = space();
    			li2 = element("li");
    			a23 = element("a");
    			a23.textContent = "asset package";
    			t119 = space();
    			li4 = element("li");
    			details = element("details");
    			summary = element("summary");
    			summary.textContent = "All releases";
    			t121 = space();
    			ul0 = element("ul");
    			li3 = element("li");
    			a24 = element("a");
    			a24.textContent = "v0.1.1";
    			t123 = space();
    			li6 = element("li");
    			a25 = element("a");
    			a25.textContent = "Cohort OSC Bridge";
    			t125 = text(" — used for triggering Cohort cues from QLab");
    			t126 = space();
    			li7 = element("li");
    			a26 = element("a");
    			a26.textContent = "API docs";
    			t128 = space();
    			hr = element("hr");
    			t129 = space();
    			div94 = element("div");
    			div93 = element("div");
    			div92 = element("div");
    			footer = element("footer");
    			div91 = element("div");
    			p9 = element("p");
    			t130 = text("Cohort has been developed with the assistance of the Toronto Arts Council, the Ontario Arts Council, and the Canada Council for the Arts' Digital Strategy Fund. Organizations that have sponsored Cohort development include ");
    			a27 = element("a");
    			a27.textContent = "bluemouth inc";
    			t132 = text(", ");
    			a28 = element("a");
    			a28.textContent = "Peggy Baker Dance Projects";
    			t134 = text(", and ");
    			a29 = element("a");
    			a29.textContent = "It's Not a Box Theatre.";
    			set_style(span, "color", "white");
    			attr_dev(span, "class", "fas fa-angle-down fa-3x");
    			add_location(span, file, 12, 3, 247);
    			attr_dev(div0, "class", "col-sm-12 text-center fixed-bottom");
    			add_location(div0, file, 11, 3, 195);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file, 10, 1, 171);
    			attr_dev(h1, "class", "title");
    			add_location(h1, file, 18, 10, 476);
    			attr_dev(a0, "alt", "link to adelheid dance project's website");
    			attr_dev(a0, "href", "http://www.adelheid.ca/");
    			add_location(a0, file, 19, 189, 695);
    			attr_dev(h30, "class", "description");
    			add_location(h30, file, 19, 10, 516);
    			add_location(br0, file, 20, 10, 820);
    			attr_dev(div2, "class", "motto");
    			add_location(div2, file, 17, 8, 446);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file, 16, 6, 414);
    			attr_dev(div4, "class", "content-center");
    			set_style(div4, "background-color", "rgba(1,1,1,0.8)");
    			add_location(div4, file, 15, 4, 337);
    			attr_dev(div5, "class", "page-header");
    			attr_dev(div5, "data-parallax", "true");
    			set_style(div5, "background-image", "url('imgs/back.jpg')");
    			add_location(div5, file, 8, 2, 72);
    			attr_dev(h20, "class", "title");
    			add_location(h20, file, 31, 12, 1074);
    			attr_dev(div6, "class", "col-md-12 ml-auto mr-auto");
    			add_location(div6, file, 30, 10, 1022);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file, 29, 8, 994);
    			add_location(br1, file, 34, 8, 1176);
    			add_location(br2, file, 35, 8, 1191);
    			attr_dev(img0, "alt", "image from lot x");
    			attr_dev(img0, "class", "img img-raised");
    			attr_dev(img0, "src", "imgs/lotx.jpg");
    			add_location(img0, file, 40, 6, 1340);
    			attr_dev(div8, "class", "card-image");
    			add_location(div8, file, 39, 5, 1309);
    			attr_dev(h40, "class", "card-category text-info");
    			add_location(h40, file, 43, 6, 1460);
    			add_location(br3, file, 46, 6, 1635);
    			attr_dev(p0, "class", "card-description");
    			add_location(p0, file, 44, 6, 1513);
    			attr_dev(a1, "alt", "link to LOT X website");
    			attr_dev(a1, "href", "http://www.adelheid.ca/projects/performance/photos-2/");
    			attr_dev(a1, "class", "btn btn-link btn-danger");
    			add_location(a1, file, 48, 6, 1657);
    			attr_dev(div9, "class", "card-body");
    			add_location(div9, file, 42, 5, 1430);
    			attr_dev(div10, "class", "card card-blog");
    			add_location(div10, file, 38, 4, 1275);
    			attr_dev(div11, "class", "col-md-2 offset-1");
    			add_location(div11, file, 37, 3, 1239);
    			attr_dev(img1, "alt", "image from cafe sarajevo");
    			attr_dev(img1, "class", "img img-raised");
    			attr_dev(img1, "src", "imgs/cafe.png");
    			add_location(img1, file, 58, 6, 1945);
    			attr_dev(div12, "class", "card-image");
    			add_location(div12, file, 57, 5, 1914);
    			attr_dev(h41, "class", "card-category text-info");
    			add_location(h41, file, 61, 6, 2073);
    			add_location(br4, file, 64, 6, 2242);
    			attr_dev(p1, "class", "card-description");
    			add_location(p1, file, 62, 6, 2134);
    			attr_dev(a2, "alt", "link to Cafe Sarajevo website");
    			attr_dev(a2, "href", "http://www.bluemouthinc.com/productions/cafe-sarajevo/");
    			attr_dev(a2, "class", "btn btn-link btn-danger");
    			add_location(a2, file, 66, 6, 2264);
    			attr_dev(div13, "class", "card-body");
    			add_location(div13, file, 60, 5, 2043);
    			attr_dev(div14, "class", "card card-blog");
    			add_location(div14, file, 56, 4, 1880);
    			attr_dev(div15, "class", "col-md-2");
    			add_location(div15, file, 55, 10, 1853);
    			attr_dev(img2, "alt", "image from flux delux");
    			attr_dev(img2, "class", "img img-raised");
    			attr_dev(img2, "src", "imgs/flux.jpeg");
    			add_location(img2, file, 74, 6, 2560);
    			attr_dev(div16, "class", "card-image");
    			add_location(div16, file, 73, 5, 2529);
    			attr_dev(h42, "class", "card-category text-info");
    			add_location(h42, file, 77, 6, 2686);
    			add_location(br5, file, 80, 6, 2871);
    			attr_dev(p2, "class", "card-description");
    			add_location(p2, file, 78, 6, 2744);
    			attr_dev(a3, "alt", "link to FluX Delux website");
    			attr_dev(a3, "href", "https://peggybakerdance.com/fluxdelux");
    			attr_dev(a3, "class", "btn btn-link btn-danger");
    			add_location(a3, file, 82, 6, 2893);
    			attr_dev(div17, "class", "card-body");
    			add_location(div17, file, 76, 5, 2656);
    			attr_dev(div18, "class", "card card-blog");
    			add_location(div18, file, 72, 4, 2495);
    			attr_dev(div19, "class", "col-md-2");
    			add_location(div19, file, 71, 11, 2468);
    			attr_dev(img3, "alt", "image from overhear");
    			attr_dev(img3, "class", "img img-raised");
    			attr_dev(img3, "src", "imgs/overhear.jpg");
    			add_location(img3, file, 90, 6, 3169);
    			attr_dev(div20, "class", "card-image");
    			add_location(div20, file, 89, 5, 3138);
    			attr_dev(h43, "class", "card-category text-info");
    			add_location(h43, file, 93, 6, 3296);
    			add_location(br6, file, 96, 6, 3524);
    			attr_dev(p3, "class", "card-description");
    			add_location(p3, file, 94, 6, 3352);
    			attr_dev(a4, "alt", "link to It's Not a Box Theatre website");
    			attr_dev(a4, "href", "https://www.itsnotaboxtheatre.ca/");
    			attr_dev(a4, "class", "btn btn-link btn-danger");
    			add_location(a4, file, 98, 6, 3546);
    			attr_dev(div21, "class", "card-body");
    			add_location(div21, file, 92, 5, 3266);
    			attr_dev(div22, "class", "card card-blog");
    			add_location(div22, file, 88, 4, 3104);
    			attr_dev(div23, "class", "col-md-2");
    			add_location(div23, file, 87, 10, 3077);
    			attr_dev(img4, "alt", "image from Jacqueries");
    			attr_dev(img4, "class", "img img-raised");
    			attr_dev(img4, "src", "imgs/jacqueries.jpg");
    			add_location(img4, file, 105, 6, 3830);
    			attr_dev(div24, "class", "card-image");
    			add_location(div24, file, 104, 5, 3799);
    			attr_dev(h44, "class", "card-category text-info");
    			add_location(h44, file, 108, 6, 3961);
    			add_location(br7, file, 111, 6, 4131);
    			attr_dev(p4, "class", "card-description");
    			add_location(p4, file, 109, 6, 4019);
    			attr_dev(a5, "alt", "link to Jacqueries project website");
    			attr_dev(a5, "href", "http://jqrs.org/reviews/");
    			attr_dev(a5, "class", "btn btn-link btn-danger");
    			add_location(a5, file, 113, 6, 4153);
    			attr_dev(div25, "class", "card-body");
    			add_location(div25, file, 107, 5, 3931);
    			attr_dev(div26, "class", "card card-blog");
    			add_location(div26, file, 103, 4, 3765);
    			attr_dev(div27, "class", "col-md-2");
    			add_location(div27, file, 102, 11, 3738);
    			attr_dev(div28, "class", "row text-center");
    			add_location(div28, file, 36, 8, 1206);
    			attr_dev(div29, "class", "container");
    			add_location(div29, file, 28, 6, 962);
    			attr_dev(div30, "class", "section text-center landing-section");
    			add_location(div30, file, 27, 4, 906);
    			attr_dev(h21, "class", "title");
    			add_location(h21, file, 127, 15, 4563);
    			attr_dev(div31, "class", "col-md-12 ml-auto mr-auto");
    			add_location(div31, file, 126, 5, 4508);
    			attr_dev(div32, "class", "row");
    			add_location(div32, file, 125, 4, 4485);
    			add_location(br8, file, 130, 4, 4634);
    			add_location(br9, file, 131, 10, 4651);
    			attr_dev(a6, "alt", "link to Jacob's twitter");
    			attr_dev(a6, "href", "https://twitter.com/jakemoves");
    			add_location(a6, file, 134, 54, 4759);
    			attr_dev(h45, "class", "description");
    			add_location(h45, file, 134, 6, 4711);
    			attr_dev(div33, "class", "col");
    			add_location(div33, file, 133, 5, 4685);
    			attr_dev(div34, "class", "row");
    			add_location(div34, file, 132, 4, 4662);
    			attr_dev(div35, "class", "container");
    			add_location(div35, file, 124, 3, 4457);
    			attr_dev(div36, "class", "section text-center section-dark landing-section");
    			add_location(div36, file, 123, 2, 4391);
    			attr_dev(div37, "class", "wrapper");
    			add_location(div37, file, 122, 1, 4367);
    			attr_dev(h22, "class", "title");
    			add_location(h22, file, 146, 12, 5364);
    			attr_dev(div38, "class", "col-md-8 ml-auto mr-auto text-center");
    			add_location(div38, file, 145, 10, 5301);
    			attr_dev(div39, "class", "row");
    			add_location(div39, file, 144, 8, 5273);
    			attr_dev(div40, "class", "space-top");
    			add_location(div40, file, 149, 8, 5447);
    			attr_dev(img5, "alt", "Jacob's headshot");
    			attr_dev(img5, "class", "img");
    			attr_dev(img5, "src", "imgs/jacob.jpeg");
    			add_location(img5, file, 158, 22, 5761);
    			attr_dev(div41, "class", "card-img-top");
    			add_location(div41, file, 156, 18, 5692);
    			attr_dev(div42, "class", "col-md-5");
    			add_location(div42, file, 155, 16, 5651);
    			attr_dev(h46, "class", "card-title");
    			add_location(h46, file, 163, 20, 5983);
    			attr_dev(h60, "class", "card-category");
    			add_location(h60, file, 164, 20, 6049);
    			attr_dev(p5, "class", "card-description");
    			add_location(p5, file, 165, 20, 6115);
    			attr_dev(i0, "class", "fab fa-twitter");
    			add_location(i0, file, 169, 109, 6392);
    			attr_dev(a7, "href", "https://twitter.com/jakemoves");
    			attr_dev(a7, "class", "btn btn-just-icon btn-link btn-twitter");
    			add_location(a7, file, 169, 22, 6305);
    			attr_dev(i1, "class", "fab fa-facebook");
    			add_location(i1, file, 170, 87, 6514);
    			attr_dev(a8, "href", "#Jacob");
    			attr_dev(a8, "class", "btn btn-just-icon btn-link btn-facebook");
    			add_location(a8, file, 170, 22, 6449);
    			attr_dev(i2, "class", "fab fa-google-plus");
    			add_location(i2, file, 171, 85, 6635);
    			attr_dev(a9, "href", "#Jacob");
    			attr_dev(a9, "class", "btn btn-just-icon btn-link btn-google");
    			add_location(a9, file, 171, 22, 6572);
    			attr_dev(div43, "class", "card-footer pull-left");
    			add_location(div43, file, 168, 20, 6247);
    			attr_dev(div44, "class", "card-body text-left");
    			add_location(div44, file, 162, 18, 5929);
    			attr_dev(div45, "class", "col-md-7");
    			add_location(div45, file, 161, 16, 5888);
    			attr_dev(div46, "class", "row");
    			add_location(div46, file, 154, 14, 5617);
    			attr_dev(div47, "class", "card card-profile card-plain");
    			add_location(div47, file, 153, 12, 5560);
    			attr_dev(div48, "class", "col-md-6");
    			attr_dev(div48, "id", "Jacob");
    			add_location(div48, file, 152, 10, 5514);
    			attr_dev(img6, "alt", "Nabeel's headshot");
    			attr_dev(img6, "class", "img");
    			attr_dev(img6, "src", "imgs/Nabeel.jpeg");
    			add_location(img6, file, 184, 22, 7065);
    			attr_dev(div49, "class", "card-img-top");
    			add_location(div49, file, 182, 18, 6995);
    			attr_dev(div50, "class", "col-md-5");
    			add_location(div50, file, 181, 16, 6954);
    			attr_dev(h47, "class", "card-title");
    			add_location(h47, file, 190, 20, 7310);
    			attr_dev(h61, "class", "card-category");
    			add_location(h61, file, 191, 20, 7372);
    			attr_dev(p6, "class", "card-description");
    			add_location(p6, file, 192, 20, 7448);
    			attr_dev(i3, "class", "fab fa-linkedin");
    			add_location(i3, file, 196, 88, 7705);
    			attr_dev(a10, "href", "#Nabeel");
    			attr_dev(a10, "class", "btn btn-just-icon btn-link btn-linkedin");
    			add_location(a10, file, 196, 22, 7639);
    			attr_dev(i4, "class", "fab fa-dribbble");
    			add_location(i4, file, 197, 88, 7829);
    			attr_dev(a11, "href", "#Nabeel");
    			attr_dev(a11, "class", "btn btn-just-icon btn-link btn-dribbble");
    			add_location(a11, file, 197, 22, 7763);
    			attr_dev(i5, "class", "fab fa-pinterest");
    			add_location(i5, file, 198, 89, 7954);
    			attr_dev(a12, "href", "#Nabeel");
    			attr_dev(a12, "class", "btn btn-just-icon btn-link btn-pinterest");
    			add_location(a12, file, 198, 22, 7887);
    			attr_dev(div51, "class", "card-footer pull-left");
    			add_location(div51, file, 195, 20, 7581);
    			attr_dev(div52, "class", "card-body text-left");
    			add_location(div52, file, 189, 18, 7256);
    			attr_dev(div53, "class", "col-md-7");
    			add_location(div53, file, 188, 16, 7215);
    			attr_dev(div54, "class", "row");
    			add_location(div54, file, 180, 14, 6920);
    			attr_dev(div55, "class", "card card-profile card-plain");
    			add_location(div55, file, 179, 12, 6863);
    			attr_dev(div56, "class", "col-md-6");
    			attr_dev(div56, "id", "Nabeel");
    			add_location(div56, file, 178, 10, 6816);
    			attr_dev(img7, "alt", "Luke's headshot");
    			attr_dev(img7, "class", "img");
    			attr_dev(img7, "src", "imgs/Luke.jpg");
    			add_location(img7, file, 211, 22, 8380);
    			attr_dev(div57, "class", "card-img-top");
    			add_location(div57, file, 209, 18, 8310);
    			attr_dev(div58, "class", "col-md-5");
    			add_location(div58, file, 208, 16, 8269);
    			attr_dev(h48, "class", "card-title");
    			add_location(h48, file, 217, 20, 8620);
    			attr_dev(h62, "class", "card-category");
    			add_location(h62, file, 218, 20, 8681);
    			attr_dev(p7, "class", "card-description");
    			add_location(p7, file, 219, 20, 8751);
    			attr_dev(i6, "class", "fab fa-youtube");
    			add_location(i6, file, 223, 85, 9086);
    			attr_dev(a13, "href", "#Luke");
    			attr_dev(a13, "class", "btn btn-just-icon btn-link btn-youtube");
    			add_location(a13, file, 223, 22, 9023);
    			attr_dev(i7, "class", "fab fa-twitter");
    			add_location(i7, file, 224, 85, 9206);
    			attr_dev(a14, "href", "#Luke");
    			attr_dev(a14, "class", "btn btn-just-icon btn-link btn-twitter");
    			add_location(a14, file, 224, 22, 9143);
    			attr_dev(i8, "class", "fab fa-instagram");
    			add_location(i8, file, 225, 87, 9328);
    			attr_dev(a15, "href", "#Luke");
    			attr_dev(a15, "class", "btn btn-just-icon btn-link btn-instagram");
    			add_location(a15, file, 225, 22, 9263);
    			attr_dev(div59, "class", "card-footer pull-left");
    			add_location(div59, file, 222, 20, 8965);
    			attr_dev(div60, "class", "card-body text-left");
    			add_location(div60, file, 216, 18, 8566);
    			attr_dev(div61, "class", "col-md-7");
    			add_location(div61, file, 215, 16, 8525);
    			attr_dev(div62, "class", "row");
    			add_location(div62, file, 207, 14, 8235);
    			attr_dev(div63, "class", "card card-profile card-plain");
    			add_location(div63, file, 206, 12, 8178);
    			attr_dev(div64, "class", "col-md-6");
    			attr_dev(div64, "id", "Luke");
    			add_location(div64, file, 205, 10, 8133);
    			attr_dev(img8, "alt", "Amanda's headshot");
    			attr_dev(img8, "class", "img");
    			attr_dev(img8, "src", "imgs/Amanda.jpeg");
    			add_location(img8, file, 238, 22, 9755);
    			attr_dev(div65, "class", "card-img-top");
    			add_location(div65, file, 236, 18, 9686);
    			attr_dev(div66, "class", "col-md-5");
    			add_location(div66, file, 235, 16, 9645);
    			attr_dev(h49, "class", "card-title");
    			add_location(h49, file, 244, 20, 10000);
    			attr_dev(h63, "class", "card-category");
    			add_location(h63, file, 245, 20, 10061);
    			attr_dev(p8, "class", "card-description");
    			add_location(p8, file, 246, 20, 10130);
    			attr_dev(i9, "class", "fab fa-linkedin");
    			add_location(i9, file, 250, 88, 10473);
    			attr_dev(a16, "href", "#Amanda");
    			attr_dev(a16, "class", "btn btn-just-icon btn-link btn-linkedin");
    			add_location(a16, file, 250, 22, 10407);
    			attr_dev(i10, "class", "fab fa-instagram");
    			add_location(i10, file, 251, 89, 10598);
    			attr_dev(a17, "href", "#Amanda");
    			attr_dev(a17, "class", "btn btn-just-icon btn-link btn-instagram");
    			add_location(a17, file, 251, 22, 10531);
    			attr_dev(i11, "class", "fab fa-dribbble");
    			add_location(i11, file, 252, 88, 10723);
    			attr_dev(a18, "href", "#Amanda");
    			attr_dev(a18, "class", "btn btn-just-icon btn-link btn-dribbble");
    			add_location(a18, file, 252, 22, 10657);
    			attr_dev(div67, "class", "card-footer pull-left");
    			add_location(div67, file, 249, 20, 10349);
    			attr_dev(div68, "class", "card-body text-left");
    			add_location(div68, file, 243, 18, 9946);
    			attr_dev(div69, "class", "col-md-7");
    			add_location(div69, file, 242, 16, 9905);
    			attr_dev(div70, "class", "row");
    			add_location(div70, file, 234, 14, 9611);
    			attr_dev(div71, "class", "card card-profile card-plain");
    			add_location(div71, file, 233, 12, 9554);
    			attr_dev(div72, "class", "col-md-6");
    			attr_dev(div72, "id", "Amanda");
    			add_location(div72, file, 232, 10, 9507);
    			attr_dev(div73, "class", "row");
    			add_location(div73, file, 151, 8, 5486);
    			attr_dev(div74, "class", "container");
    			add_location(div74, file, 143, 6, 5241);
    			attr_dev(div75, "class", "team-3");
    			add_location(div75, file, 142, 1, 5214);
    			attr_dev(h23, "class", "title");
    			add_location(h23, file, 268, 15, 11128);
    			attr_dev(div76, "class", "col-md-12 ml-auto mr-auto");
    			add_location(div76, file, 267, 5, 11073);
    			attr_dev(div77, "class", "row");
    			add_location(div77, file, 266, 4, 11050);
    			add_location(br10, file, 271, 4, 11199);
    			add_location(br11, file, 272, 10, 11216);
    			attr_dev(h31, "class", "title");
    			add_location(h31, file, 275, 6, 11281);
    			attr_dev(a19, "alt", "link to github repo");
    			attr_dev(a19, "href", "https://github.com/jakemoves/cohort-server");
    			add_location(a19, file, 276, 85, 11409);
    			attr_dev(h410, "class", "description");
    			add_location(h410, file, 276, 6, 11330);
    			attr_dev(div78, "class", "col-md-6");
    			add_location(div78, file, 274, 5, 11250);
    			attr_dev(h32, "class", "title");
    			add_location(h32, file, 280, 6, 11587);
    			attr_dev(a20, "alt", "link to Jake's twitter");
    			attr_dev(a20, "href", "https://twitter.com/jakemoves");
    			add_location(a20, file, 281, 49, 11686);
    			attr_dev(h411, "class", "description");
    			add_location(h411, file, 281, 6, 11643);
    			attr_dev(div79, "class", "col-md-6");
    			add_location(div79, file, 279, 5, 11556);
    			attr_dev(div80, "class", "row");
    			add_location(div80, file, 273, 4, 11227);
    			attr_dev(div81, "class", "container");
    			add_location(div81, file, 265, 3, 11022);
    			attr_dev(div82, "class", "section text-center section-dark landing-section");
    			add_location(div82, file, 264, 2, 10956);
    			attr_dev(div83, "class", "wrapper");
    			add_location(div83, file, 263, 1, 10932);
    			attr_dev(h24, "class", "title");
    			add_location(h24, file, 294, 15, 12089);
    			attr_dev(div84, "class", "col-md-12 ml-auto mr-auto");
    			add_location(div84, file, 293, 5, 12034);
    			attr_dev(div85, "class", "row");
    			add_location(div85, file, 292, 4, 12011);
    			add_location(br12, file, 297, 4, 12176);
    			add_location(br13, file, 298, 10, 12193);
    			attr_dev(a21, "href", "https://github.com/jakemoves/cohort-server");
    			add_location(a21, file, 302, 20, 12333);
    			add_location(li0, file, 302, 16, 12329);
    			attr_dev(a22, "href", "https://github.com/jakemoves/cohort-unity-client-demo");
    			add_location(a22, file, 305, 25, 12499);
    			add_location(li1, file, 305, 21, 12495);
    			attr_dev(a23, "href", "https://cohort.rocks/cohort-unity-client-latest.unitypackage");
    			add_location(a23, file, 306, 25, 12613);
    			add_location(li2, file, 306, 21, 12609);
    			add_location(summary, file, 309, 25, 12793);
    			attr_dev(a24, "href", "https://cohort.rocks/cohort-unity-client-v0.1.1.unitypackage");
    			add_location(a24, file, 311, 16, 12857);
    			add_location(li3, file, 311, 12, 12853);
    			add_location(ul0, file, 310, 11, 12836);
    			add_location(details, file, 308, 24, 12758);
    			add_location(li4, file, 307, 22, 12729);
    			add_location(ul1, file, 304, 19, 12469);
    			add_location(li5, file, 303, 16, 12425);
    			attr_dev(a25, "href", "https://github.com/jakemoves/cohort-osc-bridge");
    			add_location(a25, file, 317, 20, 13090);
    			add_location(li6, file, 317, 16, 13086);
    			attr_dev(a26, "href", "https://documenter.getpostman.com/view/249223/RznJmbco");
    			add_location(a26, file, 318, 20, 13238);
    			add_location(li7, file, 318, 16, 13234);
    			attr_dev(h412, "class", "description");
    			add_location(h412, file, 301, 10, 12288);
    			add_location(ul2, file, 301, 6, 12284);
    			attr_dev(div86, "class", "col-md-4 ml-auto mr-auto");
    			add_location(div86, file, 300, 5, 12239);
    			attr_dev(div87, "class", "row text-center");
    			add_location(div87, file, 299, 4, 12204);
    			attr_dev(div88, "class", "container");
    			add_location(div88, file, 291, 3, 11983);
    			attr_dev(div89, "class", "section text-center landing-section");
    			add_location(div89, file, 290, 2, 11930);
    			attr_dev(div90, "class", "wrapper");
    			add_location(div90, file, 289, 1, 11906);
    			add_location(hr, file, 326, 0, 13405);
    			attr_dev(a27, "href", "http://www.bluemouthinc.com");
    			add_location(a27, file, 332, 244, 13844);
    			attr_dev(a28, "href", "https://peggybakerdance.com");
    			add_location(a28, file, 332, 301, 13901);
    			attr_dev(a29, "href", "https://www.itsnotaboxtheatre.ca");
    			add_location(a29, file, 332, 375, 13975);
    			attr_dev(p9, "class", "small");
    			add_location(p9, file, 332, 5, 13605);
    			attr_dev(div91, "class", "row");
    			add_location(div91, file, 331, 4, 13582);
    			set_style(footer, "z-index", "100");
    			attr_dev(footer, "class", "footer footer-white ");
    			add_location(footer, file, 330, 3, 13517);
    			attr_dev(div92, "class", "container");
    			add_location(div92, file, 329, 7, 13490);
    			attr_dev(div93, "class", "section text-center landing-section");
    			add_location(div93, file, 328, 1, 13433);
    			attr_dev(div94, "class", "wrapper");
    			add_location(div94, file, 327, 0, 13410);
    			attr_dev(div95, "class", "wrapper");
    			add_location(div95, file, 26, 2, 880);
    			attr_dev(body, "class", "landing-page sidebar-collapse");
    			add_location(body, file, 7, 0, 25);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div5);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t2);
    			append_dev(div2, h30);
    			append_dev(h30, t3);
    			append_dev(h30, a0);
    			append_dev(div2, t5);
    			append_dev(div2, br0);
    			append_dev(body, t6);
    			append_dev(body, div95);
    			append_dev(div95, div30);
    			append_dev(div30, div29);
    			append_dev(div29, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h20);
    			append_dev(div29, t8);
    			append_dev(div29, br1);
    			append_dev(div29, t9);
    			append_dev(div29, br2);
    			append_dev(div29, t10);
    			append_dev(div29, div28);
    			append_dev(div28, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div8, img0);
    			append_dev(div10, t11);
    			append_dev(div10, div9);
    			append_dev(div9, h40);
    			append_dev(div9, t13);
    			append_dev(div9, p0);
    			append_dev(p0, t14);
    			append_dev(p0, br3);
    			append_dev(div9, t15);
    			append_dev(div9, a1);
    			append_dev(div28, t17);
    			append_dev(div28, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div12);
    			append_dev(div12, img1);
    			append_dev(div14, t18);
    			append_dev(div14, div13);
    			append_dev(div13, h41);
    			append_dev(div13, t20);
    			append_dev(div13, p1);
    			append_dev(p1, t21);
    			append_dev(p1, br4);
    			append_dev(div13, t22);
    			append_dev(div13, a2);
    			append_dev(div28, t24);
    			append_dev(div28, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div16);
    			append_dev(div16, img2);
    			append_dev(div18, t25);
    			append_dev(div18, div17);
    			append_dev(div17, h42);
    			append_dev(div17, t27);
    			append_dev(div17, p2);
    			append_dev(p2, t28);
    			append_dev(p2, br5);
    			append_dev(div17, t29);
    			append_dev(div17, a3);
    			append_dev(div28, t31);
    			append_dev(div28, div23);
    			append_dev(div23, div22);
    			append_dev(div22, div20);
    			append_dev(div20, img3);
    			append_dev(div22, t32);
    			append_dev(div22, div21);
    			append_dev(div21, h43);
    			append_dev(div21, t34);
    			append_dev(div21, p3);
    			append_dev(p3, t35);
    			append_dev(p3, br6);
    			append_dev(div21, t36);
    			append_dev(div21, a4);
    			append_dev(div28, t38);
    			append_dev(div28, div27);
    			append_dev(div27, div26);
    			append_dev(div26, div24);
    			append_dev(div24, img4);
    			append_dev(div26, t39);
    			append_dev(div26, div25);
    			append_dev(div25, h44);
    			append_dev(div25, t41);
    			append_dev(div25, p4);
    			append_dev(p4, t42);
    			append_dev(p4, br7);
    			append_dev(div25, t43);
    			append_dev(div25, a5);
    			append_dev(div95, t45);
    			append_dev(div95, div37);
    			append_dev(div37, div36);
    			append_dev(div36, div35);
    			append_dev(div35, div32);
    			append_dev(div32, div31);
    			append_dev(div31, h21);
    			append_dev(div35, t47);
    			append_dev(div35, br8);
    			append_dev(div35, t48);
    			append_dev(div35, br9);
    			append_dev(div35, t49);
    			append_dev(div35, div34);
    			append_dev(div34, div33);
    			append_dev(div33, h45);
    			append_dev(h45, t50);
    			append_dev(h45, a6);
    			append_dev(h45, t52);
    			append_dev(div95, t53);
    			append_dev(div95, div75);
    			append_dev(div75, div74);
    			append_dev(div74, div39);
    			append_dev(div39, div38);
    			append_dev(div38, h22);
    			append_dev(div74, t55);
    			append_dev(div74, div40);
    			append_dev(div74, t56);
    			append_dev(div74, div73);
    			append_dev(div73, div48);
    			append_dev(div48, div47);
    			append_dev(div47, div46);
    			append_dev(div46, div42);
    			append_dev(div42, div41);
    			append_dev(div41, img5);
    			append_dev(div46, t57);
    			append_dev(div46, div45);
    			append_dev(div45, div44);
    			append_dev(div44, h46);
    			append_dev(div44, t59);
    			append_dev(div44, h60);
    			append_dev(div44, t61);
    			append_dev(div44, p5);
    			append_dev(div44, t62);
    			append_dev(div44, div43);
    			append_dev(div43, a7);
    			append_dev(a7, i0);
    			append_dev(div43, t63);
    			append_dev(div43, a8);
    			append_dev(a8, i1);
    			append_dev(div43, t64);
    			append_dev(div43, a9);
    			append_dev(a9, i2);
    			append_dev(div73, t65);
    			append_dev(div73, div56);
    			append_dev(div56, div55);
    			append_dev(div55, div54);
    			append_dev(div54, div50);
    			append_dev(div50, div49);
    			append_dev(div49, img6);
    			append_dev(div54, t66);
    			append_dev(div54, div53);
    			append_dev(div53, div52);
    			append_dev(div52, h47);
    			append_dev(div52, t68);
    			append_dev(div52, h61);
    			append_dev(div52, t70);
    			append_dev(div52, p6);
    			append_dev(div52, t71);
    			append_dev(div52, div51);
    			append_dev(div51, a10);
    			append_dev(a10, i3);
    			append_dev(div51, t72);
    			append_dev(div51, a11);
    			append_dev(a11, i4);
    			append_dev(div51, t73);
    			append_dev(div51, a12);
    			append_dev(a12, i5);
    			append_dev(div73, t74);
    			append_dev(div73, div64);
    			append_dev(div64, div63);
    			append_dev(div63, div62);
    			append_dev(div62, div58);
    			append_dev(div58, div57);
    			append_dev(div57, img7);
    			append_dev(div62, t75);
    			append_dev(div62, div61);
    			append_dev(div61, div60);
    			append_dev(div60, h48);
    			append_dev(div60, t77);
    			append_dev(div60, h62);
    			append_dev(div60, t79);
    			append_dev(div60, p7);
    			append_dev(div60, t80);
    			append_dev(div60, div59);
    			append_dev(div59, a13);
    			append_dev(a13, i6);
    			append_dev(div59, t81);
    			append_dev(div59, a14);
    			append_dev(a14, i7);
    			append_dev(div59, t82);
    			append_dev(div59, a15);
    			append_dev(a15, i8);
    			append_dev(div73, t83);
    			append_dev(div73, div72);
    			append_dev(div72, div71);
    			append_dev(div71, div70);
    			append_dev(div70, div66);
    			append_dev(div66, div65);
    			append_dev(div65, img8);
    			append_dev(div70, t84);
    			append_dev(div70, div69);
    			append_dev(div69, div68);
    			append_dev(div68, h49);
    			append_dev(div68, t86);
    			append_dev(div68, h63);
    			append_dev(div68, t88);
    			append_dev(div68, p8);
    			append_dev(div68, t89);
    			append_dev(div68, div67);
    			append_dev(div67, a16);
    			append_dev(a16, i9);
    			append_dev(div67, t90);
    			append_dev(div67, a17);
    			append_dev(a17, i10);
    			append_dev(div67, t91);
    			append_dev(div67, a18);
    			append_dev(a18, i11);
    			append_dev(div95, t92);
    			append_dev(div95, div83);
    			append_dev(div83, div82);
    			append_dev(div82, div81);
    			append_dev(div81, div77);
    			append_dev(div77, div76);
    			append_dev(div76, h23);
    			append_dev(div81, t94);
    			append_dev(div81, br10);
    			append_dev(div81, t95);
    			append_dev(div81, br11);
    			append_dev(div81, t96);
    			append_dev(div81, div80);
    			append_dev(div80, div78);
    			append_dev(div78, h31);
    			append_dev(div78, t98);
    			append_dev(div78, h410);
    			append_dev(h410, t99);
    			append_dev(h410, a19);
    			append_dev(h410, t101);
    			append_dev(div80, t102);
    			append_dev(div80, div79);
    			append_dev(div79, h32);
    			append_dev(div79, t104);
    			append_dev(div79, h411);
    			append_dev(h411, t105);
    			append_dev(h411, a20);
    			append_dev(h411, t107);
    			append_dev(div95, t108);
    			append_dev(div95, div90);
    			append_dev(div90, div89);
    			append_dev(div89, div88);
    			append_dev(div88, div85);
    			append_dev(div85, div84);
    			append_dev(div84, h24);
    			append_dev(div88, t110);
    			append_dev(div88, br12);
    			append_dev(div88, t111);
    			append_dev(div88, br13);
    			append_dev(div88, t112);
    			append_dev(div88, div87);
    			append_dev(div87, div86);
    			append_dev(div86, ul2);
    			append_dev(ul2, h412);
    			append_dev(h412, li0);
    			append_dev(li0, a21);
    			append_dev(h412, t114);
    			append_dev(h412, li5);
    			append_dev(li5, t115);
    			append_dev(li5, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, a22);
    			append_dev(ul1, t117);
    			append_dev(ul1, li2);
    			append_dev(li2, a23);
    			append_dev(ul1, t119);
    			append_dev(ul1, li4);
    			append_dev(li4, details);
    			append_dev(details, summary);
    			append_dev(details, t121);
    			append_dev(details, ul0);
    			append_dev(ul0, li3);
    			append_dev(li3, a24);
    			append_dev(h412, t123);
    			append_dev(h412, li6);
    			append_dev(li6, a25);
    			append_dev(li6, t125);
    			append_dev(h412, t126);
    			append_dev(h412, li7);
    			append_dev(li7, a26);
    			append_dev(div95, t128);
    			append_dev(div95, hr);
    			append_dev(div95, t129);
    			append_dev(div95, div94);
    			append_dev(div94, div93);
    			append_dev(div93, div92);
    			append_dev(div92, footer);
    			append_dev(footer, div91);
    			append_dev(div91, p9);
    			append_dev(p9, t130);
    			append_dev(p9, a27);
    			append_dev(p9, t132);
    			append_dev(p9, a28);
    			append_dev(p9, t134);
    			append_dev(p9, a29);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(body);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment.name });
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
