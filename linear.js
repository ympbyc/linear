/*  Linear.js                  *
 *   Minori Yamashita 2020     *
 *  loosely based on LOL Forth */

//todo: drop js-clos ?
//      research Symbol

var clos = require('js-clos'),
    l    = require('./list.js');

var debug = false;
with (Object.assign(clos, l)) {
  var Machine = define_class([], (x)=>{
    return slot_exists(x, 'pstack', Cons) || slot_exists(x, 'pstack', null)
        && slot_exists(x, 'rstack', Cons) || slot_exists(x, 'pstack', null)
        && slot_exists(x, 'pc')
        && slot_exists(x, 'dict', Object)
        && slot_exists(x, 'closing', 'boolean');
  });

  var Word = define_class([], (x)=>{
    return slot_exists(x, 'name', 'string')
        && slot_exists(x, 'immediate', 'boolean')
        && slot_exists(x, 'thread');
  });
  function make_word (name, immediate, thread, naked) {
    return new Word({
      name: name, 
      immediate: immediate, 
      thread: naked ? thread : Object.assign((m)=>{thread(m); m.pc=cdr(m.pc);}, {_name: name})
    });
  }
  define_method(show, [Function], (x)=>{ return "[λ " + (x._name || x.name) + "]"});

  function lookup (w, machine) {
    return machine.dict[w] || null;
  }

  function inner_interpreter (machine) {
    with (machine) {
      if (debug) console.log(Object.assign({}, machine, {pc: show(pc),
          pstack: show(pstack), rstack: show(rstack), dict: null}));
      while ( ! (nullp(pc) && nullp(rstack))) {
        var top = car(pc);
        if (typeof top === 'function') {
          top.call(null, machine);
        } else if (clos.isA(top, Cons)) {
          rstack = cons(cdr(pc), rstack);
          pc = top;
        } else if (nullp(pc)) {
          pc = car(rstack);
          rstack = cdr(rstack);
        } else {
          pstack = cons(top, pstack);
          pc = cdr(pc);
        }
        if (debug) console.log(Object.assign({}, machine, {pc: show(pc),
          pstack: show(pstack), rstack: show(rstack), dict: null}));
      }
    }
  }

  /* primitives */
  var prims = [];
  prims.push(make_word('nop', false,  ((m)=>{})));
  prims.push(make_word('drop', false, (m)=>m.pstack = cdr(m.pstack)));
  prims.push(make_word('dup',  false, (m)=>m.pstack = cons(car(m.pstack), m.pstack)));
  prims.push(make_word('swap', false, (m)=>
    m.pstack = cons(cons(car(m.pstack), car(cdr(m.pstack))), cdr(cdr(m.pstack)))));
  prims.push(make_word('print', false,  (m)=>console.info(">>>"+car(m.pstack))));
  prims.push(make_word('pstack', false, (m)=>console.log(show(m.pstack))));
  prims.push(make_word('rstack', false, (m)=>console.log(show(m.rstack))));
  prims.push(make_word('>r', false, (m)=>{
    m.rstack = cons(car(m.pstack), m.rstack);
    m.pstack = cdr(m.pstack);
  }));
  prims.push(make_word('<r', false, (m)=>{
    m.pstack = cons(car(m.rstack), m.pstack);
    m.rstack = cdr(m.rstack);
  }));
  prims.push(make_word('machine', false, (m)=>m.pstack = cons(m, m.pstack)));
  prims.push(make_word('access', false, (m)=>{
    m.pstack = cons(car(cdr(m.pstack))[car(m.pstack)], cdr(cdr(m.pstack)));
  }));
  prims.push(make_word('invoke', false, (m)=>{
    var method_name = car(m.pstack);
    var obj = car(cdr(m.pstack));
    var args = car(cdr(cdr(m.pstack)));
    var rest = cdr(cdr(cdr(m.pstack)));
    m.pstack = cons(obj[method_name].apply(obj, args), rest); 
  }));
  prims.push(make_word('close', false, (m)=>{
    var thread = null;
    var closure = function (m) {
      //m.rstack = cons(cdr(m.pc), m.rstack);
      m.pc = foldl((prev,curr)=>cons(curr,prev), null, thread);
    };
    closure.close_in = function (x) {
      thread = cons(x, thread);
    };
    m.closing = true;
    m.pstack = cons(closure, m.pstack);
  }));
  prims.push(make_word('open', true, (m)=>{
    m.closing = false;
  }));
  prims.push(make_word('name', false, (m)=>{
    /*debug info*/ car(cdr(m.pstack))._name = car(m.pstack);
    m.dict[car(m.pstack)] = make_word(car(m.pstack), false, list(car(cdr(m.pstack))), true);
    m.pstack = cons(car(m.pstack), cdr(cdr(m.pstack)));
  }));
  prims.push(make_word('immediate', false, (m)=>{
    m.dict[car(m.pstack)].immediate = true;
  }));


  function new_forth () {
    var machine = new Machine({pstack:null, rstack:null, pc:null, dict:{}, closing:false});
    prims.forEach((w) => machine.dict[w.name] = w);
    return Object.assign(function (v) {
      //console.log(v);
      try {
        var w = lookup(v, machine);
        if (w)
          handle_found(w, machine);
        else
          handle_not_found(v, machine);
        return "ok";
      } catch (err) { console.error(err) }
    }, {machine:machine});
  }

  function handle_found (word, machine) {
    if (machine.closing && (! word.immediate))
      car(machine.pstack).close_in(word.thread);
    else {
      machine.pc = list(word.thread);
      inner_interpreter(machine);
    }
  }

  function has_method (method_name, obj) {
    return Object.getPrototypeOf(obj).hasOwnProperty(method_name);
  }

  function symbolp (v) {
    return v.search(/[a-zA-Z]/) === 0; ///
  }

  function handle_not_found (v, machine) {
    if (v.startsWith("'")) {
      var sym = v.substr(1);
      if (machine.closing)
        car(machine.pstack).close_in(sym);
      else
        machine.pstack = cons(sym, machine.pstack);
    } else if (symbolp(v)) {
        if (machine.closing)
          car(machine.pstack).close_in(v);
        else
          machine.pstack = cons(v, machine.pstack);
        handle_found(lookup('invoke', machine));
    } else {
      if (machine.closing)
        car(machine.pstack).close_in(eval(v));
      else machine.pstack = cons(eval(v), machine.pstack);
    }
  }
}
