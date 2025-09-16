// Global variables
let batchStatus = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    setInterval(refreshStatus, 30000); // Refresh every 30 seconds
});

async function loadDashboardData() {
    try {
        await Promise.all([
            loadSystemInfo(),
            loadBatchStatus()
        ]);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

async function loadSystemInfo() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();

        // Update system info display (placeholder data)
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalQuestions').textContent = '0';
        document.getElementById('averageAccuracy').textContent = '0%';

    } catch (error) {
        console.error('Failed to load system info:', error);
    }
}

async function loadBatchStatus() {
    try {
        const response = await fetch('/api/batch/status');
        const data = await response.json();
        batchStatus = data;

        // Update active jobs count
        document.getElementById('activeJobs').textContent = data.summary.running_jobs;

        // Display recent jobs
        displayRecentJobs(data.recent_jobs);

    } catch (error) {
        console.error('Failed to load batch status:', error);
        document.getElementById('recentJobs').innerHTML =
            '<div class="error">배치 작업 상태를 불러올 수 없습니다.</div>';
    }
}

function displayRecentJobs(jobs) {
    const container = document.getElementById('recentJobs');

    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p>최근 배치 작업이 없습니다.</p>';
        return;
    }

    const jobsHtml = jobs.map(job => {
        const statusClass = `status-${job.status}`;
        const startedAt = new Date(job.started_at).toLocaleString('ko-KR');
        const completedAt = job.completed_at ?
            new Date(job.completed_at).toLocaleString('ko-KR') : '-';

        return `
            <div class="job-item">
                <div>
                    <strong>${job.job_type}</strong><br>
                    <small>시작: ${startedAt} | 완료: ${completedAt}</small>
                </div>
                <span class="job-status ${statusClass}">${job.status}</span>
            </div>
        `;
    }).join('');

    container.innerHTML = jobsHtml;
}

async function triggerBatch(jobType) {
    const button = event.target;
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = '실행 중...';

    try {
        const response = await fetch(`/api/batch/trigger/${jobType}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(`${jobType} 작업이 성공적으로 실행되었습니다.`, 'success');
            await loadBatchStatus(); // Refresh status
        } else {
            showMessage(`작업 실행 실패: ${data.detail}`, 'error');
        }
    } catch (error) {
        showMessage(`작업 실행 중 오류가 발생했습니다: ${error.message}`, 'error');
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

async function refreshStatus() {
    await loadBatchStatus();
    showMessage('상태가 새로고침되었습니다.', 'success');
}

async function checkOllamaHealth() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();

        if (data.ollama) {
            showMessage(`Ollama 서버 연결됨: ${data.ollama.base_url}`, 'success');
        } else {
            showMessage('Ollama 서버 상태를 확인할 수 없습니다.', 'error');
        }
    } catch (error) {
        showMessage(`Ollama 상태 확인 실패: ${error.message}`, 'error');
    }
}

function showMessage(message, type) {
    const container = document.getElementById('batchMessage');
    container.innerHTML = `<div class="${type}">${message}</div>`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}