#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EchoChamber 게임 백엔드 서버 - 교육용 버전
고등학생을 위한 HTTP 서버 구현 학습 프로젝트

이 파일의 TODO 주석이 있는 부분을 구현하면 완성됩니다!
각 함수에 상세한 설명이 있으니 차근차근 따라해보세요.
"""

import json
import os
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

# ============================================
# 데이터 파일 경로 설정
# ============================================
# os.path.dirname(__file__): 현재 파일이 있는 폴더 경로
# os.path.join(): 경로를 안전하게 합치기 (윈도우/맥 모두 작동)
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
GAME_STATE_FILE = os.path.join(DATA_DIR, 'game-state.json')
POSTS_FILE = os.path.join(DATA_DIR, 'posts.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
LEADERBOARD_FILE = os.path.join(DATA_DIR, 'leaderboard.json')
check_FILE = False

# ============================================
# 기본 게임 상태 (게임 시작 시 초기값)
# ============================================
DEFAULT_GAME_STATE = {
    "day": 1,
    "freedom": 50,
    "order": 50,
    "trust": 50,
    "diversity": 50,
    "currentPostIndex": 0,
    "processedPosts": [],
    "gameStatus": "playing",
    "endings": []
}


# ============================================
# 유틸리티 함수: JSON 파일 읽기/쓰기
# ============================================

def load_json_file(filepath, default=None):
    """
    JSON 파일을 읽어옵니다.
    
    입력:
        filepath: 읽을 파일의 경로 (예: 'data/game-state.json')
        default: 파일이 없을 때 반환할 기본값 (None이면 None 반환)
    
    출력:
        파일이 있으면: 파이썬 딕셔너리나 리스트 (JSON을 파이썬 데이터로 변환한 것)
        파일이 없으면: default 값
    
    사용 예시:
        game_state = load_json_file('data/game-state.json', {})  # 파일 없으면 빈 딕셔너리 반환
        posts = load_json_file('data/posts.json', [])  # 파일 없으면 빈 리스트 반환
    """
    try:
        # 파일 열기: 'r'은 읽기 모드, encoding='utf-8'은 한글이 깨지지 않게
        with open(filepath, 'r', encoding='utf-8') as f:
            # json.load(f): 파일의 JSON 내용을 파이썬 딕셔너리/리스트로 변환
            return json.load(f)
    except FileNotFoundError:
        # 파일이 없을 때
        if default is not None:
            return default
        return None
    except Exception as e:
        # 다른 오류가 발생했을 때
        print(f"파일 읽기 오류: {e}")
        return None


def save_json_file(filepath, data):
    """
    JSON 파일에 데이터를 저장합니다.
    
    입력:
        filepath: 저장할 파일의 경로 (예: 'data/game-state.json')
        data: 저장할 데이터 (파이썬 딕셔너리나 리스트)
    
    출력:
        성공하면: True
        실패하면: False
    
    사용 예시:
        game_state = {"day": 1, "freedom": 50}
        save_json_file('data/game-state.json', game_state)
    """
    try:
        # 폴더가 없으면 만들어주기
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # 파일 열기: 'w'는 쓰기 모드, encoding='utf-8'은 한글이 깨지지 않게
        with open(filepath, 'w', encoding='utf-8') as f:
            # json.dump(): 파이썬 딕셔너리/리스트를 JSON 형식으로 변환해서 파일에 저장
            # ensure_ascii=False: 한글이 깨지지 않게
            # indent=2: 들여쓰기 2칸 (보기 좋게)
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        # 오류가 발생했을 때
        print(f"파일 저장 오류: {e}")
        return False


# ============================================
# HTTP 핸들러 클래스
# ============================================

class GameHandler(BaseHTTPRequestHandler):
    """
    HTTP 요청을 처리하는 핸들러 클래스
    클라이언트가 보낸 요청을 받아서 적절한 함수로 보내줍니다.
    """
    
    def do_OPTIONS(self):
        """CORS 프리플라이트 요청 처리 (브라우저 보안 관련, 이 부분은 수정 안 해도 됨)"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """CORS 헤더 추가 (브라우저에서 다른 서버로 요청 보낼 때 필요, 이 부분은 수정 안 해도 됨)"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json; charset=utf-8')
    
    def do_GET(self):
        """
        GET 요청을 처리합니다.
        클라이언트가 데이터를 요청할 때 사용됩니다.
        
        처리 과정:
        1. 요청한 경로 확인 (예: /api/game-state)
        2. 경로에 맞는 함수 호출
        3. 오류가 나면 404 (Not Found) 또는 500 (Server Error) 반환
        """
        parsed_path = urlparse(self.path)
        path = parsed_path.path  # 예: '/api/game-state'
        
        try:
            if path == '/api/game-state':
                self.handle_get_game_state()
            elif path == '/api/posts':
                # TODO: handle_get_posts() 함수 호출
                self.handle_get_posts()
            elif path == '/api/auth/check':
                # TODO: handle_get_auth_check() 함수 호출
                self.handle_get_auth_check()
            elif path == '/api/leaderboard':
                # TODO: handle_get_leaderboard() 함수 호출
                self.handle_get_leaderboard()
            else:
                # 경로를 찾을 수 없을 때
                self.send_error(404, "Not Found")
        except Exception as e:
            print(f"GET 요청 처리 오류: {e}")
            self.send_error(500, str(e))
    
    def do_POST(self):
        """
        POST 요청을 처리합니다.
        클라이언트가 데이터를 보낼 때 사용됩니다.
        
        처리 과정:
        1. 요청 본문 읽기 (클라이언트가 보낸 JSON 데이터)
        2. 요청한 경로 확인 (예: /api/action)
        3. 경로에 맞는 함수 호출
        4. 오류가 나면 404 (Not Found) 또는 500 (Server Error) 반환
        """
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        try:
            # 요청 본문 읽기
            # Content-Length: 클라이언트가 보낸 데이터의 크기
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)  # 실제 데이터 읽기
            
            if path == '/api/game-state':
                self.handle_post_game_state(body)
            elif path == '/api/action':
                # TODO: handle_post_action(body) 함수 호출
                self.handle_post_action(body)
            elif path == '/api/reset':
                # TODO: handle_post_reset() 함수 호출
                self.handle_post_reset()
            elif path == '/api/posts/update':
                # TODO: handle_post_update_post(body) 함수 호출
                self.handle_post_update_post(body)
            elif path == '/api/posts/create':
                # TODO: handle_post_create_post(body) 함수 호출
                self.handle_post_create_post(body)
            elif path == '/api/posts/delete':
                # TODO: handle_post_delete_post(body) 함수 호출
                self.handle_post_delete_post(body)
            elif path == '/api/auth/register':
                # TODO: handle_post_register(body) 함수 호출
                self.handle_post_register(body)
            elif path == '/api/auth/login':
                # TODO: handle_post_login(body) 함수 호출
                self.handle_post_login(body)
            else:
                # 경로를 찾을 수 없을 때
                self.send_error(404, "Not Found")
        except Exception as e:
            print(f"POST 요청 처리 오류: {e.with_traceback()}")
            self.send_error(500, str(e))
    
    # ============================================
    # API 구현 함수들 (아래부터 TODO로 채워야 함!)
    # ============================================
    
    def handle_get_game_state(self):
        """
        GET /api/game-state 구현
        게임의 현재 상태를 반환합니다.
        
        입력: 없음 (요청 본문 없음)
        
        처리 과정:
        1. game-state.json 파일 읽기
           - 파일이 없으면 DEFAULT_GAME_STATE 사용
        2. trust와 diversity 필드가 없으면 50으로 설정
        3. JSON 형태로 응답 보내기
        
        출력 예시:
        {
            "day": 1,
            "freedom": 50,
            "order": 50,
            "trust": 50,
            "diversity": 50,
            "currentPostIndex": 0,
            "processedPosts": [],
            "gameStatus": "playing",
            "endings": []
        }
        """
        # TODO: 1. load_json_file() 함수를 사용해서 GAME_STATE_FILE 읽기
        #       기본값은 DEFAULT_GAME_STATE.copy() 사용 (copy()는 복사본을 만드는 것)
        game_state = None  # 여기를 구현하세요!
        
        # TODO: 2. trust와 diversity가 없으면 50으로 설정
        #       예: if 'trust' not in game_state: game_state['trust'] = 50
        
        # TODO: 3. 응답 보내기
        #       a. self.send_response(200) - 성공 코드
        #       b. self.send_cors_headers() - CORS 헤더
        #       c. self.end_headers() - 헤더 마무리
        #       d. self.wfile.write(...) - 본문 보내기
        #          json.dumps(game_state, ensure_ascii=False)로 JSON 문자열로 변환
        #          .encode('utf-8')로 바이트로 변환
        
        game_state = load_json_file(GAME_STATE_FILE, DEFAULT_GAME_STATE)

        if 'trust' not in game_state:
            game_state['trust'] = 50
        if 'diversity' not in game_state:
            game_state['diversity'] = 50
        if 'freedom' not in game_state:
            game_state['freedom'] = 50
        if 'order' not in game_state:
            game_state['order'] = 50

        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(game_state, ensure_ascii = False).encode('utf-8'))
    
    def handle_post_game_state(self, body):
        """
        POST /api/game-state 구현
        게임 상태를 직접 업데이트합니다. (거의 사용 안 함)
        
        입력:
            body: 요청 본문 (바이트 데이터)
            예: b'{"day": 1, "freedom": 50, ...}'
        
        처리 과정:
        1. body를 JSON으로 파싱 (json.loads 사용)
        2. game-state.json 파일에 저장
        3. 성공 응답 보내기
        
        출력:
        {
            "success": true,
            "data": {...}  # 저장한 게임 상태
        }
        """
        # TODO: 1. body를 JSON으로 변환
        #       body.decode('utf-8')로 문자열로 변환
        #       json.loads()로 딕셔너리로 변환
        data = json.loads(body.decode('utf-8'))  # 여기를 구현하세요!
        
        # TODO: 2. save_json_file() 함수를 사용해서 GAME_STATE_FILE에 저장
        save_json_file(GAME_STATE_FILE, data)
        # TODO: 3. 응답 보내기
        #       {"success": True, "data": data} 형태로 보내기
        res = {
            "success" : True,
            "data" : data
            }
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

        self.wfile.write(json.dumps(res, ensure_ascii = False).encode('utf-8'))
    def handle_get_posts(self):
        """
        GET /api/posts 구현
        모든 게시글 목록을 반환합니다.
        
        입력: 없음
        
        처리 과정:
        1. posts.json 파일 읽기
           - 파일이 없으면 빈 리스트 [] 반환
        2. JSON 형태로 응답 보내기
        
        출력 예시:
        [
            {
                "id": 1,
                "type": "허위정보",
                "title": "...",
                "content": "...",
                "author": "...",
                "freedomImpact": -5,
                "orderImpact": 10,
                "trustImpact": 6,
                "diversityImpact": -3
            },
            ...
        ]
        """
        # TODO: 1. load_json_file() 함수를 사용해서 POSTS_FILE 읽기
        #       기본값은 빈 리스트 []
        posts = load_json_file(POSTS_FILE, [])  # 여기를 구현하세요!
        
        # TODO: 2. 응답 보내기 (handle_get_game_state와 비슷)
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

        self.wfile.write(json.dumps(posts, ensure_ascii = False).encode('utf-8'))
    def handle_post_action(self, body):
        """
        POST /api/action 구현
        게시글에 대한 액션(통과/경고/삭제)을 처리합니다.
        
        입력:
            body: 요청 본문
            예: b'{"postId": 1, "action": "approve"}'
            action은 "approve"(통과), "warn"(경고), "delete"(삭제) 중 하나
        
        처리 과정:
        1. body를 JSON으로 파싱해서 postId와 action 가져오기
        2. game-state.json과 posts.json 파일 읽기
        3. postId에 해당하는 게시글 찾기
        4. 게시글을 못 찾으면 404 에러 반환
        5. action에 따라 지표 변화 계산:
           - posts.json에 있는 freedomImpact, orderImpact, trustImpact, diversityImpact 값을 가져오기
             * 각 값은 배열 형태: [통과값, 경고값, 삭제값]
           - approve: 배열의 첫 번째 값 (인덱스 0) 사용
           - warn: 배열의 두 번째 값 (인덱스 1) 사용
           - delete: 배열의 세 번째 값 (인덱스 2) 사용
        6. 게임 상태 업데이트:
           - 지표는 0-100 범위로 제한 (max(0, min(100, 값)))
           - currentPostIndex 증가
           - processedPosts에 기록 추가
        7. 엔딩 조건 체크:
           - 어떤 지표가 0 이하이면 게임 종료
           - 30턴 완료 시 트루엔딩
        8. 게임 상태 저장
        9. 게임이 끝났으면 리더보드에 저장
        10. 성공 응답 보내기
        
        출력:
        {
            "success": true,
            "gameState": {...}  # 업데이트된 게임 상태
        }
        """
        # TODO: 1. body를 JSON으로 변환해서 postId와 action 가져오기
        #       data = json.loads(body.decode('utf-8'))
        #       post_id = data.get('postId')
        #       action = data.get('action')
        data = json.loads(body.decode('utf-8'))
        post_id = data.get('postId')
        action = data.get('action')
        
        # TODO: 2. 게임 상태와 게시글 목록 읽기
        game_state = load_json_file(GAME_STATE_FILE, DEFAULT_GAME_STATE)
        posts = load_json_file(POSTS_FILE, [])
        
        # TODO: 3. post_id에 해당하는 게시글 찾기 (for 문 사용)
        #       게시글을 못 찾으면: self.send_error(404, "게시글을 찾을 수 없습니다.") 하고 return
        chk = False
        current_post = {}
        for i in posts:
            if i['id'] == post_id:
                chk = True
                current_post = i
                print("게시물 확인")
                break
        if(chk == False):
            self.send_error(404, "게시글을 찾을 수 없습니다.")
        # TODO: 4. action에 따라 지표 변화 계산
        #       freedom_change, order_change, trust_change, diversity_change 변수 사용
        #       approve: current_post.get('freedomImpact', 0) 그대로 사용
        #       warn: 영향의 50% (곱하기 0.5)
        #       delete: 자유도는 abs(freedomImpact) * 1.5만큼 감소, 질서도는 abs(orderImpact) * 1.2만큼 증가
        freedom_change = current_post.get('freedomImpact', 0)
        order_change = current_post.get('orderImpact', 0)
        trust_change = current_post.get('trustImpact', 0)
        diversity_change = current_post.get('diversityImpact', 0)
        print(freedom_change)
        print(order_change)
        print(trust_change)
        print(diversity_change)
        currType = ''
        for i in posts:
            if i['id'] == post_id:
                currType = i['type']
        
        if action == "approve":
            ind = 0
            #print("approve")
            if currType == "허위정보":
                game_state["freedom"] += freedom_change[0]              
                game_state["order"] += order_change[0]        
                game_state["trust"] += trust_change[0]                
                game_state["diversity"] += diversity_change[0]

            elif currType == "선동":
                game_state["freedom"] += freedom_change[0]
                game_state["order"] += order_change[0]
                game_state["trust"] += trust_change[0]
                game_state["diversity"] += diversity_change[0]

            elif currType == "비판":
                game_state["freedom"] += freedom_change[0]
                game_state["order"] += order_change[0]
                game_state["trust"] += trust_change[0]
                game_state["diversity"] += diversity_change[0]

            elif currType == "논쟁":
                game_state["freedom"] += freedom_change[0]
                game_state["order"] += order_change[0]
                game_state["trust"] += trust_change[0]
                game_state["diversity"] += diversity_change[0]

            elif currType in ["유익한글", "유익한 글"]:
                game_state["freedom"] += freedom_change[0]
                game_state["order"] += order_change[0]
                game_state["trust"] += trust_change[0]
                game_state["diversity"] += diversity_change[0]
        elif action == "warn":
            #print("warn")
            ind = 1
            if currType == "허위정보":
                game_state["freedom"] += freedom_change[1]
                game_state["order"] += order_change[1]
                game_state["trust"] += trust_change[1]
                game_state["diversity"] += diversity_change[1]

            elif currType == "선동":
                game_state["freedom"] += freedom_change[1]
                game_state["order"] += order_change[1]
                game_state["trust"] += trust_change[1]
                game_state["diversity"] += diversity_change[1]

            elif currType == "비판":
                game_state["freedom"] += freedom_change[1]
                game_state["order"] += order_change[1]
                game_state["trust"] += trust_change[1]
                game_state["diversity"] += diversity_change[1]

            elif currType == "논쟁":
                game_state["freedom"] += freedom_change[1]
                game_state["order"] += order_change[1]
                game_state["trust"] += trust_change[1]
                game_state["diversity"] += diversity_change[1]

            elif currType in ["유익한글", "유익한 글"]:
                game_state["freedom"] += freedom_change[1]
                game_state["order"] += order_change[1]
                game_state["trust"] += trust_change[1]
                game_state["diversity"] += diversity_change[1]



        elif action == "delete":
            #print("delete")
            ind = 2
            if currType == "허위정보":
                game_state["freedom"] += freedom_change[2]          
                game_state["order"] += order_change[2]
                game_state["trust"] += trust_change[2]
                game_state["diversity"] += diversity_change[2]

            elif currType == "선동":
                game_state["freedom"] += freedom_change[2]
                game_state["order"] += order_change[2]
                game_state["trust"] += trust_change[2]
                game_state["diversity"] += diversity_change[2]

            elif currType == "비판":
                game_state["freedom"] += freedom_change[2]
                game_state["order"] += order_change[2]
                game_state["trust"] += trust_change[2]
                game_state["diversity"] += diversity_change[2]

            elif currType == "논쟁":
                game_state["freedom"] += freedom_change[2]
                game_state["order"] += order_change[2]
                game_state["trust"] += trust_change[2]
                game_state["diversity"] += diversity_change[2]

            elif currType == "유익한글":
                game_state["freedom"] += freedom_change[2]            
                game_state["order"] += order_change[2]
                game_state["trust"] += trust_change[2]
                game_state["diversity"] += diversity_change[2]
        # TODO: 5. 게임 상태 업데이트
        #       game_state['freedom'] = max(0, min(100, game_state.get('freedom', 50) + freedom_change))
        #       다른 지표도 같은 방식으로 업데이트
        #       currentPostIndex 증가
        #       processedPosts에 {'postId': post_id, 'action': action, 'timestamp': datetime.now().isoformat()} 추가
        game_state['freedom'] = max(0, min(100, game_state.get('freedom', 50) + freedom_change[ind]))
        game_state['order'] = max(0, min(100, game_state.get('order', 50) + order_change[ind]))
        game_state['trust'] = max(0, min(100, game_state.get('trust', 50) + trust_change[ind]))
        game_state['diversity'] = max(0, min(100, game_state.get('diversity', 50) + diversity_change[ind]))
        game_state["currentPostIndex"] += 1
        game_state['processedPosts'] = {
            'postId': post_id, 
            'action': action, 
            'timestamp': datetime.now().isoformat()
        }
        # TODO: 6. 엔딩 조건 체크
        #       if game_state['freedom'] <= 0: 게임 종료
        #       elif game_state['order'] <= 0: 게임 종료
        #       elif game_state['trust'] <= 0: 게임 종료
        #       elif game_state['diversity'] <= 0: 게임 종료
        #       elif currentPostIndex >= len(posts): 트루엔딩
        #       게임 종료 시: game_state['gameStatus'] = 'ended'
        #       game_state['endings'].append({'type': '엔딩이름', 'message': '메시지'})
        if game_state['freedom'] <= 0:
            game_state['gameStatus'] = 'ended'
            game_state['endings'].append({'type': '무정부', 'message': '자유가 완전히 사라져 무정부 상태가 되었습니다.'})
        
        elif game_state['freedom'] >= 100 and game_state['order'] >= 80: 
            game_state['gameStatus'] = 'ended'
            game_state['endings'].append({'type': '혼돈', 'message': '자유도와 질서가 넘처나 커뮤니티가 붕괴되었습니다.'})

        elif game_state['order'] <= 0: 
            game_state['gameStatus'] = 'ended'
            game_state['endings'].append({'type': '질서 붕괴', 'message': '질서가 완전히 무너져 커뮤니티가 혼란에 빠졌습니다.'})

        elif game_state['trust'] <= 0: 
            game_state['gameStatus'] = 'ended'
            game_state['endings'].append({'type': '신뢰 상실', 'message': '사용자들의 신뢰가 완전히 사라졌습니다.'})

        elif game_state['trust'] >= 100 and game_state['order'] >= 80: 
            game_state['gameStatus'] = 'ended'
            game_state['endings'].append({'type': '지배', 'message': '커뮤니티가 관리자에 의해 지배되었습니다.'})

        elif game_state['diversity'] <= 0:
            game_state['gameStatus'] = 'ended'
            game_state['endings'].append({'type': '다양성 소멸', 'message': '모든 목소리가 같아져 커뮤니티가 메아리실(Echo Chamber)이 되었습니다.'})

        elif game_state["currentPostIndex"] >= len(posts):
            game_state['gameStatus'] = 'ended'
            game_state['endings'].append({'type': '트루엔딩', 'message': '이상적인 커뮤니티의 균형을 이루었습니다.'})

        # TODO: 7. 게임 상태 저장 (save_json_file 사용)
        save_json_file(GAME_STATE_FILE, game_state)
        # TODO: 8. 게임이 끝났으면 리더보드에 저장
        #       if game_state['gameStatus'] == 'ended':
        #           self.save_to_leaderboard(game_state)
        if game_state['gameStatus'] == 'ended':
            self.save_to_leaderboard(game_state)
        # TODO: 9. 성공 응답 보내기
        #       {"success": True, "gameState": game_state}
        res = {
            "success" : True,
            "gameState" : game_state
        }
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

        self.wfile.write(json.dumps(res, ensure_ascii = False).encode('utf-8'))
    def handle_post_reset(self):
        """
        POST /api/reset 구현
        게임을 초기 상태로 리셋합니다.
        
        입력: 없음
        
        처리 과정:
        1. DEFAULT_GAME_STATE를 game-state.json에 저장
        2. 성공 응답 보내기
        
        출력:
        {
            "success": true,
            "gameState": {...}  # DEFAULT_GAME_STATE
        }
        """
        # TODO: 1. save_json_file() 함수를 사용해서 DEFAULT_GAME_STATE.copy()를 GAME_STATE_FILE에 저장
        save_json_file(GAME_STATE_FILE, DEFAULT_GAME_STATE)
        res = {
            "success" : True, 
            "gameState" : DEFAULT_GAME_STATE
        }
        # TODO: 2. 성공 응답 보내기
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

        self.wfile.write(json.dumps(res, ensure_ascii = False).encode('utf-8'))
    def handle_post_register(self, body):
        """
        POST /api/auth/register 구현
        새로운 사용자를 등록합니다.
        
        입력:
            body: 요청 본문
            예: b'{"username": "test", "password": "1234"}'
        
        처리 과정:
        1. body를 JSON으로 파싱해서 username과 password 가져오기
        2. 유효성 검사:
           - username과 password가 비어있으면 400 에러 반환
           - username이 3자 미만이면 400 에러 반환
           - password가 4자 미만이면 400 에러 반환
        3. users.json 파일 읽기
        4. 중복 확인:
           - 같은 username이 이미 있으면 400 에러 반환
        5. 새 사용자 추가:
           - id는 기존 사용자 수 + 1
           - createdAt은 현재 시간 (datetime.now().isoformat())
        6. users.json 파일에 저장
        7. 성공 응답 보내기 (비밀번호는 제외하고 보내기)
        
        출력:
        {
            "success": true,
            "message": "회원가입이 완료되었습니다.",
            "user": {
                "id": 1,
                "username": "test"
            }
        }
        """
        data = json.loads(body)
        id = data["username"]
        pw = data["password"]
        if((not id or not pw) or (len(id) < 3) or (len(pw) < 4)):
            print(1)
            self.send_response(400)
            result = {"success" : False, "error" : "에러"}
        
        userDB = load_json_file("data/users.json", [])
        print(userDB)
        if id in userDB:
            print(2)
            self.send_response(400)
            result = {"success" : False, "error" : "에러"}
        else:
            print(3)
            new_user = {
                "id": len(userDB) + 1,
                "username": id,
                "password": pw,
                "createdAt": datetime.now().isoformat()
                }
            userDB.append(new_user)
            save_json_file(USERS_FILE, userDB)
            result = {
                "success" : True,
                "message": "회원가입이 완료되었습니다.",
                "user" : {
                    "id": len(userDB),
                    "username" : id
                }
            }
            self.send_response(200)
            self.send_cors_headers()
            self.end_headers()

            self.wfile.write(json.dumps(result, ensure_ascii = False).encode('utf-8'))
        # TODO: 1. body를 JSON으로 변환해서 username과 password 가져오기
        #       .strip()으로 앞뒤 공백 제거
        
        # TODO: 2. 유효성 검사
        #       if not username or not password: 400 에러 (self.send_response(400))
        #       if len(username) < 3: 400 에러
        #       if len(password) < 4: 400 에러
        #       에러 응답: {"success": False, "error": "에러 메시지"}
        
        # TODO: 3. users.json 파일 읽기 (load_json_file 사용, 기본값은 빈 리스트)
        
        # TODO: 4. 중복 확인
        #       for 문으로 users 리스트를 돌면서 username이 같은지 확인
        #       중복이면 400 에러 반환
        
        # TODO: 5. 새 사용자 생성 및 추가
        #       new_user = {
        #           "id": len(users) + 1,
        #           "username": username,
        #           "password": password,
        #           "createdAt": datetime.now().isoformat()
        #       }
        #       users.append(new_user)
        
        # TODO: 6. users.json 파일에 저장 (save_json_file 사용)
        
        # TODO: 7. 성공 응답 보내기 (비밀번호는 포함하지 않기!)
    
    def handle_post_update_post(self, body):
        """
        POST /api/posts/update 구현
        관리자 페이지에서 게시글을 수정할 때 사용됩니다.
        
        입력:
            body: 요청 본문
            예: b'{
                    "id": 3,
                    "title": "새로운 제목",
                    "content": "수정된 내용",
                    "freedomImpact": [-5, -2, -8],
                    "orderImpact": [12, 6, 14],
                    "trustImpact": [7, 3, -6],
                    "diversityImpact": [-3, -1, 2]
                }'
        
        처리 과정:
        1. body를 JSON으로 파싱해서 id, title, content, freedomImpact, orderImpact, trustImpact, diversityImpact 가져오기
        2. id가 없거나 숫자가 아니면 400 에러 반환
        3. title과 content가 문자열인지, 비어있는지 확인 (비어있으면 400 에러)
        4. freedomImpact, orderImpact, trustImpact, diversityImpact가 리스트인지, 길이가 3인지 확인
           - 리스트가 아니거나 길이가 3이 아니면 400 에러 반환
           - 각 요소가 숫자인지 확인 (float()로 변환)
        5. posts.json 파일 읽기
        6. id가 같은 게시글 찾기
           - 못 찾으면 404 에러 반환
        7. 게시글 정보 수정
           - title, content는 strip()으로 앞뒤 공백 제거 후 저장
           - freedomImpact, orderImpact, trustImpact, diversityImpact는 배열로 저장 (각 배열은 [통과, 경고, 삭제] 순서)
        8. posts.json 파일에 저장
        9. 성공 응답 보내기
           {
             "success": true,
             "post": {...수정된 게시글...}
           }
        """
        suc = False
        data = json.loads(body)
        if (not data['id'] or not(type(data['id']) == int)) or (not(type(data['title']) == str) or not(type(data['content']) == str)) or (data['title'] == None or data['content'] == None):
            self.send_response(400)
            print("성공함 ㅋ")

        if(type(data['freedomImpact']) == list and len(data['freedomImpact']) == 3):
            freedomImpact = list(map(float, data['freedomImpact']))
        else: freedomImpact = data['freedomImpact']

        if(type(data['orderImpact']) == list and len(data['orderImpact']) == 3):
            orderImpact = list(map(float, data['orderImpact']))
        else: orderImpact = data['orderImpact']

        if(type(data['trustImpact']) == list and len(data['trustImpact']) == 3):
            trustImpact = list(map(float, data['trustImpact']))
        else: trustImpact = data['trustImpact']

        if(type(data['diversityImpact']) == list and len(data['diversityImpact']) == 3):
            diversityImpact = list(map(float, data['diversityImpact']))
        else: diversityImpact = data['diversityImpact']

        load = load_json_file(POSTS_FILE, [])
        print(load)
        for i in load:
            if i['id'] == data['id']:
                suc = True
        if(suc):
            res = {
                "success" : True,
                "post" : {
                    "id" : data['id'],
                    "title" : data['title'].strip(),
                    "content" : data['content'].strip(),
                    "freedomImpact" : freedomImpact,
                    "orderImpact" : orderImpact,
                    "trustImpact": trustImpact,
                    "diversityImpact": diversityImpact
                }
            }
            load[data['id']-1].update({
                    "id" : data['id'],
                    "title" : data['title'].strip(),
                    "content" : data['content'].strip(),
                    "freedomImpact" : freedomImpact,
                    "orderImpact" : orderImpact,
                    "trustImpact": trustImpact,
                    "diversityImpact": diversityImpact
                })
            print(load)
            save_json_file(POSTS_FILE, load)
            self.send_response(200)
            self.send_cors_headers()
            self.end_headers()

            self.wfile.write(json.dumps(res, ensure_ascii = False).encode('utf-8'))
        else:
            self.send_response(404)
        # TODO: 위 과정을 순서대로 구현해보세요!
        #       (힌트) JSON 파싱 -> 값 검증 -> 게시글 찾기 -> 값 수정 -> 저장 -> 응답
        pass
    
    def handle_post_create_post(self, body):
        """
        POST /api/posts/create 구현
        관리자 페이지에서 새 게시글을 생성할 때 사용됩니다.
        
        입력:
            body: 요청 본문
            예: b'{
                    "type": "허위정보",
                    "title": "새 게시글 제목",
                    "content": "게시글 내용",
                    "author": "작성자명",
                    "freedomImpact": [-5, -2, -8],
                    "orderImpact": [10, 5, 12],
                    "trustImpact": [7, 3, -6],
                    "diversityImpact": [-3, -1, 2]
                  }'
        
        처리 과정:
        1. body를 JSON으로 파싱해서 모든 필드 가져오기
        2. 유효성 검사:
           - type, title, content, author가 비어있으면 400 에러 반환
           - freedomImpact, orderImpact, trustImpact, diversityImpact가 리스트인지, 길이가 3인지 확인
             * 리스트가 아니거나 길이가 3이 아니면 400 에러 반환
             * 각 요소가 숫자인지 확인 (float()로 변환)
        3. posts.json 파일 읽기
        4. 새 ID 생성:
           - 기존 게시글들의 ID 중 최대값을 찾기
           - 최대값 + 1을 새 ID로 사용
        5. 새 게시글 객체 생성:
           {
             "id": 새ID,
             "type": type,
             "title": title,
             "content": content,
             "author": author,
             "freedomImpact": [통과값, 경고값, 삭제값],
             "orderImpact": [통과값, 경고값, 삭제값],
             "trustImpact": [통과값, 경고값, 삭제값],
             "diversityImpact": [통과값, 경고값, 삭제값]
           }
        6. posts 리스트에 새 게시글 추가
        7. posts.json 파일에 저장
        8. 성공 응답 보내기
        
        출력:
        {
            "success": true,
            "post": {...생성된 게시글...}
        }
        """
        # TODO: 위 과정을 순서대로 구현해보세요!
        #       (힌트) JSON 파싱 -> 값 검증 -> 새 ID 생성 -> 게시글 생성 -> 리스트에 추가 -> 저장 -> 응답
        suc = False
        data = json.loads(body)
        print(f"data: {data}ffv")
        if (not(type(data['title']) == str) or not(type(data['content']) == str)) or (data['title'] == None or data['content'] == None):
            self.send_response(400)
            print(f"data: {data}")
            print("성공함 ㅋ")
        load = load_json_file(POSTS_FILE, [])

        num = 0
        for i in load:
            num = i['id']
            suc = True
        if (suc):
            print(111)
            post = {
                "id": num + 1,
                "type": data["type"],
                "title": data["title"],
                "content": data["content"],
                "author": data["author"],
                "freedomImpact": data["freedomImpact"],
                "orderImpact": data["orderImpact"],
                "trustImpact": data["trustImpact"],
                "diversityImpact": data["diversityImpact"]
            }
            load.append(post)


            res = {
                "success" : True,
                "post" : post
            }
            print(load)
            save_json_file(POSTS_FILE, load)

            self.send_response(200)
            self.send_cors_headers()
            self.end_headers()

            self.wfile.write(json.dumps(res, ensure_ascii = False).encode('utf-8'))
        else:
            self.send_response(404)
        pass
    
    def handle_post_delete_post(self, body):
        """
        POST /api/posts/delete 구현
        관리자 페이지에서 게시글을 삭제할 때 사용됩니다.
        
        입력:
            body: 요청 본문
            예: b'{"id": 3}'
        
        처리 과정:
        1. body를 JSON으로 파싱해서 id 가져오기
        2. 유효성 검사:
           - id가 없거나 숫자가 아니면 400 에러 반환
        3. posts.json 파일 읽기
        4. 삭제할 게시글 찾기:
           - posts 리스트를 돌면서 id가 일치하는 게시글 찾기
           - 못 찾으면 404 에러 반환
        5. 게시글 삭제:
           - 리스트에서 해당 게시글 제거 (pop() 또는 remove() 사용)
        6. posts.json 파일에 저장
        7. 성공 응답 보내기
        
        출력:
        {
            "success": true
        }
        """
        suc = False
        res = {}
        data = json.loads(body)
        if (not data['id'] or not(type(data['id']) == int)):
            self.send_response(400)
            print("성공함 ㅋ")
        load = load_json_file(POSTS_FILE, [])

        curr = -1
        for i in load:
            if i['id'] == data['id']:
                curr = i['id'] - 1
        
        if curr == -1:
            self.send_response(404)
            suc = False
        else:
            suc = True

        if suc:
            load.pop(curr)
            save_json_file(POSTS_FILE, load)
            res = {
                "success": True
            }
        else:
            res = {
                "success": False
            }

        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

        self.wfile.write(json.dumps(res, ensure_ascii = False).encode('utf-8'))
        # TODO: 위 과정을 순서대로 구현해보세요!
        #       (힌트) JSON 파싱 -> 값 검증 -> 게시글 찾기 -> 삭제 -> 저장 -> 응답
        
        pass
    
    def handle_post_login(self, body):
        """
        POST /api/auth/login 구현
        사용자 인증을 처리합니다.
        
        입력:
            body: 요청 본문
            예: b'{"username": "test", "password": "1234"}'
        
        처리 과정:
        1. body를 JSON으로 파싱해서 username과 password 가져오기
        2. 유효성 검사:
           - username과 password가 비어있으면 400 에러 반환
        3. users.json 파일 읽기
        4. 사용자 찾기:
           - username과 password가 모두 일치하는 사용자 찾기
           - 못 찾으면 401 에러 반환
        5. 로그인 성공 응답 보내기 (비밀번호는 제외하고 보내기)
        
        출력:
        {
            "success": true,
            "message": "로그인 성공",
            "user": {
                "id": 1,
                "username": "test"
            }
        }
        """
        data = json.loads(body)
        id = data["username"]
        pw = data["password"]
        if not id or not pw:
            self.send_response(400)

        userDB = load_json_file(USERS_FILE, [])
        print(userDB)
        suc = False
        ii = 0
        for i in userDB:
            if i['username'] == id and i['password'] == pw:
                    check_FILE = True
                    suc = True
                    ii = i["id"]
                    
                    break

        if suc:
            result = {
                "success" : True,
                "message": "로그인 성공",
                "user": {
                    "id": ii,
                    "username": id
                }
            }
            self.send_response(200)
            self.send_cors_headers()
            self.end_headers()

            self.wfile.write(json.dumps(result, ensure_ascii = False).encode('utf-8'))
        else:
            self.send_response(401)
        # TODO: 1. body를 JSON으로 변환해서 username과 password 가져오기
        
        # TODO: 2. 유효성 검사
        #       if not username or not password: 400 에러
        
        # TODO: 3. users.json 파일 읽기
        
        # TODO: 4. 사용자 찾기
        #       for 문으로 users 리스트를 돌면서
        #       u.get('username') == username and u.get('password') == password 확인
        #       못 찾으면 401 에러 반환
        
        # TODO: 5. 성공 응답 보내기 (비밀번호는 포함하지 않기!)
    
    def handle_get_auth_check(self):
        """
        GET /api/auth/check 구현
        인증 상태를 확인합니다. (교육용 - 간단한 구현)
        
        입력: 없음
        
        처리 과정:
        1. 항상 {"success": True, "authenticated": False} 반환
           (실제 서비스에서는 세션이나 토큰으로 확인하지만, 교육용이므로 간단하게)
        
        출력:
        {
            "success": true,
            "authenticated": false
        }
        """
        res = {"success" : True,
             "authenticated" : False}
        if(check_FILE):
            res.update({"authenticated" : True})
        # TODO: 1. 응답 보내기
        #       {"success": True, "authenticated": False}
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

        self.wfile.write(json.dumps(res, ensure_ascii = False).encode('utf-8'))
    
    def handle_get_leaderboard(self):
        """
        GET /api/leaderboard 구현
        상위 점수 기록을 조회합니다.
        
        입력: 없음
        
        처리 과정:
        1. leaderboard.json 파일 읽기
           - 파일이 없으면 빈 리스트 []
        2. 점수순으로 정렬 (내림차순)
           - sort() 함수 사용, key=lambda x: x.get('score', 0), reverse=True
        3. 상위 10개만 선택
           - 리스트 슬라이싱 사용: [:10]
        4. JSON 형태로 응답 보내기
        
        출력 예시:
        {
            "success": true,
            "leaderboard": [
                {
                    "score": 200,
                    "freedom": 50,
                    "order": 50,
                    "trust": 50,
                    "diversity": 50,
                    "ending": "트루엔딩",
                    "completedAt": "2025-01-01T00:00:00",
                    "processedPosts": 30
                },
                ...
            ]
        }
        """
        # TODO: 1. leaderboard.json 파일 읽기 (load_json_file 사용, 기본값은 빈 리스트)
        lead = load_json_file(LEADERBOARD_FILE, [])
        # TODO: 2. 점수순으로 정렬 (내림차순)
        #       leaderboard.sort(key=lambda x: x.get('score', 0), reverse=True)
        lead.sort(key=lambda x: x.get('score', 0), reverse=True)
        # TODO: 3. 상위 10개만 선택
        #       top_10 = leaderboard[:10]
        top_10 = lead[:10]
        # TODO: 4. 응답 보내기
        #       {"success": True, "leaderboard": top_10}
        res = {
            "success" : True,
            "leaderboard" : top_10
        }

        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

        self.wfile.write(json.dumps(res, ensure_ascii = False).encode('utf-8'))
    def save_to_leaderboard(self, game_state):
        """
        게임 결과를 리더보드에 저장합니다.
        handle_post_action에서 게임이 끝났을 때 자동으로 호출됩니다.
        
        입력:
            game_state: 게임 상태 딕셔너리
        
        처리 과정:
        1. 점수 계산: freedom + order + trust + diversity
        2. 엔딩 타입 가져오기 (game_state['endings']의 마지막 항목)
        3. leaderboard.json 파일 읽기
        4. 새 기록 추가:
           {
               "score": 점수,
               "freedom": 자유도,
               "order": 질서도,
               "trust": 신뢰도,
               "diversity": 다양성,
               "ending": 엔딩 타입,
               "completedAt": 현재 시간,
               "processedPosts": 처리한 게시글 수
           }
        5. 점수순으로 정렬 (내림차순)
        6. 최대 100개만 유지 (100개 넘으면 잘라내기)
        7. leaderboard.json 파일에 저장
        """
        # TODO: 1. 점수 계산
        #       score = game_state.get('freedom', 0) + game_state.get('order', 0) + ...
        score = game_state.get('freedom', 0) + game_state.get('order', 0) + game_state.get('trust', 0) + game_state.get('diversity', 0)
        # TODO: 2. 엔딩 타입 가져오기
        #       endings = game_state.get('endings', [])
        #       ending_type = endings[-1].get('type', '') if endings else ''
        endings = game_state.get('endings', [])
        endings_type = endings[-1].get('type', '') if endings else ''
        print(f"리더보드 오류검출 2{endings}")
        print(f"리더보드 오류검출 3{endings_type}")
        # TODO: 3. leaderboard.json 파일 읽기
        lead = load_json_file(LEADERBOARD_FILE, [])
        print(f"리더보드 오류검출 4{lead}")
        # TODO: 4. 새 기록 생성 및 추가
        #       new_record = {...}
        #       leaderboard.append(new_record)
        print(game_state)
        new_record = {
            "score" : score,
            "freedom" : game_state['freedom'],
            "order": game_state['order'],
            "trust": game_state['trust'],
            "diversity": game_state['diversity'],
            "ending": endings_type,
            "completedAt": datetime.now().isoformat(),
            "processedPosts": game_state['processedPosts']['postId']
        }

        lead.append(new_record)
        # TODO: 5. 점수순으로 정렬
        lead.sort(key=lambda x: x.get('score', 0), reverse=True)
        # TODO: 6. 최대 100개만 유지
        #       if len(leaderboard) > 100:
        #           leaderboard = leaderboard[:100]
        if len(lead) > 100:
            lead = lead[:100]
        # TODO: 7. leaderboard.json 파일에 저장
        print(f"리드 오류#{lead}")
        save_json_file(LEADERBOARD_FILE, lead)

    def log_message(self, format, *args):
        """로그 메시지 출력 (선택사항)"""
        print(f"[{self.address_string()}] {format % args}")
    
    def log_message(self, format, *args):
        """로그 메시지 출력 (선택사항)"""
        print(f"[{self.address_string()}] {format % args}")


# ============================================
# 서버 실행
# ============================================

def run_server(port=8000):
    """
    서버를 실행합니다.
    
    사용법:
        python3 server.py
    """
    server_address = ('', port)
    httpd = HTTPServer(server_address, GameHandler)
    print(f"서버가 http://localhost:{port} 에서 실행 중입니다...")
    print("종료하려면 Ctrl+C를 누르세요.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n서버를 종료합니다...")
        httpd.shutdown()
    except Exception as e:
        print(e.with_traceback())


if __name__ == '__main__':
    # 포트 설정 (기본 8000)
    PORT = 8000
    run_server(PORT)

