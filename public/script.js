const canvas = document.getElementById("canv");
const button = document.getElementById("submit_btn");
const user_signature = document.getElementById("user_signature");
const ctx = canvas.getContext("2d");

ctx.strokeStyle = "orange";
ctx.lineWidth = 5;

const moveEvtListener = (e) => {
    console.log("x: ", e.offsetX, "y: ", e.offsetY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
};

canvas.addEventListener("mousedown", (e) => {
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    ctx.stroke();
    canvas.addEventListener("mousemove", moveEvtListener);
});

canvas.addEventListener("mouseup", () => {
    ctx.closePath();
    canvas.removeEventListener("mousemove", moveEvtListener);
});

button.addEventListener("click", () => {
    const dataURL = canvas.toDataURL();
    user_signature.value = dataURL;
});

// 2) beginning our path
// ctx.beginPath();

// 3) optionally we can set color and with of line
// ctx.strokeStyle = "orange";
// ctx.lineWidth = 10;

// // 4) moving to the starting position
// ctx.moveTo(150, 150);
// // 5) map out the shape we want to draw
// ctx.lineTo(450, 300);
// ctx.lineTo(150, 300);
// ctx.lineTo(150, 150);
// // to get rid of the strange not pointed triangle at the beginning corner
// ctx.closePath();

// // 6) we actually draw out our plan
// ctx.stroke();
