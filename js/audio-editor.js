class AudioEditor {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.audioSource = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.currentTime = 0;
        this.duration = 0;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.animationId = null;
        this.isSelecting = false;
        this.isDragging = false;
        this.mouseDownTime = 0;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    initializeElements() {
        // DOM 요소들 가져오기
        this.uploadArea = document.getElementById('uploadArea');
        this.audioInput = document.getElementById('audioInput');
        this.audioInfo = document.getElementById('audioInfo');
        this.fileName = document.getElementById('fileName');
        this.durationElement = document.getElementById('duration');
        this.sampleRateElement = document.getElementById('sampleRate');
        this.channelsElement = document.getElementById('channels');
        
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
        this.currentTimeElement = document.getElementById('currentTime');
        this.totalTimeElement = document.getElementById('totalTime');
        
        this.waveformCanvas = document.getElementById('waveformCanvas');
        this.timeline = document.getElementById('timeline');
        this.selectionArea = document.getElementById('selectionArea');
        this.timeRuler = document.getElementById('timeRuler');
        
        this.trimBtn = document.getElementById('trimBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        this.fadeInBtn = document.getElementById('fadeInBtn');
        this.fadeOutBtn = document.getElementById('fadeOutBtn');
        this.volumeAdjustInput = document.getElementById('volumeAdjustInput');
        this.applyVolumeBtn = document.getElementById('applyVolumeBtn');
        this.volume50Btn = document.getElementById('volume50Btn');
        this.volume100Btn = document.getElementById('volume100Btn');
        this.volume150Btn = document.getElementById('volume150Btn');
        this.resetBtn = document.getElementById('resetBtn');
        this.formatSelect = document.getElementById('formatSelect');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        // 시간 컨트롤 요소들
        this.timeControls = document.getElementById('timeControls');
        this.currentHours = document.getElementById('currentHours');
        this.currentMinutes = document.getElementById('currentMinutes');
        this.currentSeconds = document.getElementById('currentSeconds');
        this.currentMilliseconds = document.getElementById('currentMilliseconds');
        this.startHours = document.getElementById('startHours');
        this.startMinutes = document.getElementById('startMinutes');
        this.startSeconds = document.getElementById('startSeconds');
        this.startMilliseconds = document.getElementById('startMilliseconds');
        this.endHours = document.getElementById('endHours');
        this.endMinutes = document.getElementById('endMinutes');
        this.endSeconds = document.getElementById('endSeconds');
        this.endMilliseconds = document.getElementById('endMilliseconds');
        this.goToPositionBtn = document.getElementById('goToPositionBtn');
        this.setStartBtn = document.getElementById('setStartBtn');
        this.setEndBtn = document.getElementById('setEndBtn');
        this.applySelectionBtn = document.getElementById('applySelectionBtn');
        this.clearSelectionBtn = document.getElementById('clearSelectionBtn');
        
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        this.ctx = this.waveformCanvas.getContext('2d');
    }
    
    setupEventListeners() {
        // 파일 업로드 이벤트
        this.uploadArea.addEventListener('click', () => this.audioInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadArea.addEventListener('dragleave', () => this.uploadArea.classList.remove('dragover'));
        this.audioInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 오디오 컨트롤 이벤트
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // 파형 캔버스 이벤트
        this.waveformCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.waveformCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.waveformCanvas.addEventListener('mouseleave', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });
        
        // 전역 마우스 이벤트 (캔버스 밖에서도 감지)
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
        
        // 편집 버튼 이벤트
        this.trimBtn.addEventListener('click', () => this.trimSelection());
        this.deleteBtn.addEventListener('click', () => this.deleteSelection());
        this.fadeInBtn.addEventListener('click', () => this.applyFadeIn());
        this.fadeOutBtn.addEventListener('click', () => this.applyFadeOut());
        this.applyVolumeBtn.addEventListener('click', () => this.applyVolumeAdjust());
        this.volume50Btn.addEventListener('click', () => this.setVolumePreset(50));
        this.volume100Btn.addEventListener('click', () => this.setVolumePreset(100));
        this.volume150Btn.addEventListener('click', () => this.setVolumePreset(150));
        this.resetBtn.addEventListener('click', () => this.resetAudio());
        this.downloadBtn.addEventListener('click', () => this.downloadAudio());
        
        // 시간 컨트롤 이벤트
        this.goToPositionBtn.addEventListener('click', () => this.goToPosition());
        this.setStartBtn.addEventListener('click', () => this.setSelectionStart());
        this.setEndBtn.addEventListener('click', () => this.setSelectionEnd());
        this.applySelectionBtn.addEventListener('click', () => this.applyTimeSelection());
        this.clearSelectionBtn.addEventListener('click', () => this.clearSelection());
        
        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('audio/')) {
            this.loadAudioFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            this.loadAudioFile(file);
        }
    }
    
    async loadAudioFile(file) {
        try {
            this.showProgress('Loading audio file...');
            
            // AudioContext 초기화
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // 기존 재생 중지
            this.stop();
            
            // 파일을 ArrayBuffer로 읽기
            const arrayBuffer = await file.arrayBuffer();
            
            // 오디오 디코딩
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // 원본 오디오 백업 (초기화용)
            this.originalAudioBuffer = this.cloneAudioBuffer(this.audioBuffer);
            
            // UI 업데이트
            this.updateAudioInfo(file, this.audioBuffer);
            this.drawWaveform();
            this.enableControls();
            this.clearSelection();
            
            // 원본 오디오가 준비되었으므로 초기화 버튼 활성화
            this.resetBtn.disabled = false;
            
            this.hideProgress();
            
        } catch (error) {
            console.error('Error loading audio file:', error);
            alert('Failed to load audio file. Please try a different file.');
            this.hideProgress();
        }
    }
    
    updateAudioInfo(file, buffer) {
        this.fileName.textContent = file.name;
        this.durationElement.textContent = this.formatTime(buffer.duration);
        this.sampleRateElement.textContent = buffer.sampleRate + ' Hz';
        this.channelsElement.textContent = buffer.numberOfChannels;
        this.totalTimeElement.textContent = this.formatTime(buffer.duration);
        this.audioInfo.classList.add('show');
    }
    
    drawWaveform() {
        const canvas = this.waveformCanvas;
        const ctx = this.ctx;
        
        // 캔버스 크기 설정
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // 오디오 데이터 가져오기
        const data = this.audioBuffer.getChannelData(0);
        const length = data.length;
        const width = canvas.width;
        const height = canvas.height;
        
        // 배경 그리기
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);
        
        // 파형 그리기
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const samplesPerPixel = Math.floor(length / width);
        
        for (let x = 0; x < width; x++) {
            let min = 1.0;
            let max = -1.0;
            
            for (let j = 0; j < samplesPerPixel; j++) {
                const datum = data[x * samplesPerPixel + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            
            const yMin = (1 + min) * height / 2;
            const yMax = (1 + max) * height / 2;
            
            ctx.moveTo(x, yMin);
            ctx.lineTo(x, yMax);
        }
        
        ctx.stroke();
        
        // 중앙선 그리기
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // 시간 눈금자 그리기
        this.drawTimeRuler();
    }
    
    play() {
        if (!this.audioBuffer) return;
        
        // 기존 오디오 소스 정지
        if (this.audioSource) {
            this.audioSource.stop();
        }
        
        // 새 오디오 소스 생성
        this.audioSource = this.audioContext.createBufferSource();
        this.gainNode = this.audioContext.createGain();
        
        this.audioSource.buffer = this.audioBuffer;
        this.audioSource.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        
        // 볼륨 설정
        this.gainNode.gain.value = this.volumeSlider.value / 100;
        
        // 재생 시작
        const startOffset = this.pauseTime;
        this.audioSource.start(0, startOffset);
        this.startTime = this.audioContext.currentTime;
        this.isPlaying = true;
        
        // UI 업데이트
        this.playBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.stopBtn.disabled = false;
        
        // 타임라인 업데이트 시작
        this.updateTimeline();
        
        // 재생 완료 시 처리
        this.audioSource.onended = () => {
            if (this.isPlaying) {
                this.stop();
            }
        };
    }
    
    pause() {
        if (this.audioSource && this.isPlaying) {
            this.audioSource.stop();
            this.pauseTime = (this.audioContext.currentTime - this.startTime) + this.pauseTime;
            this.isPlaying = false;
            
            this.playBtn.disabled = false;
            this.pauseBtn.disabled = true;
            
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }
    
    stop() {
        if (this.audioSource) {
            this.audioSource.stop();
        }
        
        this.isPlaying = false;
        this.pauseTime = 0;
        this.startTime = 0;
        this.currentTime = 0;
        
        this.playBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stopBtn.disabled = true;
        
        this.currentTimeElement.textContent = this.formatTime(0);
        this.timeline.style.left = '0px';
        
        // 시간 입력 필드도 업데이트
        this.updateTimeInputs();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    setVolume(value) {
        this.volumeValue.textContent = value + '%';
        if (this.gainNode) {
            this.gainNode.gain.value = value / 100;
        }
    }
    
    updateTimeline() {
        if (!this.isPlaying) return;
        
        const elapsed = (this.audioContext.currentTime - this.startTime) + this.pauseTime;
        const progress = elapsed / this.audioBuffer.duration;
        const timelinePosition = progress * this.waveformCanvas.width;
        
        // 현재 시간 저장
        this.currentTime = elapsed;
        
        this.timeline.style.left = timelinePosition + 'px';
        this.currentTimeElement.textContent = this.formatTime(elapsed);
        
        // 시간 입력 필드 업데이트
        if (this.currentHours) {
            this.setTimeToInputs(elapsed, this.currentHours, this.currentMinutes, this.currentSeconds, this.currentMilliseconds);
        }
        
        if (elapsed < this.audioBuffer.duration) {
            this.animationId = requestAnimationFrame(() => this.updateTimeline());
        }
    }
    
    handleMouseDown(e) {
        if (!this.audioBuffer) return;
        
        // 마우스 다운 정보 저장
        this.mouseDownTime = Date.now();
        this.mouseDownX = e.clientX;
        this.mouseDownY = e.clientY;
        this.isDragging = false;
        
        // 기존 선택 초기화
        this.clearSelection();
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleMouseMove(e) {
        if (!this.audioBuffer) return;
        
        // 드래그 중이면 선택 업데이트
        if (this.isDragging && this.isSelecting) {
            this.updateSelection(e);
        }
    }
    
    handleMouseUp(e) {
        if (!this.audioBuffer) return;
        
        const timeHeld = Date.now() - this.mouseDownTime;
        
        // 드래그하지 않고 빠르게 클릭한 경우 재생 위치 이동
        if (!this.isDragging && timeHeld < 300) {
            this.handleWaveformClick(e);
        }
        
        // 드래그 중이었으면 선택 종료
        if (this.isSelecting) {
            this.endSelection();
        }
        
        // 상태 초기화
        this.mouseDownTime = 0;
        this.isDragging = false;
    }
    
    handleWaveformClick(e) {
        if (!this.audioBuffer) return;
        
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = x / this.waveformCanvas.width;
        const time = progress * this.audioBuffer.duration;
        
        this.pauseTime = time;
        this.currentTime = time;
        this.timeline.style.left = x + 'px';
        this.currentTimeElement.textContent = this.formatTime(time);
        
        // 시간 입력 필드도 업데이트
        this.updateTimeInputs();
        
        console.log('Clicked at:', this.formatTime(time));
        
        if (this.isPlaying) {
            this.pause();
            setTimeout(() => this.play(), 50);
        }
    }
    
    startSelection(e) {
        if (!this.audioBuffer) return;
        
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = x / this.waveformCanvas.width;
        
        this.selectionStart = progress * this.audioBuffer.duration;
        this.selectionEnd = this.selectionStart;
        
        this.isSelecting = true;
        this.selectionArea.style.display = 'block';
        this.selectionArea.style.left = x + 'px';
        this.selectionArea.style.width = '0px';
        
        console.log('Selection started at:', this.formatTime(this.selectionStart));
    }
    
    updateSelection(e) {
        if (!this.isSelecting || !this.audioBuffer) return;
        
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const progress = x / this.waveformCanvas.width;
        
        this.selectionEnd = progress * this.audioBuffer.duration;
        
        const startX = (this.selectionStart / this.audioBuffer.duration) * this.waveformCanvas.width;
        const endX = x;
        
        if (endX >= startX) {
            this.selectionArea.style.left = startX + 'px';
            this.selectionArea.style.width = (endX - startX) + 'px';
        } else {
            this.selectionArea.style.left = endX + 'px';
            this.selectionArea.style.width = (startX - endX) + 'px';
        }
    }
    
    handleGlobalMouseMove(e) {
        if (!this.audioBuffer) return;
        
        // 마우스 다운 후 움직임 감지
        if (this.mouseDownTime > 0 && !this.isDragging) {
            const deltaX = Math.abs(e.clientX - this.mouseDownX);
            const deltaY = Math.abs(e.clientY - this.mouseDownY);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // 5픽셀 이상 움직이면 드래그 시작
            if (distance > 5) {
                this.isDragging = true;
                // 마우스 다운 위치에서 선택 시작
                const fakeEvent = {
                    clientX: this.mouseDownX,
                    clientY: this.mouseDownY
                };
                this.startSelection(fakeEvent);
            }
        }
        
        // 드래그 중이고 선택 중일 때 선택 업데이트
        if (this.isDragging && this.isSelecting) {
            const rect = this.waveformCanvas.getBoundingClientRect();
            
            // 마우스가 캔버스 영역 내에 있을 때만 업데이트
            if (e.clientX >= rect.left && e.clientX <= rect.right && 
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                this.updateSelection(e);
            }
        }
    }
    
    endSelection() {
        if (!this.isSelecting) return; // 이미 선택이 종료된 경우 무시
        
        this.isSelecting = false;
        
        if (this.selectionStart !== null && this.selectionEnd !== null) {
            // 시작과 끝 정렬
            if (this.selectionStart > this.selectionEnd) {
                [this.selectionStart, this.selectionEnd] = [this.selectionEnd, this.selectionStart];
            }
            
            // 최소 선택 크기 확인 (0.1초 이상)
            if (Math.abs(this.selectionEnd - this.selectionStart) > 0.1) {
                this.enableEditButtons();
                this.updateTimeInputs(); // 선택 시간을 입력 필드에 반영
                console.log(`Selection: ${this.formatTime(this.selectionStart)} - ${this.formatTime(this.selectionEnd)}`);
            } else {
                this.clearSelection();
            }
        } else {
            this.clearSelection();
        }
    }
    
    enableEditButtons() {
        this.trimBtn.disabled = false;
        this.deleteBtn.disabled = false;
        this.fadeInBtn.disabled = false;
        this.fadeOutBtn.disabled = false;
        // 볼륨 조절은 항상 가능하므로 여기서는 설정하지 않음
    }
    
    trimSelection() {
        if (this.selectionStart === null || this.selectionEnd === null) return;
        
        this.stop();
        
        const startSample = Math.floor(this.selectionStart * this.audioBuffer.sampleRate);
        const endSample = Math.floor(this.selectionEnd * this.audioBuffer.sampleRate);
        const newLength = endSample - startSample;
        
        const newBuffer = this.audioContext.createBuffer(
            this.audioBuffer.numberOfChannels,
            newLength,
            this.audioBuffer.sampleRate
        );
        
        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const originalData = this.audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            
            for (let i = 0; i < newLength; i++) {
                newData[i] = originalData[startSample + i];
            }
        }
        
        this.audioBuffer = newBuffer;
        this.clearSelection();
        this.drawWaveform();
        this.updateAudioInfo({ name: this.fileName.textContent }, this.audioBuffer);
    }
    
    deleteSelection() {
        if (this.selectionStart === null || this.selectionEnd === null) return;
        
        this.stop();
        
        const startSample = Math.floor(this.selectionStart * this.audioBuffer.sampleRate);
        const endSample = Math.floor(this.selectionEnd * this.audioBuffer.sampleRate);
        const originalLength = this.audioBuffer.length;
        const newLength = originalLength - (endSample - startSample);
        
        const newBuffer = this.audioContext.createBuffer(
            this.audioBuffer.numberOfChannels,
            newLength,
            this.audioBuffer.sampleRate
        );
        
        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const originalData = this.audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            
            // 선택 영역 이전 부분 복사
            for (let i = 0; i < startSample; i++) {
                newData[i] = originalData[i];
            }
            
            // 선택 영역 이후 부분 복사
            for (let i = endSample; i < originalLength; i++) {
                newData[i - (endSample - startSample)] = originalData[i];
            }
        }
        
        this.audioBuffer = newBuffer;
        this.clearSelection();
        this.drawWaveform();
        this.updateAudioInfo({ name: this.fileName.textContent }, this.audioBuffer);
    }
    
    applyFadeIn() {
        if (this.selectionStart === null || this.selectionEnd === null) return;
        
        // 선택 구간 정보 백업
        const savedSelectionStart = this.selectionStart;
        const savedSelectionEnd = this.selectionEnd;
        
        const startSample = Math.floor(this.selectionStart * this.audioBuffer.sampleRate);
        const endSample = Math.floor(this.selectionEnd * this.audioBuffer.sampleRate);
        
        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const data = this.audioBuffer.getChannelData(channel);
            
            for (let i = startSample; i < endSample; i++) {
                const progress = (i - startSample) / (endSample - startSample);
                data[i] *= progress;
            }
        }
        
        this.drawWaveform();
        
        // 선택 구간 복원
        this.selectionStart = savedSelectionStart;
        this.selectionEnd = savedSelectionEnd;
        this.updateSelectionDisplay();
        this.enableEditButtons();
    }
    
    applyFadeOut() {
        if (this.selectionStart === null || this.selectionEnd === null) return;
        
        // 선택 구간 정보 백업
        const savedSelectionStart = this.selectionStart;
        const savedSelectionEnd = this.selectionEnd;
        
        const startSample = Math.floor(this.selectionStart * this.audioBuffer.sampleRate);
        const endSample = Math.floor(this.selectionEnd * this.audioBuffer.sampleRate);
        
        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const data = this.audioBuffer.getChannelData(channel);
            
            for (let i = startSample; i < endSample; i++) {
                const progress = 1 - (i - startSample) / (endSample - startSample);
                data[i] *= progress;
            }
        }
        
        this.drawWaveform();
        
        // 선택 구간 복원
        this.selectionStart = savedSelectionStart;
        this.selectionEnd = savedSelectionEnd;
        this.updateSelectionDisplay();
        this.enableEditButtons();
    }
    
    setVolumePreset(percentage) {
        this.volumeAdjustInput.value = percentage;
        this.applyVolumeAdjust();
    }
    
    applyVolumeAdjust() {
        if (!this.audioBuffer) return;
        
        const percentage = parseFloat(this.volumeAdjustInput.value);
        if (isNaN(percentage) || percentage <= 0) {
            alert('Please enter a valid percentage (greater than 0)');
            return;
        }
        
        this.stop();
        
        const volumeFactor = percentage / 100; // 퍼센트를 배수로 변환
        let hasSelection = this.selectionStart !== null && this.selectionEnd !== null;
        
        // 선택 구간 정보 백업 (선택 유지를 위해)
        const savedSelectionStart = this.selectionStart;
        const savedSelectionEnd = this.selectionEnd;
        
        if (hasSelection) {
            // 선택된 구간만 조절
            const startSample = Math.floor(this.selectionStart * this.audioBuffer.sampleRate);
            const endSample = Math.floor(this.selectionEnd * this.audioBuffer.sampleRate);
            
            for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
                const data = this.audioBuffer.getChannelData(channel);
                
                for (let i = startSample; i < endSample; i++) {
                    data[i] = Math.max(-1, Math.min(1, data[i] * volumeFactor));
                }
            }
            
            console.log(`Volume adjusted to ${percentage}% for selected region`);
        } else {
            // 전체 오디오 조절
            for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
                const data = this.audioBuffer.getChannelData(channel);
                
                for (let i = 0; i < data.length; i++) {
                    data[i] = Math.max(-1, Math.min(1, data[i] * volumeFactor));
                }
            }
            
            console.log(`Volume adjusted to ${percentage}% for entire audio`);
        }
        
        this.drawWaveform();
        
        // 선택 구간이 있었다면 복원
        if (hasSelection) {
            this.selectionStart = savedSelectionStart;
            this.selectionEnd = savedSelectionEnd;
            this.updateSelectionDisplay();
            this.enableEditButtons();
        }
        
        // 성공 메시지 표시
        this.showVolumeMessage(`Volume adjusted to ${percentage}%`);
    }
    
    showVolumeMessage(message) {
        // 임시 메시지 표시
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 2000);
    }
    
    cloneAudioBuffer(buffer) {
        // AudioBuffer를 복제하여 원본 보존
        const newBuffer = this.audioContext.createBuffer(
            buffer.numberOfChannels,
            buffer.length,
            buffer.sampleRate
        );
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const originalData = buffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            newData.set(originalData);
        }
        
        return newBuffer;
    }
    
    resetAudio() {
        if (!this.originalAudioBuffer) {
            alert('No original audio to reset to');
            return;
        }
        
        // 확인 대화상자
        if (!confirm('Are you sure you want to reset the audio to its original state? All changes will be lost.')) {
            return;
        }
        
        this.stop();
        
        // 원본 오디오로 복원
        this.audioBuffer = this.cloneAudioBuffer(this.originalAudioBuffer);
        
        // UI 업데이트
        this.drawWaveform();
        this.clearSelection();
        this.updateAudioInfo({ name: this.fileName.textContent }, this.audioBuffer);
        
        // 성공 메시지
        this.showResetMessage('Audio has been reset to original');
        console.log('Audio reset to original state');
    }
    
    showResetMessage(message) {
        // 초기화 성공 메시지 (빨간색)
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 2000);
    }
    
    drawTimeRuler() {
        if (!this.audioBuffer) return;
        
        const ruler = this.timeRuler;
        ruler.innerHTML = '';
        
        const duration = this.audioBuffer.duration;
        const width = this.waveformCanvas.width;
        
        // 시간 간격 계산 (초 단위)
        let interval = 1; // 기본 1초
        if (duration > 60) interval = 5;
        if (duration > 300) interval = 10;
        if (duration > 600) interval = 30;
        if (duration > 1800) interval = 60;
        
        for (let time = 0; time <= duration; time += interval) {
            const x = (time / duration) * width;
            const timeLabel = document.createElement('div');
            timeLabel.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: 5px;
                transform: translateX(-50%);
                font-size: 0.75rem;
                color: #666;
                pointer-events: none;
            `;
            timeLabel.textContent = this.formatTimeWithMs(time);
            ruler.appendChild(timeLabel);
            
            // 눈금선
            const tick = document.createElement('div');
            tick.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: 0;
                width: 1px;
                height: 5px;
                background: #ccc;
                pointer-events: none;
            `;
            ruler.appendChild(tick);
        }
    }
    
    formatTimeWithMs(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    
    parseTimeFromInputs(hoursInput, minutesInput, secondsInput, millisecondsInput) {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        const milliseconds = parseInt(millisecondsInput.value) || 0;
        
        // 유효성 검사
        if (minutes >= 60) {
            throw new Error('Minutes must be less than 60');
        }
        if (seconds >= 60) {
            throw new Error('Seconds must be less than 60');
        }
        if (milliseconds >= 1000) {
            throw new Error('Milliseconds must be less than 1000');
        }
        
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }
    
    setTimeToInputs(timeInSeconds, hoursInput, minutesInput, secondsInput, millisecondsInput) {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
        
        hoursInput.value = hours;
        minutesInput.value = minutes;
        secondsInput.value = seconds;
        millisecondsInput.value = milliseconds;
    }
    
    updateTimeInputs() {
        if (!this.audioBuffer) return;
        
        // 현재 위치 업데이트
        const currentTime = this.isPlaying ? 
            (this.audioContext.currentTime - this.startTime + this.pauseTime) : 
            this.pauseTime;
        
        // 현재 시간을 저장하고 표시 업데이트
        this.currentTime = currentTime;
        this.currentTimeElement.textContent = this.formatTime(currentTime);
        
        this.setTimeToInputs(currentTime, this.currentHours, this.currentMinutes, this.currentSeconds, this.currentMilliseconds);
        
        // 선택 구간 업데이트
        if (this.selectionStart !== null) {
            this.setTimeToInputs(this.selectionStart, this.startHours, this.startMinutes, this.startSeconds, this.startMilliseconds);
        }
        if (this.selectionEnd !== null) {
            this.setTimeToInputs(this.selectionEnd, this.endHours, this.endMinutes, this.endSeconds, this.endMilliseconds);
        }
    }
    
    goToPosition() {
        try {
            const time = this.parseTimeFromInputs(this.currentHours, this.currentMinutes, this.currentSeconds, this.currentMilliseconds);
            if (time < 0 || time > this.audioBuffer.duration) {
                alert('Time is out of range');
                return;
            }
            
            this.pauseTime = time;
            this.currentTime = time;
            const x = (time / this.audioBuffer.duration) * this.waveformCanvas.width;
            this.timeline.style.left = x + 'px';
            this.currentTimeElement.textContent = this.formatTime(time);
            
            // 시간 입력 필드도 업데이트
            this.updateTimeInputs();
            
            if (this.isPlaying) {
                this.pause();
                setTimeout(() => this.play(), 50);
            }
        } catch (error) {
            alert(error.message);
        }
    }
    
    setSelectionStart() {
        try {
            const time = this.parseTimeFromInputs(this.startHours, this.startMinutes, this.startSeconds, this.startMilliseconds);
            if (time < 0 || time > this.audioBuffer.duration) {
                alert('Time is out of range');
                return;
            }
            this.selectionStart = time;
            this.updateSelectionDisplay();
        } catch (error) {
            alert(error.message);
        }
    }
    
    setSelectionEnd() {
        try {
            const time = this.parseTimeFromInputs(this.endHours, this.endMinutes, this.endSeconds, this.endMilliseconds);
            if (time < 0 || time > this.audioBuffer.duration) {
                alert('Time is out of range');
                return;
            }
            this.selectionEnd = time;
            this.updateSelectionDisplay();
        } catch (error) {
            alert(error.message);
        }
    }
    
    applyTimeSelection() {
        if (this.selectionStart !== null && this.selectionEnd !== null) {
            // 시작과 끝 정렬
            if (this.selectionStart > this.selectionEnd) {
                [this.selectionStart, this.selectionEnd] = [this.selectionEnd, this.selectionStart];
            }
            
            this.updateSelectionDisplay();
            this.enableEditButtons();
            console.log(`Selection applied: ${this.formatTimeWithMs(this.selectionStart)} - ${this.formatTimeWithMs(this.selectionEnd)}`);
        }
    }
    
    updateSelectionDisplay() {
        if (this.selectionStart !== null && this.selectionEnd !== null) {
            const startX = (this.selectionStart / this.audioBuffer.duration) * this.waveformCanvas.width;
            const endX = (this.selectionEnd / this.audioBuffer.duration) * this.waveformCanvas.width;
            
            const left = Math.min(startX, endX);
            const width = Math.abs(endX - startX);
            
            this.selectionArea.style.display = 'block';
            this.selectionArea.style.left = left + 'px';
            this.selectionArea.style.width = width + 'px';
            
            this.isSelecting = false;
        }
    }
    
    clearSelection() {
        this.isSelecting = false;
        this.isDragging = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.selectionArea.style.display = 'none';
        this.selectionArea.style.left = '0px';
        this.selectionArea.style.width = '0px';
        this.trimBtn.disabled = true;
        this.deleteBtn.disabled = true;
        this.fadeInBtn.disabled = true;
        this.fadeOutBtn.disabled = true;
        // 볼륨 조절은 항상 가능하므로 비활성화하지 않음
    }
    
    async downloadAudio() {
        if (!this.audioBuffer) return;
        
        try {
            this.showProgress('Preparing download...');
            
            const format = this.formatSelect.value;
            const blob = this.audioBufferToWav(this.audioBuffer);
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edited_audio.${format === 'mp3' ? 'wav' : format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.hideProgress();
        } catch (error) {
            console.error('Error downloading audio:', error);
            alert('Failed to download audio file.');
            this.hideProgress();
        }
    }
    
    audioBufferToWav(buffer) {
        const length = buffer.length;
        const channels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const arrayBuffer = new ArrayBuffer(44 + length * channels * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV 헤더 작성
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * channels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * channels * 2, true);
        view.setUint16(32, channels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * channels * 2, true);
        
        // 오디오 데이터 작성
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < channels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    
    enableControls() {
        this.playBtn.disabled = false;
        this.volumeSlider.disabled = false;
        this.formatSelect.disabled = false;
        this.downloadBtn.disabled = false;
        
        // 볼륨 조절 컨트롤들 활성화
        this.volumeAdjustInput.disabled = false;
        this.applyVolumeBtn.disabled = false;
        this.volume50Btn.disabled = false;
        this.volume100Btn.disabled = false;
        this.volume150Btn.disabled = false;
        
        // 초기화 버튼은 원본 오디오가 있을 때만 활성화
        this.resetBtn.disabled = !this.originalAudioBuffer;
        
        // 시간 컨트롤들 활성화
        this.timeControls.style.display = 'block';
        this.currentHours.disabled = false;
        this.currentMinutes.disabled = false;
        this.currentSeconds.disabled = false;
        this.currentMilliseconds.disabled = false;
        this.startHours.disabled = false;
        this.startMinutes.disabled = false;
        this.startSeconds.disabled = false;
        this.startMilliseconds.disabled = false;
        this.endHours.disabled = false;
        this.endMinutes.disabled = false;
        this.endSeconds.disabled = false;
        this.endMilliseconds.disabled = false;
        this.goToPositionBtn.disabled = false;
        this.setStartBtn.disabled = false;
        this.setEndBtn.disabled = false;
        this.applySelectionBtn.disabled = false;
        this.clearSelectionBtn.disabled = false;
    }
    
    showProgress(text) {
        this.progressText.textContent = text;
        this.progressContainer.classList.add('show');
    }
    
    hideProgress() {
        this.progressContainer.classList.remove('show');
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    resizeCanvas() {
        if (this.audioBuffer) {
            setTimeout(() => this.drawWaveform(), 100);
        }
    }
}

// 페이지 로드 시 오디오 편집기 초기화
document.addEventListener('DOMContentLoaded', () => {
    new AudioEditor();
}); 