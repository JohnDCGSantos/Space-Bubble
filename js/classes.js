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
    this.PowerUp
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
      this.y + this.radious + this.velocity.y <= canvas.height &&
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
    this.radians = 0
    this.center = {
      x,
      y,
    }

    if (Math.random() < 0.5) {
      this.type = 'Traking'

      if (Math.random() < 0.5) {
        this.type = 'Spinning'

        if (Math.random() < 0.5) {
          this.type = 'Traking Spinning'
        }
      }
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

    if (this.type === 'Spinning') {
      //spinning move
      this.radians += 0.1

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 20
      this.y = this.center.y + Math.sin(this.radians) * 20
    } else if (this.type === 'Traking') {
      //traking move
      const angle = Math.atan2(player.y - this.y, player.x - this.x)
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)

      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
    } else if (this.type === 'Traking Spinning') {
      this.radians += 0.1
      const angle = Math.atan2(player.y - this.center.y, player.x - this.center.x)
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 20
      this.y = this.center.y + Math.sin(this.radians) * 20
    } else {
      //linear moove
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
    }
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

class BackgroundParticle {
  constructor({ position, radious = 3, color = 'blue' }) {
    this.position = position
    this.radious = radious
    this.color = color
    this.alpha = 0.1
  }

  draw() {
    context.save()
    context.globalAlpha = this.alpha
    context.beginPath()
    context.arc(this.position.x, this.position.y, this.radious, 0, Math.PI * 2)
    context.fillStyle = this.color
    context.fill()
    context.restore()
  }
}

class PowerUp {
  constructor({ position = { x: 0, y: 0 }, velocity }) {
    this.position = position
    this.velocity = velocity
    this.image = new Image()
    this.image.src = './BlueBoss.png'

    this.alpha = 1
    gsap.to(this, {
      alpha: 0,
      duration: 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'linear',
    })
    this.radians = 0
  }

  draw() {
    context.save()
    context.globalAlpha = this.alpha
    context.translate(
      this.position.x + this.image.width / 2,
      this.position.y + this.image.height / 2
    )
    context.rotate(this.radians)
    context.translate(
      -this.position.x - this.image.width / 2,
      -this.position.y - this.image.height / 2
    )
    context.drawImage(this.image, this.position.x, this.position.y)
    context.restore()
  }
  update() {
    this.draw()
    this.radians += 0.01
    this.position.x += this.velocity.x
  }
}
