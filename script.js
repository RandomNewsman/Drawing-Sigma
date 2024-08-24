document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('drawingCanvas');
  const context = canvas.getContext('2d');
  let isDrawing = false;
  let mode = 'line'; // Default mode
  let paths = []; // Store drawn paths for undo
  let undonePaths = []; // Store undone paths for redo
  let frames = []; // Store frames for animation
  let currentFrame = 0; // Current frame index
  let color = '#000000'; // Default color
  let backgroundColor = '#ffffff'; // Default background color (white)
  let opacity = 1; // Default opacity
  const defaultLineWidth = 2; // Default line width for freehand
  const pencilLineWidth = 1; // Line width for pencil
  const chonkyLineWidth = 10; // Line width for chonky brush
  const glowBlur = 10; // Glow effect blur radius
  const eraserSize = 20; // Eraser size
  let scale = 1; // Initial scale

  // Function to initialize canvas with white background
  function initCanvas() {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
  }
  initCanvas(); // Call function to initialize canvas on load

  canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      if (mode === 'fill') {
          const targetColor = getPixelColor(x, y);
          floodFill(x, y, targetColor, color);
      } else {
          isDrawing = true;
          context.strokeStyle = color; // Set stroke color
          context.lineWidth = mode === 'pencil' ? pencilLineWidth : (mode === 'chonky' ? chonkyLineWidth : defaultLineWidth); // Set line width
          context.globalAlpha = opacity; // Set opacity
          if (mode === 'glow') {
              context.shadowColor = color; // Set glow color
              context.shadowBlur = glowBlur; // Set glow blur radius
          } else {
              context.shadowColor = 'transparent'; // Reset shadow if not using glow tool
              context.shadowBlur = 0;
          }
          context.beginPath(); // Start a new path
          context.moveTo(x, y);
      }
  });

  canvas.addEventListener('mousemove', (e) => {
      if (isDrawing && mode !== 'fill') {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / scale;
          const y = (e.clientY - rect.top) / scale;
          context.lineTo(x, y);
          context.stroke();
          if (mode === 'chonky') {
              context.beginPath(); // Start a new path segment
              context.moveTo(x, y);
          }
      }
  });

  canvas.addEventListener('mouseup', () => {
      if (isDrawing) {
          paths.push(canvas.toDataURL()); // Save drawn path
          isDrawing = false;
      }
  });

  canvas.addEventListener('mouseout', () => {
      if (isDrawing) {
          isDrawing = false;
      }
  });

  // Function to get pixel color at a specific position
  function getPixelColor(x, y) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const index = (y * imageData.width + x) * 4;
      return {
          r: imageData.data[index],
          g: imageData.data[index + 1],
          b: imageData.data[index + 2],
          a: imageData.data[index + 3]
      };
  }

  // Function to perform flood fill (recursive implementation)
  function floodFill(x, y, targetColor, fillColor) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixelStack = [[x, y]];
      const originalColor = getPixelColor(x, y);

      if (compareColors(originalColor, targetColor)) return;

      while (pixelStack.length) {
          const newPos = pixelStack.pop();
          const [x, y] = newPos;

          let pixelIndex = (y * canvas.width + x) * 4;
          while (y >= 0 && compareColors(getPixelColor(x, y), originalColor)) {
              y--;
              pixelIndex -= canvas.width * 4;
          }
          pixelIndex += canvas.width * 4;
          y++;
          let reachLeft = false;
          let reachRight = false;

          while (y < canvas.height - 1 && compareColors(getPixelColor(x, y), originalColor)) {
              colorPixel(pixelIndex, fillColor);

              if (x > 0) {
                  if (compareColors(getPixelColor(x - 1, y), originalColor)) {
                      if (!reachLeft) {
                          pixelStack.push([x - 1, y]);
                          reachLeft = true;
                      }
                  } else if (reachLeft) {
                      reachLeft = false;
                  }
              }

              if (x < canvas.width - 1) {
                  if (compareColors(getPixelColor(x + 1, y), originalColor)) {
                      if (!reachRight) {
                          pixelStack.push([x + 1, y]);
                          reachRight = true;
                      }
                  } else if (reachRight) {
                      reachRight = false;
                  }
              }

              pixelIndex += canvas.width * 4;
              y++;
          }
      }

      context.putImageData(imageData, 0, 0);

      // Helper function to compare two colors
      function compareColors(color1, color2) {
          return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
      }

      // Helper function to color a pixel
      function colorPixel(pixelIndex, fillColor) {
          imageData.data[pixelIndex] = fillColor.r;
          imageData.data[pixelIndex + 1] = fillColor.g;
          imageData.data[pixelIndex + 2] = fillColor.b;
          imageData.data[pixelIndex + 3] = fillColor.a * 255; // Scale alpha from 0-1 to 0-255
      }
  }

  // Function to initialize canvas with white background
  function initCanvas() {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
  }
  initCanvas(); // Call function to initialize canvas on load

  canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      if (mode === 'fill') {
          const targetColor = getPixelColor(x, y);
          floodFill(x, y, targetColor, color);
      } else {
          isDrawing = true;
          context.strokeStyle = color; // Set stroke color
          context.lineWidth = mode === 'pencil' ? pencilLineWidth : (mode === 'chonky' ? chonkyLineWidth : defaultLineWidth); // Set line width
          context.globalAlpha = opacity; // Set opacity
          if (mode === 'glow') {
              context.shadowColor = color; // Set glow color
              context.shadowBlur = glowBlur; // Set glow blur radius
          } else {
              context.shadowColor = 'transparent'; // Reset shadow if not using glow tool
              context.shadowBlur = 0;
          }
          context.beginPath(); // Start a new path
          context.moveTo(x, y);
      }
  });

  canvas.addEventListener('mousemove', (e) => {
      if (isDrawing && mode !== 'fill') {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / scale;
          const y = (e.clientY - rect.top) / scale;
          context.lineTo(x, y);
          context.stroke();
          if (mode === 'chonky') {
              context.beginPath(); // Start a new path segment
              context.moveTo(x, y);
          }
      }
  });

  canvas.addEventListener('mouseup', () => {
      if (isDrawing) {
          paths.push(canvas.toDataURL()); // Save drawn path
          isDrawing = false;
      }
  });

  canvas.addEventListener('mouseout', () => {
      if (isDrawing) {
          isDrawing = false;
      }
  });

  // Function to set drawing mode
  window.setMode = function(shape) {
      mode = shape;
      if (mode === 'glow') {
          context.shadowColor = color; // Set glow color
          context.shadowBlur = glowBlur; // Set glow blur radius
      } else if (mode === 'eraser') {
          context.strokeStyle = '#FFFFFF'; // Set eraser color (white)
          context.lineWidth = eraserSize; // Set eraser size
          context.globalAlpha = 1; // Reset opacity for eraser
          context.shadowColor = 'transparent'; // Reset shadow for eraser
          context.shadowBlur = 0;
      } else {
          context.shadowColor = 'transparent'; // Reset shadow if not using glow tool
          context.shadowBlur = 0;
      }
  };

  // Function
    // Function to set drawing mode
    window.setMode = function(shape) {
        mode = shape;
        if (mode === 'glow') {
            context.shadowColor = color; // Set glow color
            context.shadowBlur = glowBlur; // Set glow blur radius
        } else if (mode === 'eraser') {
            context.strokeStyle = '#FFFFFF'; // Set eraser color (white)
            context.lineWidth = eraserSize; // Set eraser size
            context.globalAlpha = 1; // Reset opacity for eraser
            context.shadowColor = 'transparent'; // Reset shadow for eraser
            context.shadowBlur = 0;
        } else {
            context.shadowColor = 'transparent'; // Reset shadow if not using glow tool
            context.shadowBlur = 0;
        }
    };

    // Function to set drawing color
    window.setColor = function(newColor) {
        color = newColor;
        if (mode === 'glow') {
            context.shadowColor = color; // Update glow color
        } else if (mode === 'eraser') {
            context.strokeStyle = '#FFFFFF'; // Update eraser color (white)
        } else {
            context.strokeStyle = color; // Update stroke color
        }
    };

    // Function to set opacity
    window.setOpacity = function(newOpacity) {
        opacity = newOpacity;
        if (mode !== 'eraser') {
            context.globalAlpha = opacity; // Update opacity
        }
    };

    // Function to set background to transparent
    window.setTransparentBackground = function() {
        backgroundColor = 'transparent';
        initCanvas();
    };

    // Function to set background to white
    window.setWhiteBackground = function() {
        backgroundColor = '#FFFFFF';
        initCanvas();
    };

    // Function to clear canvas
    window.clearCanvas = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        initCanvas(); // Reset background
        paths = []; // Clear paths array
        undonePaths = []; // Clear undone paths array
        frames = []; // Clear frames array
    };

    // Undo function
    window.undo = function() {
        if (paths.length > 0) {
            const lastPath = paths.pop(); // Remove last drawn path from paths array
            undonePaths.push(lastPath); // Add to undone paths
            redrawPaths();
        }
    };

    // Redo function
    window.redo = function() {
        if (undonePaths.length > 0) {
            const lastUndonePath = undonePaths.pop(); // Remove last undone path from undonePaths array
            paths.push(lastUndonePath); // Add to paths
            redrawPaths();
        }
    };

    // Redraw paths function
    function redrawPaths() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        initCanvas(); // Reset background
        paths.forEach(path => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                context.drawImage(img, 0, 0);
            };
        });
    }

    // Function to download the canvas content as an image
    window.download = function() {
        const link = document.createElement('a');
        link.download = 'my_drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    // Function to zoom in
    window.zoomIn = function() {
        scale += 0.1;
        updateScale();
    };

    // Function to zoom out
    window.zoomOut = function() {
        scale -= 0.1;
        updateScale();
    };

    // Function to reset zoom
    window.resetZoom = function() {
        scale = 1;
        updateScale();
    };

    // Function to update canvas scale
    function updateScale() {
        canvas.style.transform = `scale(${scale})`;
    };

    // Function to add a frame
    window.addFrame = function() {
        const frame = canvas.toDataURL();
        frames.push(frame);
    };

    // Function to play animation
    window.playAnimation = function() {
        if (frames.length === 0) return;
        let frameIndex = 0;
        const interval = setInterval(() => {
            const img = new Image();
            img.src = frames[frameIndex];
            img.onload = () => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                initCanvas(); // Reset background
                context.drawImage(img, 0, 0);
            };
            frameIndex++;
            if (frameIndex === frames.length) {
                clearInterval(interval);
            }
        }, 100); // Adjust the time interval as needed
    };

    // Function to perform flood fill (recursive implementation)
    function floodFill(x, y, targetColor, fillColor) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixelStack = [[x, y]];
        const originalColor = getPixelColor(x, y);

        if (compareColors(originalColor, targetColor)) return;

        while (pixelStack.length) {
            const newPos = pixelStack.pop();
            const [x, y] = newPos;

            let pixelIndex = (y * canvas.width + x) * 4;
            while (y >= 0 && compareColors(getPixelColor(x, y), originalColor)) {
                y--;
                pixelIndex -= canvas.width * 4;
            }
            pixelIndex += canvas.width * 4;
            y++;
            let reachLeft = false;
            let reachRight = false;

            while (y < canvas.height - 1 && compareColors(getPixelColor(x, y), originalColor)) {
                colorPixel(pixelIndex, fillColor);

                if (x > 0) {
                    if (compareColors(getPixelColor(x - 1, y), originalColor)) {
                        if (!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }

                if (x < canvas.width - 1) {
                    if (compareColors(getPixelColor(x + 1, y), originalColor)) {
                        if (!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }

                pixelIndex += canvas.width * 4;
                y++;
            }
        }

        context.putImageData(imageData, 0, 0);

        // Helper function to compare two colors
        function compareColors(color1, color2) {
            return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
        }

        // Helper function to color a pixel
        function colorPixel(pixelIndex, fillColor) {
            imageData.data[pixelIndex] = fillColor.r;
            imageData.data[pixelIndex + 1] = fillColor.g;
            imageData.data[pixelIndex + 2] = fillColor.b;
            imageData.data[pixelIndex + 3] = fillColor.a * 255; // Scale alpha from 0-1 to 0-255
        }
    }

    // Function to get pixel color at a specific position
    function getPixelColor(x, y) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const index = (y * imageData.width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }

    // Function to initialize canvas with white background
    function initCanvas() {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    initCanvas(); // Call function to initialize canvas on load
});

     
