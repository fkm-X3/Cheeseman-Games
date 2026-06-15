let zIndexCounter = 100;

    function openWindow(id, url, title) {
        const existingWin = document.getElementById(`win-${id}`);
        
        if (existingWin) {
            existingWin.style.display = 'flex';
            focusWindow(existingWin);
            const taskItem = document.getElementById(`task-${id}`);
            if (taskItem) taskItem.remove();
            return;
        }

        const win = document.createElement('div');
        win.id = `win-${id}`;
        win.className = 'sub-window';
        
        const offset = (zIndexCounter - 100) * 20;
        win.style.left = (150 + offset) + 'px';
        win.style.top = (60 + offset) + 'px';
        win.style.zIndex = ++zIndexCounter;

        win.innerHTML = `
            <div class="window-header" onmousedown="startDrag(event, this.parentElement)">
                <span class="text-white text-[11px] font-black uppercase tracking-widest opacity-80">${title}</span>
                <div class="window-controls">
                    <div class="control-dot dot-min" onclick="minimizeWindow('${id}')"></div>
                    <div class="control-dot dot-max" onclick="toggleMaximize('${id}')"></div>
                    <div class="control-dot dot-close" onclick="closeWindow('${id}')"></div>
                </div>
            </div>
            <iframe class="window-content" src="${url}"></iframe>
        `;

        win.onmousedown = () => focusWindow(win);
        document.getElementById('desktop').appendChild(win);
    }

    function focusWindow(win) {
        win.style.zIndex = ++zIndexCounter;
    }

    function closeWindow(id) {
        const win = document.getElementById(`win-${id}`);
        if (win) win.remove();
        const taskItem = document.getElementById(`task-${id}`);
        if (taskItem) taskItem.remove();
    }

    function minimizeWindow(id) {
        const win = document.getElementById(`win-${id}`);
        if (!win) return;
        win.style.display = 'none';
        
        if (!document.getElementById(`task-${id}`)) {
            const task = document.createElement('div');
            task.id = `task-${id}`;
            task.className = 'taskbar-item';
            task.innerText = win.querySelector('.window-header span').innerText;
            task.onclick = () => {
                win.style.display = 'flex';
                focusWindow(win);
                task.remove();
            };
            document.getElementById('taskbar-items').appendChild(task);
        }
    }

    function toggleMaximize(id) {
        const win = document.getElementById(`win-${id}`);
        if (win.style.width === '100%') {
            win.style.width = '850px';
            win.style.height = '650px';
            win.style.top = '100px';
            win.style.left = '100px';
            win.style.borderRadius = '12px';
        } else {
            win.style.width = '100%';
            win.style.height = 'calc(100% - 60px)';
            win.style.top = '0';
            win.style.left = '0';
            win.style.borderRadius = '0';
        }
    }

    let currentDrag = null;
    let offsetX, offsetY;

    function startDrag(e, win) {
        if (win.style.width === '100%') return;
        currentDrag = win;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        focusWindow(win);
        win.querySelector('iframe').style.pointerEvents = 'none';
    }

    function drag(e) {
        if (!currentDrag) return;
        currentDrag.style.left = (e.clientX - offsetX) + 'px';
        currentDrag.style.top = (e.clientY - offsetY) + 'px';
    }

    function stopDrag() {
        if (currentDrag) currentDrag.querySelector('iframe').style.pointerEvents = 'auto';
        currentDrag = null;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }