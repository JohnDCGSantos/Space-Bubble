console.log('here is gsap lib', gsap)
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const scoreEl = document.querySelector('#scoreEl')
const gameOverEl = document.querySelector('.game-over')
const gameOverscoreEl = document.querySelector('#gameOverscoreEl')
const restart = document.querySelector('#restBtn')
const startBtn = document.querySelector('#startBtn')
const startScreen = document.querySelector('.start-screen')

console.log(context)

canvas.width = window.innerWidth
canvas.height = window.innerHeight

class Player {
  constructor(x, y, radious, color) {
    this.x = x
    this.y = y
    this.radious = radious
    this.color = color
    this.velocity = {
      x: 0,
      y: 0,
    }
  }

  draw() {
    context.beginPath()
    context.arc(this.x, this.y, this.radious, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
  }
  update() {
    this.draw()
    const friction = 0.98
    this.velocity.x *= friction
    this.velocity.y *= friction
    //colision detection player vs canvas x
    if (
      this.x + this.radious + this.velocity.x <= canvas.width &&
      this.x - this.radious + this.velocity.x >= 0
    ) {
      this.x += this.velocity.x
    } else {
      this.velocity.x = 0
    }
    //colision detection player vs canvas y
    if (
      this.y + this.radious + this.velocity.y <= canvas.width &&
      this.y - this.radious + this.velocity.y >= 0
    ) {
      this.y += this.velocity.y
    } else {
      this.velocity.y = 0
    }
  }
}

class Projectile {
  constructor(x, y, radious, color, velocity) {
    this.x = x
    this.y = y
    this.radious = radious
    this.color = color
    this.velocity = velocity
  }
  draw() {
    context.beginPath()
    context.arc(this.x, this.y, this.radious, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
  }
  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radious, color, velocity) {
    this.x = x
    this.y = y
    this.radious = radious
    this.color = color
    this.velocity = velocity
    this.type = 'Linear'

    if (Math.random() < 0.5) {
      this.type = 'Traking'
    }
  }
  draw() {
    context.beginPath()
    context.arc(this.x, this.y, this.radious, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
  }
  update() {
    this.draw()
    if (this.type === 'Traking') {
      const angle = Math.atan2(player.y - this.y, player.x - this.x)
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)
    }
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const friction = 0.99
class Particle {
  constructor(x, y, radious, color, velocity) {
    this.x = x
    this.y = y
    this.radious = radious
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }
  draw() {
    context.save()
    context.globalAlpha = this.alpha
    context.beginPath()
    context.arc(this.x, this.y, this.radious, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
    context.restore()
  }
  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

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

function init() {
  player = new Player(playerPositionX, playerPositiony, 15, 'white')
  projectilesArray = []
  enemiesArray = []
  particles = []
  animationId
  score = 0
  scoreEl.innerHTML = 0
}
function spawnEnemies() {
  intervalId = setInterval(() => {
    console.log(intervalId)
    const radious = Math.random() * (30 - 5) + 5

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
  }, 1000)
}

function animate() {
  //console.log(animate)
  animationId = requestAnimationFrame(animate)
  context.fillStyle = 'rgba(0, 0, 0, 0.1)'

  context.fillRect(0, 0, canvas.width, canvas.height)
  player.update()

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
          score += 10
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radious: enemy.radious - 10,
          })

          projectilesArray.splice(projectileIndex, 1)
        } else {
          //remove enemy if is small
          score += 100
          scoreEl.innerHTML = score

          //console.log('remove from the screen')
          enemiesArray.splice(index, 1)
          projectilesArray.splice(projectileIndex, 1)
        }
      }
    }
  }
}

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

restart.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()

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

window.addEventListener('keydown', event => {
  event.preventDefault()
  console.log(event.key)
  switch (event.key) {
    case 'ArrowRight':
      player.velocity.x += 1
      break
    case 'ArrowUp':
      player.velocity.y -= 1
      break
    case 'ArrowLeft':
      player.velocity.x -= 1
      break
    case 'ArrowDown':
      player.velocity.y += 1
      break
  }
})
