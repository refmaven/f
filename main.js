// Get the canvas and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Set a constant size (not responsive)
canvas.width = 800;
canvas.height = 600;

// Fill the canvas with a blue rectangle
ctx.fillStyle = 'blue';
ctx.fillRect(50, 50, 200, 100);