# 검증 노트 · XLC/FCOM/VOX (미국 커뮤니케이션 서비스 ETF) · 2026-10-29

## 시세 데이터 (XLC, 기준 10/27)
- ⚠️ 클라우드 환경에서 Yahoo 시세·운용사 사이트 직접 접속 불가 → 검색 결과의 운용사 페이지·금융 사이트로 교차확인. 차트는 GitHub 빌드가 XLC로 그림
- XLC 10/27 시장가 103.58달러 — State Street 공식 페이지(검색 결과)
- 1개월·1주 수익률: 날짜가 분명한 자료 없음(Finviz +0.21%, ETFdb -0.23% 모두 날짜 불명) → 카드에 쓰지 않음
- 알파벳(GOOGL) 10/28 시간외 약 -10% — 01_GOOGL 검증 노트와 같음

## 구조 비교 (운용사·금융 사이트)
| ETF | 총보수 | 추종 지수·범위 | 종목 수 | 메타 | 알파벳 A+C | 합계 | 기준일·출처 |
|---|---|---|---|---|---|---|---|
| XLC | 0.08% | S&P 커뮤니케이션 서비스 섹터(S&P500 종목만) | 23~28 (사이트마다 다름) | 21.45% | 12.27+9.82=22.09% | 43.5% | 10/27 State Street. Morningstar(10/23) 21.78/12.01/9.64, stockanalysis(10/26) 21.75/12.09/9.71 일치 |
| FCOM | 0.08% | MSCI USA IMI 커뮤니케이션 서비스 25/50(중소형 포함) | 92~93 | 26.20% | 14.83+8.17=23.0% | 49.2% | 10/12 TipRanks. stockanalysis 25.92/14.63/8.06(합 48.6%) |
| VOX | 0.09% | FCOM과 같은 MSCI IMI 25/50 지수(중소형 포함) | (1곳: 116개) | 20.48~25.31% | 21.7~21.9% | 42.4~47.0% | stockanalysis(8/31)·Morningstar(9/30)·Koalagains(상위3 43.7%) |
- 총보수: XLC 0.08%(State Street·검색 다수), FCOM 0.08%(stockanalysis·AAII·SEC 서류 '1만달러당 8달러'), VOX 0.09%(Vanguard 12/19/2025 기준·AAII). 한 곳(etf.com 비교)은 VOX 0.10% → 운용사 공식값 0.09% 사용
- 지수: FCOM·VOX 같은 MSCI USA IMI Communication Services 25/50, XLC는 S&P 섹터 지수 — 검색 결과 비교 자료 2곳 이상(etf.com·stockanalysis·etfdb 요약)
- 단순 계산: 알파벳 비중 약 22% × 시간외 -10% ≈ ETF -2.2%p(다른 종목이 그대로라고 가정, 정규장 결과 아님) → '단순 계산'으로 표시

## 과거 · 최근 한 달
- 10/14 알파벳 장중 359달러 10월 고점권 — Investing.com·Vantage (01_GOOGL)
- 10/22 메타 3분기 실적 뒤 -6.98% — 10/23 카드 검증(history.tsv)·Yahoo·Morningstar
- 10/27 XLC 103.58달러 — State Street
- 10/28 알파벳 실적 뒤 시간외 약 -10% — CNBC·Yahoo·재경일보 (01_GOOGL)

## 현재
- 알파벳 시간외 급락으로 메타·알파벳 비중이 큰 커뮤니케이션 ETF에 부담 — 비중 데이터(위 표) + 시간외 시세 → 영향 크기는 계산으로만 제시, 실제 XLC 시간외 시세는 확인 안 함

## 미래 · 앞으로 1~4주 (미국 날짜)
- 10/29 알파벳 실적 뒤 첫 정규장 → XLC 첫 반영
- 11/3 미국 중간선거 — 공식 일정
- 11/6 미국 10월 고용 — BLS
- 11/10 미국 10월 CPI — BLS
- 분배: 세 ETF 모두 분기 분배이나 12월 분배 기준일은 이번에 확인 안 함 → 제외

## 문장별 교차검증
| 카드 문장 | 기사 근거 | 데이터 근거 | 판정 |
|---|---|---|---|
| XLC 총보수 0.08%, FCOM 0.08%, VOX 0.09% | State Street·stockanalysis·AAII·Vanguard | - | 확인 |
| XLC 메타+알파벳 약 44% | State Street(10/27)·Morningstar·stockanalysis | 43.5% | 확인 |
| FCOM 약 49% | TipRanks·stockanalysis | 48.6~49.2% | 확인 |
| VOX 약 42~47% | stockanalysis·Morningstar·Koalagains | 기준일 8~9월 | 확인(범위·기준일 표시) |
| XLC는 S&P500 종목만, FCOM·VOX는 중소형 포함 | etf.com·stockanalysis·etfdb | - | 확인 |
| XLC 20여 개, FCOM 90여 개 | Finviz·Equibles·stockanalysis / TipRanks·stockanalysis | - | 확인 |
| 알파벳 -10%면 단순 계산 약 -2.2%p | - | 22%×10% | 확인(계산, 가정 명시) |
| 10/22 메타 -6.98% | 10/23 카드 검증 | - | 확인 |
| XLC 10/27 103.58달러 | State Street | - | 1곳이지만 운용사 공식 → 카드 타임라인에만 |
| 일정 | BLS·공식 일정 | - | 확인 |

## 뺀 내용과 이유
- XLC·FCOM·VOX 1개월 수익률: 날짜 확인 안 됨
- VOX 종목 수 116개: 1곳
- 넷플릭스 비중(4.1~4.8%): 기준일이 오래됨
- 메타 250억달러 유상증자 가격·4거래일 연속 하락: 이번 검색에서 2곳 교차 못 함
- 12월 분배 일정: 확인 안 함
