# server/app.py
import socketio
from aiohttp import web

sio = socketio.AsyncServer(cors_allowed_origins='*')  # Cho phép frontend React kết nối
app = web.Application()
sio.attach(app)

@sio.event
async def connect(sid, environ):
    print(f'Client connected: {sid}')

@sio.event
async def disconnect(sid):
    print(f'Client disconnected: {sid}')

@sio.event
async def join_conversation(sid, data):
    conversation_id = data.get('conversation_id')
    user = data.get('user')
    await sio.enter_room(sid, conversation_id)
    await sio.emit('user_joined', f"{user} đã vào cuộc trò chuyện {conversation_id}", room=conversation_id)

@sio.event
async def send_message(sid, data):
    conversation_id = data.get('conversation_id')
    content = data.get('content')
    avatar = data.get('avatar')
    username = data.get('username')
    sender_id = data.get('sender_id')  # optional nếu có
    time = data.get('time')

    if not conversation_id or not content:
        await sio.emit('error', {'message': 'Thiếu dữ liệu bắt buộc'}, to=sid)
        return  # hoặc emit lỗi về client

    await sio.emit(
        'receive_message',
        {
            'sid': sid,
            'sender_id': sender_id,
            'content': content,
            'avatar': avatar,
            'username': username,
            'conversation_id': conversation_id,
            'time': time,
        },
        room=conversation_id
    )

@sio.event
async def leave_conversation(sid, data):
    conversation_id = data.get('conversation_id')
    user = data.get('user')
    await sio.leave_room(sid, conversation_id)
    await sio.emit('user_left', f"{user} đã rời khỏi {conversation_id}", room=conversation_id)


if __name__ == '__main__':
    web.run_app(app, host='0.0.0.0', port=5000)
