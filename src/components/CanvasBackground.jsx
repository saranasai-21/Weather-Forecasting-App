import React, { useRef, useEffect } from 'react';
import styles from './CanvasBackground.module.css';

export default function CanvasBackground({ code, isDay }) {
  const canvasRef = useRef(null);

  // Map WeatherAPI condition code to visual state
  const mapConditionToState = (c, day) => {
    const num = Number(c);
    if (!c) return 'clear_day'; // default fallback
    
    if (num === 1000) {
      return day ? 'clear_day' : 'clear_night';
    }
    
    // Rain/Drizzle
    const rain = [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246];
    if (rain.includes(num)) return 'rain';
    
    // Thunderstorms
    const storm = [1087, 1273, 1276, 1279, 1282];
    if (storm.includes(num)) return 'thunderstorm';
    
    // Snow/Sleet/Freezing Rain
    const snow = [1066, 1069, 1072, 1114, 1117, 1168, 1171, 1198, 1201, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264];
    if (snow.includes(num)) return 'snow';
    
    // Fog/Mist
    const fog = [1030, 1135, 1147];
    if (fog.includes(num)) return 'foggy';
    
    // Cloudy/Overcast
    return 'cloudy';
  };

  const weatherState = mapConditionToState(code, isDay);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Set viewport dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle Classes
    class Ray {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.y = Math.random() * h;
      }
      reset() {
        this.x = Math.random() * this.w;
        this.y = -50;
        this.width = Math.random() * 80 + 40;
        this.length = Math.random() * 300 + 200;
        this.alpha = 0;
        this.maxAlpha = Math.random() * 0.15 + 0.05;
        this.speed = Math.random() * 0.5 + 0.2;
        this.angle = 0.2; // slight angle
      }
      update() {
        this.y += this.speed;
        this.x += this.speed * this.angle;
        if (this.y < this.h * 0.3) {
          this.alpha = Math.min(this.maxAlpha, this.alpha + 0.005);
        } else {
          this.alpha = Math.max(0, this.alpha - 0.005);
        }
        if (this.y > this.h || this.x > this.w) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        const grad = ctx.createLinearGradient(0, 0, 0, this.length);
        grad.addColorStop(0, `rgba(255, 235, 150, ${this.alpha})`);
        grad.addColorStop(1, 'rgba(255, 235, 150, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-this.width / 2, 0, this.width, this.length);
        ctx.restore();
      }
    }

    class Star {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h * 0.8;
        this.size = Math.random() * 1.5 + 0.2;
        this.alpha = Math.random();
        this.speed = Math.random() * 0.02 + 0.005;
        this.growing = Math.random() > 0.5;
      }
      update() {
        if (this.growing) {
          this.alpha += this.speed;
          if (this.alpha >= 1) this.growing = false;
        } else {
          this.alpha -= this.speed;
          if (this.alpha <= 0.2) this.growing = true;
        }
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Raindrop {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.y = Math.random() * h;
      }
      reset() {
        this.x = Math.random() * this.w;
        this.y = -20;
        this.length = Math.random() * 25 + 15;
        this.speed = Math.random() * 12 + 18;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.angle = -0.15; // angled rain
      }
      update() {
        this.y += this.speed;
        this.x += this.speed * this.angle;
        if (this.y > this.h || this.x < 0) {
          this.reset();
        }
      }
      draw() {
        ctx.strokeStyle = `rgba(174, 219, 255, ${this.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length * this.angle, this.y + this.length);
        ctx.stroke();
      }
    }

    class Snowflake {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.y = Math.random() * h;
      }
      reset() {
        this.x = Math.random() * this.w;
        this.y = -10;
        this.size = Math.random() * 4 + 1;
        this.speedY = Math.random() * 1.5 + 0.8;
        this.speedX = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.spin = Math.random() * 0.02;
        this.angle = Math.random() * Math.PI * 2;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.angle) * 0.4;
        this.angle += this.spin;
        if (this.y > this.h) {
          this.reset();
        }
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class CloudBlob {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.x = Math.random() * w * 1.5 - w * 0.25;
        this.y = Math.random() * h * 0.4;
        this.r = Math.random() * 120 + 80;
        this.speed = Math.random() * 0.15 + 0.05;
        this.opacity = Math.random() * 0.06 + 0.02;
      }
      update() {
        this.x += this.speed;
        if (this.x - this.r > this.w) {
          this.x = -this.r;
          this.y = Math.random() * this.h * 0.4;
        }
      }
      draw() {
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        grad.addColorStop(0.8, `rgba(240, 244, 255, ${this.opacity * 0.3})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class FogWisp {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.x = Math.random() * w * 1.5 - w * 0.25;
        this.y = Math.random() * h * 0.3 + h * 0.6; // foggy bottom wisps
        this.width = Math.random() * 250 + 150;
        this.height = Math.random() * 60 + 30;
        this.speed = Math.random() * 0.25 + 0.1;
        this.opacity = Math.random() * 0.08 + 0.02;
      }
      update() {
        this.x += this.speed;
        if (this.x - this.width > this.w) {
          this.x = -this.width;
          this.y = Math.random() * this.h * 0.3 + this.h * 0.6;
        }
      }
      draw() {
        ctx.fillStyle = `rgba(220, 225, 230, ${this.opacity})`;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize Particles
    let particles = [];
    const initParticles = () => {
      const w = canvas.width;
      const h = canvas.height;
      particles = [];

      if (weatherState === 'clear_day') {
        for (let i = 0; i < 15; i++) particles.push(new Ray(w, h));
      } else if (weatherState === 'clear_night') {
        for (let i = 0; i < 300; i++) particles.push(new Star(w, h));
      } else if (weatherState === 'rain' || weatherState === 'thunderstorm') {
        for (let i = 0; i < 180; i++) particles.push(new Raindrop(w, h));
      } else if (weatherState === 'snow') {
        for (let i = 0; i < 120; i++) particles.push(new Snowflake(w, h));
      } else if (weatherState === 'cloudy') {
        for (let i = 0; i < 20; i++) particles.push(new CloudBlob(w, h));
      } else if (weatherState === 'foggy') {
        for (let i = 0; i < 25; i++) particles.push(new FogWisp(w, h));
      }
    };
    initParticles();

    // Solar Orb and Moon properties
    let sunOrb = { x: canvas.width * 0.8, y: canvas.height * 0.2, targetX: canvas.width * 0.8, targetY: canvas.height * 0.2 };
    let moonOrb = { x: canvas.width * 0.8, y: canvas.height * 0.2 };
    let lightningFlash = 0;

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      // Update sun target positions
      sunOrb.targetX = w * 0.8;
      sunOrb.targetY = h * 0.25;
      sunOrb.x += (sunOrb.targetX - sunOrb.x) * 0.05;
      sunOrb.y += (sunOrb.targetY - sunOrb.y) * 0.05;
      
      ctx.clearRect(0, 0, w, h);

      // Draw Sun Orb on Clear Day
      if (weatherState === 'clear_day') {
        const grad = ctx.createRadialGradient(sunOrb.x, sunOrb.y, 0, sunOrb.x, sunOrb.y, 250);
        grad.addColorStop(0, 'rgba(255, 235, 120, 0.45)');
        grad.addColorStop(0.2, 'rgba(255, 200, 80, 0.2)');
        grad.addColorStop(0.6, 'rgba(255, 180, 60, 0.05)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sunOrb.x, sunOrb.y, 250, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Moon Orb on Clear Night
      if (weatherState === 'clear_night') {
        const grad = ctx.createRadialGradient(w * 0.8, h * 0.25, 0, w * 0.8, h * 0.25, 180);
        grad.addColorStop(0, 'rgba(240, 248, 255, 0.35)');
        grad.addColorStop(0.3, 'rgba(220, 235, 255, 0.15)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.25, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and Draw Particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Thunderstorm Lightning overlay
      if (weatherState === 'thunderstorm') {
        if (Math.random() < 0.007) {
          lightningFlash = Math.random() * 0.6 + 0.3; // flash alpha
        }
        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(235, 245, 255, ${lightningFlash})`;
          ctx.fillRect(0, 0, w, h);
          lightningFlash -= 0.08; // fade flash
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [weatherState]);

  return (
    <div className={`${styles.canvasContainer} ${styles[weatherState]}`} id="fullscreen-particle-background">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
