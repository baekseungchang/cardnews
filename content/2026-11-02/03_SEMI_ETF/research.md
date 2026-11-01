# 검증 노트 · SOXX/SMH/XSD (미국 반도체 ETF) · 2026-11-02

## 시세 데이터 (SOXX·SMH, 기준 10/30)
- ⚠️ 클라우드 환경에서 Yahoo 시세 서버 접속 불가(DNS 차단), 운용사·stockanalysis 직접 열람도 막힘 → 숫자는 검색으로 확인한 운용사·데이터 사이트 2곳 값만 사용. 차트는 GitHub 빌드가 SOXX로 그림
- 10/30 ETF별 하루 등락률: SMH -9.1%(1곳, pomegra/FinanceFeeds 요약), 필라델피아반도체 -6%(1곳, Phemex) → 확인 안 돼 카드에 안 씀
- 최근 1개월 ETF 수익률: 확인 못 함 → 대신 연초 대비 비교(8~9월 기준)와 인텔 비중으로 구성
- 연초 대비(배당 재투자): SOXX +75.21% vs SMH +57.87% (9/11, totalrealreturns), SOXX +68.37% vs SMH +51.83% (8/25, Motley Fool) → 'SOXX가 더 많이 올랐다'는 방향은 2곳 일치, 숫자는 날짜 붙여 8/25 값만 사용

## 무엇을 담나 (현재)
- SOXX(아이셰어즈): 총보수 0.34%, NYSE 반도체 지수 추종, 상위 5종목 8%·나머지 4% 상한, 30여 종목 — Pensions & Investments·TradingView·etf.com
- SOXX 속 인텔 8.25%(10/23, stockanalysis 검색 요약), 8.4%(10/16, dividendvision) → '약 8%'. 같은 날 AMD 9.32%·엔비디아 8.11%·마이크론 7.77%·브로드컴 7.37%(stockanalysis 1곳 → 카드엔 인텔만)
- SMH(반에크): 총보수 0.35%, MVIS US Listed Semiconductor 25 지수, 26종목 — VanEck 팩트시트(6/30)·Morningstar
- SMH 속 엔비디아 19.62%, TSMC 9.47%, 인텔 4.00% (VanEck 10/29·stockanalysis 10/30) → 확인
- XSD(SPDR): 총보수 0.35%, 수정 동일가중, 40여 종목 — State Street 팩트시트(6/30)·P&I(7/17). 인텔 2.75%(6/30)·3.56%(7/17) → '약 3%(6~7월)'로 날짜 붙여 약하게
- 인텔 10/30 -28.58% — 01 카드와 같은 근거(FinanceFeeds·MarketBeat·Yahoo·CNN)
- 단순 계산(다른 종목 그대로일 때): SOXX 8.25%×-28.58% ≈ -2.4%p, SMH 4.00%×-28.58% ≈ -1.1%p, XSD 약 3%×-28.58% ≈ -0.9%p(카드엔 SOXX·SMH만)

## 과거 · 최근 한 달
- 8/25 연초 대비 SOXX +68.37% vs SMH +51.83% — Motley Fool(8/25)·totalrealreturns(9/11, 방향 일치)
- 10/16 SOXX 속 인텔 8.4% — dividendvision
- 10/22 인텔 -8.04%, 반도체 동반 약세 — heygotrade·mitrade
- 10/30 인텔 -28.58% — 01 카드 근거

## 미래 · 앞으로 1~4주 (미국 날짜)
- 11/3 AMD 3분기 실적(장 마감 뒤) — briefglance·techi. AMD는 SOXX 1위 비중(9.32%, 1곳) → 카드엔 'SOXX·SMH 모두 담는 종목'으로만
- 11/6 미국 10월 고용, 11/10 10월 CPI — BLS 일정
- 11/17~18 엔비디아 실적(날짜 출처마다 엇갈림) — Earnings Whispers·Wall Street Horizon. SMH 19.62% 비중
- 분배일·리밸런싱 날짜: 2곳 확인 못 함 → 제외

## 문장별 교차검증
| 카드 문장 | 기사 근거 | 데이터 근거 | 판정 |
|---|---|---|---|
| SOXX 총보수 0.34% | P&I·TradingView | - | 확인 |
| SMH·XSD 총보수 0.35% | VanEck·State Street·P&I | - | 확인 |
| SOXX 상위 5종목 8% 상한 | TradingView·etf.com | 인텔 8.25~8.4% | 확인 |
| SOXX 인텔 약 8% | stockanalysis(10/23)·dividendvision(10/16) | - | 확인 |
| SMH 인텔 4.00%, 엔비디아 19.6% | VanEck(10/29)·stockanalysis(10/30) | - | 확인 |
| XSD 인텔 약 3%(6~7월) | State Street·P&I | 날짜 오래됨 | 약하게 표현 |
| 인텔 -28.58% | FinanceFeeds·MarketBeat | 92.07→65.76 | 확인 |
| 단순 영향 SOXX 약 -2.4%p, SMH 약 -1.1%p | - | 비중×등락률 계산 | 확인(계산, '단순 계산' 표시) |
| 올해 SOXX가 SMH보다 더 올라(8/25 +68% vs +52%) | Motley Fool·totalrealreturns | - | 확인 |
| 10/22 인텔 -8.04% | heygotrade·mitrade | - | 확인 |
| 일정 4개 | 위 출처 | - | 확인(엔비디아는 범위) |

## 뺀 내용과 이유
- 10/30 SMH -9.1%, SOX 지수 -6%: 각 1곳 → 제외
- 10월 한 달 ETF 수익률: 확인 못 함 → 제외
- SOXX 상위 종목 전체 비중(AMD 9.32% 등): 1곳 → 인텔만 사용
- 분배·리밸런싱 일정: 확인 못 함 → 제외
- 레버리지 SOXL: 보수·일일 성과 확인 못 함 → 제외
