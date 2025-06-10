const bubbleBtn = document.getElementById("bubbleBtn");
const shellBtn = document.getElementById("shellBtn");
const binaryBtn = document.getElementById("binaryBtn");
const dataInput = document.getElementById("dataInput");
const searchInput = document.getElementById("searchInput");
const searchGroup = document.getElementById("searchGroup");
const processBtn = document.getElementById("processBtn");
const resetBtn = document.getElementById("resetBtn");
const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const resultsDiv = document.getElementById("results");
const resultText = document.getElementById("resultText");
const stepsDiv = document.getElementById("steps");
const speedControl = document.getElementById("speedControl");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const downloadExample = document.getElementById("downloadExample");
const tableBody = document.getElementById("tableBody");

// Chart setup
const ctx = document.getElementById("chart").getContext("2d");
let chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Nilai Siswa",
        data: [],
        backgroundColor: "#4361ee",
        borderColor: "#3a0ca3",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Nilai: ${context.parsed.y}`;
          },
          title: function (context) {
            return context[0].label;
          },
        },
        backgroundColor: "rgba(30, 30, 45, 0.9)",
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: "Nilai",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: "Nama Siswa",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
    animation: {
      duration: 0,
    },
  },
});

// Variabel state
let currentAlgorithm = "bubble";
let originalData = [];
let sortedData = [];
let animationSpeed = 5;
let animationSteps = [];
let currentStep = 0;
let animationInterval = null;

// Event Listeners
bubbleBtn.addEventListener("click", () => setActiveAlgorithm("bubble"));
shellBtn.addEventListener("click", () => setActiveAlgorithm("shell"));
binaryBtn.addEventListener("click", () => setActiveAlgorithm("binary"));
processBtn.addEventListener("click", processData);
resetBtn.addEventListener("click", resetVisualizer);
fileInput.addEventListener("change", handleFileUpload);
speedSlider.addEventListener("input", updateSpeed);
downloadExample.addEventListener("click", downloadExampleFile);

// Fungsi untuk mengatur algoritma aktif
function setActiveAlgorithm(algorithm) {
  currentAlgorithm = algorithm;

  // Reset button styles
  bubbleBtn.classList.remove("active");
  shellBtn.classList.remove("active");
  binaryBtn.classList.remove("active");

  // Set active button
  if (algorithm === "bubble") {
    bubbleBtn.classList.add("active");
    speedControl.style.display = "flex";
    searchGroup.style.display = "none";
  } else if (algorithm === "shell") {
    shellBtn.classList.add("active");
    speedControl.style.display = "flex";
    searchGroup.style.display = "none";
  } else if (algorithm === "binary") {
    binaryBtn.classList.add("active");
    speedControl.style.display = "none";
    searchGroup.style.display = "flex";
  }
}

// Fungsi untuk memperbarui kecepatan
function updateSpeed() {
  animationSpeed = speedSlider.value;
  speedValue.textContent = animationSpeed;

  // Jika animasi sedang berjalan, perbarui kecepatan
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null; // Clear interval before setting new one
    playAnimation();
  }
}

// Fungsi untuk memproses data
function processData() {
  // Hentikan animasi yang sedang berjalan
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  // Ambil data dari input
  let dataStr = dataInput.value.trim();

  // Validasi data
  if (!dataStr) {
    showError("Silakan masukkan data siswa terlebih dahulu!");
    return;
  }

  // Parse data siswa
  try {
    originalData = dataStr.split(",").map((pair) => {
      const [name, scoreStr] = pair.split(":").map((str) => str.trim());
      if (!name || !scoreStr) {
        throw new Error(`Format tidak valid: "${pair}"`);
      }

      const score = parseFloat(scoreStr);
      if (isNaN(score)) {
        throw new Error(`Nilai tidak valid: "${scoreStr}"`);
      }

      return { name, score };
    });
  } catch (error) {
    showError(error.message);
    return;
  }

  // Tampilkan tabel siswa
  updateStudentTable(originalData);

  // Proses berdasarkan algoritma
  if (currentAlgorithm === "binary") {
    const searchValue = parseFloat(searchInput.value.trim());
    if (isNaN(searchValue)) {
      showError("Silakan masukkan nilai yang valid untuk dicari!");
      return;
    }

    // Pastikan data terurut untuk binary search
    sortedData = [...originalData].sort((a, b) => a.score - b.score);
    updateChart(sortedData);

    // Reset animation steps
    animationSteps = [];

    // Jalankan binary search dengan visualisasi dan dapatkan metrics
    const binarySearchResult = binarySearchWithVisualization(sortedData, searchValue);
    const resultIndex = binarySearchResult.index;
    const searchComparisons = binarySearchResult.comparisons;
    const searchTime = binarySearchResult.time;

    // Tampilkan hasil
    resultsDiv.style.display = "block";
    if (resultIndex === -1) {
      resultText.innerHTML = `
        <p>Nilai <strong>${searchValue}</strong> tidak ditemukan dalam data siswa.</p>
        <p>Jumlah perbandingan: <strong>${searchComparisons}</strong></p>
        <p>Waktu eksekusi: <strong>${searchTime.toFixed(2)} ms</strong></p>
      `;
    } else {
      const foundStudent = sortedData[resultIndex];
      resultText.innerHTML = `
        <p>Nilai <strong>${searchValue}</strong> ditemukan pada siswa <strong>${foundStudent.name}</strong> (setelah diurutkan).</p>
        <p>Jumlah perbandingan: <strong>${searchComparisons}</strong></p>
        <p>Waktu eksekusi: <strong>${searchTime.toFixed(2)} ms</strong></p>
      `;
    }

    // Mulai animasi
    currentStep = 0;
    playAnimation();
  }else {
        // Untuk sorting algorithms
        sortedData = [...originalData];
        animationSteps = [];
        
        let result;
        
        if (currentAlgorithm === "bubble") {
            result = bubbleSortWithSteps(sortedData);
        } else if (currentAlgorithm === "shell") {
            result = shellSortWithSteps(sortedData);
        }

        // Tampilkan hasil
        resultsDiv.style.display = "block";

        // Update tabel dengan data terurut
        updateStudentTable(sortedData);

        // Tampilkan pesan hasil dengan waktu eksekusi, perbandingan, dan pertukaran
        const studentList = sortedData.map(student => `${student.name} (${student.score})`).join(", ");
        resultText.innerHTML = `
            <p>Data siswa terurut: <strong>${studentList}</strong></p>
            <p>Waktu eksekusi: <strong>${result.time.toFixed(2)} ms</strong></p>
            <p>Jumlah perbandingan: <strong>${result.comparisons}</strong></p>
            <p>Jumlah pertukaran: <strong>${result.swaps}</strong></p>
        `;

        // Mulai animasi
        currentStep = 0;
        playAnimation();
    }
}

// Fungsi untuk memainkan animasi sorting
function playAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval);
  }

  const delay = 1100 - animationSpeed * 100; // 100ms sampai 1000ms

  animationInterval = setInterval(() => {
    if (currentStep >= animationSteps.length) {
      clearInterval(animationInterval);
      return;
    }

    const step = animationSteps[currentStep];
    updateChart(step.data, step.highlights);

    if (step.description) {
      stepsDiv.innerHTML += `<div class="step-item">Langkah ${
        currentStep + 1
      }: ${step.description}</div>`;
      // Scroll to bottom
      stepsDiv.scrollTop = stepsDiv.scrollHeight;
    }

    currentStep++;
  }, delay);
}

// Fungsi untuk mengupdate chart
function updateChart(data, highlights = []) {
  chart.data.labels = data.map((student) => student.name);
  chart.data.datasets[0].data = data.map((student) => student.score);

  // Update warna untuk highlight
  chart.data.datasets[0].backgroundColor = data.map((_, i) => {
    if (highlights.includes(i)) {
      return "#f72585";
    }
    return "#4361ee";
  });

  chart.update();
}

// Fungsi untuk update tabel siswa
function updateStudentTable(data) {
  tableBody.innerHTML = data.map(student => `
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${student.name}</td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${student.score}</td>
    </tr>
  `).join("");
}

// Fungsi untuk highlight hasil binary search - (Not directly used for animation, but good to keep)
function highlightResult(index) {
  if (index === -1) return;

  const bgColors = sortedData.map((_, i) =>
    i === index ? "#f72585" : "#4361ee"
  );

  chart.data.labels = sortedData.map((student) => student.name);
  chart.data.datasets[0].data = sortedData.map((student) => student.score);
  chart.data.datasets[0].backgroundColor = bgColors;
  chart.update();
}

// Bubble Sort dengan penyimpanan langkah, perhitungan waktu, perbandingan, dan pertukaran
function bubbleSortWithSteps(arr) {
    const startTime = performance.now(); // Catat waktu mulai
    let n = arr.length;
    let swapped;
    let comparisons = 0;
    let swaps = 0;
    
    // Reset steps
    stepsDiv.innerHTML = "";
    
    // Simpan langkah awal
    animationSteps.push({
        data: [...arr],
        highlights: [],
        description: "Memulai Bubble Sort data siswa"
    });
    
    do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            comparisons++; // Increment comparison count
            // Simpan langkah sebelum perbandingan
            animationSteps.push({
                data: [...arr],
                highlights: [i, i + 1],
                description: `Membandingkan ${arr[i].name} (${arr[i].score}) dan ${arr[i+1].name} (${arr[i+1].score})`
            });
            
            if (arr[i].score > arr[i + 1].score) {
                // Tukar elemen
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                swapped = true;
                swaps++; // Increment swap count
                
                // Simpan langkah setelah pertukaran
                animationSteps.push({
                    data: [...arr],
                    highlights: [i, i + 1],
                    description: `Menukar posisi ${arr[i].name} dan ${arr[i+1].name}`
                });
            }
        }
        n--;
    } while (swapped);
    
    // Simpan langkah akhir
    animationSteps.push({
        data: [...arr],
        highlights: [],
        description: "Sorting selesai"
    });
    
    const endTime = performance.now(); // Catat waktu selesai
    return {
        time: endTime - startTime, 
        comparisons: comparisons, 
        swaps: swaps 
    }; // Return waktu eksekusi, perbandingan, dan pertukaran
}


// Shell Sort dengan penyimpanan langkah, perhitungan waktu, perbandingan, dan pertukaran
function shellSortWithSteps(arr) {
    const startTime = performance.now(); // Catat waktu mulai
    let n = arr.length;
    let comparisons = 0;
    let swaps = 0;
    
    // Reset steps
    stepsDiv.innerHTML = "";
    
    // Simpan langkah awal
    animationSteps.push({
        data: [...arr],
        highlights: [],
        description: "Memulai Shell Sort data siswa"
    });
    
    // Mulai dengan gap besar, lalu kurangi gap
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        animationSteps.push({
            data: [...arr],
            highlights: [],
            description: `Menggunakan gap: ${gap}`
        });
        
        // Lakukan insertion sort untuk gap ini
        for (let i = gap; i < n; i++) {
            let temp = arr[i];
            let j;
            
            // Simpan langkah sebelum pergeseran
            animationSteps.push({
                data: [...arr],
                highlights: [i, i - gap],
                description: `Membandingkan ${arr[i].name} (${arr[i].score}) dan ${arr[i - gap].name} (${arr[i - gap].score})`
            });
            
            for (j = i; j >= gap; j -= gap) {
                comparisons++; // Increment comparison count
                if (arr[j - gap].score > temp.score) {
                    arr[j] = arr[j - gap];
                    swaps++; // Increment swap count for shifting
                    // Simpan langkah setelah pergeseran
                    animationSteps.push({
                        data: [...arr],
                        highlights: [j, j - gap],
                        description: `Memindahkan ${arr[j].name} ke posisi ${j}`
                    });
                } else {
                    break; // Element is in correct position
                }
            }
            
            if (arr[j].name !== temp.name || arr[j].score !== temp.score) { // Only count swap if an actual change happens
                arr[j] = temp;
                swaps++; // Increment swap count for placing temp
            }

            // Simpan langkah setelah penempatan
            animationSteps.push({
                data: [...arr],
                highlights: [j],
                description: `Menempatkan ${temp.name} pada posisi ${j}`
            });
        }
    }
    
    // Simpan langkah akhir
    animationSteps.push({
        data: [...arr],
        highlights: [],
        description: "Sorting selesai"
    });
    
    const endTime = performance.now(); // Catat waktu selesai
    return { 
        time: endTime - startTime, 
        comparisons: comparisons, 
        swaps: swaps 
    }; // Return waktu eksekusi, perbandingan, dan pertukaran
}

// Binary Search dengan perhitungan waktu dan perbandingan
function binarySearchWithVisualization(arr, target) {
    const startTime = performance.now();
    let left = 0;
    let right = arr.length - 1;
    let comparisons = 0;
    let foundIndex = -1;
    
    // Reset steps
    stepsDiv.innerHTML = "";
    
    // Simpan langkah awal
    animationSteps.push({
        data: [...arr],
        highlights: [],
        description: `Memulai Binary Search untuk nilai ${target}`
    });
    
    while (left <= right) {
            comparisons++; // Increment comparison for the mid check
        const mid = Math.floor((left + right) / 2);
        
        // Highlight area pencarian dan titik tengah
        let highlights = [];
        for (let i = left; i <= right; i++) {
            highlights.push(i);
        }
        
        // Simpan langkah sebelum perbandingan
        animationSteps.push({
            data: [...arr],
            highlights: [...highlights, mid],
            description: `Membagi data: indeks ${left}-${right}, titik tengah ${mid} (${arr[mid].name}: ${arr[mid].score})`
        });
        
        if (arr[mid].score === target) {
            foundIndex = mid;
            // Simpan langkah ketika ditemukan
            animationSteps.push({
                data: [...arr],
                highlights: [mid],
                description: `Ditemukan nilai ${target} pada siswa ${arr[mid].name}`
            });
            break;
        } else if (arr[mid].score < target) {
            // Simpan langkah jika nilai lebih besar
            animationSteps.push({
                data: [...arr],
                highlights: [mid],
                description: `${target} lebih besar dari ${arr[mid].score}, mencari di bagian kanan`
            });
            left = mid + 1;
        } else {
            // Simpan langkah jika nilai lebih kecil
            animationSteps.push({
                data: [...arr],
                highlights: [mid],
                description: `${target} lebih kecil dari ${arr[mid].score}, mencari di bagian kiri`
            });
            right = mid - 1;
        }
    }
    
    if (foundIndex === -1) {
        // Simpan langkah jika tidak ditemukan
        animationSteps.push({
            data: [...arr],
            highlights: [],
            description: `Nilai ${target} tidak ditemukan dalam data`
        });
    }
    
    const endTime = performance.now();
    return {
        index: foundIndex,
        time: endTime - startTime, // Return waktu eksekusi dalam milidetik
        comparisons: comparisons
    };
}


// Fungsi untuk handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  fileName.textContent = file.name;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = e.target.result;

    // Cek ekstensi file untuk menentukan cara membaca
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      // File Excel
      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Konversi ke JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Proses data
        const students = [];

        jsonData.forEach((row) => {
          // Cari kolom yang mengandung "nama" dan "nilai"
          const nameKey = Object.keys(row).find(
            (key) =>
              key.toLowerCase().includes("nama") ||
              key.toLowerCase().includes("name")
          );

          const scoreKey = Object.keys(row).find(
            (key) =>
              key.toLowerCase().includes("nilai") ||
              key.toLowerCase().includes("score") ||
              key.toLowerCase().includes("value")
          );

          if (nameKey && scoreKey) {
            const name = String(row[nameKey]);
            const score = parseFloat(row[scoreKey]);

            if (!isNaN(score)) {
              students.push({ name, score });
            }
          }
        });

        if (students.length === 0) {
          showError("File Excel tidak berisi data siswa yang valid");
          return;
        }

        // Format untuk textarea
        dataInput.value = students
          .map((student) => `${student.name}:${student.score}`)
          .join(", ");
      } catch (error) {
        showError("Gagal membaca file Excel: " + error.message);
      }
    } else {
      // File teks (txt, csv)
      const content = e.target.result;
      // Bersihkan konten dan konversi ke format yang sesuai
      const cleanedContent = content
        .replace(/\r\n/g, ",") // Ganti baris baru dengan koma
        .replace(/\n/g, ",")
        .replace(/\s+/g, "") // Hapus spasi berlebih
        .replace(/,,+/g, ","); // Hapus koma berurutan

      dataInput.value = cleanedContent;
    }
  };

  reader.onerror = function () {
    showError("Gagal membaca file");
  };

  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    reader.readAsBinaryString(file);
  } else {
    reader.readAsText(file);
  }
}

// Fungsi untuk reset visualizer
function resetVisualizer() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  dataInput.value = "";
  searchInput.value = "";
  fileName.textContent = "Belum ada file dipilih";
  fileInput.value = "";
  resultsDiv.style.display = "none";
  stepsDiv.innerHTML = "";
  tableBody.innerHTML = "";
  animationSteps = [];
  currentStep = 0;

  // Reset chart
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  chart.update();
}

// Fungsi untuk menampilkan error
function showError(message) {
  resultsDiv.style.display = "block";
  resultText.innerHTML = `<div style="color: #f72585;"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
  stepsDiv.innerHTML = "";
  tableBody.innerHTML = "";
}

// Inisialisasi
setActiveAlgorithm("bubble");