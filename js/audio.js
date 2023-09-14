const audio = {
  shoot: new Howl({
    src: './audio/Shoot.wav',
    volume: 0.06,
  }),

  damage: new Howl({
    src: './audio/Damage.wav',
    volume: 0.1,
  }),

  kill: new Howl({
    src: './audio/Kill.wav',
    volume: 0.1,
  }),
  death: new Howl({
    src: './audio/Death.wav',
    volume: 0.1,
  }),
  powerUp: new Howl({
    src: './audio/Powerup.wav',
    volume: 0.1,
  }),
  select: new Howl({
    src: './audio/Select.wav',
    volume: 0.3,
    html5: true,
  }),
  background: new Howl({
    src: './audio/Background.mp3',
    volume: 0.08,
    loop: true,
  }),
}
