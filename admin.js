let soc = document.getElementById('soc');
let soh = document.getElementById('soh');
let socTable = document.getElementById('socTable');
let sohTable = document.getElementById('sohTable');

const socBtn = document.querySelector('.soc');
const sohBtn = document.querySelector('.soh');

socBtn.addEventListener('click', function() {
    socBtn.classList.add('activeBtn');
    sohBtn.classList.remove('activeBtn');
});

sohBtn.addEventListener('click', function() {
    sohBtn.classList.add('activeBtn');
    socBtn.classList.remove('activeBtn');
});

soc.onclick = function(){
    sohTable.classList.add('displayTable');
    socTable.classList.remove('displayTable');
}

soh.onclick = function(){
    socTable.classList.add('displayTable');
    sohTable.classList.remove('displayTable');
}

//log out
function logout(){
    window.location.href='index.html';
}


// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyBppIwEMQtK1OsnN2MVanqIwUre6xfnkZU",
    authDomain: "batterymonitoringsystem-86df4.firebaseapp.com",
    databaseURL: "https://batterymonitoringsystem-86df4-default-rtdb.firebaseio.com",
    projectId: "batterymonitoringsystem-86df4",
    storageBucket: "batterymonitoringsystem-86df4.firebasestorage.app",
    messagingSenderId: "913686041879",
    appId: "1:913686041879:web:24f5581ef99823b0d31352",
    measurementId: "G-0W50WGBWGC"
};

firebase.initializeApp(firebaseConfig);


// HÀM CẬP NHẬT DỮ LIỆU TỪ localStorage
function updateTablesFromLocalStorage() {
    let warnings = [];

    const socData = JSON.parse(localStorage.getItem('socSorted')) || [];
    const sohData = JSON.parse(localStorage.getItem('sohSorted')) || [];

    const socContainer = document.getElementById('usersocContainer');
    const sohContainer = document.getElementById('usersohContainer');

    socContainer.innerHTML = '';
    sohContainer.innerHTML = '';

    socData.forEach(user => {
        if(user.floor === '0' && user.room === '0' || user.reasons === 'tenant') return;
        const roomId = `${user.floor}${user.room}`;
        if (user.soc < 30 && user.soc !== null) warnings.push(`${roomId}: SoC vượt ngưỡng`);
        if (user.soh === 0) warnings.push(`${roomId}: SoH vượt ngưỡng`);
        if (user.temp > 60) warnings.push(`${roomId}: Temp vượt ngưỡng`);

        let soctr = document.createElement('tr');
        soctr.innerHTML = `
            <td>${roomId}</td>
            <td>${user.soc !== null ? user.soc + '%' : 'Chưa lắp hệ thống'}</td>
            <td>${user.soc === null? 'Chưa lắp hệ thống': user.soc < 30? 'Yếu': 'Tốt'}</td>
            <td><a href="#" class="btn-detail" data-bs-toggle="modal" data-bs-target="#exampleModal"
                data-floorroom="${roomId}"
                data-name="${user.name}"
                data-email="${user.email}"
                data-used="${user.used}"
                data-phone="${user.phonenumber}">Chi tiết</a>

            </td>`;
        socContainer.appendChild(soctr);
    });

    sohData.forEach(user => {
        if(user.floor === '0' && user.room === '0' || user.reasons === 'tenant') return;
        const roomId = `${user.floor}${user.room}`;

        let sohtr = document.createElement('tr');
        sohtr.innerHTML = `
            <td>${roomId}</td>
            <td>${user.soh !== null ? user.soh + '%' : 'Chưa lắp hệ thống' }</td>
            <td>${user.soh === null? 'Chưa lắp hệ thống': user.soh < 30? 'Yếu': 'Tốt'}</td>
            <td><a href="#" class="btn-detail" data-bs-toggle="modal" data-bs-target="#exampleModal"
                data-floorroom="${roomId}"
                data-name="${user.name}"
                data-email="${user.email}"
                data-used="${user.used}"
                data-phone="${user.phonenumber}">Chi tiết</a>
            </td>`;
        sohContainer.appendChild(sohtr);
    });

    if (warnings.length > 0) {
        const modalBody = document.getElementById('warnmodal-body');
        modalBody.innerHTML = warnings.map(w => `<p>${w}</p>`).join('');
        const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));
        warningModal.show();
    }

    const exampleModal = document.getElementById('exampleModal');
    exampleModal.addEventListener('show.bs.modal', function (event) {
        const btn = event.relatedTarget;
        const roomId = btn.getAttribute('data-floorroom');
        const name = btn.getAttribute('data-name');
        const email = btn.getAttribute('data-email');
        const phone = btn.getAttribute('data-phone');
        const used   = parseInt(btn.getAttribute('data-used'), 10) || 0;

        const titleEl = exampleModal.querySelector('.modal-title');
        titleEl.textContent = `Thông tin căn ${roomId}`;

        const bodyEl = exampleModal.querySelector('.modal-body');
        bodyEl.innerHTML = `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${cleanField(email)}</p>
            <p><strong>Phone:</strong> ${cleanField(phone)}</p>
            <p><strong>Used:</strong> <span id="used-value">${used}</span></p>
            <button class="btn-plus">+</button>
            <button class="btn-minus">-</button>
            `;


        // Hàm helper để cập nhật Firebase
    function changeUsed(roomId, delta) {
    const usedRef = firebase.database().ref(`/Room/${roomId}/used`);
    usedRef.transaction(current => {
        const num = parseInt(current, 10) || 0;
        const next = num + delta;
        return next >= 0 ? next : 0;
    });
}

    // Gắn sự kiện cho nút +
    bodyEl.querySelector('.btn-plus').addEventListener('click', () => {
        changeUsed(roomId, +1);
    // cập nhật lại hiển thị ngay
    const valEl = bodyEl.querySelector('#used-value');
    const current = parseInt(valEl.textContent, 10) || 0;
    const updated = current + 1;
    valEl.textContent = updated;
    });

    // Gắn sự kiện cho nút –
    bodyEl.querySelector('.btn-minus').addEventListener('click', () => {
        changeUsed(roomId, -1);
        const valEl = bodyEl.querySelector('#used-value');
    const current = parseInt(valEl.textContent, 10) || 0;
        const newVal = Math.max(current - 1, 0);
        valEl.textContent = newVal;
    });


    });
}



