# Onsori WOW Analysis System

발음 학습자의 객관식/OX 문제 답변을 분석하여 개인별 학습 패턴과 발음 구분 능력을 측정하고 맞춤형 피드백을 제공하는 배치 처리 시스템

## 주요 기능

- 📊 **사용자별 정답률 분석**: 전체/카테고리별 정확도 측정
- 🔍 **혼동 패턴 분석**: 자주 틀리는 문제 유형 파악
- 🤖 **AI 기반 인사이트**: Ollama Gemma 모델을 활용한 학습 분석
- ⏰ **자동 배치 처리**: 정기적인 분석 및 리포트 생성
- 🖥️ **웹 인터페이스**: 대시보드 및 테스트 도구 제공

## 기술 스택

- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: PostgreSQL
- **AI Engine**: Ollama + Gemma 모델
- **Scheduler**: APScheduler
- **Frontend**: HTML/CSS/JavaScript

## 설치 및 실행

### 1. 사전 요구사항

- Python 3.8+
- PostgreSQL
- Ollama (Gemma 모델과 함께)

### 2. 프로젝트 설정

```bash
# 저장소 클론
git clone <repository-url>
cd onsori-wow-analysis

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# 의존성 설치
pip install -r requirements.txt
```

### 3. 환경 설정

```bash
# 환경 변수 파일 생성
cp .env.example .env

# .env 파일 편집
# DATABASE_PASSWORD=your_password_here
```

설정 파일 `config/config.yaml`을 환경에 맞게 수정:

```yaml
database:
  host: localhost
  port: 5432
  database: onsori_analysis
  username: postgres

ollama:
  base_url: http://localhost:11434
  model: gemma
  timeout: 30
```

### 4. 데이터베이스 설정

```bash
# PostgreSQL 데이터베이스 생성
createdb onsori_analysis

# 마이그레이션 실행
alembic upgrade head
```

### 5. Ollama 설정

```bash
# Ollama 설치 (https://ollama.ai/)
ollama pull gemma

# Ollama 서버 시작
ollama serve
```

### 6. 애플리케이션 실행

```bash
# 개발 모드
python app/main.py

# 또는 uvicorn 직접 실행
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 사용법

### 웹 인터페이스

- **대시보드**: http://localhost:8000/
- **테스트 인터페이스**: http://localhost:8000/test
- **API 문서**: http://localhost:8000/docs

### API 엔드포인트

#### 사용자 관리
- `GET /api/users/` - 사용자 목록 조회
- `POST /api/users/` - 새 사용자 생성
- `GET /api/users/{user_id}` - 특정 사용자 조회

#### 분석
- `GET /api/analysis/users/{user_id}/accuracy` - 정확도 분석
- `GET /api/analysis/users/{user_id}/confusion-patterns` - 혼동 패턴 분석
- `GET /api/analysis/users/{user_id}/report` - 종합 리포트

#### 배치 작업
- `POST /api/batch/trigger/{job_type}` - 배치 작업 수동 실행
- `GET /api/batch/status` - 배치 작업 상태 조회
- `GET /api/batch/jobs` - 배치 작업 이력

### 배치 작업 유형

1. **daily_analysis**: 일일 사용자 분석 (매일 자정)
2. **weekly_report**: 주간 종합 리포트 (매주 일요일 1시)
3. **monthly_summary**: 월간 시스템 요약 (매월 1일 2시)

## 데이터베이스 스키마

### 주요 테이블

- **users**: 사용자 정보
- **questions**: 문제 정보 및 메타데이터
- **user_answers**: 사용자 답변 기록
- **analysis_results**: 분석 결과 저장
- **batch_jobs**: 배치 작업 실행 이력

### 유연한 확장

- JSON 필드 활용으로 스키마 변경 없이 데이터 확장 가능
- Alembic을 통한 체계적인 마이그레이션 관리
- 인덱스 최적화로 성능 보장

## 개발

### 새로운 마이그레이션 생성

```bash
alembic revision --autogenerate -m "Add new feature"
alembic upgrade head
```

### 테스트 실행

```bash
# 유닛 테스트 (구현 예정)
pytest tests/

# API 테스트
# 웹 인터페이스의 테스트 탭 활용
```

### 로그 확인

```bash
# 애플리케이션 로그
tail -f logs/app.log

# 배치 작업 로그
grep "batch" logs/app.log
```

## 설정 파일 구조

```
config/
├── config.yaml          # 메인 설정
├── config.dev.yaml      # 개발 환경 설정 (선택)
└── config.prod.yaml     # 운영 환경 설정 (선택)

.env                      # 환경 변수 (비밀번호 등)
```

## 트러블슈팅

### 자주 발생하는 문제

1. **Ollama 연결 실패**
   ```bash
   # Ollama 서비스 상태 확인
   ollama list

   # 모델 다운로드 확인
   ollama pull gemma
   ```

2. **데이터베이스 연결 오류**
   ```bash
   # PostgreSQL 서비스 상태 확인
   pg_isready -h localhost -p 5432

   # 연결 권한 확인
   psql -h localhost -U postgres -d onsori_analysis
   ```

3. **배치 작업 실행 안됨**
   - 로그 파일에서 스케줄러 상태 확인
   - 수동 실행으로 작업 테스트: `POST /api/batch/trigger/daily_analysis`

### 로그 레벨 조정

`config/config.yaml`에서 로그 레벨 변경:

```yaml
logging:
  level: DEBUG  # INFO, WARNING, ERROR
```

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 기여

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 지원

문제가 발생하면 GitHub Issues에 보고해 주세요.