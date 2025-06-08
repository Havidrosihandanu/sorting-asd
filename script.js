
        // Elemen DOM
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
                datasets: [{
                    label: "Nilai Siswa",
                    data: [],
                    backgroundColor: "#4361ee",
                    borderColor: "#3a0ca3",
                    borderWidth: 1,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Nilai: ${context.parsed.y}`;
                            },
                            title: function(context) {
                                return context[0].label;
                            }
                        },
                        backgroundColor: "rgba(30, 30, 45, 0.9)",
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 14
                        },
                        padding: 12,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "rgba(0, 0, 0, 0.05)"
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: 'Nilai',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: 'Nama Siswa',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                },
                animation: {
                    duration: 0
                }
            }
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
                originalData = dataStr.split(",").map(pair => {
                    const [name, scoreStr] = pair.split(":").map(str => str.trim());
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
                
                const resultIndex = binarySearch(sortedData, searchValue);
                
                // Tampilkan hasil
                resultsDiv.style.display = "block";
                if (resultIndex === -1) {
                    resultText.innerHTML = `Nilai <strong>${searchValue}</strong> tidak ditemukan dalam data siswa.`;
                } else {
                    const foundStudent = sortedData[resultIndex];
                    resultText.innerHTML = `Nilai <strong>${searchValue}</strong> ditemukan pada siswa <strong>${foundStudent.name}</strong> (setelah diurutkan).`;
                }
                
                // Highlight hasil di chart
                highlightResult(resultIndex);
            } else {
                // Untuk sorting algorithms
                sortedData = [...originalData];
                animationSteps = [];
                
                if (currentAlgorithm === "bubble") {
                    bubbleSortWithSteps(sortedData);
                } else if (currentAlgorithm === "shell") {
                    shellSortWithSteps(sortedData);
                }
                
                // Tampilkan hasil
                resultsDiv.style.display = "block";
                
                // Update tabel dengan data terurut
                updateStudentTable(sortedData);
                
                // Tampilkan pesan hasil
                const studentList = sortedData.map(student => `${student.name} (${student.score})`).join(", ");
                resultText.innerHTML = `Data siswa terurut: <strong>${studentList}</strong>`;
                
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
                    stepsDiv.innerHTML += `<div class="step-item">Langkah ${currentStep + 1}: ${step.description}</div>`;
                    // Scroll to bottom
                    stepsDiv.scrollTop = stepsDiv.scrollHeight;
                }
                
                currentStep++;
            }, delay);
        }

        // Fungsi untuk mengupdate chart
        function updateChart(data, highlights = []) {
            chart.data.labels = data.map(student => student.name);
            chart.data.datasets[0].data = data.map(student => student.score);
            
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
            tableBody.innerHTML = "";
            
            data.forEach(student => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.score}</td>
                `;
                tableBody.appendChild(row);
            });
        }

        // Fungsi untuk highlight hasil binary search
        function highlightResult(index) {
            if (index === -1) return;
            
            const bgColors = sortedData.map((_, i) =>
                i === index ? "#f72585" : "#4361ee"
            );
            
            chart.data.labels = sortedData.map(student => student.name);
            chart.data.datasets[0].data = sortedData.map(student => student.score);
            chart.data.datasets[0].backgroundColor = bgColors;
            chart.update();
        }

        // Bubble Sort dengan penyimpanan langkah
        function bubbleSortWithSteps(arr) {
            let n = arr.length;
            let swapped;
            
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
        }

        // Shell Sort dengan penyimpanan langkah
        function shellSortWithSteps(arr) {
            let n = arr.length;
            
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
                    
                    for (j = i; j >= gap && arr[j - gap].score > temp.score; j -= gap) {
                        arr[j] = arr[j - gap];
                        
                        // Simpan langkah setelah pergeseran
                        animationSteps.push({
                            data: [...arr],
                            highlights: [j, j - gap],
                            description: `Memindahkan ${arr[j].name} ke posisi ${j}`
                        });
                    }
                    
                    arr[j] = temp;
                    
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
        }

        // Binary Search
        function binarySearch(arr, target) {
            let left = 0;
            let right = arr.length - 1;
            let steps = [];
            
            while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                steps.push(`Membagi data: indeks ${left}-${right}, titik tengah ${mid} (${arr[mid].name}: ${arr[mid].score})`);
                
                if (arr[mid].score === target) {
                    steps.push(`Ditemukan nilai ${target} pada siswa ${arr[mid].name}`);
                    return mid;
                } else if (arr[mid].score < target) {
                    steps.push(`${target} lebih besar dari ${arr[mid].score}, mencari di bagian kanan`);
                    left = mid + 1;
                } else {
                    steps.push(`${target} lebih kecil dari ${arr[mid].score}, mencari di bagian kiri`);
                    right = mid - 1;
                }
            }
            
            steps.push(`Nilai ${target} tidak ditemukan dalam data`);
            
            // Tampilkan langkah-langkah binary search
            stepsDiv.innerHTML = steps.map(step => 
                `<div class="step-item">${step}</div>`
            ).join("");
            
            return -1;
        }

        // Fungsi untuk handle file upload
        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            fileName.textContent = file.name;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = e.target.result;
                
                // Cek ekstensi file untuk menentukan cara membaca
                if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    // File Excel
                    try {
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        
                        // Konversi ke JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);
                        
                        // Proses data
                        const students = [];
                        
                        jsonData.forEach(row => {
                            // Cari kolom yang mengandung "nama" dan "nilai"
                            const nameKey = Object.keys(row).find(key => 
                                key.toLowerCase().includes('nama') || 
                                key.toLowerCase().includes('name'));
                                
                            const scoreKey = Object.keys(row).find(key => 
                                key.toLowerCase().includes('nilai') || 
                                key.toLowerCase().includes('score') ||
                                key.toLowerCase().includes('value'));
                            
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
                        dataInput.value = students.map(student => `${student.name}:${student.score}`).join(", ");
                    } catch (error) {
                        showError("Gagal membaca file Excel: " + error.message);
                    }
                } else {
                    // File teks (txt, csv)
                    const content = e.target.result;
                    // Bersihkan konten dan konversi ke format yang sesuai
                    const cleanedContent = content
                        .replace(/\r\n/g, ",")  // Ganti baris baru dengan koma
                        .replace(/\n/g, ",")
                        .replace(/\s+/g, "")    // Hapus spasi berlebih
                        .replace(/,,+/g, ",");   // Hapus koma berurutan
                    
                    dataInput.value = cleanedContent;
                }
            };
            
            reader.onerror = function() {
                showError("Gagal membaca file");
            };
            
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
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

        // Fungsi untuk download contoh file Excel
        function downloadExampleFile(e) {
            e.preventDefault();
            
            // Buat data contoh
            const data = [
                ["Nama", "Nilai"],
                ["Andi", 85],
                ["Budi", 90],
                ["Cici", 75],
                ["Dedi", 65],
                ["Eka", 95],
                ["Fani", 80],
                ["Gani", 70],
                ["Hani", 60]
            ];
            
            // Buat workbook
            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "DataSiswa");
            
            // Simpan sebagai file
            XLSX.writeFile(wb, "contoh_data_siswa.xlsx");
        }

        // Inisialisasi
        setActiveAlgorithm("bubble");
        
        // Contoh data awal