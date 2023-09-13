//console.log('here is gsap lib', gsap)
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const scoreEl = document.querySelector('#scoreEl')
const gameOverEl = document.querySelector('.game-over')
const gameOverscoreEl = document.querySelector('#gameOverscoreEl')
const restart = document.querySelector('#restBtn')
const startBtn = document.querySelector('#startBtn')
const startScreen = document.querySelector('.start-screen')
//console.log(context)
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const playerPositionX = canvas.width / 2
const playerPositiony = canvas.height / 2
//console.log(player)
let player = new Player(playerPositionX, playerPositiony, 15, 'white')
let projectilesArray = []
let enemiesArray = []
let particles = []
let animationId
let intervalId
let score = 0
let powerUps = []
let spawnPowerUpsId
let frames = 0
let backgroundParticles = []

function init() {
  player = new Player(playerPositionX, playerPositiony, 15, 'white')
  projectilesArray = []
  enemiesArray = []
  particles = []
  powerUps = []
  animationId
  score = 0
  scoreEl.innerHTML = 0
  frames = 0
  backgroundParticles = []
  const spacing = 30
  clearInterval(spawnPowerUpsId)
  spawnPowerUpsId = null
  for (let x = 0; x < canvas.width + spacing; x += spacing) {
    for (let y = 0; y < canvas.height + spacing; y += spacing) {
      backgroundParticles.push(
        new BackgroundParticle({
          position: {
            x: x,
            y: y,
          },
          radious: 3,
        })
      )
    }
  }
}

function spawnEnemies() {
  intervalId = setInterval(() => {
    //console.log(intervalId)
    const radious = Math.random() * (30 - 8) + 8
    let x
    let y
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radious : canvas.width + radious
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radious : canvas.height + radious
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }

    enemiesArray.push(new Enemy(x, y, radious, color, velocity))
    //console.log('Enemies Array----->>>>>', enemiesArray)
  }, 2000)
}

function spawnPowerUps() {
  spawnPowerUpsId = setInterval(() => {
    powerUps.push(
      new PowerUp({
        position: {
          x: -30,
          y: Math.random() * canvas.height,
        },
        velocity: {
          x: Math.random() + 1,
          y: 0,
        },
      })
    )
  }, 10000)
}

