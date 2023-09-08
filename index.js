console.log('here is gsap lib', gsap)
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
console.log(context)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

class Player {
  constructor(x, y, radious, color) {
    this.x = x
    this.y = y
    this.radious = radious
    this.color = color
  }
  draw() {
    context.beginPath()
    context.arc(this.x, this.y, this.radious, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
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

const player = new Player(playerPositionX, playerPositiony, 15, 'white')
//console.log(player)

const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', {
  x: 1,
  y: 1,
})

const projectilesArray = []
const enemiesArray = []
const particles = []

function spawnEnemies() {
  setInterval(() => {
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
    console.log('Enemies Array----->>>>>', enemiesArray)
  }, 1000)
}

let animationId
function animate() {
  //console.log(animate)
  animationId = requestAnimationFrame(animate)
  context.fillStyle = 'rgba(0, 0, 0, 0.1)'

  context.fillRect(0, 0, canvas.width, canvas.height)
  player.draw()

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  })

  projectilesArray.forEach((projectile, index) => {
    projectile.update()
    //remove from the edges of the screen
    if (
      projectile.x + projectile.radious < 0 ||
      projectile.x - projectile.radious > canvas.width ||
      projectile.y + projectile.radious < 0 ||
      projectile.y - projectile.radious > canvas.height
    ) {
      setTimeout(() => {
        projectilesArray.splice(index, 1)
      }, 0)
    }
  })

  enemiesArray.forEach((enemy, index) => {
    enemy.update()
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    //Game Over
    if (distance - enemy.radious - player.radious < 1) {
      console.log('Game Over')
      cancelAnimationFrame(animationId)
    }

    projectilesArray.forEach((projectile, projectileIndex) => {
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
        if (enemy.radious - 10 > 5) {
          gsap.to(enemy, {
            radious: enemy.radious - 10,
          })
          setTimeout(() => {
            projectilesArray.splice(projectileIndex, 1)
          }, 0)
        } else {
          setTimeout(() => {
            console.log('remove from the screen')
            enemiesArray.splice(index, 1)
            projectilesArray.splice(projectileIndex, 1)
          }, 0)
        }
      }
    })
  })
}

window.addEventListener('click', event => {
  // console.log(projectilesArray)
  const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
  //console.log(angle)
  const velocity = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4,
  }
  projectilesArray.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})

animate()
spawnEnemies()
