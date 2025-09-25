const gotop = document.querySelector('.gotop');
gotop.addEventListener('click',function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

// dropdown
const btn = document.getElementById("dropdownBtn");
const filterBox = document.getElementById("filter");

btn.addEventListener("click", () => {
  filterBox.classList.toggle("show");
});


// gallery
const sheetID = "17lmRDtyNAAO5by06d3jujobKKpe4M11qxwziiXNPwqs"; 
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

fetch(url)
  .then(res => res.text())
  .then(data => {
    const json = JSON.parse(data.substr(47).slice(0, -2));
    const rows = json.table.rows;
    const gallery = document.getElementById("gallery");

    let allCategorySet = new Set();

    rows.forEach(r => {
      const image = r.c[0].v;
      const caption = r.c[r.c.length-1].v;

      const catColumns = [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
      const allCats = catColumns.flatMap(i => {
        const val = r.c[i] ? r.c[i].v : "";
        return val && val !== "-" ? val : [];
      });

      allCats.forEach(c => allCategorySet.add(c));

      const div = document.createElement("div");
      div.className = "item";
      div.setAttribute("data-cat", allCats.join("|"));

      let mediaHTML;

      if (image.endsWith(".mp4")||image.endsWith(".mkv")) {
        // กรณีวิดีโอ
        mediaHTML = `
          <video controls width="100%" style="border-radius:15px">
            <source src="${image}" type="video/mp4">
          </video>
        `;
      } else if (r.c[1]) {
        mediaHTML = `
          <a href="${r.c[1].v}">
            <img src="${image}" style="border-radius:15px">
          </a>
        `
      } else {
        // กรณีรูปภาพ
        mediaHTML = `
          <img src="${image}" style="border-radius:15px">
        `;
      }
      
      div.innerHTML = `
        <a href="${image}" data-fancybox="gallery">
          ${mediaHTML}
        </a><br>
        ${allCats
          .slice()
          .sort((a, b) => a.localeCompare(b, "th"))
          .map(cat => {
            let className = 'cat'; 

            if (cat.startsWith('@')) { className = 'cat-at'; }
            else if (cat.startsWith('#')) { className = 'cat-hash'; }
            else if (/^[\u0E00-\u0E7F]/.test(cat)) { className = 'cat-thai';}

            return `<small class="${className}">${cat}</small>`;
        }).join("&nbsp;&nbsp;")}
        <p class="caption">${caption}</p>
      `;

      gallery.appendChild(div);
    });

    // --- Filter checkboxes ---//
    const filterDiv = document.getElementById("filter");
    Array.from(allCategorySet).sort().forEach(cat => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" value="${cat}">
        <span class="checkmark"></span> 
        ${cat}
      `;
      label.classList.add("checkbox");
      filterDiv.appendChild(label);
    });

    const checkboxes = document.querySelectorAll("#filter input[type=checkbox]");

    function filterGallery() {
      const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value.trim());

      const items = document.querySelectorAll(".item");
      let anyVisible = false;

      items.forEach(item => {
        const itemCats = item.getAttribute("data-cat").split("|").map(s => s.trim());
        const show = selected.length === 0 || selected.every(cat => itemCats.includes(cat));
        item.style.display = show ? "block" : "none";
        if (show) anyVisible = true;
      });

      const noResultDiv = document.getElementById("no-result");
      if (!anyVisible) {
        noResultDiv.style.display = "block";
        noResultDiv.innerHTML = `
          <div class="noresult"><i>ไม่พบผลการค้นหา</i></div>
        `;
      } else {
        noResultDiv.style.display = "none";
      }
    }

    checkboxes.forEach(cb => cb.addEventListener("change", filterGallery));

    Fancybox.bind('[data-fancybox="gallery"]', {
      Thumbs: {
        autoStart: false   // ไม่เปิด thumbnail อัตโนมัติ
      },
      Toolbar: {
        display: ["zoom", "close"] // toolbar เรียบง่าย
      },
      animated: false,      // ปิด animation
      Carousel: {
        preload: 1,          // โหลดแค่ 1 รูปล่วงหน้า
        friction: 0.9
      },
      dragToClose: true,
      infinite: true
    });

  });


  // theme
const themeToggleButton = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// ตรวจสอบธีมที่บันทึกไว้
let savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  document.body.classList.add('light');
  document.body.classList.remove('dark');
  themeIcon.src = 'sun-icon.png'; // ไอคอนพระอาทิตย์ (สว่าง)
} else {
  document.body.classList.add('dark');
  document.body.classList.remove('light');
  themeIcon.src = 'moon-icon.png'; // ไอคอนพระจันทร์ (มืด)
}

// ฟังก์ชันเปลี่ยนธีม
themeToggleButton.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  document.body.classList.toggle('dark', !isLight);

  if (isLight) {
    localStorage.setItem('theme', 'light');
    themeIcon.src = 'sun-icon.png'; 
  } else {
    localStorage.setItem('theme', 'dark');
    themeIcon.src = 'moon-icon.png'; 
  }

  // เปลี่ยนข้อความและพื้นหลังของสีหลังจากคลิกปุ่มเปลี่ยนธีม
  changeThemeColors();
});

// เปลี่ยนข้อความและพื้นหลังตามธีม
function changeThemeColors() {
  const elements = document.querySelectorAll('.color > button'); // เลือกแต่ละ div ที่อยู่ภายใน .color
  elements.forEach(function(element) {
    if (document.body.classList.contains('light')) {
      // สำหรับธีมสว่าง
      element.style.color = element.getAttribute('data-dark'); // เปลี่ยนสีข้อความให้เป็น dark สีของข้อความในธีมสว่าง
      element.style.backgroundColor = element.getAttribute('data-light-bg'); // เปลี่ยนพื้นหลัง
      element.textContent = element.getAttribute('data-light'); // เปลี่ยนข้อความให้ตรงกับโค้ดสีในธีมสว่าง
    } else {
      // สำหรับธีมมืด
      element.style.color = element.getAttribute('data-light'); // เปลี่ยนสีข้อความให้เป็น light สีของข้อความในธีมมืด
      element.style.backgroundColor = element.getAttribute('data-dark-bg'); // เปลี่ยนพื้นหลัง
      element.textContent = element.getAttribute('data-dark'); // เปลี่ยนข้อความให้ตรงกับโค้ดสีในธีมมืด
    }
  });
}

// เรียกใช้เมื่อโหลดหน้า
changeThemeColors();
