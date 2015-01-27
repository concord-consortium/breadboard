sound = {};

sound.mute = false;

sound.play = function (sound) {
  if (!!window.Audio && !sound.mute) {
    sound.play();
  }
}

module.exports = sound;
