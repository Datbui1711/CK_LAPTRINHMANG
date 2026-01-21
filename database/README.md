# DATABASE SCHEMA

## Mô tả các bảng

### 1. **users**
Lưu thông tin người dùng:
- `id`: ID người dùng
- `username`: Tên đăng nhập (unique)
- `email`: Email (unique)
- `password`: Mật khẩu đã hash bằng bcrypt
- `avatar`: URL ảnh đại diện
- `full_name`: Tên đầy đủ
- `created_at`, `updated_at`: Timestamps

### 2. **friend_requests**
Lưu lời mời kết bạn:
- `sender_id`: Người gửi lời mời
- `receiver_id`: Người nhận lời mời
- `message`: Lời nhắn kèm theo
- `status`: Trạng thái (pending/accepted/rejected)
- Ràng buộc unique: một cặp sender-receiver chỉ có 1 request pending

### 3. **friendships**
Lưu mối quan hệ bạn bè:
- `user1_id`, `user2_id`: Hai người bạn (user1_id < user2_id để tránh duplicate)
- Ràng buộc unique: mỗi cặp bạn chỉ lưu 1 lần

### 4. **conversations**
Lưu phòng chat:
- `type`: Loại phòng (direct: 1-1, group: nhóm)
- `name`: Tên nhóm (chỉ dùng cho group)
- `avatar`: Avatar nhóm
- `created_by`: Người tạo nhóm

### 5. **conversation_members**
Lưu thành viên trong phòng chat:
- `conversation_id`: ID phòng chat
- `user_id`: ID thành viên
- `last_read_at`: Thời điểm đọc tin nhắn cuối cùng (để tính unread count)

### 6. **messages**
Lưu tin nhắn:
- `conversation_id`: ID phòng chat
- `sender_id`: Người gửi
- `content`: Nội dung text (null nếu là ảnh)
- `image_url`: URL ảnh từ Cloudinary
- `message_type`: Loại tin nhắn (text/image)

### 7. **refresh_tokens**
Lưu refresh token để xác thực:
- `user_id`: ID người dùng
- `token`: Refresh token
- `expires_at`: Thời gian hết hạn

## Quan hệ giữa các bảng

```
users (1) ────< friend_requests (N)
users (1) ────< friendships (N) [qua user1_id và user2_id]
users (1) ────< conversations (N) [qua created_by]
users (1) ────< conversation_members (N)
conversations (1) ────< conversation_members (N)
conversations (1) ────< messages (N)
users (1) ────< messages (N) [qua sender_id]
users (1) ────< refresh_tokens (N)
```

## Cách tính Unread Count

Unread count = Số tin nhắn trong conversation sau `last_read_at` của member đó.

```sql
SELECT COUNT(*) 
FROM messages 
WHERE conversation_id = ? 
  AND created_at > (
    SELECT last_read_at 
    FROM conversation_members 
    WHERE conversation_id = ? AND user_id = ?
  )
```