///// Kiểm tra email và phone có tồn taioj không
function cleanField(value) {
    return (!value || value === 'undefined' || value === 'null') ? 'Chưa cập nhật' : value;
}


// CẬP NHẬT localStorage mỗi giây để giữ thứ tự sắp xếp
setInterval(() => {
    let database = JSON.parse(localStorage.getItem('database')) || [];
    let socSorted = [...database].sort((a, b) => a.soc - b.soc);
    let sohSorted = [...database].sort((a, b) => a.soh - b.soh);
    localStorage.setItem("socSorted", JSON.stringify(socSorted));
    localStorage.setItem("sohSorted", JSON.stringify(sohSorted));
}, 1000);


// Lắng nghe realtime Firebase cho từng căn hộ
function listenRealtimeForEachRoom() {
    const database = JSON.parse(localStorage.getItem('database')) || [];

    database.forEach(room => {
        if (room.floor === '0' && room.room === '0' || room.reasons === 'tenant') return;

        const roomId = `${room.floor}${room.room}`;

        const socPath = `/Room/${roomId}/soc`;
        const sohPath = `/Room/${roomId}/soh`;
        const tempPath = `/Room/${roomId}/temp`;
        const usedPath = `/Room/${roomId}/used`;

        firebase.database().ref(socPath).on('value', snapshot => {
            updateRoomDataInLocalStorage(roomId, 'soc', snapshot.val());
        });

        firebase.database().ref(sohPath).on('value', snapshot => {
            updateRoomDataInLocalStorage(roomId, 'soh', snapshot.val());
        });

        firebase.database().ref(tempPath).on('value', snapshot => {
            updateRoomDataInLocalStorage(roomId, 'temp', snapshot.val());
        });
        firebase.database().ref(usedPath).on('value', snapshot => {
            updateRoomDataInLocalStorage(roomId, 'used', snapshot.val());
        });
    });
}


// Hàm cập nhật localStorage theo roomId
function updateRoomDataInLocalStorage(roomId, field, newValue) {
    let data = JSON.parse(localStorage.getItem('database')) || [];
    const updatedData = data.map(room => {
        const currentId = `${room.floor}${room.room}`;
        if (currentId === roomId) {
            return { ...room, [field]: newValue };
        }
        return room;
    });
    localStorage.setItem('database', JSON.stringify(updatedData));
}


// Bắt đầu lắng nghe Firebase
listenRealtimeForEachRoom();

// Cập nhật bảng lần đầu và sau mỗi 5s
updateTablesFromLocalStorage();
setInterval(updateTablesFromLocalStorage, 5000);

// Xác nhận thay đổi thông tin phía client
function alter(){
    window.location.href = 'admin_check_list.html';
} 