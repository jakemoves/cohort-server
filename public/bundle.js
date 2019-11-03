
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
    	var body, div5, div1, div0, span, t0, div4, div3, div2, h1, t2, h30, t3, a0, t5, br0, t6, div95, div30, div29, div7, div6, h20, t8, br1, t9, br2, t10, div28, div11, div10, div8, img0, t11, div9, h40, t13, p0, t14, br3, t15, a1, t17, div15, div14, div12, img1, t18, div13, h41, t20, p1, t21, br4, t22, a2, t24, div19, div18, div16, img2, t25, div17, h42, t27, p2, t28, br5, t29, a3, t31, div23, div22, div20, img3, t32, div21, h43, t34, p3, t35, br6, t36, a4, t38, div27, div26, div24, img4, t39, div25, h44, t41, p4, t42, br7, t43, a5, t45, div37, div36, div35, div32, div31, h21, t47, br8, t48, br9, t49, div34, div33, h45, t50, a6, t52, t53, div75, div74, div39, div38, h22, t55, div40, t56, div73, div48, div47, div46, div42, div41, img5, t57, div45, div44, h46, t59, h60, t61, p5, t62, div43, t63, div56, div55, div54, div50, div49, img6, t64, div53, div52, h47, t66, h61, t68, p6, t69, div51, t70, div64, div63, div62, div58, div57, img7, t71, div61, div60, h48, t73, h62, t75, p7, t76, div59, t77, div72, div71, div70, div66, div65, img8, t78, div69, div68, h49, t80, h63, t82, p8, t83, div67, t84, div83, div82, div81, div77, div76, h23, t86, br10, t87, br11, t88, div80, div78, h31, t90, h410, t91, a7, t93, t94, div79, h32, t96, h411, t97, a8, t99, t100, div90, div89, div88, div85, div84, h24, t102, br12, t103, br13, t104, div87, div86, ul2, h412, li0, a9, t106, li5, t107, ul1, li1, a10, t109, li2, a11, t111, li4, details, summary, t113, ul0, li3, a12, t115, li6, a13, t117, t118, li7, a14, t120, hr, t121, div94, div93, div92, footer, div91, p9, t122, a15, t124, a16, t126, a17;

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
    			t3 = text("Cohort is a code framework that helps artists and activitists use smartphones to run interesting events for groups of people. The project is administered by ");
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
    			t63 = space();
    			div56 = element("div");
    			div55 = element("div");
    			div54 = element("div");
    			div50 = element("div");
    			div49 = element("div");
    			img6 = element("img");
    			t64 = space();
    			div53 = element("div");
    			div52 = element("div");
    			h47 = element("h4");
    			h47.textContent = "Nabeel Kassam";
    			t66 = space();
    			h61 = element("h6");
    			h61.textContent = "Producer/Project Manager";
    			t68 = space();
    			p6 = element("p");
    			t69 = space();
    			div51 = element("div");
    			t70 = space();
    			div64 = element("div");
    			div63 = element("div");
    			div62 = element("div");
    			div58 = element("div");
    			div57 = element("div");
    			img7 = element("img");
    			t71 = space();
    			div61 = element("div");
    			div60 = element("div");
    			h48 = element("h4");
    			h48.textContent = "Luke Garwood";
    			t73 = space();
    			h62 = element("h6");
    			h62.textContent = "Assitant Developer";
    			t75 = space();
    			p7 = element("p");
    			t76 = space();
    			div59 = element("div");
    			t77 = space();
    			div72 = element("div");
    			div71 = element("div");
    			div70 = element("div");
    			div66 = element("div");
    			div65 = element("div");
    			img8 = element("img");
    			t78 = space();
    			div69 = element("div");
    			div68 = element("div");
    			h49 = element("h4");
    			h49.textContent = "Amanda Baker";
    			t80 = space();
    			h63 = element("h6");
    			h63.textContent = "Quality Assurance";
    			t82 = space();
    			p8 = element("p");
    			t83 = space();
    			div67 = element("div");
    			t84 = space();
    			div83 = element("div");
    			div82 = element("div");
    			div81 = element("div");
    			div77 = element("div");
    			div76 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Using Cohort";
    			t86 = space();
    			br10 = element("br");
    			t87 = space();
    			br11 = element("br");
    			t88 = space();
    			div80 = element("div");
    			div78 = element("div");
    			h31 = element("h3");
    			h31.textContent = "For people who code";
    			t90 = space();
    			h410 = element("h4");
    			t91 = text("If you're a technical kind of person, head over to our ");
    			a7 = element("a");
    			a7.textContent = "GitHub repository";
    			t93 = text(" to get started.");
    			t94 = space();
    			div79 = element("div");
    			h32 = element("h3");
    			h32.textContent = "For people who don't code";
    			t96 = space();
    			h411 = element("h4");
    			t97 = text("Reach out to us on ");
    			a8 = element("a");
    			a8.textContent = "Twitter";
    			t99 = text("! We're actively working to make Cohort more accessible to non-coders.");
    			t100 = space();
    			div90 = element("div");
    			div89 = element("div");
    			div88 = element("div");
    			div85 = element("div");
    			div84 = element("div");
    			h24 = element("h2");
    			h24.textContent = "Code Links and Documentation";
    			t102 = space();
    			br12 = element("br");
    			t103 = space();
    			br13 = element("br");
    			t104 = space();
    			div87 = element("div");
    			div86 = element("div");
    			ul2 = element("ul");
    			h412 = element("h4");
    			li0 = element("li");
    			a9 = element("a");
    			a9.textContent = "Cohort Server";
    			t106 = space();
    			li5 = element("li");
    			t107 = text("Cohort Unity Client:\n              \t\t\t\t\t");
    			ul1 = element("ul");
    			li1 = element("li");
    			a10 = element("a");
    			a10.textContent = "example project";
    			t109 = space();
    			li2 = element("li");
    			a11 = element("a");
    			a11.textContent = "asset package";
    			t111 = space();
    			li4 = element("li");
    			details = element("details");
    			summary = element("summary");
    			summary.textContent = "All releases";
    			t113 = space();
    			ul0 = element("ul");
    			li3 = element("li");
    			a12 = element("a");
    			a12.textContent = "v0.1.1";
    			t115 = space();
    			li6 = element("li");
    			a13 = element("a");
    			a13.textContent = "Cohort OSC Bridge";
    			t117 = text(" — used for triggering Cohort cues from QLab");
    			t118 = space();
    			li7 = element("li");
    			a14 = element("a");
    			a14.textContent = "API docs";
    			t120 = space();
    			hr = element("hr");
    			t121 = space();
    			div94 = element("div");
    			div93 = element("div");
    			div92 = element("div");
    			footer = element("footer");
    			div91 = element("div");
    			p9 = element("p");
    			t122 = text("Cohort has been developed with the assistance of the Toronto Arts Council, the Ontario Arts Council, and the Canada Council for the Arts' Digital Strategy Fund. Organizations that have sponsored Cohort development include ");
    			a15 = element("a");
    			a15.textContent = "bluemouth inc";
    			t124 = text(", ");
    			a16 = element("a");
    			a16.textContent = "Peggy Baker Dance Projects";
    			t126 = text(", and ");
    			a17 = element("a");
    			a17.textContent = "It's Not a Box Theatre.";
    			set_style(span, "color", "white");
    			attr_dev(span, "class", "fas fa-angle-down fa-3x");
    			add_location(span, file, 25, 3, 386);
    			attr_dev(div0, "class", "col-sm-12 text-center fixed-bottom");
    			add_location(div0, file, 24, 3, 334);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file, 23, 1, 310);
    			attr_dev(h1, "class", "title");
    			add_location(h1, file, 31, 10, 615);
    			attr_dev(a0, "alt", "link to adelheid dance project's website");
    			attr_dev(a0, "href", "http://www.adelheid.ca/");
    			add_location(a0, file, 32, 191, 836);
    			attr_dev(h30, "class", "description");
    			add_location(h30, file, 32, 10, 655);
    			add_location(br0, file, 33, 10, 961);
    			attr_dev(div2, "class", "motto");
    			add_location(div2, file, 30, 8, 585);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file, 29, 6, 553);
    			attr_dev(div4, "class", "content-center");
    			set_style(div4, "background-color", "rgba(1,1,1,0.8)");
    			add_location(div4, file, 28, 4, 476);
    			attr_dev(div5, "class", "page-header");
    			attr_dev(div5, "data-parallax", "true");
    			set_style(div5, "background-image", "url('imgs/back.jpg')");
    			add_location(div5, file, 21, 2, 211);
    			attr_dev(h20, "class", "title");
    			add_location(h20, file, 44, 12, 1215);
    			attr_dev(div6, "class", "col-md-12 ml-auto mr-auto");
    			add_location(div6, file, 43, 10, 1163);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file, 42, 8, 1135);
    			add_location(br1, file, 47, 8, 1317);
    			add_location(br2, file, 48, 8, 1332);
    			attr_dev(img0, "alt", "image from lot x");
    			attr_dev(img0, "class", "img img-raised");
    			attr_dev(img0, "src", "imgs/lotx.jpg");
    			add_location(img0, file, 53, 6, 1481);
    			attr_dev(div8, "class", "card-image");
    			add_location(div8, file, 52, 5, 1450);
    			attr_dev(h40, "class", "card-category   svelte-b1nktv");
    			attr_dev(h40, "id", "lot");
    			add_location(h40, file, 56, 6, 1601);
    			add_location(br3, file, 59, 6, 1777);
    			attr_dev(p0, "class", "card-description");
    			add_location(p0, file, 57, 6, 1655);
    			attr_dev(a1, "alt", "link to LOT X website");
    			attr_dev(a1, "href", "http://www.adelheid.ca/projects/performance/photos-2/");
    			attr_dev(a1, "class", "btn btn-link btn-danger svelte-b1nktv");
    			add_location(a1, file, 61, 6, 1799);
    			attr_dev(div9, "class", "card-body");
    			add_location(div9, file, 55, 5, 1571);
    			attr_dev(div10, "class", "card card-blog svelte-b1nktv");
    			add_location(div10, file, 51, 4, 1416);
    			attr_dev(div11, "class", "col-md-2 offset-1");
    			add_location(div11, file, 50, 3, 1380);
    			attr_dev(img1, "alt", "image from cafe sarajevo");
    			attr_dev(img1, "class", "img img-raised");
    			attr_dev(img1, "src", "imgs/cafe.png");
    			add_location(img1, file, 71, 6, 2087);
    			attr_dev(div12, "class", "card-image");
    			add_location(div12, file, 70, 5, 2056);
    			attr_dev(h41, "class", "card-category    svelte-b1nktv");
    			add_location(h41, file, 74, 6, 2215);
    			add_location(br4, file, 77, 6, 2377);
    			attr_dev(p1, "class", "card-description");
    			add_location(p1, file, 75, 6, 2269);
    			attr_dev(a2, "alt", "link to Cafe Sarajevo website");
    			attr_dev(a2, "href", "http://www.bluemouthinc.com/productions/cafe-sarajevo/");
    			attr_dev(a2, "class", "btn btn-link btn-danger svelte-b1nktv");
    			add_location(a2, file, 79, 6, 2399);
    			attr_dev(div13, "class", "card-body");
    			add_location(div13, file, 73, 5, 2185);
    			attr_dev(div14, "class", "card card-blog svelte-b1nktv");
    			add_location(div14, file, 69, 4, 2022);
    			attr_dev(div15, "class", "col-md-2");
    			add_location(div15, file, 68, 10, 1995);
    			attr_dev(img2, "alt", "image from flux delux");
    			attr_dev(img2, "class", "img img-raised");
    			attr_dev(img2, "src", "imgs/flux.jpg");
    			add_location(img2, file, 87, 6, 2695);
    			attr_dev(div16, "class", "card-image");
    			add_location(div16, file, 86, 5, 2664);
    			attr_dev(h42, "class", "card-category   svelte-b1nktv");
    			add_location(h42, file, 90, 6, 2820);
    			add_location(br5, file, 93, 6, 2997);
    			attr_dev(p2, "class", "card-description");
    			add_location(p2, file, 91, 6, 2870);
    			attr_dev(a3, "alt", "link to FluX Delux website");
    			attr_dev(a3, "href", "https://peggybakerdance.com/fluxdelux");
    			attr_dev(a3, "class", "btn btn-link btn-danger svelte-b1nktv");
    			add_location(a3, file, 95, 6, 3019);
    			attr_dev(div17, "class", "card-body");
    			add_location(div17, file, 89, 5, 2790);
    			attr_dev(div18, "class", "card card-blog svelte-b1nktv");
    			add_location(div18, file, 85, 4, 2630);
    			attr_dev(div19, "class", "col-md-2");
    			add_location(div19, file, 84, 11, 2603);
    			attr_dev(img3, "alt", "image from overhear");
    			attr_dev(img3, "class", "img img-raised");
    			attr_dev(img3, "src", "imgs/overhear.jpg");
    			add_location(img3, file, 103, 6, 3295);
    			attr_dev(div20, "class", "card-image");
    			add_location(div20, file, 102, 5, 3264);
    			attr_dev(h43, "class", "card-category   svelte-b1nktv");
    			add_location(h43, file, 106, 6, 3422);
    			add_location(br6, file, 109, 6, 3642);
    			attr_dev(p3, "class", "card-description");
    			add_location(p3, file, 107, 6, 3470);
    			attr_dev(a4, "alt", "link to It's Not a Box Theatre website");
    			attr_dev(a4, "href", "https://www.itsnotaboxtheatre.ca/");
    			attr_dev(a4, "class", "btn btn-link btn-danger svelte-b1nktv");
    			add_location(a4, file, 111, 6, 3664);
    			attr_dev(div21, "class", "card-body");
    			add_location(div21, file, 105, 5, 3392);
    			attr_dev(div22, "class", "card card-blog svelte-b1nktv");
    			add_location(div22, file, 101, 4, 3230);
    			attr_dev(div23, "class", "col-md-2");
    			add_location(div23, file, 100, 10, 3203);
    			attr_dev(img4, "alt", "image from Jacqueries");
    			attr_dev(img4, "class", "img img-raised");
    			attr_dev(img4, "src", "imgs/jacqueries.jpg");
    			add_location(img4, file, 118, 6, 3948);
    			attr_dev(div24, "class", "card-image");
    			add_location(div24, file, 117, 5, 3917);
    			attr_dev(h44, "class", "card-category  svelte-b1nktv");
    			add_location(h44, file, 121, 6, 4079);
    			add_location(br7, file, 124, 6, 4240);
    			attr_dev(p4, "class", "card-description");
    			add_location(p4, file, 122, 6, 4128);
    			attr_dev(a5, "alt", "link to Jacqueries project website");
    			attr_dev(a5, "href", "http://jqrs.org/reviews/");
    			attr_dev(a5, "class", "btn btn-link btn-danger svelte-b1nktv");
    			add_location(a5, file, 126, 6, 4262);
    			attr_dev(div25, "class", "card-body");
    			add_location(div25, file, 120, 5, 4049);
    			attr_dev(div26, "class", "card card-blog svelte-b1nktv");
    			add_location(div26, file, 116, 4, 3883);
    			attr_dev(div27, "class", "col-md-2");
    			add_location(div27, file, 115, 11, 3856);
    			attr_dev(div28, "class", "row text-center");
    			add_location(div28, file, 49, 8, 1347);
    			attr_dev(div29, "class", "container");
    			add_location(div29, file, 41, 6, 1103);
    			attr_dev(div30, "class", "section text-center landing-section");
    			add_location(div30, file, 40, 4, 1047);
    			attr_dev(h21, "class", "title");
    			add_location(h21, file, 140, 15, 4672);
    			attr_dev(div31, "class", "col-md-12 ml-auto mr-auto");
    			add_location(div31, file, 139, 5, 4617);
    			attr_dev(div32, "class", "row");
    			add_location(div32, file, 138, 4, 4594);
    			add_location(br8, file, 143, 4, 4743);
    			add_location(br9, file, 144, 10, 4760);
    			attr_dev(a6, "alt", "link to Jacob's twitter");
    			attr_dev(a6, "href", "https://twitter.com/jakemoves");
    			add_location(a6, file, 147, 54, 4868);
    			attr_dev(h45, "class", "description");
    			add_location(h45, file, 147, 6, 4820);
    			attr_dev(div33, "class", "col");
    			add_location(div33, file, 146, 5, 4794);
    			attr_dev(div34, "class", "row");
    			add_location(div34, file, 145, 4, 4771);
    			attr_dev(div35, "class", "container");
    			add_location(div35, file, 137, 3, 4566);
    			attr_dev(div36, "class", "section text-center section-dark landing-section");
    			add_location(div36, file, 136, 2, 4500);
    			attr_dev(div37, "class", "wrapper");
    			add_location(div37, file, 135, 1, 4476);
    			attr_dev(h22, "class", "title");
    			add_location(h22, file, 159, 12, 5473);
    			attr_dev(div38, "class", "col-md-8 ml-auto mr-auto text-center");
    			add_location(div38, file, 158, 10, 5410);
    			attr_dev(div39, "class", "row");
    			add_location(div39, file, 157, 8, 5382);
    			attr_dev(div40, "class", "space-top");
    			add_location(div40, file, 162, 8, 5556);
    			attr_dev(img5, "alt", "Jacob's headshot");
    			attr_dev(img5, "class", "img");
    			attr_dev(img5, "src", "imgs/jacob.jpeg");
    			add_location(img5, file, 171, 22, 5870);
    			attr_dev(div41, "class", "card-img-top");
    			add_location(div41, file, 169, 18, 5801);
    			attr_dev(div42, "class", "col-md-5");
    			add_location(div42, file, 168, 16, 5760);
    			attr_dev(h46, "class", "card-title");
    			add_location(h46, file, 176, 20, 6110);
    			attr_dev(h60, "class", "card-category svelte-b1nktv");
    			add_location(h60, file, 177, 20, 6176);
    			attr_dev(p5, "class", "card-description");
    			add_location(p5, file, 178, 20, 6242);
    			attr_dev(div43, "class", "card-footer pull-left");
    			add_location(div43, file, 181, 20, 6374);
    			attr_dev(div44, "class", "card-body text-sm-center text-md-left");
    			add_location(div44, file, 175, 18, 6038);
    			attr_dev(div45, "class", "col-md-7");
    			add_location(div45, file, 174, 16, 5997);
    			attr_dev(div46, "class", "row");
    			add_location(div46, file, 167, 14, 5726);
    			attr_dev(div47, "class", "card card-profile card-plain");
    			add_location(div47, file, 166, 12, 5669);
    			attr_dev(div48, "class", "col-md-6");
    			attr_dev(div48, "id", "Jacob");
    			add_location(div48, file, 165, 10, 5623);
    			attr_dev(img6, "alt", "Nabeel's headshot");
    			attr_dev(img6, "class", "img");
    			attr_dev(img6, "src", "imgs/Nabeel.jpeg");
    			add_location(img6, file, 197, 22, 7201);
    			attr_dev(div49, "class", "card-img-top");
    			add_location(div49, file, 195, 18, 7131);
    			attr_dev(div50, "class", "col-md-5");
    			add_location(div50, file, 194, 16, 7090);
    			attr_dev(h47, "class", "card-title");
    			add_location(h47, file, 203, 20, 7464);
    			attr_dev(h61, "class", "card-category svelte-b1nktv");
    			add_location(h61, file, 204, 20, 7526);
    			attr_dev(p6, "class", "card-description");
    			add_location(p6, file, 205, 20, 7602);
    			attr_dev(div51, "class", "card-footer pull-left");
    			add_location(div51, file, 208, 20, 7735);
    			attr_dev(div52, "class", "card-body text-sm-center text-md-left");
    			add_location(div52, file, 202, 18, 7392);
    			attr_dev(div53, "class", "col-md-7");
    			add_location(div53, file, 201, 16, 7351);
    			attr_dev(div54, "class", "row");
    			add_location(div54, file, 193, 14, 7056);
    			attr_dev(div55, "class", "card card-profile card-plain");
    			add_location(div55, file, 192, 12, 6999);
    			attr_dev(div56, "class", "col-md-6");
    			attr_dev(div56, "id", "Nabeel");
    			add_location(div56, file, 191, 10, 6952);
    			attr_dev(img7, "alt", "Luke's headshot");
    			attr_dev(img7, "class", "img");
    			attr_dev(img7, "src", "imgs/Luke.jpg");
    			add_location(img7, file, 224, 22, 8543);
    			attr_dev(div57, "class", "card-img-top");
    			add_location(div57, file, 222, 18, 8473);
    			attr_dev(div58, "class", "col-md-5");
    			add_location(div58, file, 221, 16, 8432);
    			attr_dev(h48, "class", "card-title");
    			add_location(h48, file, 230, 20, 8801);
    			attr_dev(h62, "class", "card-category svelte-b1nktv");
    			add_location(h62, file, 231, 20, 8862);
    			attr_dev(p7, "class", "card-description");
    			add_location(p7, file, 232, 20, 8932);
    			attr_dev(div59, "class", "card-footer pull-left");
    			add_location(div59, file, 235, 20, 9146);
    			attr_dev(div60, "class", "card-body text-sm-center text-md-left");
    			add_location(div60, file, 229, 18, 8729);
    			attr_dev(div61, "class", "col-md-7");
    			add_location(div61, file, 228, 16, 8688);
    			attr_dev(div62, "class", "row");
    			add_location(div62, file, 220, 14, 8398);
    			attr_dev(div63, "class", "card card-profile card-plain");
    			add_location(div63, file, 219, 12, 8341);
    			attr_dev(div64, "class", "col-md-6");
    			attr_dev(div64, "id", "Luke");
    			add_location(div64, file, 218, 10, 8296);
    			attr_dev(img8, "alt", "Amanda's headshot");
    			attr_dev(img8, "class", "img");
    			attr_dev(img8, "src", "imgs/Amanda.jpeg");
    			add_location(img8, file, 251, 22, 9945);
    			attr_dev(div65, "class", "card-img-top");
    			add_location(div65, file, 249, 18, 9876);
    			attr_dev(div66, "class", "col-md-5");
    			add_location(div66, file, 248, 16, 9835);
    			attr_dev(h49, "class", "card-title");
    			add_location(h49, file, 257, 20, 10208);
    			attr_dev(h63, "class", "card-category svelte-b1nktv");
    			add_location(h63, file, 258, 20, 10269);
    			attr_dev(p8, "class", "card-description");
    			add_location(p8, file, 259, 20, 10338);
    			attr_dev(div67, "class", "card-footer pull-left");
    			add_location(div67, file, 262, 20, 10557);
    			attr_dev(div68, "class", "card-body text-sm-center text-md-left");
    			add_location(div68, file, 256, 18, 10136);
    			attr_dev(div69, "class", "col-md-7");
    			add_location(div69, file, 255, 16, 10095);
    			attr_dev(div70, "class", "row");
    			add_location(div70, file, 247, 14, 9801);
    			attr_dev(div71, "class", "card card-profile card-plain");
    			add_location(div71, file, 246, 12, 9744);
    			attr_dev(div72, "class", "col-md-6");
    			attr_dev(div72, "id", "Amanda");
    			add_location(div72, file, 245, 10, 9697);
    			attr_dev(div73, "class", "row");
    			add_location(div73, file, 164, 8, 5595);
    			attr_dev(div74, "class", "container");
    			add_location(div74, file, 156, 6, 5350);
    			attr_dev(div75, "class", "team-3");
    			add_location(div75, file, 155, 1, 5323);
    			attr_dev(h23, "class", "title");
    			add_location(h23, file, 281, 15, 11345);
    			attr_dev(div76, "class", "col-md-12 ml-auto mr-auto");
    			add_location(div76, file, 280, 5, 11290);
    			attr_dev(div77, "class", "row");
    			add_location(div77, file, 279, 4, 11267);
    			add_location(br10, file, 284, 4, 11416);
    			add_location(br11, file, 285, 10, 11433);
    			attr_dev(h31, "class", "title");
    			add_location(h31, file, 288, 6, 11498);
    			attr_dev(a7, "alt", "link to github repo");
    			attr_dev(a7, "href", "https://github.com/jakemoves/cohort-server");
    			add_location(a7, file, 289, 85, 11626);
    			attr_dev(h410, "class", "description");
    			add_location(h410, file, 289, 6, 11547);
    			attr_dev(div78, "class", "col-md-6");
    			add_location(div78, file, 287, 5, 11467);
    			attr_dev(h32, "class", "title");
    			add_location(h32, file, 293, 6, 11804);
    			attr_dev(a8, "alt", "link to Jake's twitter");
    			attr_dev(a8, "href", "https://twitter.com/jakemoves");
    			add_location(a8, file, 294, 49, 11903);
    			attr_dev(h411, "class", "description");
    			add_location(h411, file, 294, 6, 11860);
    			attr_dev(div79, "class", "col-md-6");
    			add_location(div79, file, 292, 5, 11773);
    			attr_dev(div80, "class", "row");
    			add_location(div80, file, 286, 4, 11444);
    			attr_dev(div81, "class", "container");
    			add_location(div81, file, 278, 3, 11239);
    			attr_dev(div82, "class", "section text-center section-dark landing-section");
    			add_location(div82, file, 277, 2, 11173);
    			attr_dev(div83, "class", "wrapper");
    			add_location(div83, file, 276, 1, 11149);
    			attr_dev(h24, "class", "title");
    			add_location(h24, file, 307, 15, 12306);
    			attr_dev(div84, "class", "col-md-12 ml-auto mr-auto");
    			add_location(div84, file, 306, 5, 12251);
    			attr_dev(div85, "class", "row");
    			add_location(div85, file, 305, 4, 12228);
    			add_location(br12, file, 310, 4, 12393);
    			add_location(br13, file, 311, 10, 12410);
    			attr_dev(a9, "href", "https://github.com/jakemoves/cohort-server");
    			add_location(a9, file, 315, 20, 12550);
    			add_location(li0, file, 315, 16, 12546);
    			attr_dev(a10, "href", "https://github.com/jakemoves/cohort-unity-client-demo");
    			add_location(a10, file, 318, 25, 12716);
    			add_location(li1, file, 318, 21, 12712);
    			attr_dev(a11, "href", "https://cohort.rocks/cohort-unity-client-latest.unitypackage");
    			add_location(a11, file, 319, 25, 12830);
    			add_location(li2, file, 319, 21, 12826);
    			add_location(summary, file, 322, 25, 13010);
    			attr_dev(a12, "href", "https://cohort.rocks/cohort-unity-client-v0.1.1.unitypackage");
    			add_location(a12, file, 324, 16, 13074);
    			add_location(li3, file, 324, 12, 13070);
    			add_location(ul0, file, 323, 11, 13053);
    			add_location(details, file, 321, 24, 12975);
    			add_location(li4, file, 320, 22, 12946);
    			add_location(ul1, file, 317, 19, 12686);
    			add_location(li5, file, 316, 16, 12642);
    			attr_dev(a13, "href", "https://github.com/jakemoves/cohort-osc-bridge");
    			add_location(a13, file, 330, 20, 13307);
    			add_location(li6, file, 330, 16, 13303);
    			attr_dev(a14, "href", "https://documenter.getpostman.com/view/249223/RznJmbco");
    			add_location(a14, file, 331, 20, 13455);
    			add_location(li7, file, 331, 16, 13451);
    			attr_dev(h412, "class", "description");
    			add_location(h412, file, 314, 10, 12505);
    			add_location(ul2, file, 314, 6, 12501);
    			attr_dev(div86, "class", "col-md-4 ml-auto mr-auto");
    			add_location(div86, file, 313, 5, 12456);
    			attr_dev(div87, "class", "row text-center");
    			add_location(div87, file, 312, 4, 12421);
    			attr_dev(div88, "class", "container");
    			add_location(div88, file, 304, 3, 12200);
    			attr_dev(div89, "class", "section text-center landing-section");
    			add_location(div89, file, 303, 2, 12147);
    			attr_dev(div90, "class", "wrapper");
    			add_location(div90, file, 302, 1, 12123);
    			add_location(hr, file, 339, 0, 13622);
    			attr_dev(a15, "href", "http://www.bluemouthinc.com");
    			add_location(a15, file, 345, 244, 14061);
    			attr_dev(a16, "href", "https://peggybakerdance.com");
    			add_location(a16, file, 345, 301, 14118);
    			attr_dev(a17, "href", "https://www.itsnotaboxtheatre.ca");
    			add_location(a17, file, 345, 375, 14192);
    			attr_dev(p9, "class", "small");
    			add_location(p9, file, 345, 5, 13822);
    			attr_dev(div91, "class", "row");
    			add_location(div91, file, 344, 4, 13799);
    			set_style(footer, "z-index", "100");
    			attr_dev(footer, "class", "footer footer-white ");
    			add_location(footer, file, 343, 3, 13734);
    			attr_dev(div92, "class", "container");
    			add_location(div92, file, 342, 7, 13707);
    			attr_dev(div93, "class", "section text-center landing-section");
    			add_location(div93, file, 341, 1, 13650);
    			attr_dev(div94, "class", "wrapper");
    			add_location(div94, file, 340, 0, 13627);
    			attr_dev(div95, "class", "wrapper");
    			add_location(div95, file, 39, 2, 1021);
    			attr_dev(body, "class", "landing-page sidebar-collapse");
    			add_location(body, file, 20, 0, 164);
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
    			append_dev(div73, t63);
    			append_dev(div73, div56);
    			append_dev(div56, div55);
    			append_dev(div55, div54);
    			append_dev(div54, div50);
    			append_dev(div50, div49);
    			append_dev(div49, img6);
    			append_dev(div54, t64);
    			append_dev(div54, div53);
    			append_dev(div53, div52);
    			append_dev(div52, h47);
    			append_dev(div52, t66);
    			append_dev(div52, h61);
    			append_dev(div52, t68);
    			append_dev(div52, p6);
    			append_dev(div52, t69);
    			append_dev(div52, div51);
    			append_dev(div73, t70);
    			append_dev(div73, div64);
    			append_dev(div64, div63);
    			append_dev(div63, div62);
    			append_dev(div62, div58);
    			append_dev(div58, div57);
    			append_dev(div57, img7);
    			append_dev(div62, t71);
    			append_dev(div62, div61);
    			append_dev(div61, div60);
    			append_dev(div60, h48);
    			append_dev(div60, t73);
    			append_dev(div60, h62);
    			append_dev(div60, t75);
    			append_dev(div60, p7);
    			append_dev(div60, t76);
    			append_dev(div60, div59);
    			append_dev(div73, t77);
    			append_dev(div73, div72);
    			append_dev(div72, div71);
    			append_dev(div71, div70);
    			append_dev(div70, div66);
    			append_dev(div66, div65);
    			append_dev(div65, img8);
    			append_dev(div70, t78);
    			append_dev(div70, div69);
    			append_dev(div69, div68);
    			append_dev(div68, h49);
    			append_dev(div68, t80);
    			append_dev(div68, h63);
    			append_dev(div68, t82);
    			append_dev(div68, p8);
    			append_dev(div68, t83);
    			append_dev(div68, div67);
    			append_dev(div95, t84);
    			append_dev(div95, div83);
    			append_dev(div83, div82);
    			append_dev(div82, div81);
    			append_dev(div81, div77);
    			append_dev(div77, div76);
    			append_dev(div76, h23);
    			append_dev(div81, t86);
    			append_dev(div81, br10);
    			append_dev(div81, t87);
    			append_dev(div81, br11);
    			append_dev(div81, t88);
    			append_dev(div81, div80);
    			append_dev(div80, div78);
    			append_dev(div78, h31);
    			append_dev(div78, t90);
    			append_dev(div78, h410);
    			append_dev(h410, t91);
    			append_dev(h410, a7);
    			append_dev(h410, t93);
    			append_dev(div80, t94);
    			append_dev(div80, div79);
    			append_dev(div79, h32);
    			append_dev(div79, t96);
    			append_dev(div79, h411);
    			append_dev(h411, t97);
    			append_dev(h411, a8);
    			append_dev(h411, t99);
    			append_dev(div95, t100);
    			append_dev(div95, div90);
    			append_dev(div90, div89);
    			append_dev(div89, div88);
    			append_dev(div88, div85);
    			append_dev(div85, div84);
    			append_dev(div84, h24);
    			append_dev(div88, t102);
    			append_dev(div88, br12);
    			append_dev(div88, t103);
    			append_dev(div88, br13);
    			append_dev(div88, t104);
    			append_dev(div88, div87);
    			append_dev(div87, div86);
    			append_dev(div86, ul2);
    			append_dev(ul2, h412);
    			append_dev(h412, li0);
    			append_dev(li0, a9);
    			append_dev(h412, t106);
    			append_dev(h412, li5);
    			append_dev(li5, t107);
    			append_dev(li5, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, a10);
    			append_dev(ul1, t109);
    			append_dev(ul1, li2);
    			append_dev(li2, a11);
    			append_dev(ul1, t111);
    			append_dev(ul1, li4);
    			append_dev(li4, details);
    			append_dev(details, summary);
    			append_dev(details, t113);
    			append_dev(details, ul0);
    			append_dev(ul0, li3);
    			append_dev(li3, a12);
    			append_dev(h412, t115);
    			append_dev(h412, li6);
    			append_dev(li6, a13);
    			append_dev(li6, t117);
    			append_dev(h412, t118);
    			append_dev(h412, li7);
    			append_dev(li7, a14);
    			append_dev(div95, t120);
    			append_dev(div95, hr);
    			append_dev(div95, t121);
    			append_dev(div95, div94);
    			append_dev(div94, div93);
    			append_dev(div93, div92);
    			append_dev(div92, footer);
    			append_dev(footer, div91);
    			append_dev(div91, p9);
    			append_dev(p9, t122);
    			append_dev(p9, a15);
    			append_dev(p9, t124);
    			append_dev(p9, a16);
    			append_dev(p9, t126);
    			append_dev(p9, a17);
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
