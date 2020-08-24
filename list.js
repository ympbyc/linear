/*  List.js                                            *
 *  Absolutely minimum set of list functions a la Lisp *
 *  Author: Minori Yamashita 2020                      */

//usage example: node -e "`cat lisp.js`" -i
if (this.require)
  this.CLOS = require('js-clos');
else {
  this.List = {};
  exports = this.List;
}

with (this.CLOS) {
  var Cons = define_class([], (x)=> slot_exists(x, 'car') && slot_exists(x, 'cdr'));
  var car  = define_generic(false, 'car');
  var cdr  = define_generic(false, 'cdr');
  define_method(car, [Cons], (xs)=>xs.car);
  define_method(car, [null], (_)=>null);
  define_method(cdr, [Cons], (xs)=>xs.cdr);
  define_method(cdr, [null], (_)=>null);
  var nullp = define_generic(false, 'nullp');
  define_method(nullp, [null], (_)=>true);
  define_method(nullp, [undefined], (_)=>false);

  function cons (head, tail) {
    return new Cons({car: head, cdr: tail});
  }
  function list (...params) {
    return params.reverse().reduce((prev,curr)=>{
      return cons(curr,prev);
    }, null);
  }

  var foldl = define_generic(false, 'foldl');
  define_method(foldl, [Function, undefined, null], (fn, init, _)=>init);
  define_method(foldl, [Function, undefined, Cons], 
                (fn, init, xs)=>foldl(fn, fn(init, car(xs)), cdr(xs)));
  var toarray = define_generic(false, 'toarray');
  define_method(toarray, [null], (_)=>[]);
  define_method(toarray, [Cons], (xs)=>foldl(((prev,curr)=>{
    prev.push(curr); 
    return prev;
  }), [], xs));

  var show = define_generic(false, 'show');
  define_method(show, [Cons], 
                (xs)=> "( " + toarray(xs).map(show).join(" ") + " )");
  define_method(show, [Array],
                (xs)=> "[ " + xs.map(show).join(" ") + " ]");
  define_method(show, [null], (x)=>"()");
  define_method(show, [undefined], (x)=>x);

  Cons.prototype.toString = function () {
    return show(this);
  }

  exports.Cons    = Cons;
  exports.cons    = cons;
  exports.car     = car;
  exports.cdr     = cdr;
  exports.nullp   = nullp;
  exports.list    = list;
  exports.foldl   = foldl;
  exports.toarray = toarray;
  exports.show    = show;
  exports.reverse = (xs)=>foldl((prev,curr)=>cons(curr,prev), null, xs);
}
