document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('dark-mode-toggle');

    // Modal elements
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const closeModalBtn = document.getElementById('close-modal');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const slideshowSpeedSelect = document.getElementById('slideshow-speed');

    // Selection elements
    const selectModeBtn = document.getElementById('select-mode-btn');
    const startSelectionSlideshowBtn = document.getElementById('start-selection-slideshow-btn');
    const clearSelectionBtn = document.getElementById('clear-selection-btn');

    // Magnifier
    const magnifierGlass = document.getElementById('magnifier-glass');

    let currentIndex = 0;
    let currentImageSet = []; // Used by the lightbox
    let displayedImages = []; // Images currently visible in the grid
    let slideshowInterval;
    let isSlideshowPlaying = false;
    
    // Selection state
    let isSelectionMode = false;
    let selection = [];

    const imageData = [
        // Animals (7 images)
        { src: 'images/animals/deer.jpg', category: 'animals', uploaded: '2025-07-10' },
        { src: 'images/animals/owl.jpg', category: 'animals', uploaded: '2025-07-05' },
        { src: 'images/animals/parrot.jpg', category: 'animals', uploaded: '2025-06-20' },
        { src: 'images/animals/pitbull.jpg', category: 'animals', uploaded: '2025-06-15' },
        { src: 'images/animals/puppy.jpg', category: 'animals', uploaded: '2025-05-30' },
        { src: 'images/animals/tiger.jpg', category: 'animals', uploaded: '2025-05-25' },
        { src: 'images/animals/white cat.jpg', category: 'animals', uploaded: '2025-04-10' },
        // Architecture (6 images)
        { src: 'images/architecture/cityscape.jpg', category: 'architecture', uploaded: '2025-07-12' },
        { src: 'images/architecture/eiffel tower.jpg', category: 'architecture', uploaded: '2025-07-02' },
        { src: 'images/architecture/india gate.jpg', category: 'architecture', uploaded: '2025-06-18' },
        { src: 'images/architecture/mount fuji.jpg', category: 'architecture', uploaded: '2025-06-12' },
        { src: 'images/architecture/twin tower.jpg', category: 'architecture', uploaded: '2025-05-28' },
        { src: 'images/architecture/ye.jpg', category: 'architecture', uploaded: '2025-05-22' },
        // Nature (7 images)
        { src: 'images/nature/Autumn.jpg', category: 'nature', uploaded: '2025-07-14' },
        { src: 'images/nature/beach.jpg', category: 'nature', uploaded: '2025-07-08' },
        { src: 'images/nature/field.jpg', category: 'nature', uploaded: '2025-06-22' },
        { src: 'images/nature/forest.jpg', category: 'nature', uploaded: '2025-06-14' },
        { src: 'images/nature/lake.jpg', category: 'nature', uploaded: '2025-05-29' },
        { src: 'images/nature/mountain.jpg', category: 'nature', uploaded: '2025-05-24' },
        { src: 'images/nature/Waterfall.jpg', category: 'nature', uploaded: '2025-04-14' },
        // People (7 images)
        { src: 'images/people/arthur.jpg', category: 'people', uploaded: '2025-07-16' },
        { src: 'images/people/Dante.jpg', category: 'people', uploaded: '2025-07-06' },
        { src: 'images/people/kanye west.jpg', category: 'people', uploaded: '2025-06-25' },
        { src: 'images/people/keanu reaves.jpg', category: 'people', uploaded: '2025-06-16' },
        { src: 'images/people/Sean combs.jpg', category: 'people', uploaded: '2025-05-26' },
        { src: 'images/people/tony montana.jpg', category: 'people', uploaded: '2025-05-20' },
        { src: 'images/people/ty dolla sign.jpg', category: 'people', uploaded: '2025-04-16' },
    ];

    const getDaysAgo = (dateString) => {
        const uploadDate = new Date(dateString);
        const today = new Date();
        const timeDiff = today.getTime() - uploadDate.getTime();
        const daysAgo = Math.floor(timeDiff / (1000 * 3600 * 24));
        if (daysAgo < 0) return 'Uploaded in the future';
        if (daysAgo === 0) return 'Uploaded today';
        if (daysAgo === 1) return 'Uploaded yesterday';
        return `Uploaded ${daysAgo} days ago`;
    };

    // ▼▼▼ THIS FUNCTION IS NOW UPDATED ▼▼▼
    const createImageElement = (image) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.category = image.category;
        item.dataset.src = image.src; // Reference to find image data

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.category;

        const info = document.createElement('div');
        info.className = 'image-info';

        // Extract and display the filename instead of the category
        const imageName = document.createElement('p');
        imageName.className = 'category'; // Keep class for styling
        const pathParts = image.src.split('/');
        const fileNameWithExt = pathParts[pathParts.length - 1];
        const fileName = fileNameWithExt.split('.')[0];
        imageName.textContent = fileName;

        const timestamp = document.createElement('p');
        timestamp.className = 'timestamp';
        timestamp.textContent = getDaysAgo(image.uploaded);

        const selectionOverlay = document.createElement('div');
        selectionOverlay.className = 'selection-overlay';
        selectionOverlay.innerHTML = '<i class="fas fa-check-circle icon"></i>';

        info.appendChild(imageName); // Add the image name
        info.appendChild(timestamp);
        item.appendChild(img);
        item.appendChild(info);
        item.appendChild(selectionOverlay);

        item.addEventListener('click', () => handleItemClick(item, image));

        return item;
    };
    // ▲▲▲ THIS FUNCTION IS NOW UPDATED ▲▲▲

    const populateGallery = (filter = 'all') => {
        galleryContainer.innerHTML = '';
        displayedImages = (filter === 'all')
            ? imageData
            : imageData.filter(img => img.category === filter);

        displayedImages.forEach(imgData => {
            const item = createImageElement(imgData);
            if (selection.some(sel => sel.src === imgData.src)) {
                item.classList.add('selected');
            }
            galleryContainer.appendChild(item);
        });
    };
    
    const toggleSelectionMode = () => {
        isSelectionMode = !isSelectionMode;
        galleryContainer.classList.toggle('selection-mode', isSelectionMode);
        selectModeBtn.classList.toggle('active', isSelectionMode);
        selectModeBtn.textContent = isSelectionMode ? 'Cancel Selection' : 'Select for Slideshow';
        updateSelectionControls();
    };

    const updateSelectionControls = () => {
        const hasSelection = selection.length > 0;
        if (isSelectionMode) {
            startSelectionSlideshowBtn.classList.remove('hidden');
            clearSelectionBtn.classList.toggle('hidden', !hasSelection);
            startSelectionSlideshowBtn.textContent = `Start Slideshow (${selection.length})`;
            startSelectionSlideshowBtn.disabled = !hasSelection;
        } else {
            startSelectionSlideshowBtn.classList.add('hidden');
            clearSelectionBtn.classList.add('hidden');
        }
    };
    
    const clearSelection = () => {
        selection = [];
        document.querySelectorAll('.gallery-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        updateSelectionControls();
    };

    const handleItemClick = (itemElement, imageData) => {
        if (isSelectionMode) {
            const indexInSelection = selection.findIndex(sel => sel.src === imageData.src);
            if (indexInSelection > -1) {
                selection.splice(indexInSelection, 1);
                itemElement.classList.remove('selected');
            } else {
                selection.push(imageData);
                itemElement.classList.add('selected');
            }
            updateSelectionControls();
        } else {
            const itemIndex = displayedImages.findIndex(img => img.src === imageData.src);
            openModal(itemIndex, displayedImages);
        }
    };

    const openModal = (index, imageSet) => {
        currentImageSet = imageSet;
        currentIndex = index;
        if (currentImageSet.length === 0) return;

        modalImg.src = currentImageSet[currentIndex].src;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    const closeModalHandler = () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        stopSlideshow();
        magnifierGlass.style.display = 'none';
        modalImg.style.cursor = 'zoom-in';
    };

    const showNextImage = () => {
        currentIndex = (currentIndex + 1) % currentImageSet.length;
        modalImg.src = currentImageSet[currentIndex].src;
    };

    const showPrevImage = () => {
        currentIndex = (currentIndex - 1 + currentImageSet.length) % currentImageSet.length;
        modalImg.src = currentImageSet[currentIndex].src;
    };

    const toggleSlideshow = () => {
        if (isSlideshowPlaying) stopSlideshow();
        else startSlideshow();
    };
    
    const startSlideshow = () => {
        isSlideshowPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        const speed = parseInt(slideshowSpeedSelect.value, 10) * 1000;
        slideshowInterval = setInterval(showNextImage, speed);
    };
    
    const stopSlideshow = () => {
        isSlideshowPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(slideshowInterval);
    };

    function magnify(img, zoom) {
        magnifierGlass.style.backgroundImage = `url('${img.src}')`;
        magnifierGlass.style.backgroundRepeat = 'no-repeat';
        magnifierGlass.style.backgroundSize = `${img.width * zoom}px ${img.height * zoom}px`;
        let bw = 3;
        let w = magnifierGlass.offsetWidth / 2;
        let h = magnifierGlass.offsetHeight / 2;
        const moveMagnifier = (e) => {
            e.preventDefault();
            let pos = getCursorPos(e);
            let x = pos.x;
            let y = pos.y;
            if (x > img.offsetWidth - (w / zoom)) { x = img.offsetWidth - (w / zoom); }
            if (x < w / zoom) { x = w / zoom; }
            if (y > img.offsetHeight - (h / zoom)) { y = img.offsetHeight - (h / zoom); }
            if (y < h / zoom) { y = h / zoom; }
            magnifierGlass.style.left = `${e.pageX - w}px`;
            magnifierGlass.style.top = `${e.pageY - h}px`;
            magnifierGlass.style.backgroundPosition = `-${(x * zoom) - w + bw}px -${(y * zoom) - h + bw}px`;
        };
        const getCursorPos = (e) => {
            let a = img.getBoundingClientRect();
            let x = e.clientX - a.left;
            let y = e.clientY - a.top;
            return { x: x, y: y };
        };
        magnifierGlass.addEventListener('mousemove', moveMagnifier);
        img.addEventListener('mousemove', moveMagnifier);
        magnifierGlass.addEventListener('touchmove', moveMagnifier);
        img.addEventListener('touchmove', moveMagnifier);
    }
    
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeToggle.checked = true;
        }
    }

    // EVENT LISTENERS
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            button.classList.add('active');
            populateGallery(button.dataset.filter);
        });
    });

    selectModeBtn.addEventListener('click', toggleSelectionMode);
    clearSelectionBtn.addEventListener('click', clearSelection);
    startSelectionSlideshowBtn.addEventListener('click', () => {
        if (selection.length > 0) {
            openModal(0, selection);
        }
    });

    closeModalBtn.addEventListener('click', closeModalHandler);
    nextBtn.addEventListener('click', showNextImage);
    prevBtn.addEventListener('click', showPrevImage);
    playPauseBtn.addEventListener('click', toggleSlideshow);

    slideshowSpeedSelect.addEventListener('change', () => {
        if (isSlideshowPlaying) {
            stopSlideshow();
            startSlideshow();
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalHandler();
    });

    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('show')) {
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'Escape') closeModalHandler();
        }
    });

    modalImg.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            magnifierGlass.style.display = 'block';
            magnify(modalImg, 2);
        }
    });
    
    modalImg.addEventListener('mouseleave', () => {
        magnifierGlass.style.display = 'none';
    });

    // Initial Population
    populateGallery();
});