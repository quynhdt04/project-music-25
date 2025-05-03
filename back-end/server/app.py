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
    # Khi client ngắt kết nối, bạn có thể muốn xử lý các hoạt động như xóa người dùng khỏi phòng nếu cần
    # await sio.leave_room(sid, conversation_id)  # Nếu cần làm điều này

@sio.event
async def join_conversation(sid, data):
    conversation_id = data.get('conversation_id')
    user = data.get('user')

    if not conversation_id or not user:
        await sio.emit('error', {'message': 'Thiếu thông tin phòng trò chuyện hoặc người dùng'}, to=sid)
        return

    await sio.enter_room(sid, conversation_id)
    await sio.emit('user_joined', f"{user} đã vào cuộc trò chuyện {conversation_id}", room=conversation_id)

@sio.event
async def send_message(sid, data):
    conversation_id = data.get('conversation_id')
    content = data.get('content')
    sender_avatar = data.get('sender_avatar')
    sender_name = data.get('sender_name')
    sender_id = data.get('sender_id')  # optional nếu có
    createdAt = data.get('createdAt')
    message_id = data.get('id')
    type = data.get('type')

    if not conversation_id or not content or not sender_id or not sender_name:
        await sio.emit('error', {'message': 'Thiếu dữ liệu bắt buộc'}, to=sid)
        return  # Trả lỗi về client nếu thiếu dữ liệu

    # Emit thông tin tin nhắn đến tất cả người dùng trong cuộc trò chuyện
    await sio.emit(
        'receive_message',
        {
            'id': message_id,
            'sender_id': sender_id,
            'content': content,
            'sender_avatar': sender_avatar,
            'sender_name': sender_name,
            'conversation_id': conversation_id,
            'createdAt': createdAt,
            'type': type,
        },
        room=conversation_id
    )

@sio.event
async def leave_conversation(sid, data):
    conversation_id = data.get('conversation_id')
    user = data.get('user')

    if not conversation_id or not user:
        await sio.emit('error', {'message': 'Thiếu thông tin phòng trò chuyện hoặc người dùng'}, to=sid)
        return

    await sio.leave_room(sid, conversation_id)
    await sio.emit('user_left', f"{user} đã rời khỏi {conversation_id}", room=conversation_id)


if __name__ == '__main__':
    web.run_app(app, host='0.0.0.0', port=5000)
