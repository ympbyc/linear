/* Linear screenless interface *
 * Minori Yamashita 2020       */

var queue = [];
function speak_queue () {
  var utt;
  if (speechSynthesis.speaking)
    return;
  else {
    if (utt = queue.shift())
      speechSynthesis.speak(utt);
  }
}
setInterval(speak_queue, 100);

var utt_params = {
  default: {
    pitch: 1,
    rate: 1,
    lang: "en-US"
  },
  key: {
    pitch: 1,
    rate: 40,
    lang: "ja-JP"
  },
  print: {
    pitch: 1,
    rate: 1,
    lang: "en-US",
    voice: speechSynthesis.getVoices().find((x)=>x.name==="Karen")
  }
};

function make_utt (text, param_key="default") {
  var utt = new SpeechSynthesisUtterance();
  utt.text = text;
  return Object.assign(utt, utt_params[param_key]);
}

speechSynthesis.speak(make_utt("Linear, screenless programming environment. If you are new, just type help followed by Enter."));

var forth = new_forth()

var src = [];
var w_in = document.getElementById("word-in");
w_in.focus();
var last_w_in = "";
w_in.addEventListener("keyup", (e)=>{
  window.kue = e;
  if (e.key === " " || e.key === "Enter") 
    word_in();
  else if (e.key === "Backspace" && w_in.value === "") {
    if (last_w_in === "") src.pop();
    show_src();
  }
  else {
    say_key(e.key);
  }
  last_w_in = w_in.value;
});

function word_in () {
  var w = w_in.value.trim();
  if (w.length <= 0) return;
  queue.push(make_utt(w)); //speak word
  if (execute(w)) src.push(w);
  show_src();
  w_in.value = "";
}

function execute (w) {
  if (w === "ss") {
    queue.push(make_utt(src.join(", ") + "."));
    return false;
  }
  if (w === "ssf") {
    queue.push(make_utt(src.join(" ") + "."));
    return false;
  }
  forth(w);
  return true;
}

var source = document.getElementById("source");
function show_src () {
  source.innerHTML = src.join(" ");
}

function say_key (key) {
  speechSynthesis.cancel();
  speechSynthesis.speak(make_utt(key, "key"));
}

this.present = function (x) {
  console.log(x);
  queue.push(make_utt(x, "print"));
}



