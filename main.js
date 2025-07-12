const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const diskInput = document.getElementById("diskInput");
const startButton = document.getElementById("startButton");

let rows=[[],[],[]];

let solution=[];
let moveIndex = 0;
let activeAnimation = null;
let timeoutId = null;
let diskCount=0;

const pegDist = 180;
const margin = 2;
const height = 10;
const canvasHeight = 200;
const widthScaling = 14;
const pegHeight = 150;

canvas.height = canvasHeight;
canvas.width = 600;

const colors = [
  "red",
  "orange",
  "yellow",
  "lime",
  "blue",
  "magenta",
  "deeppink",
  "aqua",
  "chartreuse",
  "gold"
]

function initialise(n){
    // stop any current animation
    if (timeoutId) clearTimeout(timeoutId);
    rows = [[],[],[]];
    for (let i=n;i>0;i--) {
        rows[0].push(i);
    }
    solution = [];              // Reset solution array
    moveIndex = 0;              // Reset animation step
    activeAnimation = null;
    diskCount = n;
    timeoutId = null;
}

function animateMoves(solution, delay = 500) {
    let moveIndex = 0;
    let frameInterval = Math.floor(delay/20);
    let activeAnimation = null;

    function startNextMove() {
        if (moveIndex >= solution.length) return;

        const [diskSize, from, to] = solution[moveIndex];
        const disk = rows[from].pop();

        const fromX = pegDist * (from + 0.5);
        const toX = pegDist * (to + 0.5);

        const fromY = canvasHeight - (rows[from].length + 1) * (height + margin);
        const toY = canvasHeight - (rows[to].length + 2) * (height + margin);

        activeAnimation = {
            disk,
            fromX,
            toX,
            fromY,
            toY,
            phase: "up",
            x: fromX,
            y: fromY
        };

        stepAnimation();
    }

    function stepAnimation() {
        const speed = 5;
        const a = activeAnimation;

        if (!a) return;

        switch (a.phase) {
            case "up":
                a.y -= speed;
                if (a.y <= 100) {
                    a.y = 100;
                    a.phase = "side";
                }
                break;

            case "side":
                const dir = a.toX > a.fromX ? 1 : -1;
                a.x += dir * speed;
                if ((dir === 1 && a.x >= a.toX) || (dir === -1 && a.x <= a.toX)) {
                    a.x = a.toX;
                    a.phase = "down";
                }
                break;

            case "down":
                a.y += speed;
                if (a.y >= a.toY) {
                    a.y = a.toY;

                    // Drop disk into place
                    rows[solution[moveIndex][2]].push(a.disk);
                    activeAnimation = null;
                    moveIndex++;
                    draw(diskCount); // Final draw for this move

                    // Wait full `delay` before starting next animation
                    startNextMove();
                    return;
                }
                break;
        }

        draw(diskCount);
        drawMovingDisk(a);

        timeoutId = setTimeout(stepAnimation, frameInterval); // Simulate animation frame
    }
    startNextMove();
}

function draw(n){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let k=0;
    for (let i=0;i<3;i++){
        for (let j=0;j<rows[i].length;j++){
            const diskVal = rows[i][j];
            if (activeAnimation && activeAnimation.disk === diskVal && i === solution[moveIndex][0]) {
                continue; // Skip drawing disk that is being animated
            }
            const color = colors[(rows[i][j] - 1) % colors.length];
            const width = rows[i][j] * widthScaling;
            const x = pegDist*(i+0.5) - (width)/2;
            const y = canvasHeight - (j+1) *(height+margin);
            ctx.fillStyle = color;
            ctx.fillRect(x,y,width,height);
            k++;
        }
        // draw the peg
        ctx.fillStyle = "rgba(14, 14, 14, 0.5)";
        ctx.fillRect(pegDist*(i+0.5) - 2, canvasHeight-pegHeight, 4, pegHeight);
    }
}

function drawMovingDisk(a) {
    const width = a.disk * widthScaling;
    const x = a.x - width / 2;
    const y = a.y;
    const color = colors[(a.disk - 1) % colors.length];

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}


function solve(n, oldRow, newRow, auxRow, currSolution){
    if (n==0) return null;
    solve(n-1, oldRow, auxRow, newRow, currSolution);
    // each element of currSolution represents a single move
    currSolution.push([n, oldRow, newRow]);
    solve(n-1, auxRow, newRow, oldRow, currSolution);
    return currSolution;
}

startButton.addEventListener("click", () => {
    diskCount = +diskInput.value;
    if (isNaN(diskCount) || diskCount < 1 || diskCount > 10) {
        alert("Please enter a valid number of disks (1-10).");
        return;
    }

    initialise(diskCount);         // Reset towers
    draw(diskCount);               // Draw initial state

    solve(diskCount, 0, 2, 1, solution);
    animateMoves(solution, 300); // Animate with 500ms between moves
});
