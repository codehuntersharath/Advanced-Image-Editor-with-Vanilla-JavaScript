document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("upload");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const brightnessSlider = document.getElementById("brightness");
  const contrastSlider = document.getElementById("contrast");
  const saturationSlider = document.getElementById("saturation");
  const rotateSlider = document.getElementById("rotate");
  const scaleSlider = document.getElementById("scale");
  const cropBtn = document.getElementById("crop-btn");
  const applyCropBtn = document.getElementById("apply-crop-btn");
  const downloadBtn = document.getElementById("download-btn");

  let img = new Image();
  let isCropping = false;
  let isFlippedHorizontal = false;
  let isFlippedVertical = false;

  let cropStartX, cropStartY, cropWidth, cropHeight;

  // Function to draw the image
  function drawImage() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);
    // Apply rotation and flipping transformations
    if (isFlippedHorizontal) ctx.scale(-1, 1);
    if (isFlippedVertical) ctx.scale(1, -1);

    ctx.drawImage(
      img,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    ctx.restore();
  }

  // Function to apply filters and transformations
  function applyEdits() {
    const brightness = brightnessSlider.value;
    const contrast = contrastSlider.value;
    const saturation = saturationSlider.value;
    const rotate = rotateSlider.value;
    const scale = scaleSlider.value / 100;

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.filter = `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturation}%)
        `;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.drawImage(
      img,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    ctx.restore();
  }

  // Upload image
  uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);

    img.onload = drawImage;
  });

  // Event listeners for filters and transformations
  brightnessSlider.addEventListener("input", applyEdits);
  contrastSlider.addEventListener("input", applyEdits);
  saturationSlider.addEventListener("input", applyEdits);
  rotateSlider.addEventListener("input", applyEdits);
  scaleSlider.addEventListener("input", applyEdits);

  // Cropping functionality
  cropBtn.addEventListener("click", () => {
    canvas.style.cursor = "crosshair";
    isCropping = true;
    canvas.addEventListener("mousedown", startCrop);
    canvas.addEventListener("mouseup", endCrop);
  });

  function startCrop(event) {
    cropStartX = event.offsetX;
    cropStartY = event.offsetY;
  }

  function endCrop(event) {
    cropWidth = event.offsetX - cropStartX;
    cropHeight = event.offsetY - cropStartY;
    isCropping = false;
  }

  applyCropBtn.addEventListener("click", () => {
    if (cropWidth && cropHeight) {
      const croppedImage = ctx.getImageData(
        cropStartX,
        cropStartY,
        cropWidth,
        cropHeight
      );
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      ctx.putImageData(croppedImage, 0, 0);
      canvas.style.cursor = "pointer";
    }
  });

  // Flip buttons
  document.getElementById("flip-horizontal").addEventListener("click", () => {
    isFlippedHorizontal = !isFlippedHorizontal;
    drawImage();
  });
  document.getElementById("flip-vertical").addEventListener("click", () => {
    isFlippedVertical = !isFlippedVertical;
    drawImage();
  });

  // Download edited image
  downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});
