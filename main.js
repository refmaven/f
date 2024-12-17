const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = 'blue';        
ctx.fillRect(50, 50, 200, 100);
  
window.addEventListener('resize', () => {            
  canvas.width = window.innerWidth;           
  canvas.height = window.innerHeight;          
  ctx.fillStyle = 'blue';          
  ctx.fillRect(50, 50, 200, 100);     
});
