/*  List.js                                            *
 *  Absolutely minimum set of list functions a la Lisp *
 *  Author: Minori Yamashita 2020                      */

//usage example: node -e "`cat lisp.js`" -i

with (require('js-clos')) {
  var Cons = define_class([], (x)=> slot_exists(x, 'car') && slot_exists(x, 'cdr'));
  var car  = define_generic();
  var cdr  = define_generic();
  define_method(car, [Cons], (xs)=>xs.car);
  define_method(car, [null], (_)=>null);
  define_method(cdr, [Cons], (xs)=>xs.cdr);
  define_method(cdr, [null], (_)=>null);

  function cons (head, tail) {
    return new Cons({car: head, cdr: tail});
  }
  function list (...params) {
    return params.reverse().reduce((prev,curr)=>{
      return cons(curr,prev);
    }, null);
  }

  var foldl = define_generic();
  define_method(foldl, [Function, undefined, null], (fn, init, _)=>init);
  define_method(foldl, [Function, undefined, Cons], 
                (fn, init, xs)=>foldl(fn, fn(init, car(xs)), cdr(xs)));
  var toarray = define_generic();
  define_method(toarray, [null], (_)=>[]);
  define_method(toarray, [Cons], (xs)=>foldl(((prev,curr)=>{
    prev.push(curr); 
    return prev;
  }), [], xs))

  var show = define_generic();
  define_method(show, [Cons], 
                (xs)=> "(" + toarray(xs).join(" ") + ")");
  define_method(show, [undefined], (x)=>x);
  Cons.prototype.toString = function () {
    return show(this);
  }
}
