let selectedUserId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    setupFormHandlers();
});

function setupFormHandlers() {
    // Create User Form Handler
    document.getElementById('createUserForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;

        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email || null
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('사용자가 성공적으로 생성되었습니다.', 'success');
                document.getElementById('createUserForm').reset();
                loadUsers();
            } else {
                showMessage(`사용자 생성 실패: ${data.detail}`, 'error');
            }
        } catch (error) {
            showMessage(`오류: ${error.message}`, 'error');
        }
    });
}

// Tab Management
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');
}

// User Management
async function loadUsers() {
    try {
        const response = await fetch('/api/users/');
        const users = await response.json();

        const container = document.getElementById('usersList');

        if (users.length === 0) {
            container.innerHTML = '<div class="loading">등록된 사용자가 없습니다.</div>';
            return;
        }

        const usersHtml = users.map(user => `
            <div class="user-item" onclick="selectUser(${user.id})">
                <strong>${user.username}</strong> (ID: ${user.id})
                ${user.email ? `<br><small>${user.email}</small>` : ''}
            </div>
        `).join('');

        container.innerHTML = usersHtml;
    } catch (error) {
        document.getElementById('usersList').innerHTML =
            '<div class="error">사용자 목록을 불러올 수 없습니다.</div>';
    }
}

function selectUser(userId) {
    selectedUserId = userId;
    document.getElementById('analysisUserId').value = userId;

    // Update visual selection
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    showMessage(`사용자 ID ${userId}를 선택했습니다.`, 'success');
}

// Analysis Tests
async function testAccuracyAnalysis() {
    const userId = document.getElementById('analysisUserId').value;
    const days = document.getElementById('analysisPeriod').value;

    if (!userId) {
        showMessage('사용자 ID를 입력하세요.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/analysis/users/${userId}/accuracy?days=${days}`);
        const data = await response.json();

        showResult('analysisResult', 'analysisData', data);
    } catch (error) {
        showMessage(`분석 실패: ${error.message}`, 'error');
    }
}

async function testConfusionAnalysis() {
    const userId = document.getElementById('analysisUserId').value;
    const days = document.getElementById('analysisPeriod').value;

    if (!userId) {
        showMessage('사용자 ID를 입력하세요.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/analysis/users/${userId}/confusion-patterns?days=${days}`);
        const data = await response.json();

        showResult('analysisResult', 'analysisData', data);
    } catch (error) {
        showMessage(`분석 실패: ${error.message}`, 'error');
    }
}

async function testFullReport() {
    const userId = document.getElementById('analysisUserId').value;
    const days = document.getElementById('analysisPeriod').value;

    if (!userId) {
        showMessage('사용자 ID를 입력하세요.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/analysis/users/${userId}/report?days=${days}`);
        const data = await response.json();

        showResult('analysisResult', 'analysisData', data);
    } catch (error) {
        showMessage(`리포트 생성 실패: ${error.message}`, 'error');
    }
}

// Batch Tests
async function triggerTestBatch(jobType) {
    try {
        const response = await fetch(`/api/batch/trigger/${jobType}`, {
            method: 'POST'
        });
        const data = await response.json();

        showResult('batchResult', 'batchData', data);

        if (response.ok) {
            showMessage(`${jobType} 배치 작업이 성공적으로 실행되었습니다.`, 'success');
        } else {
            showMessage(`배치 작업 실패: ${data.detail}`, 'error');
        }
    } catch (error) {
        showMessage(`배치 작업 실행 실패: ${error.message}`, 'error');
    }
}

async function getBatchStatus() {
    try {
        const response = await fetch('/api/batch/status');
        const data = await response.json();

        showResult('batchResult', 'batchData', data);
    } catch (error) {
        showMessage(`배치 상태 조회 실패: ${error.message}`, 'error');
    }
}

async function getBatchJobs() {
    try {
        const response = await fetch('/api/batch/jobs');
        const data = await response.json();

        showResult('batchResult', 'batchData', data);
    } catch (error) {
        showMessage(`배치 작업 이력 조회 실패: ${error.message}`, 'error');
    }
}

// System Tests
async function testSystemHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();

        showResult('systemResult', 'systemData', data);
        showMessage('시스템이 정상 작동 중입니다.', 'success');
    } catch (error) {
        showMessage(`시스템 상태 확인 실패: ${error.message}`, 'error');
    }
}

async function testOllamaConnection() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();

        showResult('systemResult', 'systemData', data.ollama);
        showMessage('Ollama 연결 정보를 확인했습니다.', 'success');
    } catch (error) {
        showMessage(`Ollama 연결 테스트 실패: ${error.message}`, 'error');
    }
}

async function getSystemInfo() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();

        showResult('systemResult', 'systemData', data);
    } catch (error) {
        showMessage(`시스템 정보 조회 실패: ${error.message}`, 'error');
    }
}

async function testOllamaAnalysis() {
    const testDataText = document.getElementById('ollamaTestData').value;

    if (!testDataText.trim()) {
        showMessage('테스트 데이터를 입력하세요.', 'error');
        return;
    }

    try {
        const testData = JSON.parse(testDataText);

        // This would need to be implemented as an API endpoint
        showMessage('Ollama 직접 테스트는 백엔드 구현이 필요합니다.', 'error');
        showResult('systemResult', 'systemData', {
            message: 'Ollama 직접 테스트 API가 구현되면 여기에 결과가 표시됩니다.',
            test_data: testData
        });

    } catch (error) {
        showMessage(`JSON 파싱 오류: ${error.message}`, 'error');
    }
}

// Utility Functions
function showResult(containerId, dataId, data) {
    document.getElementById(containerId).style.display = 'block';
    document.getElementById(dataId).textContent = JSON.stringify(data, null, 2);
}

function showMessage(message, type) {
    const container = document.getElementById('globalMessage');
    container.innerHTML = `<div class="${type}">${message}</div>`;

    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}