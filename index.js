/* Linear screenless interface *
 * Minori Yamashita 2020       */

var utt = new SpeechSynthesisUtterance();
utt.pitch = 1;
utt.rate = 1;
utt.lang = "en-US";
utt.text = "Linear, screenless programming environment. If you are new, just type help followed by Enter.";

speechSynthesis.speak(utt);

var src = [];
var word = "";
var wutt = new SpeechSynthesisUtterance();
wutt.pitch = 0;
wutt.rate = 1;
wutt.lang = "en-US";
var kutt = new SpeechSynthesisUtterance();
kutt.pitch = 0;
kutt.rate = 40;
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
  speak_word(w);
  if (execute(w)) src.push(w);
  show_src();
  w_in.value = "";
}

function execute (w) {
  if (w === "ss") {
    utt.text = src.join(", ") + ".";
    speechSynthesis.cancel();
    speechSynthesis.speak(utt);
    return false;
  }
  if (w === "ssf") {
    utt.text = src.join(" ") + ".";
    speechSynthesis.cancel();
    speechSynthesis.speak(utt);
    return false;
  }
  return true;
}

var source = document.getElementById("source");
function show_src () {
  source.innerHTML = src.join(" ");
}

function speak_word (word) {
  wutt.text = word;
  speechSynthesis.cancel();
  speechSynthesis.speak(wutt);
}

function say_key (key) {
  kutt.text = key;
  speechSynthesis.cancel();
  speechSynthesis.speak(kutt);
}




