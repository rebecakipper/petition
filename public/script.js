const canvas = document.getElementById("canv");
const button = document.getElementById("submit_btn");
const user_signature = document.getElementById("user_signature");
const ctx = canvas.getContext("2d");

ctx.strokeStyle = "orange";
ctx.lineWidth = 3;

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
