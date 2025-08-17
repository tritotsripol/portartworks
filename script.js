const sheetID = "17lmRDtyNAAO5by06d3jujobKKpe4M11qxwziiXNPwqs"; // ใส่ Spreadsheet ID ของคุณ
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
      const caption = r.c[r.c.length-1].v; // สมมติ caption อยู่ column สุดท้าย

      // สมมติ column 1–6 เป็นหมวด
      const catColumns = [1,2,3,4,5,6];
      const allCats = catColumns.flatMap(i => {
        const val = r.c[i] ? r.c[i].v : "";
        return val && val !== "-" ? val.split(",").map(s => s.trim()) : [];
      });

      // เก็บทุกหมวดเพื่อสร้าง checkbox
      allCats.forEach(c => allCategorySet.add(c));

      // สร้าง item
      const div = document.createElement("div");
      div.className = "item";

      // data-cat ใช้ | เป็นตัวคั่น
      div.setAttribute("data-cat", allCats.join("|"));

      div.innerHTML = `
        <a href="${image}"><img src="${image}" alt="${caption}" class="gallery-img"></a><br>
        ${allCats.map(cat => `<small class="cat">${cat}</small>`).join("&nbsp;")}
        <p class="caption">${caption}</p>
      `;

      gallery.appendChild(div);
    });

    // --- สร้าง checkbox filter อัตโนมัติ ---
    const filterDiv = document.getElementById("filter");
    Array.from(allCategorySet).sort().forEach(cat => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" value="${cat}">&nbsp;
        <span class="checkmark"></span> 
        ${cat}
      `;
      label.classList.add("checkbox");

      filterDiv.appendChild(label);
    });

    // --- Filter function ---
    const checkboxes = document.querySelectorAll("#filter input[type=checkbox]");

    function filterGallery() {
      const selected = Array.from(checkboxes)
                            .filter(cb => cb.checked)
                            .map(cb => cb.value.trim());

      document.querySelectorAll(".item").forEach(item => {
        const itemCats = item.getAttribute("data-cat").split("|").map(s => s.trim());
        item.style.display = (selected.length === 0 || selected.some(cat => itemCats.includes(cat))) ? "block" : "none";
      });
    }

    checkboxes.forEach(cb => cb.addEventListener("change", filterGallery));

  });
