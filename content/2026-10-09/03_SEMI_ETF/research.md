# 검증 노트 · 미국 반도체 ETF (SMH vs SOXX) · 2026-10-09

## 시세 데이터 (SMH, SOXX, 기준 10/7~10/8)
- ⚠️ 이번 실행 환경에서 Yahoo Finance 시세 API(query1.finance.yahoo.com)가 프록시 403으로 차단됨. vaneck.com·ishares.com·etf.com·stockanalysis.com 등 직접 조회도 차단(연결 거부) → 웹 검색 결과에 노출된 발행사 페이지·집계 사이트 내용으로 확인. 일봉 직접 계산 불가.
- 표지 등락률은 change "auto"(빌드 시 실제 시세로 계산). 본문 숫자는 출처 2곳 이상이 맞는 것만 사용
- 연초 대비(NAV 기준): SOXX 93.97%(iShares, 10/7) · 91.6%(Trefis, 10/1) / SMH 73.61%(VanEck, 10/7) · 75.63%(Yahoo, 10/6) → 기준일·방식이 달라 카드엔 "90%대 / 70%대"로 표기
- 1개월(9/8~10/6): SMH +10.20%·SOXX +11.65%(Trackinsight), SMH 1개월 +9.30%(Yahoo), SOXX 1M +13.46%·SMH +11.55%(Portfolioslab, 기준일 불명) → 수치 불일치, 카드엔 "두 ETF 모두 한 달 상승"(방향만)으로 표기
- 10/7 SOXX 종가 582.82달러(-1.12%) — Benzinga(10/8). 10/8 장중 564.57달러(14:21 ET) 1곳 → 10/8 SOXX 종가 등락은 미확인, 카드엔 미기재
- 10/7 필라델피아 반도체지수 13,066.15(-1.15%) — 뉴스핌(10/8), Kalkine(10/8)

## 과거 · 최근 한 달
- 9월~10/6 두 ETF 모두 1개월 상승 — Trackinsight(9/8~10/6), Yahoo SMH 성과 페이지 / 수치는 출처마다 9~13%로 달라 방향만 사용
- 10/7 연초 대비 SOXX 90%대, SMH 70%대 — iShares·VanEck 상품 페이지(10/7), Trefis(10/1)·Yahoo(10/6)
- 10/7 반도체지수 -1.15%, SMH·SOXX 각 약 -1% — 뉴스핌(10/8), Kalkine, Stocktwits(10/7)
- 10/8 FT "오픈AI 연환산 매출 약 500억 달러, 시장 추정 약 700억 달러 하회" 보도 → 반도체지수 3%대 하락 — CNN(10/8), Bloomberg(10/8), 서울경제 영문(10/9), knowledge/log.jsonl(10/9, Yahoo·Benzinga·MarketScreener)

## 현재
- 10/8 반도체지수 하락 폭: 국민일보 속보 -3.39%, Bloomberg -3.4%, 톱스타뉴스 12,598.55(-3.58%, 10/7 종가 13,066.15 대비 계산과 일치), log.jsonl 약 -3.8%, Yahoo "장중 한때 -4%" → 출처마다 달라 카드엔 "3%대"로 표기
- 원인: FT의 오픈AI 매출 보도 — CNN(10/8), Bloomberg(10/8), 서울경제(10/9), Yahoo(10/8). 같은 날 유가 급등·금리 상승도 함께 거론(뉴스핌, Benzinga 크레이머 발언) → 카드엔 "보도 뒤 하락"으로 시점만 연결, 단일 원인으로 단정하지 않음
- 엔비디아 10/8 약 -2.9% — Bloomberg(10/8), Yahoo(10/8, -2.94%)
- 나스닥 종합 -1.25%, 8월 중순 이후 최대 낙폭 — CNN(10/8), log.jsonl(CNBC·Yahoo·이투데이). Bloomberg: 나스닥100 -1.4%, 7주 만의 최대 낙폭
- SOXX의 기초지수는 필라델피아 반도체지수(SOX, 나스닥 운영)가 아님: iShares 상품 페이지 "NYSE Semiconductor Index", ETFdb "ICE Semiconductor Sector Index"(ICE 운영). 2021년 중반 PHLX→ICE 지수로 교체(대만 stockfeel 1곳, 상품 URL에 'phlx' 흔적) → 카드엔 "SOX 지수 추종 아님"만 표기, 교체 연도는 미기재

