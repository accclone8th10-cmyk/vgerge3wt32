const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// 1. TẢI TÀI NGUYÊN
const mapImg = new Image(); 
mapImg.src = 'map.png'; // File map thế giới của cậu

const realms = [
    { name: "Luyện Khí", need: 100, absorb: 1, color: "#4facfe", atk: 20 },
    { name: "Trúc Cơ", need: 800, absorb: 3, color: "#00ff88", atk: 60 },
    { name: "Kim Đan", need: 3000, absorb: 7, color: "#f6d365", atk: 150 }
];

let player = {
    x: 1000, y: 1000, size: 40, speed: 300,
    linhKhi: 0, realm: 0, hp: 100, maxHp: 100,
    mode: "BE_QUAN"
};

let bullets = [];
let mobs = [];
const keys = {};

// 2. LOGIC CHUYỂN CHẾ ĐỘ (QUAN TRỌNG)
function switchMode(mode) {
    player.mode = mode;
    
    // Cập nhật Tab UI
    document.getElementById('tab-be-quan').className = (mode === 'BE_QUAN' ? 'active' : '');
    document.getElementById('tab-hanh-tau').className = (mode === 'HANH_TAU' ? 'active' : '');

    if (mode === "BE_QUAN") {
        // Khi Bế Quan: Đưa về tâm điểm tĩnh lặng
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        mobs = []; 
    } else {
        // Khi Hành Tẩu: Sinh quái trên bản đồ rộng
        spawnMobs(15);
    }
}

function spawnMobs(count) {
    for(let i=0; i<count; i++) {
        mobs.push({ x: Math.random()*2000, y: Math.random()*2000, hp: 100, size: 25 });
    }
}

// 3. CHIÊU THỨC VỆT SÁNG
canvas.addEventListener("mousedown", (e) => {
    if (player.mode === "HANH_TAU") {
        // Tính tọa độ click dựa trên camera
        const camX = player.x - canvas.width/2;
        const camY = player.y - canvas.height/2;
        const angle = Math.atan2(e.clientY - (player.y - camY), e.clientX - (player.x - camX));
        
        bullets.push({
            x: player.x, y: player.y,
            vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10,
            life: 100
        });
    }
});

// 4. VẼ GIAO DIỆN RIÊNG BIỆT
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (player.mode === "HANH_TAU") {
        // GIAO DIỆN THẾ GIỚI
        ctx.save();
        // Camera di chuyển theo nhân vật
        ctx.translate(-player.x + canvas.width/2, -player.y + canvas.height/2);
        
        // Vẽ map.png
        if (mapImg.complete) {
            ctx.drawImage(mapImg, 0, 0, 2000, 2000);
        } else {
            ctx.fillStyle = "#1a2635"; ctx.fillRect(0,0,2000,2000);
        }

        // Vẽ Quái
        mobs.forEach(m => {
            ctx.fillStyle = "red"; ctx.beginPath(); ctx.arc(m.x, m.y, m.size, 0, Math.PI*2); ctx.fill();
        });

        // Vẽ Vệt sáng
        bullets.forEach(b => {
            ctx.strokeStyle = realms[player.realm].color; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.vx*5, b.y + b.vy*5); ctx.stroke();
        });

        // Nhân vật (Hình vuông hành tẩu)
        ctx.fillStyle = "white"; ctx.fillRect(player.x - 20, player.y - 20, 40, 40);
        ctx.restore();

    } else {
        // GIAO DIỆN BẾ QUAN
        ctx.fillStyle = "#050a0f"; // Nền động phủ tối
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Trận pháp pháp phát sáng dưới chân
        ctx.strokeStyle = realms[player.realm].color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 100 + Math.sin(Date.now()/200)*10, 0, Math.PI*2);
        ctx.stroke();

        // Nhân vật ngồi giữa (Hình vuông bế quan)
        ctx.fillStyle = "white";
        ctx.shadowBlur = 20; ctx.shadowColor = realms[player.realm].color;
        ctx.fillRect(canvas.width/2 - 20, canvas.height/2 - 20, 40, 40);
        ctx.shadowBlur = 0;
    }

    updateLogic();
    requestAnimationFrame(draw);
}

// 5. LOGIC TU LUYỆN & THÔNG SỐ
function updateLogic() {
    const r = realms[player.realm];
    // Tốc độ nạp linh khí: Bế quan (x10) vs Hành tẩu (x1)
    let gain = r.absorb * (player.mode === "BE_QUAN" ? 5 : 0.5);
    player.linhKhi += gain / 60;

    // Cập nhật bảng hệ thống (side-panel)
    document.getElementById("display-realm").innerText = r.name;
    document.getElementById("progress-bar").style.width = (player.linhKhi / r.need * 100) + "%";
    document.getElementById("hp-bar").style.width = (player.hp / player.maxHp * 100) + "%";
    document.getElementById("speed-tag").innerText = "+" + gain.toFixed(1) + "/s";

    // Di chuyển chỉ khi hành tẩu
    if (player.mode === "HANH_TAU") {
        if (keys["w"]) player.y -= 5; if (keys["s"]) player.y += 5;
        if (keys["a"]) player.x -= 5; if (keys["d"]) player.x += 5;
    }
}

// Các sự kiện hỗ trợ
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
window.addEventListener("resize", () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

// Bắt đầu
draw();
