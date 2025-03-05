const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const currentSources = {};

// Load file lists from files.json
async function loadFileLists() {
    const response = await fetch('files.json');
    const fileLists = await response.json();
    return fileLists;
}

// Load all audio buffers based on file lists
async function loadBuffers(fileLists) {
    const allFiles = [
        ...fileLists.drums.map(f => `sounds/drums/${f}`),
        ...fileLists.loops.map(f => `sounds/loops/${f}`),
        ...fileLists.effects.map(f => `sounds/effects/${f}`),
        ...fileLists["trump-zel"].map(f => `sounds/trump-zel/${f}`)
    ];
    const buffers = {};
    for (const file of allFiles) {
        const response = await fetch(file);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        buffers[file] = audioBuffer;
    }
    return buffers;
}

// Format file names for display
function formatFileName(file) {
    const name = file.replace('.webm', '');
    if (name.includes('-')) {
        return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    } else if (name.includes('_')) {
        return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return name;
}

// Build the dashboard UI
function buildUI(buffers, fileLists) {
    const dashboard = document.getElementById('dashboard');
    const sections = [
        { name: 'Drums', files: fileLists.drums, category: 'drums' },
        { name: 'Loops', files: fileLists.loops, category: 'loops' },
        { name: 'Effects', files: fileLists.effects, category: 'effects' },
        { name: 'Trump-Zel', files: fileLists["trump-zel"], category: 'trump-zel' }
    ];

    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section';
        const h2 = document.createElement('h2');
        h2.textContent = section.name;
        sectionDiv.appendChild(h2);
        const fileList = document.createElement('div');
        fileList.className = 'file-list';

        section.files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.file = `sounds/${section.category}/${file}`;
            fileItem.dataset.category = section.category;

            const span = document.createElement('span');
            span.textContent = formatFileName(file);

            const button = document.createElement('button');
            button.className = 'play-button';
            button.innerHTML = '<i class="fas fa-play"></i>'; // Play triangle icon

            fileItem.appendChild(span);
            fileItem.appendChild(button);
            fileList.appendChild(fileItem);
        });

        sectionDiv.appendChild(fileList);
        dashboard.appendChild(sectionDiv);
    });

    // Add play/stop functionality
    document.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', () => {
            const fileItem = button.parentElement;
            const file = fileItem.dataset.file;
            const category = fileItem.dataset.category;

            if (currentSources[file]) {
                // Stop the audio
                currentSources[file].stop();
                delete currentSources[file];
                button.classList.remove('playing');
                button.innerHTML = '<i class="fas fa-play"></i>'; // Back to play icon
            } else {
                // Play the audio
                const source = audioContext.createBufferSource();
                source.buffer = buffers[file];
                source.loop = (category === 'drums'); // Only drums loop
                source.connect(audioContext.destination);
                source.start();
                currentSources[file] = source;
                button.classList.add('playing');
                button.innerHTML = '<i class="fas fa-pause"></i>'; // Pause icon when playing

                // Reset button for non-looping audio when they end
                if (!source.loop) {
                    source.onended = () => {
                        button.classList.remove('playing');
                        button.innerHTML = '<i class="fas fa-play"></i>';
                        delete currentSources[file];
                    };
                }
            }
        });
    });
}

// Initialize on page load
window.onload = async () => {
    const fileLists = await loadFileLists();
    const buffers = await loadBuffers(fileLists);
    buildUI(buffers, fileLists);
};