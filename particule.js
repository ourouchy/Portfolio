document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Configuration des particules
  const particleColors = [
    'rgba(74, 111, 165, 0.25)', 
    'rgba(90, 141, 184, 0.2)', 
    'rgba(121, 136, 151, 0.2)',
    'rgba(74, 111, 165, 0.15)'
  ];
  
  // Types de particules - Petites, moyennes et grandes
  const particleTypes = [
    { count: 80, sizeMin: 1, sizeMax: 3, speedFactor: 0.3 },   // Petites particules
    { count: 25, sizeMin: 3, sizeMax: 6, speedFactor: 0.2 },   // Moyennes particules
    { count: 15, sizeMin: 6, sizeMax: 10, speedFactor: 0.1 }    // Grandes particules
  ];
  
  const particles = [];
  
  class Particle {
    constructor(type) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * (type.sizeMax - type.sizeMin) + type.sizeMin;
      this.speedFactor = type.speedFactor;
      this.speedX = (Math.random() * 0.5 - 0.25) * this.speedFactor;
      this.speedY = (Math.random() * 0.5 - 0.25) * this.speedFactor;
      this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
      // Plus les particules sont grandes, plus elles sont transparentes
      this.opacity = Math.max(0.05, 0.3 - (this.size / 30));
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Rebondir sur les bords
      if (this.x < 0 || this.x > canvas.width) {
        this.speedX = -this.speedX;
      }
      
      if (this.y < 0 || this.y > canvas.height) {
        this.speedY = -this.speedY;
      }
    }
    
    draw() {
      // Utiliser l'opacité calculée dans le constructeur
      const colorParts = this.color.substring(this.color.indexOf('(') + 1, this.color.lastIndexOf(')')).split(',');
      const r = colorParts[0].trim();
      const g = colorParts[1].trim();
      const b = colorParts[2].trim();
      
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  function init() {
    // Créer des particules pour chaque type
    particleTypes.forEach(type => {
      for (let i = 0; i < type.count; i++) {
        particles.push(new Particle(type));
      }
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      
      // Dessiner des lignes entre particules proches
      // La distance de connexion dépend de la taille des particules
      for (let j = i; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // La distance de connexion est basée sur la somme des tailles des particules
        const connectionDistance = (particles[i].size + particles[j].size) * 8;
        
        if (distance < connectionDistance) {
          // L'opacité des lignes dépend de la distance
          const opacity = 0.12 * (1 - distance / connectionDistance);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(90, 141, 184, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  
  init();
  animate();
});