### 무엇을 담나 (비교표)
| 항목 | SMH | SOXX | 출처 |
|---|---|---|---|
| 운용사 | VanEck | iShares(블랙록) | 발행사 페이지 |
| 기초지수 | MVIS US Listed Semiconductor 25 | NYSE Semiconductor Index(ICE) | VanEck·MarketVector 지수가이드 / iShares·ETFdb |
| 종목 수 | 26개(StockAnalysis 10/6), 지수는 25종목 | 30개(iShares 10/7, N-PORT 6/30) | → SMH는 "약 25개" |
| 엔비디아 비중 | 19.44%(Morningstar·StockAnalysis 10/6), 19.5%(Light Horse) | 7.45%(Morningstar·StockAnalysis 10/5) | 확인 |
| TSMC | 9.45%(Morningstar·StockAnalysis 10/6) | 미확인 | SOXX는 제외 |
| 브로드컴 | 5.15%(StockAnalysis 10/6) | 6.74%(Morningstar·StockAnalysis 10/5) | SMH 1곳 → 카드 미기재 |
| 1위 종목 | 엔비디아 | AMD 9.24%(인텔 8.93%, 마이크론 7.64%) | Morningstar·StockAnalysis |
| 상위 10개 비중 | 67.2%(Morningstar), 67.3%(Light Horse) | - | 카드 미기재(SOXX 비교값 없음) |
| 단일 종목 상한 | 20% | 상위 5개 8%·나머지 4%, ADR 합계 10% | MVIS 지수가이드·MarketVector / MicroSectors·TradingView(2차 출처) |
| 총보수 | 0.35% | 0.33% | VanEck·Trackinsight / iShares(10/7)·24/7 Wall St.(6/10). SOXX 6/30 팩트시트·옛 투자설명서는 0.34% |
| 순자산 | 769.6억 달러(VanEck 10/7), 778.1억(Trackinsight 10/2) | 481.9억 달러(iShares 10/7), 488.1억(iShares 스위스 10/2) | "약 770억$ / 약 480억$" |
| 분배 | 연 1회(12월, 2025년 배당락 12/22) | 분기(최근 6월·9월 중순) | VanEck·StockAnalysis / iShares 페이지·팩트시트 |
| 리밸런싱 | 분기(3·6·9·12월, 지수가이드 v1.04 2026-09). 옛 자료는 반기 리뷰 | 분기 리밸런싱, 연 1회 재구성 | 다음은 둘 다 12월 → 기간 밖이라 카드 미기재 |

## 미래 · 앞으로 1~4주
- 10/14(화) 21:30 KST 미국 9월 CPI — 10/7 카드(01_CEG·02_JPY·03_NUCLEAR_ETF)와 같은 일정
- 10/15(목) 15:00 KST TSMC 3분기 실적 컨퍼런스(대만 14:00) — TSMC IR, Defense World(10/8, "Thursday"). 침묵 기간 10/5~10/14. 회사 3분기 가이던스 매출 446억~458억 달러(1곳, 카드 미기재)
- 11/3 SOXX 주식 분할(forward split) 기준일, 11/4 장 마감 뒤 시행, 11/5부터 분할 반영 가격으로 거래 — iShares 상품 페이지(8/21 공시). 분할 비율 3:1은 집계 사이트(digrin) 1곳뿐이라 카드에 미기재. 분할은 보유 가치에 영향 없음
- 참고(기간 밖·미확정): 엔비디아 3분기(FY27) 실적 11/18(현지) 추정 — 캘린더 사이트 추정치, 회사 미확정 / ASML 3분기 실적 10/14 — Akros 1곳 / 인텔 10/22 추정 — 미확정 → 모두 카드 제외
- 전망: 매수·매도 판단 대신 구조 차이로만 정리. 애널리스트 ETF 전망은 날짜 있는 2곳 자료 없어 미사용