function createScoreLabel({ position, score }) {
  const scoreLabel = document.createElement('label')
  scoreLabel.innerHTML = score
  scoreLabel.style.color = 'gold'
  scoreLabel.style.position = 'absolute'
  scoreLabel.style.left = position.x + 'px'
  scoreLabel.style.top = position.y + 'px'
  scoreLabel.style.userSelect = 'none'

  document.body.appendChild(scoreLabel)

  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 1,
    onComplete: () => {
      scoreLabel.parentNode.removeChild(scoreLabel)
    },
  })
}
function animate() {
  //console.log(animate)
  animationId = requestAnimationFrame(animate)
  context.fillStyle = 'rgba(0, 0, 0, 0.1)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  frames++
  backgroundParticles.forEach(backgroundParticle => {
    backgroundParticle.draw()

    const distance = Math.hypot(
      player.x - backgroundParticle.position.x,
      player.y - backgroundParticle.position.y
    )
    if (distance < 130) {
      backgroundParticle.alpha = 0
      if (distance > 80) {
        backgroundParticle.alpha = 0.9
      }
    } else if (distance > 100 && backgroundParticle.alpha < 0.1) {
      backgroundParticle.alpha += 0.03
    } else if (distance > 100 && backgroundParticle.alpha > 0.1) {
      backgroundParticle.alpha -= 0.03
    }
  })
  player.update()

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i]

    if (powerUp.position.x > canvas.width) {
      powerUps.splice(i, 1)
    } else powerUp.update()

    const distance = Math.hypot(player.x - powerUp.position.x, player.y - powerUp.position.y)
    if (distance < powerUp.image.height / 2 + player.radious) {
      //console.log('get it')

      //catch power up
      powerUps.splice(i, 1)
      player.powerUp = 'AutoGun'
      player.color = 'red'
      //power up runs out
      setTimeout(() => {
        player.powerUp = null
        player.color = 'white'
      }, 5000)
    }
  }
  //console.log('PowerUps', powerUps)
  if (player.powerUp === 'AutoGun') {
    const angle = Math.atan2(mouse.position.y - player.y, mouse.position.x - player.x)
    const velocity = {
      x: Math.cos(angle) * 4,
      y: Math.sin(angle) * 4,
    }
    if (frames % 5 === 0)
      projectilesArray.push(new Projectile(player.x, player.y, 5, 'red', velocity))
  }

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index]
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  }

  for (let index = projectilesArray.length - 1; index >= 0; index--) {
    const projectile = projectilesArray[index]
    projectile.update()
    //remove from the edges of the screen
    if (
      projectile.x + projectile.radious < 0 ||
      projectile.x - projectile.radious > canvas.width ||
      projectile.y + projectile.radious < 0 ||
      projectile.y - projectile.radious > canvas.height
    ) {
      projectilesArray.splice(index, 1)
    }
  }

  for (let index = enemiesArray.length - 1; index >= 0; index--) {
    const enemy = enemiesArray[index]
    enemy.update()

    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    //Game Over
    if (distance - enemy.radious - player.radious < 1) {
      console.log('Game Over')
      cancelAnimationFrame(animationId)
      clearInterval(intervalId)
      console.log(intervalId)
      gameOverEl.style.display = 'block'
      gsap.fromTo(
        '.game-over',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: 'expo',
        }
      )

      gameOverscoreEl.innerHTML = score
    }

    for (
      let projectileIndex = projectilesArray.length - 1;
      projectileIndex >= 0;
      projectileIndex--
    ) {
      const projectile = projectilesArray[projectileIndex]

      const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      // console.log(distance)

      //when projectiles touch enemy
      if (distance - enemy.radious - projectile.radious < 1) {
        //Create explosions
        for (let i = 0; i < enemy.radious * 2; i++) {
          particles.push(
            new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
              x: (Math.random() - 0.5) * (Math.random() * 6),
              y: (Math.random() - 0.5) * (Math.random() * 6),
            })
          )
        }
        //where shrink enemy
        if (enemy.radious - 10 > 5) {
          score += 25
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radious: enemy.radious - 10,
          })
          createScoreLabel({
            position: {
              x: projectile.x,
              y: projectile.y,
            },
            score: 25,
          })
          projectilesArray.splice(projectileIndex, 1)
        } else {
          //remove enemy if is small
          score += 100
          scoreEl.innerHTML = score
          createScoreLabel({
            position: {
              x: projectile.x,
              y: projectile.y,
            },
            score: 100,
          })
          backgroundParticles.forEach(backgroundParticle => {
            gsap.set(backgroundParticle, {
              color: 'white',
              alpha: 1,
            })
            gsap.to(backgroundParticle, {
              color: enemy.color,
              alpha: 0.1,
            })
          })
          //console.log('remove from the screen')
          enemiesArray.splice(index, 1)
          projectilesArray.splice(projectileIndex, 1)
        }
      }
    }
  }
}

//events

window.addEventListener('click', event => {
  //console.log(projectilesArray)
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x)
  //console.log(angle)
  const velocity = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4,
  }
  projectilesArray.push(new Projectile(player.x, player.y, 5, 'white', velocity))
})

const mouse = {
  position: {
    x: 0,
    y: 0,
  },
}
window.addEventListener('mousemove', event => {
  mouse.position.x = event.clientX
  mouse.position.y = event.clientY
})

restart.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  spawnPowerUps()
  gsap.to('.game-over', {
    opacity: 0,
    scale: 0,
    duration: 0.5,
    ease: 'expo.in',
    onComplete: () => {
      gameOverEl.style.display = 'none'
    },
  })
})

startBtn.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  spawnPowerUps()
  gsap.to('.start-screen', {
    opacity: 0,
    scale: 0,
    duration: 0.3,
    ease: 'expo.in',
    onComplete: () => {
      startScreen.style.display = 'none'
    },
  })
})

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  init()
})

window.addEventListener('keydown', event => {
  event.preventDefault()
  console.log(event.key)
  switch (event.key) {
    case 'ArrowRight':
    case 'd':
      player.velocity.x += 1
      break
    case 'ArrowUp':
    case 'w':
      player.velocity.y -= 1
      break
    case 'ArrowLeft':
    case 'a':
      player.velocity.x -= 1
      break
    case 'ArrowDown':
    case 's':
      player.velocity.y += 1
      break
  }
})