## 문장별 교차검증
| 카드 문장 | 기사 근거 | 데이터 근거 | 판정 |
|---|---|---|---|
| 표지: 엔비디아 비중 2.6배 | Morningstar·StockAnalysis | 19.44÷7.45=2.61 | 확인 |
| 10/8 FT 오픈AI 매출 보도 뒤 반도체지수 3%대 하락 | CNN·Bloomberg(10/8), 국민일보·톱스타(10/9) | 하락 폭 3.39~3.8% 혼재 | '3%대'로 약하게 표현 |
| 엔비디아 약 -2.9% | Bloomberg, Yahoo(10/8) | - | 확인 |
| 나스닥 -1.25% 마감 | CNN(10/8), log.jsonl(CNBC·Yahoo·이투데이) | log.jsonl | 확인 ('7주 새 최대'는 지수별 표현 차이로 최종 점검에서 삭제) |
| SOXX는 SOX 지수 추종 아님 | iShares(NYSE 반도체지수), ETFdb(ICE 지수) | - | 확인 |
| 기초지수 MVIS 반도체25 / NYSE 반도체 | VanEck·MarketVector / iShares | - | 확인 |
| 종목 수 약 25개 / 30개 | StockAnalysis(26)·지수(25) / iShares·N-PORT | - | SMH '약'으로 표현 |
| 엔비디아 19.4% / 7.5% | Morningstar·StockAnalysis | 10/6, 10/5 기준 | 확인 |
| 총보수 0.35% / 0.33% | VanEck·Trackinsight / iShares·24/7 Wall St. | - | 확인 |
| 순자산 약 770억$ / 약 480억$ | VanEck·Trackinsight / iShares 미국·스위스 | - | 확인 |
| 분배 연 1회 / 분기 | VanEck·StockAnalysis / iShares 페이지·팩트시트 | - | 확인 |
| 9월 두 ETF 모두 한 달 상승 | Trackinsight, Yahoo, Portfolioslab | API 차단 | 방향만, 약하게 표현 |
| 10/7 연초 대비 SOXX 90%대, SMH 70%대 | iShares·VanEck(10/7), Trefis·Yahoo | NAV 기준 | 구간으로 약하게 표현 |
| 10/14 CPI, 10/15 TSMC 실적 | 10/7 카드 일정 / TSMC IR·Defense World | - | 확인 |
| 11/3 SOXX 분할 기준일, 11/5 분할 반영 | iShares 공식 공시(발행사 일정) | 집계 사이트 날짜 일치 | 확인(비율 제외) |
| 엔비디아·TSMC 쏠림 → SMH / 고르게 분산 → SOXX | 위 비중·상한 규칙 | - | 확인(구조 설명, 권유 아님) |
| 보수 차이 연 0.02%p | - | 0.35-0.33 계산 | 확인 |
| 캡션: TSMC 약 9%, 1위 AMD 9%대 | Morningstar·StockAnalysis | - | 확인 |

## 뺀 내용과 이유
- 국내 상장 반도체 ETF(KODEX 미국반도체MV, TIGER 미국필라델피아반도체나스닥): 상품 페이지 직접 조회가 막혀 보수·구성을 2곳에서 확인 못 해 제외
- 1개월 수익률 수치: SMH 9.3~11.6%, SOXX 11.7~13.5%로 출처별 불일치 → 방향만 사용
- 10/8 SMH·SOXX 종가 등락률: 확정 종가 2곳 미확인(장중 수치만) → 표지는 auto
- 반도체지수 10/8 정확한 하락률(-3.39%/-3.58%/-3.8%): 출처 충돌 → '3%대'
- TSMC -3.01%, 브로드컴 -4.35%, 마이크론 -4.79%(10/8): 서울경제 1곳 → 제외
- SOXX 분할 비율(3:1): 집계 사이트 1곳 → 제외
- SOXX 장비 비중 약 21%, 5년·10년 수익률 비교: 출처 1곳·기준일 불명 → 제외
- 엔비디아 실적(11/18 추정)·ASML(10/14)·인텔(10/22) 일정: 회사 미확정 또는 1곳 → 제외
- SOXX 지수 교체 시점(2021년): 1곳 → 제외
- "SMH가 올해 덜 오른 이유는 엔비디아 쏠림" 같은 인과 설명: 비중 차이는 확인되나 수익률 기여도 분석 자료 2곳이 없어 제외
